import React from 'react';
import { Sparkles, ArrowRight, XCircle } from 'lucide-react';

interface InterruptionModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onEndSession: () => void;
  interruptionDurationSeconds?: number;
}

export const InterruptionModal: React.FC<InterruptionModalProps> = ({
  isOpen,
  onContinue,
  onEndSession,
  interruptionDurationSeconds = 0,
}) => {
  if (!isOpen) return null;

  const minutesAway = Math.floor(interruptionDurationSeconds / 60);
  const secondsAway = Math.floor(interruptionDurationSeconds % 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border border-slate-200 text-center space-y-6">
        {/* Friendly gentle icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-inner">
          <Sparkles className="w-8 h-8 text-amber-500" />
        </div>

        {/* Message strictly adhering to non-shaming user prompt */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">
            Hey! You were in Focus Mode.
          </h3>
          <p className="text-sm text-slate-600">
            Ready to continue studying?
          </p>
          {interruptionDurationSeconds > 5 && (
            <p className="text-xs text-slate-400 font-mono">
              Paused for {minutesAway > 0 ? `${minutesAway}m ` : ''}{secondsAway}s while away
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onContinue}
            className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 text-base"
          >
            <span>Continue Studying</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onEndSession}
            className="w-full py-3 px-5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-2xl transition-colors text-sm flex items-center justify-center space-x-1.5"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>End Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
