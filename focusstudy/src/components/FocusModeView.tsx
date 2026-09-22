import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Sparkles,
  Shield,
  Coffee,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Headphones,
  Sliders,
  ArrowLeft,
} from 'lucide-react';
import { Subject, Task, FocusSession, AppSettings } from '../types';
import { playCompletionBell, playStartSound, ambientPlayer } from '../utils/sound';
import { DNDGuideModal } from './DNDGuideModal';
import { FocusCheckModal } from './FocusCheckModal';
import { FocusCompleteModal } from './FocusCompleteModal';

interface FocusModeViewProps {
  subjects: Subject[];
  tasks: Task[];
  settings: AppSettings;
  preselectedTaskId?: string | null;
  onSessionComplete: (session: FocusSession) => void;
  onMarkTaskCompleted?: (taskId: string) => void;
  onExitFocusMode?: () => void;
}

const MOTIVATIONAL_WHISPERS = [
  'Deep work is where mastery lives.',
  'One concept, one problem at a time.',
  'Your future self is thanking you right now.',
  'Focus is the superpower of modern students.',
  'Quiet the noise. Trust the process.',
  'Stay with the problem just five more minutes.',
  'Consistency beats intensity every single day.',
];

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  subjects,
  tasks,
  settings,
  preselectedTaskId,
  onSessionComplete,
  onMarkTaskCompleted,
  onExitFocusMode,
}) => {
  // Setup State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    preselectedTaskId || ''
  );
  const [customTopic, setCustomTopic] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // in minutes
  const [customDurationInput, setCustomDurationInput] = useState<string>('30');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'whitenoise' | 'library'>(
    settings.ambientSound || 'none'
  );
  const [ambientVol, setAmbientVol] = useState<number>(settings.ambientVolume || 0.5);

  // Active Session State
  const [isActiveSession, setIsActiveSession] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // seconds
  const [totalTime, setTotalTime] = useState<number>(25 * 60);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [dndModalOpen, setDndModalOpen] = useState<boolean>(false);
  const [focusCheckOpen, setFocusCheckOpen] = useState<boolean>(false);
  const [completeModalOpen, setCompleteModalOpen] = useState<boolean>(false);

  // Completed session info for celebration modal
  const [lastCompletedSession, setLastCompletedSession] = useState<{
    duration: number;
    title: string;
    subject: string;
    xp: number;
    task?: Task;
  } | null>(null);

  // Motivational quote cycle
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Focus container ref
  const focusContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Preselection effect
  useEffect(() => {
    if (preselectedTaskId) {
      const task = tasks.find((t) => t.id === preselectedTaskId);
      if (task) {
        setSelectedTaskId(task.id);
        setSelectedSubjectId(task.subjectId);
        if (task.estimatedDuration) {
          setSelectedDuration(task.estimatedDuration);
          setTimeLeft(task.estimatedDuration * 60);
          setTotalTime(task.estimatedDuration * 60);
        }
      }
    }
  }, [preselectedTaskId, tasks]);

  // Current selected subject & task objects
  const currentSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId),
    [subjects, selectedSubjectId]
  );
  const currentTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  // Distraction detection: Page Visibility API
  useEffect(() => {
    if (!isActiveSession || isBreak) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tab or minimized window
        setIsPaused(true);
      } else {
        // User returned to the tab
        if (settings.distractionAlertEnabled) {
          setFocusCheckOpen(true);
        }
      }
    };

    const handleBlur = () => {
      // Gentle blur trigger
      if (settings.distractionAlertEnabled && !document.hidden) {
        // User clicked outside iframe or switched app
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActiveSession, isBreak, settings.distractionAlertEnabled]);

  // Countdown Timer Engine
  useEffect(() => {
    if (isActiveSession && !isPaused && !focusCheckOpen && !emergencyModalOpen) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleSessionCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActiveSession, isPaused, focusCheckOpen, emergencyModalOpen, isBreak]);

  // Subtle Motivational Quote Rotation every 3 minutes
  useEffect(() => {
    if (!isActiveSession) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_WHISPERS.length);
    }, 180000);
    return () => clearInterval(interval);
  }, [isActiveSession]);

  // Ambient sound management
  useEffect(() => {
    if (isActiveSession && ambientSound !== 'none') {
      ambientPlayer.start(ambientSound, ambientVol);
    } else {
      ambientPlayer.stop();
    }
    return () => {
      ambientPlayer.stop();
    };
  }, [isActiveSession, ambientSound]);

  const handleStartSession = () => {
    let duration = selectedDuration;
    if (isCustomDuration) {
      const parsed = parseInt(customDurationInput, 10);
      duration = !isNaN(parsed) && parsed > 0 && parsed <= 180 ? parsed : 25;
    }

    setTimeLeft(duration * 60);
    setTotalTime(duration * 60);
    setIsActiveSession(true);
    setIsPaused(false);
    setIsBreak(false);
    setSessionStartTime(Date.now());
    playStartSound();

    if (ambientSound !== 'none') {
      ambientPlayer.start(ambientSound, ambientVol);
    }
  };

  const handleSessionCompleted = () => {
    playCompletionBell();
    ambientPlayer.stop();

    if (isBreak) {
      // Break completed, return to focus or dashboard
      setIsBreak(false);
      setIsActiveSession(false);
      return;
    }

    const durationMins = Math.round(totalTime / 60);
    const xp = Math.round(durationMins * 2.5) + 10;
    const taskTitle = currentTask ? currentTask.title : customTopic || 'Focused Study Session';
    const subName = currentSubject ? currentSubject.name : 'General Study';

    const newSession: FocusSession = {
      id: `sess-${Date.now()}`,
      subjectId: selectedSubjectId || undefined,
      taskId: selectedTaskId || undefined,
      taskTitle: taskTitle,
      subjectName: subName,
      durationMinutes: durationMins,
      completedAt: new Date().toISOString(),
      xpEarned: xp,
      type: durationMins === 25 ? 'pomodoro' : 'custom',
    };

    onSessionComplete(newSession);

    setLastCompletedSession({
      duration: durationMins,
      title: taskTitle,
      subject: subName,
      xp: xp,
      task: currentTask,
    });

    setIsActiveSession(false);
    setCompleteModalOpen(true);
  };

  const handleStartBreak = (breakMinutes: number = 5) => {
    setCompleteModalOpen(false);
    setIsBreak(true);
    setIsActiveSession(true);
    setIsPaused(false);
    setTimeLeft(breakMinutes * 60);
    setTotalTime(breakMinutes * 60);
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleEmergencyExit = () => {
    ambientPlayer.stop();
    setEmergencyModalOpen(false);
    setIsActiveSession(false);
    setIsPaused(false);
    if (onExitFocusMode) onExitFocusMode();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      focusContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress computation (0 to 1)
  const progressRatio = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Filter tasks belonging to selected subject
  const subjectTasks = useMemo(() => {
    if (!selectedSubjectId) return tasks.filter((t) => !t.completed);
    return tasks.filter((t) => t.subjectId === selectedSubjectId && !t.completed);
  }, [tasks, selectedSubjectId]);

  /* =========================================================================
     VIEW 1: SETUP SCREEN (Before starting the session)
     ========================================================================= */
  if (!isActiveSession) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-24 animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Core Distraction-Free Engine
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Start Focus Session
            </h1>
          </div>
          <button
            onClick={() => setDndModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition"
            title="Digital Wellbeing & Do Not Disturb Help"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>DND Guide</span>
          </button>
        </div>

        {/* Focus Philosophy Banner */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 to-sky-50/80 dark:from-indigo-950/40 dark:to-sky-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold block text-slate-900 dark:text-white">Pure Single-Task Concentration</span>
            Zero feeds, zero popups. All distractions are locked out while the timer runs.
          </div>
        </div>

        {/* Step 1: Select Subject & Task */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Select Subject & Topic
          </label>

          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {subjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    // clear task if not in this subject
                    const matching = tasks.find((t) => t.subjectId === sub.id && !t.completed);
                    if (matching) setSelectedTaskId(matching.id);
                    else setSelectedTaskId('');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>

          {/* Task Select or Custom Topic */}
          {subjectTasks.length > 0 ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Planned Task to Focus On:
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {subjectTasks.map((t) => {
                  const isSelected = selectedTaskId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        if (t.estimatedDuration) {
                          setSelectedDuration(t.estimatedDuration);
                          setIsCustomDuration(false);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                        {t.estimatedDuration}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Topic or Goal:
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 4 Practice Problems"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Step 2: Duration Presets */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Choose Study Duration
          </label>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '25 min', value: 25, badge: 'Pomodoro' },
              { label: '45 min', value: 45, badge: 'Standard' },
              { label: '60 min', value: 60, badge: 'Deep' },
              { label: '90 min', value: 90, badge: 'Flow' },
            ].map((preset) => {
              const isSelected = !isCustomDuration && selectedDuration === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => {
                    setSelectedDuration(preset.value);
                    setIsCustomDuration(false);
                  }}
                  className={`py-3 px-2 rounded-xl text-center transition border flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm font-semibold">{preset.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{preset.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Duration Toggle */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Custom Length (minutes):</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="180"
                value={customDurationInput}
                onChange={(e) => {
                  setCustomDurationInput(e.target.value);
                  setIsCustomDuration(true);
                }}
                onFocus={() => setIsCustomDuration(true)}
                className={`w-16 py-1.5 px-2 text-center text-xs font-semibold rounded-lg border ${
                  isCustomDuration
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              />
              <span className="text-slate-400">mins</span>
            </div>
          </div>
        </div>

        {/* Step 3: Ambient Sound Options */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-indigo-500" />
              <span>Background Soundscape (Offline Web Audio)</span>
            </label>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'Mute' },
              { id: 'rain', label: 'Rain' },
              { id: 'whitenoise', label: 'Pink Noise' },
              { id: 'library', label: 'Library Hum' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => setAmbientSound(snd.id as typeof ambientSound)}
                className={`py-2 px-1 text-xs rounded-xl border text-center transition ${
                  ambientSound === snd.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={handleStartSession}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-3"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Enter Distraction-Free Mode</span>
        </button>

        {/* DND Guidance Modal */}
        <DNDGuideModal isOpen={dndModalOpen} onClose={() => setDndModalOpen(false)} />

        {/* Focus Complete Celebration */}
        {lastCompletedSession && (
          <FocusCompleteModal
            isOpen={completeModalOpen}
            durationMinutes={lastCompletedSession.duration}
            taskTitle={lastCompletedSession.title}
            subjectName={lastCompletedSession.subject}
            xpEarned={lastCompletedSession.xp}
            task={lastCompletedSession.task}
            onMarkTaskCompleted={onMarkTaskCompleted}
            onStartBreak={() => handleStartBreak(5)}
            onClose={() => setCompleteModalOpen(false)}
          />
        )}
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: ACTIVE FULLSCREEN DISTRACTION-FREE VIEW
     ========================================================================= */
  const activeTaskTitle = currentTask ? currentTask.title : customTopic || 'Focused Study';
  const activeSubjectName = currentSubject ? currentSubject.name : 'College Study';
  const activeSubjectColor = currentSubject ? currentSubject.color : '#6366f1';

  return (
    <div
      ref={focusContainerRef}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden transition-colors duration-500 font-sans"
    >
      {/* Top Bar: Minimal Subject Pill, Fullscreen toggle & DND */}
      <div className="flex items-center justify-between w-full max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: activeSubjectColor }}
          />
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase truncate max-w-[200px]">
            {isBreak ? 'Break Time' : activeSubjectName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient sound quick toggle */}
          {ambientSound !== 'none' && (
            <button
              onClick={() => {
                if (ambientPlayer.getActiveType() !== 'none') {
                  ambientPlayer.stop();
                } else {
                  ambientPlayer.start(ambientSound, ambientVol);
                }
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Ambient Sound"
            >
              <Headphones className="w-4 h-4" />
            </button>
          )}

          {/* DND modal opener */}
          <button
            onClick={() => setDndModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="DND Guide"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Center Zone: Active Task, Minimalist Ring, Big Countdown & Motivation */}
      <div className="my-auto flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
        {/* Task Title */}
        <div className="mb-6 px-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight line-clamp-2">
            {isBreak ? 'Rest your eyes, hydrate, breathe' : activeTaskTitle}
          </h2>
          {isPaused && (
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/30">
              Session Paused
            </span>
          )}
        </div>

        {/* Minimal Progress Ring & Timer */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
            {/* Background Track */}
            <circle
              cx="130"
              cy="130"
              r="120"
              className="stroke-slate-900"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Active Progress Circle */}
            <circle
              cx="130"
              cy="130"
              r="120"
              stroke={isBreak ? '#10b981' : activeSubjectColor}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Digital Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-sm">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
              {isBreak ? 'Relaxation' : 'Remaining'}
            </span>
          </div>
        </div>

        {/* Minimal Motivational Whisper */}
        {!isBreak && (
          <p className="mt-8 text-xs text-slate-400/90 font-medium italic max-w-xs transition-opacity duration-700">
            “{MOTIVATIONAL_WHISPERS[quoteIndex]}”
          </p>
        )}
      </div>

      {/* Bottom Bar: Pause / Resume & Emergency Exit */}
      <div className="flex items-center justify-center gap-4 w-full max-w-sm mx-auto pb-4">
        {/* Pause/Resume Button */}
        <button
          onClick={handleTogglePause}
          className={`flex-1 py-3 px-5 rounded-2xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
            isPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Study</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Emergency Exit Button */}
        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="py-3 px-4 rounded-2xl bg-slate-900/70 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 text-xs font-semibold transition flex items-center gap-1.5"
          title="Emergency Exit Session"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Emergency Exit Confirmation Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Exit Focus Mode?</h3>
            <p className="text-xs text-slate-400 mb-6">
              You still have {formatTime(timeLeft)} remaining. Are you sure you want to end this study session early?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition"
              >
                Keep Studying
              </button>
              <button
                onClick={handleEmergencyExit}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold rounded-xl transition"
              >
                Yes, Exit Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Check Distraction Detection Modal */}
      <FocusCheckModal
        isOpen={focusCheckOpen}
        onContinue={() => {
          setFocusCheckOpen(false);
          setIsPaused(false);
        }}
        onEndSession={() => {
          setFocusCheckOpen(false);
          handleEmergencyExit();
        }}
      />

      {/* DND Guidance Modal */}
      <DNDGuideModal isOpen={dndModalOpen} onClose={() => setDndModalOpen(false)} />
    </div>
  );
};
