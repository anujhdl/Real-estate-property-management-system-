import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import type { UserProfile } from '../models/types';
import {
  isBootstrappedAdminEmail,
  syncUserProfile,
  updateUserFavorites,
  updateUserProfileDetails,
} from '../services/userService';
import { seedCatalogToFirestore } from '../services/propertyService';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  updateProfileInfo: (name: string, phone?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_FAV_KEY = 'aurelia_estates_favorites_v1';

function readLocalFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeLocalFavorites(ids: string[]): void {
  try {
    window.localStorage.setItem(LOCAL_FAV_KEY, JSON.stringify(ids.slice(0, 50)));
  } catch {
    // Ignore storage quota errors
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user: FirebaseUser | null, preferredName?: string) => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const synced = await syncUserProfile(user, preferredName);
      // Merge any pre-login local favorites once signed in with verified email
      const localFavs = readLocalFavorites();
      if (user.emailVerified && localFavs.length > 0) {
        const merged = Array.from(new Set([...synced.favorites, ...localFavs])).slice(0, 50);
        if (merged.length !== synced.favorites.length) {
          await updateUserFavorites(user.uid, merged);
          synced.favorites = merged;
        }
        writeLocalFavorites([]);
      }
      setProfile(synced);

      // When a verified admin signs in for the first time, ensure Firestore has the 20 seeded listings
      if (user.emailVerified && (synced.role === 'admin' || isBootstrappedAdminEmail(user.email))) {
        void seedCatalogToFirestore().catch(() => {
          // Non-blocking catalog sync
        });
      }
    } catch (err) {
      console.error('Failed to sync user profile:', err);
      setProfile({
        id: user.uid,
        name: preferredName || user.displayName || user.email?.split('@')[0] || 'Member',
        email: user.email || '',
        authProviderId: user.providerData[0]?.providerId || 'google.com',
        role: user.emailVerified && isBootstrappedAdminEmail(user.email) ? 'admin' : 'user',
        favorites: readLocalFavorites(),
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      void loadProfile(user);
    });
    return () => unsubscribe();
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await loadProfile(result.user);
  }, [loadProfile]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await loadProfile(cred.user);
    },
    [loadProfile]
  );

  const registerWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      try {
        await sendEmailVerification(cred.user);
      } catch {
        // Ignore rate-limit error on verification email
      }
      await loadProfile(cred.user, name.trim());
    },
    [loadProfile]
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!firebaseUser || !profile) {
        const current = readLocalFavorites();
        const next = current.includes(propertyId)
          ? current.filter((id) => id !== propertyId)
          : [...current, propertyId].slice(0, 50);
        writeLocalFavorites(next);
        window.dispatchEvent(new Event('aurelia-favorites-changed'));
        return;
      }

      const exists = profile.favorites.includes(propertyId);
      const next = exists
        ? profile.favorites.filter((id) => id !== propertyId)
        : [...profile.favorites, propertyId].slice(0, 50);

      setProfile((prev) => (prev ? { ...prev, favorites: next } : prev));

      if (firebaseUser.emailVerified) {
        await updateUserFavorites(firebaseUser.uid, next);
      } else {
        writeLocalFavorites(next);
      }
    },
    [firebaseUser, profile]
  );

  const updateProfileInfo = useCallback(
    async (name: string, phone?: string) => {
      if (!firebaseUser) return;
      await updateProfile(firebaseUser, { displayName: name.trim() });
      if (firebaseUser.emailVerified) {
        await updateUserProfileDetails(firebaseUser.uid, { name, phone });
      }
      setProfile((prev) => (prev ? { ...prev, name: name.trim(), phone: phone?.trim() } : prev));
    },
    [firebaseUser]
  );

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      await loadProfile(auth.currentUser);
    }
  }, [loadProfile]);

  const isEmailVerified = Boolean(firebaseUser?.emailVerified);
  const isAdmin = Boolean(
    isEmailVerified &&
      (profile?.role === 'admin' || isBootstrappedAdminEmail(firebaseUser?.email))
  );

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        isAdmin,
        isEmailVerified,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        requestPasswordReset,
        resendVerificationEmail,
        logout,
        toggleFavorite,
        updateProfileInfo,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
