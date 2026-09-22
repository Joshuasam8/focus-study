import React from 'react';
import { Eye, ArrowRight, XCircle } from 'lucide-react';

interface FocusCheckModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onEndSession: () => void;
}

export const FocusCheckModal: React.FC<FocusCheckModalProps> = ({
  isOpen,
  onContinue,
  onEndSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <Eye className="w-7 h-7 animate-pulse" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 mb-2">
          Focus Check
        </span>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Hey! You were in Focus Mode.
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          It's completely normal to get briefly sidetracked. Take a gentle breath. Ready to continue studying?
        </p>

        <div className="space-y-2.5">
          <button
            onClick={onContinue}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Continue Studying</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onEndSession}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.99] text-slate-600 dark:text-slate-300 font-medium text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>End Session Early</span>
          </button>
        </div>
      </div>
    </div>
  );
};
