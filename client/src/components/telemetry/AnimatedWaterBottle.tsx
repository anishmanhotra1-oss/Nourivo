import React, { useState } from 'react';
import { Droplets, Sparkles, CheckCircle2, Plus } from 'lucide-react';

interface AnimatedWaterBottleProps {
  currentMl: number;
  targetMl: number;
  onQuickAddDose?: (amountMl: number) => void;
}

export const AnimatedWaterBottle: React.FC<AnimatedWaterBottleProps> = ({
  currentMl,
  targetMl,
  onQuickAddDose,
}) => {
  const [isSplashing, setIsSplashing] = useState(false);

  const rawPercentage = targetMl > 0 ? (currentMl / targetMl) * 100 : 0;
  const fillPercentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));
  const isGoalReached = fillPercentage >= 100;

  const handleBottleClick = () => {
    setIsSplashing(true);
    setTimeout(() => setIsSplashing(false), 800);
    if (onQuickAddDose) {
      onQuickAddDose(250);
    }
  };

  return (
    <div className="telemetry-card rounded-2xl p-4 sm:p-6 border border-cyan-500/30 flex flex-col items-center justify-between space-y-4 sm:space-y-5 shadow-2xl relative overflow-hidden">
      {/* Background Glowing Cyan Ambient Effect */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="text-center space-y-1 z-10 font-mono">
        <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-cyan-400 font-bold uppercase tracking-wider">
          <Droplets className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>Interactive Hydration Flask</span>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums">
          {(currentMl / 1000).toFixed(2)} L <span className="text-gray-400 font-normal text-xs">/ {(targetMl / 1000).toFixed(2)} L</span>
        </div>
      </div>

      {/* Interactive Water Bottle Container */}
      <div
        onClick={handleBottleClick}
        className="relative cursor-pointer group flex flex-col items-center justify-end select-none"
        title="Tap bottle to log +250 mL water dose"
      >
        {/* Click Splash Effect */}
        {isSplashing && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-400 animate-ping opacity-75" />
            <span className="absolute -top-4 font-mono font-bold text-xs text-cyan-300 animate-bounce bg-dark-bg/90 px-2 py-0.5 rounded-full border border-cyan-500/40">
              +250 mL 💧
            </span>
          </div>
        )}

        {/* Flask Cap / Nozzle */}
        <div className="w-10 sm:w-12 h-5 sm:h-6 bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-600 rounded-t-lg border-t border-x border-cyan-400/60 shadow-md flex items-center justify-center group-hover:brightness-125 transition-all">
          <div className="w-5 sm:w-6 h-1.5 sm:h-2 bg-dark-bg/80 rounded-full" />
        </div>

        {/* Flask Neck */}
        <div className="w-14 sm:w-16 h-3.5 sm:h-4 bg-dark-bg/90 border-x border-cyan-500/40" />

        {/* Flask Glass Vessel Body */}
        <div className="relative w-36 sm:w-44 h-[180px] sm:h-[220px] rounded-b-3xl rounded-t-xl bg-dark-bg/90 border-2 border-cyan-500/50 overflow-hidden shadow-[inset_0_0_25px_rgba(6,182,212,0.2)] flex flex-col justify-end group-hover:border-cyan-400 transition-all">
          
          {/* Glass Graduation Volume Marks */}
          <div className="absolute left-2.5 top-0 bottom-0 flex flex-col justify-between py-4 text-[9px] font-mono text-cyan-400/70 z-20 pointer-events-none">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-400/60 inline-block" /> 100%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-400/40 inline-block" /> 75%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-400/40 inline-block" /> 50%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-400/40 inline-block" /> 25%</span>
          </div>

          {/* Center Floating Live Percentage Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-dark-bg/85 backdrop-blur-md border border-cyan-500/60 text-cyan-300 font-mono font-bold text-xs sm:text-sm shadow-glow flex items-center gap-1.5">
              <span>{fillPercentage}%</span>
              {isGoalReached && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[9px] font-mono text-cyan-300/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 rounded-full">
              Tap to fill +250 mL
            </span>
          </div>

          {/* Animated Liquid Reservoir (Dynamic Height 0% to 100%) */}
          <div
            className="w-full relative transition-all duration-1000 ease-out"
            style={{ height: `${fillPercentage}%` }}
          >
            {/* SVG Wave Surface Top */}
            {fillPercentage > 0 && fillPercentage < 100 && (
              <div className="absolute -top-3 left-0 right-0 w-[200%] h-6 overflow-hidden">
                <svg
                  className="w-full h-full animate-wave"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,0 C150,90 350,-40 500,40 C650,120 900,-30 1200,30 L1200,120 L0,120 Z"
                    fill="#06B6D4"
                    fillOpacity="0.85"
                  />
                </svg>
              </div>
            )}

            {/* Main Gradient Liquid Body */}
            <div className="w-full h-full bg-gradient-to-b from-cyan-400 via-cyan-500 to-teal-700 relative overflow-hidden">
              {/* Translucent Liquid Bubbles */}
              <div className="absolute bottom-2 left-6 w-2.5 h-2.5 rounded-full bg-white/40 animate-bounce" style={{ animationDuration: '2s' }} />
              <div className="absolute bottom-6 right-8 w-3.5 h-3.5 rounded-full bg-white/30 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
              <div className="absolute bottom-12 left-14 w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Goal Reached Status Banner / Quick Dose Shortcuts */}
      <div className="w-full text-center space-y-2 font-mono z-10">
        {isGoalReached ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Target Hydration Met Today!</span>
          </div>
        ) : (
          <div className="text-[11px] sm:text-xs text-gray-400">
            Need <strong className="text-cyan-300 font-bold">{Math.max(0, targetMl - currentMl)} mL</strong> more to complete target.
          </div>
        )}

        {onQuickAddDose && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => onQuickAddDose(250)}
              className="px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all shadow-glow cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>250mL Glass</span>
            </button>
            <button
              onClick={() => onQuickAddDose(500)}
              className="px-3 py-2 rounded-xl bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 text-xs font-bold transition-all shadow-glow cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>500mL Bottle</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
