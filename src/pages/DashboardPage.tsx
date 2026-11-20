import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  LogOut,
  Mail,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { fetchMyInquiries } from '../services/inquiryService';
import type { Inquiry } from '../models/types';
import { PropertyCard } from '../components/PropertyCard';

type DashboardTab = 'favorites' | 'inquiries' | 'profile';

export function DashboardPage() {
  const {
    firebaseUser,
    profile,
    loading,
    isAdmin,
    isEmailVerified,
    logout,
    updateProfileInfo,
    resendVerificationEmail,
    refreshProfile,
  } = useAuth();
  const { properties, favoriteIds } = useProperties();
  const navigate = useNavigate();

  const [tab, setTab] = useState<DashboardTab>('favorites');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      navigate('/auth', { state: { from: '/dashboard' }, replace: true });
    }
  }, [loading, firebaseUser, navigate]);

  useEffect(() => {
    if (profile) {
      setNameInput(profile.name);
      setPhoneInput(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!firebaseUser || !isEmailVerified) return;
    setLoadingInquiries(true);
    fetchMyInquiries(firebaseUser.uid)
      .then(setInquiries)
      .catch((err) => console.error('Failed to load user inquiries:', err))
      .finally(() => setLoadingInquiries(false));
  }, [firebaseUser, isEmailVerified]);

  const savedProperties = useMemo(
    () => properties.filter((p) => favoriteIds.includes(p.id)),
    [properties, favoriteIds]
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSavingProfile(true);
    setProfileNotice(null);
    try {
      await updateProfileInfo(nameInput, phoneInput);
      setProfileNotice('Your profile details have been updated.');
    } catch (err) {
      setProfileNotice(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-zinc-500">
        Loading your account...
      </div>
    );
  }

  if (!firebaseUser || !profile) return null;

  return (
    <div className="bg-zinc-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-gold-600 mb-1">Client Dashboard</p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900">
              {profile.name}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {profile.email} &middot; Role: {isAdmin ? 'Administrator' : 'Member'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 whitespace-nowrap"
              >
                <Shield className="w-4 h-4 text-gold-400" />
                Open Admin Console
              </Link>
            )}
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-300 text-zinc-700 text-xs font-medium rounded-lg hover:border-zinc-900 hover:text-zinc-900 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Email Verification Notice for Unverified Email/Password Accounts */}
        {!isEmailVerified && (
          <div className="mb-8 p-5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-sm text-amber-950">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verify your email to sync cloud favourites &amp; inquiries</p>
                <p className="text-xs text-amber-900 mt-1">
                  We sent a verification link to {profile.email}. Click it and then refresh your
                  status.
                </p>
                {verifyNotice && <p className="text-xs font-medium mt-1">{verifyNotice}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await resendVerificationEmail();
                  setVerifyNotice('Verification email resent.');
                }}
                className="px-3.5 py-2 text-xs font-medium bg-white border border-amber-300 text-amber-950 rounded-lg hover:bg-amber-100 cursor-pointer"
              >
                Resend Email
              </button>
              <button
                type="button"
                onClick={() => void refreshProfile()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 mb-8 overflow-x-auto">
          {(
            [
              { id: 'favorites', label: `Saved Favourites (${savedProperties.length})`, icon: Heart },
              { id: 'inquiries', label: `My Inquiries (${inquiries.length})`, icon: Mail },
              { id: 'profile', label: 'Profile Settings', icon: User },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  tab === item.id
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Favourites */}
        {tab === 'favorites' && (
          <div>
            {savedProperties.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
                <h2 className="font-display text-2xl font-semibold text-zinc-900 mb-2">
                  No Saved Properties Yet
                </h2>
                <p className="text-sm text-zinc-600 max-w-md mx-auto mb-6">
                  Click the heart icon on any listing to shortlist villas, apartments, plots, or
                  commercial spaces here.
                </p>
                <Link
                  to="/properties"
                  className="inline-flex items-center px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800"
                >
                  Explore Listings
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {savedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Inquiries */}
        {tab === 'inquiries' && (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            {loadingInquiries ? (
              <div className="p-10 text-center text-sm text-zinc-500">Loading your inquiries...</div>
            ) : inquiries.length === 0 ? (
              <div className="p-12 text-center">
                <h2 className="font-display text-2xl font-semibold text-zinc-900 mb-2">
                  No Inquiries Submitted Yet
                </h2>
                <p className="text-sm text-zinc-600 mb-6">
                  Any property inquiry or site-visit request you submit while signed in appears here
                  with live status updates.
                </p>
                <Link
                  to="/properties"
                  className="inline-flex items-center px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800"
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span className="font-mono">{inq.id}</span>
                        <span>&middot;</span>
                        <span>{inq.inquiryType}</span>
                        <span>&middot;</span>
                        <span>{new Date(inq.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                      <h3 className="font-sans text-base font-semibold text-zinc-900">
                        {inq.propertyTitle}
                      </h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">{inq.message}</p>
                    </div>
                    <div className="sm:text-right shrink-0 space-y-1 text-xs">
                      <p className="font-semibold text-zinc-900">Status: {inq.status}</p>
                      <p
                        className={
                          inq.emailDeliveryStatus === 'sent'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }
                      >
                        Email: {inq.emailDeliveryStatus === 'sent' ? 'Delivered' : 'Delivery Pending/Failed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {tab === 'profile' && (
          <div className="max-w-lg bg-white border border-zinc-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-zinc-900 mb-1">
              Profile Settings
            </h2>
            <p className="text-xs text-zinc-500 mb-6">
              Update your contact details for faster inquiry pre-filling.
            </p>

            {profileNotice && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label htmlFor="prof-name" className="block text-xs font-medium text-zinc-700 mb-1">
                  Full Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label htmlFor="prof-email" className="block text-xs font-medium text-zinc-700 mb-1">
                  Email Address (Read-Only)
                </label>
                <input
                  id="prof-email"
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="prof-phone" className="block text-xs font-medium text-zinc-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 tabular-nums"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-60 cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
