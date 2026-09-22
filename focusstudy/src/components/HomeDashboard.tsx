import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Target,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  BookOpen,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';

interface HomeDashboardProps {
  onStartFocus: () => void;
  onNavigateToPlanner: () => void;
  onNavigateToExams: () => void;
  onFocusTask: (task: Task) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartFocus,
  onNavigateToPlanner,
  onNavigateToExams,
  onFocusTask,
}) => {
  const { userProfile, tasks, studySessions, exams, toggleTaskComplete, updateDailyGoal } = useApp();
  const [editingGoal, setEditingGoal] = useState<boolean>(false);
  const [tempGoalMinutes, setTempGoalMinutes] = useState<number>(userProfile?.dailyGoal || 240);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate today's completed study time in minutes
  const todayMinutes = studySessions
    .filter((s) => {
      if (!s.createdAt) return false;
      const dateStr = s.createdAt.seconds
        ? new Date(s.createdAt.seconds * 1000).toISOString().split('T')[0]
        : new Date(s.createdAt).toISOString().split('T')[0];
      return dateStr === todayStr;
    })
    .reduce((sum, s) => sum + (s.actualDuration || 0), 0);

  const goalMinutes = userProfile?.dailyGoal || 240;
  const progressPercent = Math.min(100, Math.round((todayMinutes / Math.max(1, goalMinutes)) * 100));

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Filter tasks for today or uncompleted
  const todayTasks = tasks.filter(t => t.date === todayStr || !t.completed).slice(0, 4);

  // Next upcoming exam
  const upcomingExam = exams.length > 0 ? exams[0] : null;
  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Passed';
    return `In ${diffDays} days`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Greeting & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-800">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()} 👋
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome, <span className="font-semibold text-slate-800">{userProfile?.name || 'Student'}</span>. Ready to make progress today?
          </p>
        </div>

        {/* Streak & XP Pills */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-bold text-xs shadow-xs">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-bounce" />
            <span>🔥 {userProfile?.currentStreak || 0} Day Streak</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full font-bold text-xs shadow-xs">
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-500" />
            <span>⚡ {userProfile?.totalXP || 0} XP</span>
          </div>
        </div>
      </div>

      {/* 2. THE HERO: Prominent "START FOCUS MODE" Button & Daily Goal Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Main Focus Mode Launch Hero */}
        <div className="md:col-span-7 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-indigo-900/10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative background ring */}
          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DIStraction-Free Focus Mode</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Zero interruptions. Pure flow.
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-sm">
              Lock in for a focused sprint. Automatically silences distractions and tracks deep habit consistency.
            </p>
          </div>

          {/* THE MOST IMPORTANT BUTTON (Visually Prominent) */}
          <div className="pt-6 relative z-10">
            <button
              onClick={onStartFocus}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform active:scale-98 flex items-center justify-center space-x-2.5 text-base sm:text-lg group"
            >
              <span className="text-xl">🎯</span>
              <span>START FOCUS MODE</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Today's Goal & Progress Card */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Today&apos;s Goal</span>
              </span>
              <button
                onClick={() => setEditingGoal(!editingGoal)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {editingGoal ? 'Done' : 'Change'}
              </button>
            </div>

            {editingGoal ? (
              <div className="flex items-center space-x-2 py-1">
                <input
                  type="number"
                  step="15"
                  min="15"
                  max="720"
                  value={tempGoalMinutes}
                  onChange={(e) => setTempGoalMinutes(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-indigo-300 rounded-lg text-sm font-bold"
                />
                <span className="text-xs text-slate-500">minutes</span>
                <button
                  onClick={() => {
                    updateDailyGoal(tempGoalMinutes);
                    setEditingGoal(false);
                  }}
                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatHoursMins(goalMinutes)}
                </span>
                <span className="text-xs font-medium text-slate-500">daily target</span>
              </div>
            )}

            {/* Time progress fraction matching prompt */}
            <div className="text-sm font-semibold text-slate-700">
              {formatHoursMins(todayMinutes)} / {formatHoursMins(goalMinutes)}
            </div>

            {/* Progress percentage bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Progress</span>
                <span className="text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>🔥 {userProfile?.currentStreak || 0} Day Streak</span>
            <span>Best: {userProfile?.longestStreak || 0} days</span>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Tasks & Upcoming Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Upcoming Tasks */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Upcoming Study Tasks</h3>
            </div>
            <button
              onClick={onNavigateToPlanner}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
            >
              <span>View All Planner</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <p className="text-xs">No pending tasks scheduled for today.</p>
              <button
                onClick={onNavigateToPlanner}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task in Study Planner</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                      : 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-slate-700 truncate max-w-[120px]">
                          {task.subject}
                        </span>
                        {task.chapter && (
                          <span className="text-slate-400">• {task.chapter}</span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                            task.priority === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs text-slate-500 font-medium">
                      {task.estimatedDuration}m
                    </span>
                    {!task.completed && (
                      <button
                        onClick={() => onFocusTask(task)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                        title="Focus on this topic"
                      >
                        Focus 🎯
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Exam Card */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Upcoming Exam</span>
              </span>
              <button
                onClick={onNavigateToExams}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Manage
              </button>
            </div>

            {upcomingExam ? (
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-2">
                <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  {upcomingExam.subject}
                </div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {upcomingExam.title}
                </h4>
                <div className="pt-1 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">{upcomingExam.date}</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                    {getDaysUntil(upcomingExam.date)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <Sparkles className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No exams scheduled yet.</p>
                <button
                  onClick={onNavigateToExams}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  + Add Exam Schedule
                </button>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium">
            💡 <strong>Study Tip:</strong> 25 minutes of active retrieval beats 2 hours of passive reading.
          </div>
        </div>
      </div>
    </div>
  );
};
