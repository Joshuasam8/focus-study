import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Clock, BookOpen, Sparkles, CheckCircle, Coffee, ArrowRight } from 'lucide-react';
import { Task } from '../types';

interface FocusCompleteModalProps {
  isOpen: boolean;
  durationMinutes: number;
  taskTitle: string;
  subjectName: string;
  xpEarned: number;
  task?: Task;
  onMarkTaskCompleted?: (taskId: string) => void;
  onStartBreak: () => void;
  onClose: () => void;
}

export const FocusCompleteModal: React.FC<FocusCompleteModalProps> = ({
  isOpen,
  durationMinutes,
  taskTitle,
  subjectName,
  xpEarned,
  task,
  onMarkTaskCompleted,
  onStartBreak,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-100/50 dark:ring-emerald-900/30">
          <Award className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Great Focus!</span>
        </span>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Focus Session Completed!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Your concentration paid off. Daily study goals updated!
        </p>

        {/* Stats card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 text-left space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Duration
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              {durationMinutes} minutes
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              Topic / Task
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100 max-w-[180px] truncate text-right">
              {taskTitle || subjectName}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              XP Earned
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              +{xpEarned} XP
            </span>
          </div>
        </div>

        {/* Prompt to mark task completed if applicable */}
        {task && !task.completed && onMarkTaskCompleted && (
          <div className="mb-5 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between gap-2 text-left">
            <div className="text-xs text-indigo-900 dark:text-indigo-200">
              <span className="font-semibold block">Finished this task?</span>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300">Mark it completed in your planner</span>
            </div>
            <button
              onClick={() => onMarkTaskCompleted(task.id)}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Mark Done</span>
            </button>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={onStartBreak}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Coffee className="w-4 h-4" />
            <span>Take a 5-Min Break</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.99] text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
