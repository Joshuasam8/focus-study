import React from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  TrendingUp,
  Calendar,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Subject, Task, FocusSession, UserProfile } from '../types';
import { getTodayStudyMinutes } from '../utils/storage';

interface ProgressScreenProps {
  user: UserProfile;
  subjects: Subject[];
  tasks: Task[];
  sessions: FocusSession[];
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  user,
  subjects,
  tasks,
  sessions,
}) => {
  const todayMinutes = getTodayStudyMinutes(sessions);
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalSessionsCount = sessions.length;

  // Calculate day-by-day stats for the past 7 days
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();

  // Create last 7 days array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];

    // Sum minutes for this date
    const dayMinutes = sessions
      .filter((s) => s.completedAt.startsWith(dateStr))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    const hours = (dayMinutes / 60);

    return {
      dateStr,
      dayName,
      minutes: dayMinutes,
      hours: Number(hours.toFixed(1)),
      isToday: i === 6,
    };
  });

  const weeklyTotalHours = last7Days.reduce((acc, d) => acc + d.hours, 0);
  const maxDayHours = Math.max(...last7Days.map((d) => d.hours), 4);

  // Subject-wise hours breakdown
  const subjectBreakdown = subjects.map((sub) => {
    const subSessions = sessions.filter(
      (s) => s.subjectId === sub.id || s.subjectName.toLowerCase() === sub.name.toLowerCase()
    );
    const totalMinutes = subSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const hours = Number((totalMinutes / 60).toFixed(1));
    return {
      subject: sub,
      hours,
      totalMinutes,
      percentage: weeklyTotalHours > 0 ? Math.round((hours / weeklyTotalHours) * 100) : 0,
    };
  });

  // Calculate level based on XP
  const level = Math.floor(user.xp / 400) + 1;
  const nextLevelXp = level * 400;
  const currentLevelProgress = Math.min(100, Math.round(((user.xp % 400) / 400) * 100));

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Analytics & Consistency
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Study Progress
        </h1>
      </div>

      {/* Streak Showcase Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/20 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-100 uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-current text-amber-200 animate-bounce" />
            <span>Active Momentum</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            {user.streak} Day Streak!
          </h2>
          <p className="text-xs text-amber-100/90">
            Study every day to keep your focus fire burning.
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
          <Flame className="w-8 h-8 text-white fill-white" />
        </div>
      </div>

      {/* Key Metric Numbers Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Today</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {(todayMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-[10px] text-slate-400">Goal: {user.dailyGoalHours}h</div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Week</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {weeklyTotalHours.toFixed(1)}h
          </div>
          <div className="text-[10px] text-slate-400">Past 7 Days</div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Tasks</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {completedTasksCount}
          </div>
          <div className="text-[10px] text-slate-400">{totalSessionsCount} Sessions</div>
        </div>
      </div>

      {/* Weekly Study Chart (Monday -> 2h, Tuesday -> 3h, etc.) */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Study Hours
            </h3>
            <p className="text-xs text-slate-400">
              Total {weeklyTotalHours.toFixed(1)} hours logged this week
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            Avg {(weeklyTotalHours / 7).toFixed(1)}h / day
          </span>
        </div>

        {/* Clean Bar Visualizer */}
        <div className="pt-6 pb-2 flex items-end justify-between gap-2 h-44">
          {last7Days.map((day) => {
            const heightPercent = maxDayHours > 0 ? (day.hours / maxDayHours) * 100 : 0;
            return (
              <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-indigo-600 transition">
                  {day.hours > 0 ? `${day.hours}h` : '0'}
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-end justify-center overflow-hidden h-28">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      day.isToday
                        ? 'bg-indigo-600 dark:bg-indigo-500'
                        : 'bg-indigo-300 dark:bg-indigo-800 hover:bg-indigo-400'
                    }`}
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-bold ${
                    day.isToday
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Weekly List View for clear scannability */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
          {last7Days.map((d) => (
            <div key={d.dateStr} className="flex items-center justify-between text-slate-600 dark:text-slate-400 py-0.5">
              <span className={d.isToday ? 'font-bold text-slate-900 dark:text-white' : ''}>
                {d.dayName} {d.isToday ? '(Today)' : ''}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {d.hours} Hours
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject-Wise Study Distribution */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Subject-Wise Progress
          </h3>
          <span className="text-xs text-slate-400">Total Hours</span>
        </div>

        <div className="space-y-3.5">
          {subjectBreakdown.map((item) => (
            <div key={item.subject.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.subject.color }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.subject.name}
                  </span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {item.hours}h ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: item.subject.color,
                    width: `${Math.max(2, item.percentage)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Level & XP Rewards */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Student Rank
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                Level {level} Focus Scholar
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            {user.xp} XP Total
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Next rank progress</span>
            <span>{currentLevelProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
