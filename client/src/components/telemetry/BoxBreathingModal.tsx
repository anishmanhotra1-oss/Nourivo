import React, { useState, useEffect } from 'react';
import { X, Heart, Sparkles, Volume2, VolumeX, Play, Pause, RefreshCcw } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface BoxBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

const PHASE_INSTRUCTIONS: Record<Phase, { text: string; subtext: string; color: string; ringClass: string; freq: number }> = {
  Inhale: {
    text: '🌬️ Inhale Deeply',
    subtext: 'Expand your lungs through your nose (4 seconds)',
    color: 'text-cyan-400',
    ringClass: 'scale-125 bg-cyan-500/30 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.6)]',
    freq: 440, // A4
  },
  Hold: {
    text: '🫁 Hold Breath',
    subtext: 'Maintain oxygen saturation in stillness (4 seconds)',
    color: 'text-purple-400',
    ringClass: 'scale-125 bg-purple-500/30 border-purple-400 shadow-[0_0_50px_rgba(139,92,246,0.6)]',
    freq: 523.25, // C5
  },
  Exhale: {
    text: '💨 Exhale Slowly',
    subtext: 'Release all tension through your mouth (4 seconds)',
    color: 'text-emerald-400',
    ringClass: 'scale-90 bg-emerald-500/20 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    freq: 392, // G4
  },
  Rest: {
    text: '🧘 Pause & Rest',
    subtext: 'Feel your heart rate & blood pressure stabilize (4 seconds)',
    color: 'text-amber-400',
    ringClass: 'scale-90 bg-amber-500/20 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    freq: 329.63, // E4
  },
};

// Web Audio API Synthesized Gentle Chime Tone
const playPhaseChimeSound = (frequency: number) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (err) {
    // Audio context policy fallback
  }
};

export const BoxBreathingModal: React.FC<BoxBreathingModalProps> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<Phase>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Play audio chime on phase transition
  const triggerPhaseTransition = (nextPhase: Phase) => {
    setPhase(nextPhase);
    if (isAudioEnabled) {
      playPhaseChimeSound(PHASE_INSTRUCTIONS[nextPhase].freq);
    }
  };

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phase
        if (phase === 'Inhale') {
          triggerPhaseTransition('Hold');
          return 4;
        } else if (phase === 'Hold') {
          triggerPhaseTransition('Exhale');
          return 4;
        } else if (phase === 'Exhale') {
          triggerPhaseTransition('Rest');
          return 4;
        } else {
          triggerPhaseTransition('Inhale');
          setCompletedCycles((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, phase, isAudioEnabled]);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentInfo = PHASE_INSTRUCTIONS[phase];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-dark-bg/95 backdrop-blur-2xl flex items-start justify-center pt-3 sm:pt-6 p-3 overflow-y-auto animate-fade-in font-sans"
    >
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="telemetry-card max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-5 sm:p-7 border border-brand-500/40 relative shadow-2xl space-y-5 flex flex-col items-center text-center">
        {/* Top Controls: Sound Toggle & Close Button */}
        <div className="w-full flex items-center justify-between font-mono">
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAudioEnabled
                ? 'bg-brand-600/20 border-brand-500/40 text-brand-300 shadow-glow'
                : 'bg-dark-bg border-dark-border text-gray-500'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isAudioEnabled ? 'Audio Chime ON' : 'Muted'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-bg border border-dark-border text-gray-400 hover:text-white hover:border-brand-500/50 transition-all cursor-pointer shadow-glow"
            title="Close Mind Calm Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
            <span>NEURAL HRV COHERENCE ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Mind Calm Box Breathing Reset
          </h2>
          <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto">
            4-Second box intervals to reduce cortisol & stabilize heart rate variability.
          </p>
        </div>

        {/* Animated Breathing Orb Centerpiece */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-2">
          {/* Outer Pulsing Aura Rings */}
          <div className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ease-in-out ${currentInfo.ringClass}`} />
          <div className="absolute inset-4 rounded-full border border-white/20 animate-ping opacity-20 pointer-events-none" />

          {/* Core Animated Orb */}
          <div className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-cyan-600 via-purple-600 to-emerald-500 p-1 flex flex-col items-center justify-center shadow-glow border border-white/40 backdrop-blur-md">
            <div className="w-full h-full rounded-full bg-dark-bg/95 flex flex-col items-center justify-center space-y-1 font-mono">
              <span className={`text-4xl font-extrabold tabular-nums ${currentInfo.color} animate-pulse`}>
                {secondsLeft}s
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {phase}
              </span>
            </div>
          </div>
        </div>

        {/* Current Instruction Label */}
        <div className="space-y-1 font-mono">
          <div className={`text-base sm:text-lg font-extrabold ${currentInfo.color}`}>
            {currentInfo.text}
          </div>
          <div className="text-xs text-gray-300 font-sans max-w-xs">
            {currentInfo.subtext}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-dark-border/80 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border/80 text-center">
            <div className="text-[9px] text-gray-500 uppercase">Cycles</div>
            <div className="text-sm font-bold text-white tabular-nums">🧘 {completedCycles}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border/80 text-center">
            <div className="text-[9px] text-gray-500 uppercase">Coherence</div>
            <div className="text-sm font-bold text-emerald-400 tabular-nums">💖 94%</div>
          </div>

          <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border/80 text-center">
            <div className="text-[9px] text-gray-500 uppercase">Stress Relief</div>
            <div className="text-sm font-bold text-cyan-400 tabular-nums">⚡ -32%</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 w-full font-mono">
          <Tooltip content={isActive ? 'Pause Breathing Cycle' : 'Resume Breathing Cycle'} position="top" className="flex-1">
            <button
              onClick={() => setIsActive(!isActive)}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isActive ? 'Pause' : 'Resume'}</span>
            </button>
          </Tooltip>

          <Tooltip content="Reset Breathing Counter" position="top">
            <button
              onClick={() => {
                setPhase('Inhale');
                setSecondsLeft(4);
                setCompletedCycles(0);
              }}
              className="p-3 rounded-xl bg-dark-bg hover:bg-dark-hover border border-dark-border/80 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
