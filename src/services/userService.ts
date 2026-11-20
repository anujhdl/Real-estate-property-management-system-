import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { BOOTSTRAPPED_ADMIN_EMAILS, db } from '../config/firebase';
import { handleFirestoreError, OperationType } from '../database/firestoreError';
import type { UserProfile } from '../models/types';

const USERS_COLLECTION = 'users';

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export function isBootstrappedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return (BOOTSTRAPPED_ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase());
}

export async function syncUserProfile(
  fbUser: FirebaseUser,
  preferredName?: string
): Promise<UserProfile> {
  const uid = fbUser.uid;
  const email = (fbUser.email || '').toLowerCase();
  const isBootstrapped = fbUser.emailVerified && isBootstrappedAdminEmail(email);

  // If email isn't verified yet (e.g., fresh Email/Password signup before clicking link),
  // return an in-memory profile without failing Firestore verified-user rules.
  if (!fbUser.emailVerified) {
    return {
      id: uid,
      name: preferredName || fbUser.displayName || email.split('@')[0] || 'Member',
      email,
      authProviderId: fbUser.providerData[0]?.providerId || 'password',
      role: 'user',
      favorites: [],
      createdAt: new Date().toISOString(),
    };
  }

  const userRef = doc(db, USERS_COLLECTION, uid);

  try {
    const snap = await getDoc(userRef);
    let isAdminDoc = false;
    try {
      const adminSnap = await getDoc(doc(db, 'admins', uid));
      isAdminDoc = adminSnap.exists();
    } catch {
      isAdminDoc = false;
    }

    if (snap.exists()) {
      const data = snap.data() as Record<string, unknown>;
      const resolvedRole: 'user' | 'admin' =
        isBootstrapped || isAdminDoc || data.role === 'admin' ? 'admin' : 'user';
      return {
        id: uid,
        name: String(data.name ?? fbUser.displayName ?? 'Member'),
        email: String(data.email ?? email),
        authProviderId: String(data.authProviderId ?? 'google.com'),
        role: resolvedRole,
        phone: typeof data.phone === 'string' ? data.phone : undefined,
        favorites: Array.isArray(data.favorites) ? (data.favorites as string[]) : [],
        createdAt: toIsoString(data.createdAt),
      };
    }

    const newProfile = {
      id: uid,
      name: (preferredName || fbUser.displayName || email.split('@')[0] || 'Member').slice(0, 120),
      email: email.slice(0, 160),
      authProviderId: (fbUser.providerData[0]?.providerId || 'google.com').slice(0, 64),
      role: isBootstrapped ? 'admin' : 'user',
      favorites: [] as string[],
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile);

    return {
      id: uid,
      name: newProfile.name,
      email: newProfile.email,
      authProviderId: newProfile.authProviderId,
      role: newProfile.role as 'user' | 'admin',
      favorites: [],
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${uid}`);
  }
}

export async function updateUserFavorites(
  uid: string,
  favorites: string[]
): Promise<void> {
  const trimmed = Array.from(new Set(favorites)).slice(0, 50);
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), { favorites: trimmed });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
  }
}

export async function updateUserProfileDetails(
  uid: string,
  details: { name: string; phone?: string }
): Promise<void> {
  const payload: Record<string, unknown> = {
    name: details.name.trim().slice(0, 120),
  };
  if (typeof details.phone === 'string') {
    payload.phone = details.phone.trim().slice(0, 30);
  }
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
  }
}

export async function fetchAllUsersAdmin(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          name: String(data.name ?? 'Member'),
          email: String(data.email ?? ''),
          authProviderId: String(data.authProviderId ?? 'google.com'),
          role: data.role === 'admin' ? 'admin' : 'user',
          phone: typeof data.phone === 'string' ? data.phone : undefined,
          favorites: Array.isArray(data.favorites) ? (data.favorites as string[]) : [],
          createdAt: toIsoString(data.createdAt),
        } as UserProfile;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
  }
}
