import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  BookOpen,
  Calendar,
  BarChart3,
  Home,
  LogOut,
  User,
  Shield,
  Clock,
  ArrowRight,
  Target,
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { HomeDashboard } from './components/HomeDashboard';
import { StudyPlanner } from './components/StudyPlanner';
import { ExamsView } from './components/ExamsView';
import { AnalyticsView } from './components/AnalyticsView';
import { FocusSetupModal } from './components/FocusSetupModal';
import { FocusModeScreen } from './components/FocusModeScreen';
import { AuthModal } from './components/AuthModal';
import { Task, DistractionSettings } from './types';

type ActiveTab = 'home' | 'planner' | 'exams' | 'analytics';

function MainApp() {
  const { currentUser, isGuest, userProfile, loading, logOut, recordStudySession, continueAsGuest } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Focus Setup Modal state
  const [isFocusSetupOpen, setIsFocusSetupOpen] = useState<boolean>(false);
  const [focusInitialSubject, setFocusInitialSubject] = useState<string>('');
  const [focusInitialTopic, setFocusInitialTopic] = useState<string>('');
  const [focusInitialDuration, setFocusInitialDuration] = useState<number>(25);

  // Active Focus Mode session state
  const [activeFocusSession, setActiveFocusSession] = useState<{
    subject: string;
    topic: string;
    durationMinutes: number;
    protectionSettings: DistractionSettings;
    pomodoroMode: boolean;
  } | null>(null);

  // Focus trigger from task or exam
  const handleFocusTask = (task: Task) => {
    setFocusInitialSubject(task.subject);
    setFocusInitialTopic(task.chapter ? `${task.chapter}: ${task.title}` : task.title);
    setFocusInitialDuration(task.estimatedDuration || 25);
    setIsFocusSetupOpen(true);
  };

  const handleFocusSubject = (subject: string, topic: string) => {
    setFocusInitialSubject(subject);
    setFocusInitialTopic(topic);
    setFocusInitialDuration(45);
    setIsFocusSetupOpen(true);
  };

  const handleStartFocusSession = (config: {
    subject: string;
    topic: string;
    durationMinutes: number;
    protectionSettings: DistractionSettings;
    pomodoroMode: boolean;
  }) => {
    setActiveFocusSession(config);
  };

  const handleSessionComplete = (sessionData: {
    subject: string;
    topic: string;
    targetDuration: number;
    actualDuration: number;
    completed: boolean;
    interruptionsCount: number;
    xpEarned: number;
  }) => {
    recordStudySession(sessionData);
  };

  // If currently in Focus Mode, completely simplify UI! Hide all navigation, sidebars, headers, cards
  if (activeFocusSession) {
    return (
      <FocusModeScreen
        subject={activeFocusSession.subject}
        topic={activeFocusSession.topic}
        initialDurationMinutes={activeFocusSession.durationMinutes}
        protectionSettings={activeFocusSession.protectionSettings}
        pomodoroMode={activeFocusSession.pomodoroMode}
        onExitFocus={() => setActiveFocusSession(null)}
        onSessionComplete={handleSessionComplete}
      />
    );
  }

  // Welcome / Onboarding Screen if not authenticated and not guest
  if (!loading && !currentUser && !isGuest) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        {/* Navigation header */}
        <header className="max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-xl">🎯</span>
            </div>
            <span className="text-xl font-black tracking-tight">FocusStudy</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-md transition-all"
            >
              Get Started
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto w-full px-6 py-12 sm:py-16 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built Specifically for College Students</span>
          </div>

          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Master your studies with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400">
                zero distractions
              </span>
              .
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Plan courses and chapters, lock into an interruption-free study sanctuary, prepare for exams, and build indestructible daily study habits.
            </p>
          </div>

          {/* Core Philosophy Banner */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-slate-400 py-2">
            <span className="text-indigo-400">Plan</span>
            <span>→</span>
            <span className="text-emerald-400">Focus</span>
            <span>→</span>
            <span className="text-teal-400">Study</span>
            <span>→</span>
            <span className="text-amber-400">Track</span>
            <span>→</span>
            <span className="text-purple-400">Improve</span>
          </div>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <button
              onClick={() => {
                setAuthMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 transition-all text-base flex items-center justify-center space-x-2 active:scale-98"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                continueAsGuest();
              }}
              className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 text-base transition-colors"
            >
              Continue as Guest (Instant Preview)
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-12 text-left max-w-3xl w-full">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Distraction-Free Mode</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Minimalist full-screen timer, ambient audio generator, and non-shaming interruption telemetry.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Chapter Study Planner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Break subjects into digestible chapters with priority tagging and estimated focus intervals.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Habit Streaks & Exams</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stay accountable with daily streaks, XP progression, and exact exam countdown milestones.
              </p>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800">
          FocusStudy • Powered by Cloud Firestore & Firebase Auth
        </footer>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center space-x-2 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-950 block leading-none">
                  FocusStudy
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  College Planner
                </span>
              </div>
            </button>
          </div>

          {/* Quick Stats & User Profile Action */}
          <div className="flex items-center space-x-3">
            {/* Streak & XP Display */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>{userProfile?.currentStreak || 0}d</span>
              </div>

              <div className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-full text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-500" />
                <span>{userProfile?.totalXP || 0} XP</span>
              </div>
            </div>

            {/* Quick Focus Button in Header */}
            <button
              onClick={() => {
                setFocusInitialSubject('');
                setFocusInitialTopic('');
                setFocusInitialDuration(25);
                setIsFocusSetupOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-1"
            >
              <span>🎯 Focus</span>
            </button>

            {/* Account / Guest switch */}
            {isGuest ? (
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold border border-indigo-200 transition-colors"
                title="Guest Mode: Click to create account & sync cloud backup"
              >
                Guest (Sync Cloud)
              </button>
            ) : (
              <button
                onClick={logOut}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-4xl mx-auto px-4 flex items-center space-x-1 sm:space-x-2 border-t border-slate-100 overflow-x-auto text-xs font-semibold py-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Planner</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'exams'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Exams</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Track & Habits</span>
          </button>
        </div>
      </header>

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <HomeDashboard
            onStartFocus={() => {
              setFocusInitialSubject('');
              setFocusInitialTopic('');
              setFocusInitialDuration(25);
              setIsFocusSetupOpen(true);
            }}
            onNavigateToPlanner={() => setActiveTab('planner')}
            onNavigateToExams={() => setActiveTab('exams')}
            onFocusTask={handleFocusTask}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner onFocusTask={handleFocusTask} />
        )}

        {activeTab === 'exams' && (
          <ExamsView onFocusSubject={handleFocusSubject} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}
      </main>

      {/* Focus Mode Setup Modal */}
      <FocusSetupModal
        isOpen={isFocusSetupOpen}
        onClose={() => setIsFocusSetupOpen(false)}
        onStartFocus={handleStartFocusSession}
        initialSubject={focusInitialSubject}
        initialTopic={focusInitialTopic}
        initialDuration={focusInitialDuration}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
