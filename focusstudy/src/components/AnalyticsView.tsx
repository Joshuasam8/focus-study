import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Flame,
  Zap,
  Clock,
  CheckCircle,
  ShieldCheck,
  Award,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { userProfile, studySessions, subjects } = useApp();

  // Compute stats
  const totalMinutes = studySessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
  const totalSessions = studySessions.length;
  const completedSessions = studySessions.filter((s) => s.completed).length;
  const totalInterruptions = studySessions.reduce((sum, s) => sum + (s.interruptionsCount || 0), 0);

  // Past 7 days chart data
  const getLast7DaysData = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayMins = studySessions
        .filter((s) => {
          if (!s.createdAt) return false;
          const sDate = s.createdAt.seconds
            ? new Date(s.createdAt.seconds * 1000).toISOString().split('T')[0]
            : new Date(s.createdAt).toISOString().split('T')[0];
          return sDate === dateStr;
        })
        .reduce((sum, s) => sum + (s.actualDuration || 0), 0);

      days.push({
        name: dayName,
        date: dateStr,
        minutes: dayMins,
      });
    }
    return days;
  };

  const weeklyData = getLast7DaysData();

  // Subject breakdown
  const subjectBreakdown = subjects.map((sub) => {
    const mins = studySessions
      .filter((s) => s.subject === sub.name)
      .reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    return {
      name: sub.name,
      color: sub.color || '#4F46E5',
      minutes: mins,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track & Improve
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review study consistency, focus telemetry, and habit streaks
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Total Time</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Logged in deep focus</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Habit Streak</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center space-x-1">
            <span>🔥 {userProfile?.currentStreak || 0}</span>
            <span className="text-sm font-semibold text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Best streak: {userProfile?.longestStreak || 0} days
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Total XP</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {userProfile?.totalXP || 0}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Level: Scholar Tier</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Focus Ratio</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100}%
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Completed without exit</p>
        </div>
      </div>

      {/* Past 7 Days Study Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Past 7 Days Study Time (Minutes)</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Daily Target: {userProfile?.dailyGoal || 240}m</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} minutes`, 'Studied']}
              />
              <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.minutes >= (userProfile?.dailyGoal || 240) ? '#10B981' : '#4F46E5'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Distribution & Distraction Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Subject Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Course Time Distribution</h3>
          </div>

          <div className="space-y-3">
            {subjectBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No subjects logged yet.</p>
            ) : (
              subjectBreakdown.map((item) => {
                const percent = totalMinutes > 0 ? Math.round((item.minutes / totalMinutes) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 truncate max-w-[200px]">{item.name}</span>
                      <span className="text-slate-500">{item.minutes}m ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distraction Telemetry strictly adhering to Section 9 of the prompt */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Distraction Telemetry</h3>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total Interruption Pauses:</span>
              <span className="font-bold text-slate-900">{totalInterruptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Completed Focus Sprints:</span>
              <span className="font-bold text-emerald-600">{completedSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Partial Sessions:</span>
              <span className="font-bold text-slate-900">{totalSessions - completedSessions}</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900">
            <strong>Philosophy:</strong> Remember, interruptions happen to every student. What builds greatness is gently returning to flow without self-criticism.
          </div>
        </div>
      </div>

      {/* Historical Session Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Recent Focus Sessions</h3>
        {studySessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No focus sessions logged yet. Start your first session on the Home Dashboard!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {studySessions.slice(0, 8).map((session) => (
              <div key={session.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{session.topic}</p>
                  <p className="text-slate-500 text-xs">
                    {session.subject} • {session.actualDuration}m studied
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-600">+{session.xpEarned} XP</span>
                  <p className="text-[11px] text-slate-400">
                    {session.completed ? '🎉 Completed' : 'Partial'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
