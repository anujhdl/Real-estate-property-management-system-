import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

function mapAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email address or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In popup was closed before completion.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in your Firebase Console (Authentication → Sign-in method → Email/Password). Use "Continue with Google" below for immediate access.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes before trying again.';
    default:
      return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
  }
}

export function AuthPage() {
  const {
    firebaseUser,
    isAdmin,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    requestPasswordReset,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = (location.state as { from?: string } | null)?.from;

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser) {
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else {
        navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
      }
    }
  }, [firebaseUser, isAdmin, navigate, fromPath]);

  const handleGoogle = async () => {
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (mode === 'reset') {
      setBusy(true);
      try {
        await requestPasswordReset(email);
        setSuccess(
          `If an account exists for ${email.trim()}, a password reset link has been sent to your inbox.`
        );
      } catch (err) {
        setError(mapAuthError(err));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setBusy(true);
      try {
        await registerWithEmail(name, email, password);
        setSuccess('Account created! Please check your inbox to verify your email address.');
      } catch (err) {
        setError(mapAuthError(err));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[82vh] bg-zinc-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-7 sm:p-9 shadow-xs">
        <div className="text-center mb-7">
          <p className="text-xs font-medium text-gold-600 mb-1.5">Aurelia Estates Account</p>
          <h1 className="font-display text-3xl font-semibold text-zinc-900">
            {mode === 'login'
              ? 'Welcome Back'
              : mode === 'register'
                ? 'Create Client Account'
                : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1.5">
            {mode === 'login'
              ? 'Access saved favourites, track inquiries, or open the Admin Console.'
              : mode === 'register'
                ? 'Save favourite listings and monitor your advisory inquiries.'
                : 'Enter your registered email address to receive a reset link.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-lg mb-6">
          {(
            [
              { id: 'login', label: 'Sign In' },
              { id: 'register', label: 'Register' },
              { id: 'reset', label: 'Reset' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setError(null);
                setSuccess(null);
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === tab.id
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5 leading-relaxed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Instant Google Sign-In */}
        {mode !== 'reset' && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-zinc-300 rounded-lg text-sm font-medium text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
              <div className="h-px flex-1 bg-zinc-200" />
              <span>or use email &amp; password</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-medium text-zinc-700 mb-1">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-700 mb-1">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-xs text-gold-600 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="auth-confirm" className="block text-xs font-medium text-zinc-700 mb-1">
                Confirm Password
              </label>
              <input
                id="auth-confirm"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <LogIn className="w-4 h-4" />
            ) : mode === 'register' ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            {mode === 'login'
              ? 'Sign In'
              : mode === 'register'
                ? 'Create Account'
                : 'Send Password Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-[11px] text-zinc-500 text-center leading-relaxed">
          Administrators: Sign in with your verified Google account to access the protected Admin
          Dashboard.
        </p>
      </div>
    </div>
  );
}
