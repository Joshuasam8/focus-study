import React from 'react';
import { Shield, BellOff, Smartphone, Laptop, Apple, ExternalLink, X, CheckCircle2 } from 'lucide-react';

interface DNDGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DNDGuideModal: React.FC<DNDGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Focus & Do Not Disturb</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Maximize distraction-free concentration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of web limitation with transparent explanation */}
        <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-3">
          <BellOff className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            <span className="font-semibold block mb-0.5">System-Level Notification Note:</span>
            Web browsers enforce security sandboxes preventing web pages from directly toggling your phone’s system Do Not Disturb switch. Use the quick shortcuts below to mute phone calls and social notifications during your session:
          </div>
        </div>

        {/* Quick OS Instructions */}
        <div className="mt-5 space-y-3">
          {/* iOS / iPadOS */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Apple className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>iPhone & iPad (iOS Focus Mode)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Swipe down from top-right corner to open <strong>Control Center</strong> → Tap <strong>Focus</strong> → Select <strong>Do Not Disturb</strong> or <strong>Study</strong>.
            </p>
          </div>

          {/* Android */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Android (Digital Wellbeing & DND)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Swipe down twice from top of screen → Tap the <strong>Do Not Disturb</strong> quick toggle, or open <strong>Settings → Digital Wellbeing → Focus Mode</strong> to pause distracting apps (Instagram, TikTok, WhatsApp).
            </p>
          </div>

          {/* Mac & Windows */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Mac & Windows Laptop</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              <strong>Mac:</strong> Click the Control Center icon in menu bar → Focus → Do Not Disturb.<br />
              <strong>Windows:</strong> Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">Win + N</kbd> → Click <strong>Focus</strong> to silence banners for 25-60 minutes.
            </p>
          </div>
        </div>

        {/* In-App Guarantees */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            FocusStudy Guarantees:
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero in-app popups, feeds, or advertisements while studying</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Automatic Focus Check distraction alert if you switch tabs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Fullscreen lock mode with serene progress indicator</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition shadow-sm"
          >
            I'm Ready to Study
          </button>
        </div>
      </div>
    </div>
  );
};
