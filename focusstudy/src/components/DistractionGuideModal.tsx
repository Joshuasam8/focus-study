import React from 'react';
import { Shield, BellOff, PhoneOff, Smartphone, X, ExternalLink, CheckCircle } from 'lucide-react';

interface DistractionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableDndPrompt?: () => void;
}

export const DistractionGuideModal: React.FC<DistractionGuideModalProps> = ({
  isOpen,
  onClose,
  onEnableDndPrompt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Distraction Protection Guide</h2>
              <p className="text-xs text-slate-500">System permissions & operating system guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Honest OS Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-2">
            <div className="flex items-start space-x-2 font-medium">
              <span className="text-base">ℹ️</span>
              <span>Important Device Notice</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800">
              FocusStudy cannot directly block notifications or phone calls from other applications on this device due to operating system security sandboxes.
            </p>
            <p className="text-xs font-medium text-amber-900">
              For a completely uninterrupted study session, we recommend enabling your device&apos;s native <strong>Do Not Disturb / Focus Mode</strong>.
            </p>
          </div>

          {/* Quick Action */}
          {onEnableDndPrompt && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  onEnableDndPrompt();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-center shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Request Focus Notification Permissions</span>
              </button>
            </div>
          )}

          {/* Android Guide */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <div className="flex items-center space-x-2 font-semibold text-slate-900">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Android Guide: Block Calls & Notifications</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 font-mono text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-800">Settings → Sound & Vibration → Do Not Disturb</p>
              <p className="text-slate-600 pl-3">↳ <strong>Calls</strong> → Select &ldquo;Don&apos;t allow calls&rdquo;</p>
              <p className="text-slate-600 pl-3">↳ <strong>Apps</strong> → Turn off notifications for social & messaging</p>
              <p className="text-slate-600 pl-3">↳ <strong>Quick Settings:</strong> Swipe down from top → Tap &ldquo;Do Not Disturb&rdquo;</p>
            </div>
          </div>

          {/* iOS / iPhone Guide */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <div className="flex items-center space-x-2 font-semibold text-slate-900">
              <PhoneOff className="w-4 h-4 text-indigo-600" />
              <span>iPhone / iPad Guide: Focus & Call Protection</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 font-mono text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-800">Settings → Focus → Do Not Disturb</p>
              <p className="text-slate-600 pl-3">↳ <strong>People</strong> → Allow Calls From: &ldquo;Allowed People Only&rdquo; or &ldquo;Nobody&rdquo;</p>
              <p className="text-slate-600 pl-3">↳ <strong>Apps</strong> → Silence alerts while in study session</p>
              <p className="text-slate-600 pl-3">↳ <strong>Control Center:</strong> Swipe down from top right → Tap &ldquo;Focus&rdquo; → &ldquo;Study&rdquo;</p>
            </div>
          </div>

          {/* Browser / Laptop Guide */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <div className="flex items-center space-x-2 font-semibold text-slate-900">
              <BellOff className="w-4 h-4 text-purple-600" />
              <span>Mac & Windows Focus Assist</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1">
              <p><strong>Mac:</strong> Click Control Center in the top menu bar → Turn on <strong>Focus</strong>.</p>
              <p><strong>Windows:</strong> Click Notification Center in bottom right taskbar → Tap <strong>Focus</strong> or <strong>Focus Assist</strong>.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-medium rounded-xl text-sm hover:bg-slate-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
