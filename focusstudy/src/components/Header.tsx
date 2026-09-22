import React from 'react';
import {
  Target,
  GraduationCap,
  Moon,
  Sun,
  Shield,
  Flame,
  Bell,
} from 'lucide-react';
import { ActiveTab, UserProfile, AppSettings } from '../types';

interface HeaderProps {
  user: UserProfile;
  settings: AppSettings;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onToggleDarkMode: () => void;
  onOpenDNDGuide: () => void;
  onOpenReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  settings,
  activeTab,
  onSelectTab,
  onToggleDarkMode,
  onOpenDNDGuide,
  onOpenReminders,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 transition-colors"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              FocusStudy
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Exams Tab Shortcut */}
          <button
            onClick={() => onSelectTab('exams')}
            className={`p-2 rounded-xl transition ${
              activeTab === 'exams'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Exam Planner"
          >
            <GraduationCap className="w-4 h-4" />
          </button>

          {/* Reminders Button */}
          <button
            onClick={onOpenReminders}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Study Reminders"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* DND Guide Button */}
          <button
            onClick={onOpenDNDGuide}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Do Not Disturb & Digital Wellbeing Guide"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={settings.darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {settings.darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
