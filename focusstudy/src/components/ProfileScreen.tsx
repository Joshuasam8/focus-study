import React, { useState } from 'react';
import {
  User,
  Moon,
  Sun,
  Bell,
  Volume2,
  VolumeX,
  Target,
  GraduationCap,
  Shield,
  RotateCcw,
  LogOut,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types';

interface ProfileScreenProps {
  user: UserProfile;
  settings: AppSettings;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
  onOpenReminders: () => void;
  onOpenDNDGuide: () => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  settings,
  onUpdateUser,
  onUpdateSettings,
  onOpenReminders,
  onOpenDNDGuide,
  onResetData,
  onLogout,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalHours, setGoalHours] = useState(user.dailyGoalHours);

  const handleSaveGoal = () => {
    onUpdateUser({ dailyGoalHours: Number(goalHours) || 4 });
    setIsEditingGoal(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Account & Preferences
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Student Profile
        </h1>
      </div>

      {/* User Card */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {user.name}
            </h2>
            {user.isGuest && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Guest
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {user.email}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {user.major || 'College Student'} • {user.college || 'University'}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Study Goal Configuration */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Daily Study Target
            </span>
          </div>
          <button
            onClick={() => {
              if (isEditingGoal) handleSaveGoal();
              else setIsEditingGoal(true);
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isEditingGoal ? 'Save' : 'Adjust'}
          </button>
        </div>

        {isEditingGoal ? (
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              min="1"
              max="16"
              value={goalHours}
              onChange={(e) => setGoalHours(Number(e.target.value))}
              className="w-20 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm text-center"
            />
            <span className="text-xs text-slate-500">Hours per day</span>
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {user.dailyGoalHours} Hours / Day
            </span>
            <span className="text-xs text-slate-400">Target for deep study</span>
          </div>
        )}
      </div>

      {/* Preferences List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        {/* Dark Mode Toggle */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.darkMode ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Dark Mode</div>
              <div className="text-[11px] text-slate-400">Relax your eyes for night study</div>
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              settings.darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.darkMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Distraction Alert / Focus Check Toggle */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Focus Check Alerts</div>
              <div className="text-[11px] text-slate-400">Gentle check-in if you switch tabs</div>
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateSettings({ distractionAlertEnabled: !settings.distractionAlertEnabled })
            }
            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              settings.distractionAlertEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.distractionAlertEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Notification & Reminders Menu Item */}
        <div
          onClick={onOpenReminders}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Study & Exam Reminders
              </div>
              <div className="text-[11px] text-slate-400">Manage scheduled notifications</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Do Not Disturb & Digital Wellbeing Guide */}
        <div
          onClick={onOpenDNDGuide}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Do Not Disturb (DND) Guide
              </div>
              <div className="text-[11px] text-slate-400">Mute phone & social notifications</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Reset & Logout Actions */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => {
            if (confirm('Reset all courses, tasks, and progress to default college demo data?')) {
              onResetData();
            }
          }}
          className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset to College Sample Data</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold text-xs transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account / Sign Out</span>
        </button>
      </div>
    </div>
  );
};
