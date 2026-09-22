import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  AlertTriangle,
  Shield,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Coffee,
  RotateCcw,
} from 'lucide-react';
import { DistractionSettings, AmbientSoundType } from '../types';
import { InterruptionModal } from './InterruptionModal';
import { EmergencyExitModal } from './EmergencyExitModal';
import { CompletionModal } from './CompletionModal';
import { startAmbientSound, stopAmbientSound } from '../utils/audio';

interface FocusModeScreenProps {
  subject: string;
  topic: string;
  initialDurationMinutes: number;
  protectionSettings: DistractionSettings;
  pomodoroMode: boolean;
  onExitFocus: () => void;
  onSessionComplete: (sessionData: {
    subject: string;
    topic: string;
    targetDuration: number;
    actualDuration: number;
    completed: boolean;
    interruptionsCount: number;
    xpEarned: number;
  }) => void;
}

export const FocusModeScreen: React.FC<FocusModeScreenProps> = ({
  subject,
  topic,
  initialDurationMinutes,
  protectionSettings,
  pomodoroMode,
  onExitFocus,
  onSessionComplete,
}) => {
  const totalSeconds = initialDurationMinutes * 60;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [breakTotalSeconds, setBreakTotalSeconds] = useState<number>(5 * 60);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState<number>(5 * 60);

  // Distraction tracking
  const [showInterruptionModal, setShowInterruptionModal] = useState<boolean>(false);
  const [interruptionCount, setInterruptionCount] = useState<number>(0);
  const [interruptedAt, setInterruptedAt] = useState<number | null>(null);
  const [awayDurationSeconds, setAwayDurationSeconds] = useState<number>(0);

  // Emergency exit modal
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Completion modal
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // Audio ambient sound
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Accurate timestamp reference
  const lastTickTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Total seconds elapsed in study mode
  const studySecondsElapsed = totalSeconds - secondsRemaining;

  // Sound switch effect
  useEffect(() => {
    if (ambientSound === 'none' || isPaused || isBreak) {
      stopAmbientSound();
    } else {
      startAmbientSound(ambientSound);
    }
    return () => {
      stopAmbientSound();
    };
  }, [ambientSound, isPaused, isBreak]);

  // Main countdown timer loop using high-precision Date.now() deltas
  useEffect(() => {
    lastTickTimeRef.current = Date.now();

    if (isPaused || showInterruptionModal || showExitModal || showCompletionModal) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.max(1, Math.round((now - lastTickTimeRef.current) / 1000));
      lastTickTimeRef.current = now;

      if (!isBreak) {
        // Study session countdown
        setSecondsRemaining((prev) => {
          if (prev <= deltaSeconds) {
            clearInterval(timerIntervalRef.current);
            handleStudySessionComplete();
            return 0;
          }
          return prev - deltaSeconds;
        });
      } else {
        // Break countdown
        setBreakSecondsRemaining((prev) => {
          if (prev <= deltaSeconds) {
            clearInterval(timerIntervalRef.current);
            // Break completed, prompt return
            setIsBreak(false);
            setSecondsRemaining(totalSeconds);
            return 0;
          }
          return prev - deltaSeconds;
        });
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPaused, isBreak, showInterruptionModal, showExitModal, showCompletionModal, totalSeconds]);

  // Completion handler
  const handleStudySessionComplete = () => {
    setShowCompletionModal(true);
    // Send browser notification if permission was granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🎉 Focus Session Completed!', {
          body: `You finished ${initialDurationMinutes}m on ${topic}. Great study habit!`,
        });
      } catch (_) {}
    }
  };

  // Visibility / Blur distraction detection
  useEffect(() => {
    if (!protectionSettings.appDistractions) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched away from focus screen
        if (!isPaused && !isBreak && !showCompletionModal) {
          setInterruptedAt(Date.now());
          setIsPaused(true);
        }
      } else if (document.visibilityState === 'visible') {
        // User returned to focus screen
        if (interruptedAt) {
          const duration = Math.round((Date.now() - interruptedAt) / 1000);
          setAwayDurationSeconds(duration);
          setInterruptionCount((c) => c + 1);
          setShowInterruptionModal(true);
          setInterruptedAt(null);
        }
      }
    };

    const handleWindowBlur = () => {
      if (!isPaused && !isBreak && !showCompletionModal) {
        setInterruptedAt(Date.now());
      }
    };

    const handleWindowFocus = () => {
      if (interruptedAt && !showInterruptionModal && !showCompletionModal) {
        const duration = Math.round((Date.now() - interruptedAt) / 1000);
        if (duration > 3) {
          setAwayDurationSeconds(duration);
          setInterruptionCount((c) => c + 1);
          setShowInterruptionModal(true);
        }
        setInterruptedAt(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [protectionSettings.appDistractions, isPaused, isBreak, showCompletionModal, interruptedAt, showInterruptionModal]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const currentRemaining = isBreak ? breakSecondsRemaining : secondsRemaining;
  const currentTotal = isBreak ? breakTotalSeconds : totalSeconds;
  const progressRatio = Math.max(0, Math.min(1, 1 - currentRemaining / currentTotal));

  // Emergency Exit Confirm
  const handleExitConfirm = (savePartial: boolean) => {
    setShowExitModal(false);
    stopAmbientSound();
    if (savePartial && studySecondsElapsed >= 180) {
      const minutes = Math.round(studySecondsElapsed / 60);
      onSessionComplete({
        subject,
        topic,
        targetDuration: initialDurationMinutes,
        actualDuration: minutes,
        completed: false,
        interruptionsCount: interruptionCount,
        xpEarned: minutes, // 1 XP per minute studied
      });
    }
    onExitFocus();
  };

  // Completion modal Actions
  const handleStartBreak = () => {
    setShowCompletionModal(false);
    setIsBreak(true);
    setBreakTotalSeconds(5 * 60);
    setBreakSecondsRemaining(5 * 60);
    setIsPaused(false);
  };

  const handleFinishDone = () => {
    setShowCompletionModal(false);
    stopAmbientSound();
    onSessionComplete({
      subject,
      topic,
      targetDuration: initialDurationMinutes,
      actualDuration: initialDurationMinutes,
      completed: true,
      interruptionsCount: interruptionCount,
      xpEarned: initialDurationMinutes,
    });
    onExitFocus();
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 text-white flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* Top Bar: Minimal Status & Controls */}
      <div className="w-full max-w-4xl mx-auto px-6 pt-6 flex items-center justify-between text-slate-400 text-xs">
        {/* Distraction status badge */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">
            {isBreak ? '☕ Restful Break Active' : '🛡 Focus Protection Active'}
          </span>
        </div>

        {/* Ambient sound selector & Fullscreen */}
        <div className="flex items-center space-x-2">
          {/* Ambient Sound Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-800">
            {ambientSound === 'none' ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            )}
            <select
              value={ambientSound}
              onChange={(e) => setAmbientSound(e.target.value as AmbientSoundType)}
              className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="none" className="bg-slate-900 text-slate-200">Audio: Muted</option>
              <option value="rain" className="bg-slate-900 text-slate-200">🌧 Gentle Rain</option>
              <option value="white-noise" className="bg-slate-900 text-slate-200">🌫 White Noise</option>
              <option value="binaural" className="bg-slate-900 text-slate-200">🧠 10Hz Alpha Waves</option>
            </select>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Focus Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-xl mx-auto w-full text-center space-y-8">
        {/* Subject & Topic: strictly matching prompt format */}
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-black tracking-widest text-indigo-400 uppercase">
            {subject}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {topic}
          </h1>
          {isBreak && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
              <Coffee className="w-3.5 h-3.5" />
              <span>Pomodoro Recharge Break</span>
            </div>
          )}
        </div>

        {/* Big Legible Timer Display (e.g. 24:36) */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="text-7xl sm:text-9xl font-mono font-extrabold tracking-tighter text-slate-50 tabular-nums">
            {formatTime(currentRemaining)}
          </div>

          {isPaused && (
            <div className="mt-2 text-xs uppercase tracking-widest font-bold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full animate-pulse">
              Timer Paused
            </div>
          )}
        </div>

        {/* Minimal Progress Bar (━━━━━━━━━━━━━━━━) */}
        <div className="w-full max-w-sm space-y-2">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                isBreak ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>{Math.round(progressRatio * 100)}% Completed</span>
            <span>{Math.round(currentTotal / 60)} min target</span>
          </div>
        </div>
      </div>

      {/* Bottom Minimal Controls */}
      <div className="w-full max-w-md mx-auto px-6 pb-12 pt-4 flex items-center justify-center space-x-6">
        {/* Pause / Resume Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center space-x-2 text-sm active:scale-95"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 text-emerald-400 fill-current" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 text-amber-400 fill-current" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Emergency Exit Button */}
        <button
          onClick={() => {
            setIsPaused(true);
            setShowExitModal(true);
          }}
          className="px-6 py-3.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 hover:text-rose-200 font-bold rounded-2xl transition-all flex items-center space-x-2 text-sm active:scale-95"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Emergency Exit</span>
        </button>

        {/* If in break mode, allow skipping break */}
        {isBreak && (
          <button
            onClick={() => {
              setIsBreak(false);
              setSecondsRemaining(totalSeconds);
            }}
            className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-2xl text-xs"
          >
            Skip Break
          </button>
        )}
      </div>

      {/* Gentle Distraction Interruption Modal */}
      <InterruptionModal
        isOpen={showInterruptionModal}
        interruptionDurationSeconds={awayDurationSeconds}
        onContinue={() => {
          setShowInterruptionModal(false);
          setIsPaused(false);
          lastTickTimeRef.current = Date.now();
        }}
        onEndSession={() => {
          setShowInterruptionModal(false);
          setShowExitModal(true);
        }}
      />

      {/* Emergency Exit Modal */}
      <EmergencyExitModal
        isOpen={showExitModal}
        elapsedMinutes={Math.floor(studySecondsElapsed / 60)}
        onContinue={() => {
          setShowExitModal(false);
          setIsPaused(false);
          lastTickTimeRef.current = Date.now();
        }}
        onExit={handleExitConfirm}
      />

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        subject={subject}
        topic={topic}
        durationMinutes={initialDurationMinutes}
        xpEarned={initialDurationMinutes}
        interruptionsCount={interruptionCount}
        pomodoroMode={pomodoroMode}
        onStartBreak={handleStartBreak}
        onDone={handleFinishDone}
      />
    </div>
  );
};
