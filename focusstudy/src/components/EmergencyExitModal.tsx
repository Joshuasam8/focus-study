import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, LogOut, CheckSquare } from 'lucide-react';

interface EmergencyExitModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onExit: (savePartial: boolean) => void;
  elapsedMinutes: number;
}

export const EmergencyExitModal: React.FC<EmergencyExitModalProps> = ({
  isOpen,
  onContinue,
  onExit,
  elapsedMinutes,
}) => {
  const [savePartial, setSavePartial] = useState<boolean>(elapsedMinutes >= 3);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border border-slate-200 text-center space-y-6">
        {/* Warning Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
          <AlertCircle className="w-7 h-7" />
        </div>

        {/* Message from prompt */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Exit Focus Mode?</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your current session will not be counted as a completed session.
          </p>
        </div>

        {/* Optional Partial save option if time was put in */}
        {elapsedMinutes >= 3 && (
          <div
            onClick={() => setSavePartial(!savePartial)}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-start space-x-3 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <input
              type="checkbox"
              checked={savePartial}
              onChange={(e) => setSavePartial(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Log {elapsedMinutes} partial study minutes to today&apos;s goal
              </p>
              <p className="text-[11px] text-slate-500">
                Records study time without marking this as a completed pomodoro.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onContinue}
            className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Studying</span>
          </button>

          <button
            onClick={() => onExit(savePartial)}
            className="w-full py-3 px-5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium rounded-2xl transition-colors text-sm flex items-center justify-center space-x-2 border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
