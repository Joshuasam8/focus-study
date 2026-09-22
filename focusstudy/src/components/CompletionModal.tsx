import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Coffee, Check, Clock, BookOpen, Zap } from 'lucide-react';
import { playTimerCompletionChime } from '../utils/audio';

interface CompletionModalProps {
  isOpen: boolean;
  subject: string;
  topic: string;
  durationMinutes: number;
  xpEarned: number;
  interruptionsCount: number;
  pomodoroMode: boolean;
  onStartBreak: () => void;
  onDone: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  subject,
  topic,
  durationMinutes,
  xpEarned,
  interruptionsCount,
  pomodoroMode,
  onStartBreak,
  onDone,
}) => {
  useEffect(() => {
    if (isOpen) {
      playTimerCompletionChime();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch (_) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border border-slate-200 text-center space-y-6">
        {/* Celebration Badge */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
          <Award className="w-8 h-8 text-emerald-600" />
        </div>

        {/* Header from Prompt */}
        <div className="space-y-1">
          <span className="text-2xl">🎉</span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Focus Session Completed!
          </h3>
          <p className="text-xs text-slate-500">
            Great job! Your study habits are getting stronger every day.
          </p>
        </div>

        {/* Stats Card matching prompt specifications */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 divide-y divide-slate-200/60 text-sm">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Study Duration</span>
            </span>
            <span className="font-bold text-slate-900">{durationMinutes} minutes</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Topic</span>
            </span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]" title={topic}>
              {topic}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>XP Earned</span>
            </span>
            <span className="font-extrabold text-indigo-600 text-base">+{xpEarned} XP</span>
          </div>

          {interruptionsCount === 0 ? (
            <div className="pt-2 text-center text-xs font-medium text-emerald-700">
              ✨ Pure Deep Focus: Zero interruptions detected!
            </div>
          ) : (
            <div className="pt-2 text-center text-xs text-slate-500">
              Resumed after {interruptionsCount} {interruptionsCount === 1 ? 'pause' : 'pauses'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {pomodoroMode && (
            <button
              onClick={onStartBreak}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <Coffee className="w-5 h-5" />
              <span>Start 5-Min Break</span>
            </button>
          )}

          <button
            onClick={onDone}
            className={`w-full py-3 px-5 font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 text-sm ${
              pomodoroMode
                ? 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
