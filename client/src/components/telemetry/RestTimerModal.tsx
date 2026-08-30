import React, { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, RotateCcw, CheckCircle2, Zap } from 'lucide-react';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSeconds?: number;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  isOpen,
  onClose,
  defaultSeconds = 60,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds);
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setTotalSeconds(defaultSeconds);
    setTimeLeft(defaultSeconds);
    setIsActive(true);
  }, [defaultSeconds, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Play audio beep cue if browser allows
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // ignore audio policy errors
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePresetSelect = (secs: number) => {
    setTotalSeconds(secs);
    setTimeLeft(secs);
    setIsActive(true);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-4 sm:pt-8 p-4 bg-dark-bg/80 backdrop-blur-md animate-fade-in">
      <div className="telemetry-card rounded-2xl w-full max-w-sm p-5 relative border border-brand-500/50 shadow-2xl shadow-brand-500/20 space-y-5 text-center font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-dark-surface hover:bg-dark-hover text-gray-400 hover:text-white border border-dark-border transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
          <Timer className="w-4 h-4 text-brand-400 animate-pulse" />
          <span>Rest Recovery Countdown</span>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="text-dark-surface stroke-current"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="text-brand-500 stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="7"
              strokeDasharray={263.89}
              strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            {timeLeft === 0 ? (
              <div className="animate-bounce flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1" />
                <span className="text-sm font-bold text-emerald-400 font-mono">Rest Complete!</span>
              </div>
            ) : (
              <>
                <span className="text-3xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] font-mono uppercase text-gray-400 mt-0.5">Remaining</span>
              </>
            )}
          </div>
        </div>

        {/* Preset Selectors */}
        <div className="grid grid-cols-4 gap-2 font-mono text-xs">
          {[30, 60, 90, 120].map((secs) => (
            <button
              key={secs}
              onClick={() => handlePresetSelect(secs)}
              className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                totalSeconds === secs
                  ? 'bg-brand-600 border-brand-500 text-white shadow-glow'
                  : 'bg-dark-surface border-dark-border text-gray-300 hover:border-brand-500/50'
              }`}
            >
              {secs}s
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-glow transition-all"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" /> Pause Rest
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Resume
              </>
            )}
          </button>

          <button
            onClick={() => handlePresetSelect(totalSeconds)}
            className="p-2.5 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white cursor-pointer transition-all"
            title="Reset Rest Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
