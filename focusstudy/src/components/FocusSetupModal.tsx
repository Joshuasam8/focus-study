import React, { useState } from 'react';
import { Shield, Clock, BookOpen, Layers, Check, Info, Bell, Phone, Smartphone, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DistractionSettings } from '../types';
import { DistractionGuideModal } from './DistractionGuideModal';

interface FocusSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFocus: (sessionConfig: {
    subject: string;
    topic: string;
    durationMinutes: number;
    protectionSettings: DistractionSettings;
    pomodoroMode: boolean;
  }) => void;
  initialSubject?: string;
  initialTopic?: string;
  initialDuration?: number;
}

export const FocusSetupModal: React.FC<FocusSetupModalProps> = ({
  isOpen,
  onClose,
  onStartFocus,
  initialSubject = '',
  initialTopic = '',
  initialDuration = 25,
}) => {
  const { subjects, tasks } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || (subjects.length > 0 ? subjects[0].name : 'Data Structures')
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'Trees');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [duration, setDuration] = useState<number>(initialDuration);
  const [customDurationInput, setCustomDurationInput] = useState<string>('30');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [pomodoroMode, setPomodoroMode] = useState<boolean>(true);

  // Distraction settings
  const [protectionSettings, setProtectionSettings] = useState<DistractionSettings>({
    notifications: true,
    calls: true,
    appDistractions: true,
  });

  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  if (!isOpen) return null;

  // Derive chapters or tasks for currently selected subject
  const currentSubjectObj = subjects.find(s => s.name === selectedSubject);
  const subjectTasks = tasks.filter(t => t.subject === selectedSubject && !t.completed);
  const chapters = currentSubjectObj?.chapters || [];

  const handleStart = () => {
    const finalTopic = customTopic.trim() || selectedTopic.trim() || 'General Focus Review';
    const finalDuration = isCustomDuration ? Math.max(5, parseInt(customDurationInput) || 25) : duration;

    // Request native web notification permissions if enabled
    if (protectionSettings.notifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    onStartFocus({
      subject: selectedSubject || 'General Studies',
      topic: finalTopic,
      durationMinutes: finalDuration,
      protectionSettings,
      pomodoroMode,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Focus Mode Setup
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center space-x-2 mt-4">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'} transition-all`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'} transition-all`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'} transition-all`} />
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            {/* STEP 1: What do you want to study? */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">What do you want to study?</h3>
                  <p className="text-xs text-slate-500 mt-1">Select a course and the specific topic or chapter</p>
                </div>

                {/* Subject Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Course / Subject</span>
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      const sObj = subjects.find(s => s.name === e.target.value);
                      if (sObj && sObj.chapters && sObj.chapters.length > 0) {
                        setSelectedTopic(sObj.chapters[0]);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                    {subjects.length === 0 && (
                      <option value="General Studies">General Studies</option>
                    )}
                  </select>
                </div>

                {/* Planned Topics / Chapters */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Topic or Chapter</span>
                  </label>

                  {/* Suggestions from tasks or subject chapters */}
                  {(chapters.length > 0 || subjectTasks.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-1 pb-2">
                      {chapters.map((chap) => (
                        <button
                          type="button"
                          key={chap}
                          onClick={() => {
                            setSelectedTopic(chap);
                            setCustomTopic('');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selectedTopic === chap && !customTopic
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {chap}
                        </button>
                      ))}

                      {subjectTasks.map((task) => (
                        <button
                          type="button"
                          key={task.id}
                          onClick={() => {
                            setSelectedTopic(task.title);
                            setCustomTopic('');
                            if (task.estimatedDuration) {
                              setDuration(task.estimatedDuration);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selectedTopic === task.title && !customTopic
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          📌 {task.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom Topic Input */}
                  <input
                    type="text"
                    placeholder="Or type a custom topic (e.g. Trees, Calculus Midterm Prep)"
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Duration Presets */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">How long do you want to focus?</h3>
                  <p className="text-xs text-slate-500 mt-1">Choose a research-backed focus interval</p>
                </div>

                {/* Preset Options */}
                <div className="grid grid-cols-2 gap-3">
                  {[25, 45, 60, 90].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => {
                        setDuration(mins);
                        setIsCustomDuration(false);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        !isCustomDuration && duration === mins
                          ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="text-2xl font-bold text-slate-900">
                        {mins} <span className="text-xs font-normal text-slate-500">mins</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {mins === 25 && 'Standard Pomodoro'}
                        {mins === 45 && 'Deep College Sprint'}
                        {mins === 60 && 'Full Hour Immersion'}
                        {mins === 90 && 'Ultradian Peak Flow'}
                      </div>
                      {!isCustomDuration && duration === mins && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Duration */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomDuration(true)}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isCustomDuration
                        ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold">Custom Duration</span>
                    </div>
                    {isCustomDuration && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="5"
                          max="240"
                          value={customDurationInput}
                          onChange={(e) => setCustomDurationInput(e.target.value)}
                          className="w-16 px-2 py-1 text-center font-bold border border-indigo-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs text-slate-500">mins</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Pomodoro Mode Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Pomodoro Interval Mode</p>
                    <p className="text-[11px] text-slate-500">Suggests a 5-minute break immediately after focus</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPomodoroMode(!pomodoroMode)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      pomodoroMode ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        pomodoroMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Ready to Focus & Distraction Protection */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-50 border border-indigo-200/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                    Ready to Focus?
                  </div>
                  <div className="space-y-1.5 text-slate-800 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">📚</span>
                      <span className="font-semibold text-slate-950">{selectedSubject}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base">📖</span>
                      <span className="text-slate-700">{customTopic.trim() || selectedTopic}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base">⏱</span>
                      <span className="text-indigo-900 font-bold">
                        {isCustomDuration ? customDurationInput : duration} Minutes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distraction Protection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-slate-900">🛡 Distraction Protection</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGuideModal(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>OS Guide</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                    {/* Notifications */}
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">🔔 Notifications</p>
                          <p className="text-[11px] text-slate-500">Mute unnecessary alerts & tabs</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setProtectionSettings(p => ({ ...p, notifications: !p.notifications }))
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                          protectionSettings.notifications
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {protectionSettings.notifications ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Calls */}
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">📞 Calls</p>
                          <p className="text-[11px] text-slate-500">Recommend DND call silence</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setProtectionSettings(p => ({ ...p, calls: !p.calls }))
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                          protectionSettings.calls
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {protectionSettings.calls ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* App Distractions */}
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">📱 App Distractions</p>
                          <p className="text-[11px] text-slate-500">Detect tab switches & screen exits</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setProtectionSettings(p => ({ ...p, appDistractions: !p.appDistractions }))
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                          protectionSettings.appDistractions
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {protectionSettings.appDistractions ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Realistic honesty callout */}
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-amber-900 text-xs">
                    <p>
                      FocusStudy cannot directly block notifications or calls from other apps on this device. For complete silence, turn on <strong>Do Not Disturb</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowGuideModal(true)}
                      className="mt-1 font-semibold text-amber-950 underline hover:text-amber-800"
                    >
                      Open DND & Focus Mode Guide →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-200 transition-all flex items-center space-x-1"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-200 transition-all flex items-center space-x-2"
              >
                <span>Enter Focus Mode 🎯</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <DistractionGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onEnableDndPrompt={() => {
          if ('Notification' in window) {
            Notification.requestPermission();
          }
        }}
      />
    </>
  );
};
