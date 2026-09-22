import React from 'react';
import {
  Home,
  BookOpen,
  Target,
  BarChart2,
  User,
  GraduationCap,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onStartFocus: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onStartFocus,
}) => {
  return (
    <nav
      id="bottom-nav-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 transition-colors"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* 1. Home Tab */}
        <button
          id="nav-tab-home"
          onClick={() => onSelectTab('home')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition ${
            activeTab === 'home'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* 2. Planner Tab */}
        <button
          id="nav-tab-planner"
          onClick={() => onSelectTab('planner')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition ${
            activeTab === 'planner'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Planner</span>
        </button>

        {/* 3. CENTER VISUALLY PROMINENT FOCUS BUTTON */}
        <div className="relative -top-5 flex flex-col items-center px-1">
          <button
            id="nav-tab-focus-prominent"
            onClick={onStartFocus}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 hover:scale-105 active:scale-95 transition-all ring-4 ring-white dark:ring-slate-900"
            aria-label="Start Focus Mode"
          >
            <Target className="w-7 h-7 animate-pulse" />
          </button>
          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">
            Focus
          </span>
        </div>

        {/* 4. Progress Tab */}
        <button
          id="nav-tab-progress"
          onClick={() => onSelectTab('progress')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition ${
            activeTab === 'progress'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Progress</span>
        </button>

        {/* 5. Exams Shortcut or Profile Tab */}
        <button
          id="nav-tab-profile"
          onClick={() => onSelectTab('settings')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition ${
            activeTab === 'settings'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
