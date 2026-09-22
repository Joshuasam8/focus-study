import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, Sparkles, AlertCircle, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { signInEmail, signUpEmail, signInGoogle, continueAsGuest, resetPassword, authError, clearAuthError } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMessage(null);
    clearAuthError();

    try {
      if (mode === 'login') {
        await signInEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setFeedbackMessage('Please enter your full name');
          setSubmitting(false);
          return;
        }
        await signUpEmail(name.trim(), email, password);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setFeedbackMessage('Password reset email sent! Check your inbox.');
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    clearAuthError();
    try {
      await signInGoogle();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onClose();
  };

  const formatAuthError = (errStr: string | null) => {
    if (!errStr) return null;
    if (errStr.includes('operation-not-allowed')) {
      return 'Email/Password sign-in is not activated in this Firebase project yet. Please use "Continue with Google" or "Continue as Guest" below!';
    }
    if (errStr.includes('popup-blocked')) {
      return 'The sign-in popup was blocked by your browser. Please allow popups or click "Continue as Guest".';
    }
    if (errStr.includes('unauthorized-domain')) {
      return 'This web domain is not yet on the Firebase authorized domains list. Please use "Continue as Guest" for instant offline access!';
    }
    if (errStr.includes('popup-closed-by-user')) {
      return 'Google sign-in popup was closed before completion. Please try again or continue as guest.';
    }
    if (errStr.includes('invalid-credential') || errStr.includes('user-not-found') || errStr.includes('wrong-password')) {
      return 'Incorrect email or password. Please verify credentials or create an account.';
    }
    if (errStr.includes('email-already-in-use')) {
      return 'This email address already has an account. Please switch to Sign In.';
    }
    return errStr;
  };

  const friendlyError = formatAuthError(authError);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Branding */}
        <div className="p-8 pb-5 bg-gradient-to-b from-indigo-50/70 via-slate-50/50 to-white text-center space-y-2 border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">FocusStudy</h2>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to synchronize study streaks, chapters, and exam schedules.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-4">
          {friendlyError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{friendlyError}</span>
              </div>
              <button
                type="button"
                onClick={handleGuest}
                className="w-full py-1.5 px-3 bg-white hover:bg-rose-100/70 text-rose-800 font-bold rounded-xl border border-rose-300 text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <span>Continue as Guest Instead (Instant Access)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {feedbackMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Primary Quick Sign-in Options */}
          <div className="space-y-2.5">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full py-3 px-4 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl text-sm transition-all flex items-center justify-center space-x-3 shadow-xs active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Guest Mode */}
            <button
              type="button"
              onClick={handleGuest}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-2xl text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue as Guest (Offline Local Storage)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">
              Or with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Tab switcher */}
          <div className="flex border border-slate-200 rounded-xl p-0.5 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearAuthError();
                setFeedbackMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearAuthError();
                setFeedbackMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            {/* Name (Sign up only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-all text-xs flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span className="animate-spin text-xs">⏳ Please wait...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </>
              ) : (
                <span>Send Reset Instructions</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
