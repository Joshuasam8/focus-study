import React, { useState } from 'react';
import { Target, Sparkles, GraduationCap, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onContinueAsGuest,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex.chen@university.edu');
  const [password, setPassword] = useState('study123');
  const [college, setCollege] = useState('State University');
  const [major, setMajor] = useState('Computer Science');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'College Student',
      email: email.trim() || 'student@university.edu',
      college: college.trim() || 'University',
      major: major.trim() || 'Computer Science',
      dailyGoalHours: 4,
      xp: isSignUp ? 100 : 1420,
      streak: isSignUp ? 1 : 7,
      lastStudyDate: new Date().toISOString().split('T')[0],
      isGuest: false,
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center px-4 py-8 select-none">
      <div className="max-w-sm w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Target className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            FocusStudy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Smart distraction-free study planner for college students
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mt-2">
            <span>Plan</span>
            <span>→</span>
            <span>Focus</span>
            <span>→</span>
            <span>Study</span>
            <span>→</span>
            <span>Track</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-lg transition ${
                !isSignUp
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-lg transition ${
                isSignUp
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {isSignUp && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                College Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {isSignUp && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    University / College
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="State University"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Major
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-sm mt-4 flex items-center justify-center gap-2"
            >
              <span>{isSignUp ? 'Create Student Account' : 'Log In & Study'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2 text-center text-slate-400 text-xs">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative bg-white dark:bg-slate-900 px-2 text-[11px] font-semibold">
              OR
            </span>
          </div>

          {/* Continue as Guest Button */}
          <button
            onClick={onContinueAsGuest}
            type="button"
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-indigo-500" />
            <span>Continue as Guest</span>
          </button>
        </div>

        {/* Demo Data Tip */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          Pre-loaded with college demo courses (Data Structures, OS, DB, Linear Algebra).
        </div>
      </div>
    </div>
  );
};
