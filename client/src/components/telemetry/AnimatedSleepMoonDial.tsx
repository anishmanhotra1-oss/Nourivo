import React from 'react';
import { Moon, Star, Sparkles, Clock, CheckCircle2, Calculator } from 'lucide-react';
import { ProgressRing } from '../common/ProgressRing';

interface AnimatedSleepMoonDialProps {
  loggedMinutes: number;
  targetMinutes: number;
  onOpenCalculator?: () => void;
}

export const AnimatedSleepMoonDial: React.FC<AnimatedSleepMoonDialProps> = ({
  loggedMinutes,
  targetMinutes,
  onOpenCalculator,
}) => {
  const loggedHours = Math.round((loggedMinutes / 60) * 10) / 10;
  const targetHours = Math.round((targetMinutes / 60) * 10) / 10;

  const rawPercent = targetMinutes > 0 ? (loggedMinutes / targetMinutes) * 100 : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));
  const isTargetAchieved = progressPercent >= 100;

  const debtSurplusHours = Math.round((loggedHours - targetHours) * 10) / 10;

  return (
    <div className="telemetry-card rounded-2xl p-6 border border-purple-500/30 flex flex-col items-center justify-between space-y-6 shadow-2xl relative overflow-hidden">
      {/* Night Sky Cosmic Glow Background */}
      <div className="absolute -top-12 -left-12 w-56 h-56 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="text-center space-y-1 z-10 font-mono">
        <div className="flex items-center justify-center gap-1.5 text-xs text-purple-400 font-bold uppercase tracking-wider">
          <Moon className="w-4 h-4 text-purple-300 animate-pulse" />
          <span>Circadian Sleep & Recovery Dial</span>
        </div>
        <div className="text-2xl font-extrabold text-white tabular-nums">
          {loggedHours}h <span className="text-gray-400 font-normal text-xs">/ {targetHours}h Target</span>
        </div>
      </div>

      {/* Central Animated Crescent Moon & Progress Ring */}
      <div className="relative w-56 h-56 flex items-center justify-center z-10">
        <ProgressRing progress={progressPercent} radius={92} stroke={10} color="#A855F7">
          <div className="flex flex-col items-center justify-center space-y-1 text-center font-mono">
            {/* Glowing SVG Crescent Moon */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
                <path
                  d="M 50 10 A 40 40 0 1 0 90 50 A 30 30 0 1 1 50 10 Z"
                  fill="url(#moonGrad)"
                />
                <defs>
                  <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Pulsing Star Particle */}
              <Star className="w-3 h-3 text-amber-300 fill-amber-300 absolute -top-1 -right-1 animate-ping" />
              <Star className="w-2.5 h-2.5 text-indigo-300 fill-indigo-300 absolute bottom-1 left-0 animate-pulse" />
            </div>

            <span className="text-2xl font-extrabold text-white tabular-nums">
              {progressPercent}%
            </span>
            <span className="text-[10px] text-purple-300 uppercase tracking-widest font-sans font-semibold">
              {isTargetAchieved ? 'Target Met' : 'Recovery Pacing'}
            </span>
          </div>
        </ProgressRing>
      </div>

      {/* Sleep Debt / Surplus & Action Button */}
      <div className="w-full text-center space-y-3 font-mono z-10">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-dark-bg/80 border border-dark-border/80 text-center">
            <span className="text-[10px] text-gray-500 uppercase block">Sleep Balance</span>
            <span className={`font-bold tabular-nums block ${debtSurplusHours >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {debtSurplusHours >= 0 ? `+${debtSurplusHours}h Surplus` : `${debtSurplusHours}h Debt`}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-dark-bg/80 border border-dark-border/80 text-center">
            <span className="text-[10px] text-gray-500 uppercase block">REM Cycles</span>
            <span className="font-bold text-purple-300 tabular-nums block">
              {Math.round((loggedMinutes / 90) * 10) / 10} Cycles
            </span>
          </div>
        </div>

        {onOpenCalculator && (
          <button
            onClick={onOpenCalculator}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Calculator className="w-4 h-4 text-purple-300" />
            <span>Calculate Bedtime Target</span>
          </button>
        )}
      </div>
    </div>
  );
};
