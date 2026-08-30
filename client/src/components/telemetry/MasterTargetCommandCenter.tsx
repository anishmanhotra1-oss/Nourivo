import React, { useState } from 'react';
import { Target, Dumbbell, Droplets, Flame, Moon, Award, Sparkles, Sliders, Heart, Smile, Zap, Activity } from 'lucide-react';

interface MasterTargetCommandCenterProps {
  user: {
    name: string;
    stepGoal: number;
    waterGoal: number;
    calorieGoal: number;
    sleepGoal: number;
  };
  today: {
    steps: number;
    waterMl: number;
    caloriesIn: number;
    caloriesBurned: number;
    sleepMinutes: number;
  };
  onOpenAdjuster: () => void;
}

export const MasterTargetCommandCenter: React.FC<MasterTargetCommandCenterProps> = ({
  user,
  today,
  onOpenAdjuster,
}) => {
  const [viewMode, setViewMode] = useState<'fitness' | 'lifestyle' | 'recovery'>('fitness');

  const waterPercent = Math.min(100, Math.round(((today?.waterMl || 0) / (user?.waterGoal || 2500)) * 100));
  const caloriePercent = Math.min(100, Math.round(((today?.caloriesBurned || 0) / (user?.calorieGoal || 2200)) * 100));
  const sleepPercent = Math.min(100, Math.round(((today?.sleepMinutes || 0) / (user?.sleepGoal || 480)) * 100));
  const gymPercent = 85;
  const mindPercent = 92;
  const hrvPercent = 96;

  const fitnessMasterScore = Math.round((gymPercent + waterPercent + caloriePercent + sleepPercent) / 4);
  const lifestyleMasterScore = Math.round((sleepPercent + waterPercent + mindPercent + caloriePercent) / 4);
  const recoveryMasterScore = Math.round((sleepPercent + mindPercent + hrvPercent + waterPercent) / 4);

  const currentScore =
    viewMode === 'fitness'
      ? fitnessMasterScore
      : viewMode === 'lifestyle'
      ? lifestyleMasterScore
      : recoveryMasterScore;

  // SVG Gauge Arc Math
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-dark-surface via-dark-bg to-brand-950/40 border border-brand-500/40 shadow-[0_0_40px_rgba(37,99,235,0.2)] relative overflow-hidden font-sans group">
      {/* Layered Animated Ambient Blur Orbs */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header Bar Line */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-dark-border/80 font-mono relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 text-white border border-brand-400/40 shadow-glow shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-extrabold text-white font-display tracking-tight">
              Master Telemetry Core
            </h3>
            <p className="text-[11px] text-gray-400 font-sans mt-0.5">
              {viewMode === 'fitness'
                ? 'Hypertrophy Overload, Active Energy Burn & Hydration Matrix'
                : viewMode === 'lifestyle'
                ? 'Sleep Quality, Rest, Mindfulness & Fluid Balance Matrix'
                : 'Circadian Coherence, Stress Reduction & HRV Recovery Matrix'}
            </p>
          </div>
        </div>

        {/* Adjust Targets Launcher */}
        <button
          onClick={onOpenAdjuster}
          className="p-2.5 rounded-xl bg-dark-bg hover:bg-brand-600/20 text-gray-300 hover:text-white border border-dark-border hover:border-brand-500/50 transition-all cursor-pointer shadow-glow shrink-0"
          title="Adjust Master Goals"
        >
          <Sliders className="w-4 h-4 text-brand-400" />
        </button>
      </div>

      {/* Mode Selector Row - Placed Directly Below Master Telemetry Header */}
      <div className="pt-4 pb-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap font-mono text-xs relative z-10 no-scrollbar">
        <button
          onClick={() => setViewMode('fitness')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            viewMode === 'fitness'
              ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 text-white shadow-glow border border-brand-400/40'
              : 'bg-dark-bg/90 text-gray-400 hover:text-gray-200 border border-dark-border/80'
          }`}
        >
          <Dumbbell className="w-4 h-4 text-cyan-400" />
          <span>Fitness Mode</span>
        </button>

        <button
          onClick={() => setViewMode('lifestyle')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            viewMode === 'lifestyle'
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-glow border border-purple-400/40'
              : 'bg-dark-bg/90 text-gray-400 hover:text-gray-200 border border-dark-border/80'
          }`}
        >
          <Smile className="w-4 h-4 text-pink-400" />
          <span>Lifestyle Mode</span>
        </button>

        <button
          onClick={() => setViewMode('recovery')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            viewMode === 'recovery'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-glow border border-emerald-400/40'
              : 'bg-dark-bg/90 text-gray-400 hover:text-gray-200 border border-dark-border/80'
          }`}
        >
          <Heart className="w-4 h-4 text-emerald-400" />
          <span>Recovery Mode</span>
        </button>
      </div>

      {/* Main Content: Double-Ring Holographic Score Reactor & Telemetry Bars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 items-center relative z-10">
        
        {/* Holographic Arc Reactor Dial */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-dark-bg/70 border border-dark-border/80 relative overflow-hidden group">
          <div className="relative w-44 h-44 flex items-center justify-center">
            
            {/* Outer Spinning Orbit Ring */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-purple-500/20 border-b-purple-400 animate-[spin_15s_linear_infinite_reverse]" />

            {/* Core Arc Gauge SVG */}
            <svg height="176" width="176" className="rotate-[-90deg] drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <defs>
                <linearGradient id="masterReactorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="40%" stopColor="#3B82F6" />
                  <stop offset="80%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <circle
                stroke="#11131F"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="88"
                cy="88"
              />
              <circle
                stroke="url(#masterReactorGradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="88"
                cy="88"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
              <span className="text-4xl font-extrabold text-white tracking-tight tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                {currentScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" /> Vitality Index
              </span>
            </div>
          </div>

          <div className="text-center mt-3 font-mono">
            <div className="text-xs font-bold text-gray-200 flex items-center justify-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{currentScore >= 85 ? 'Peak System Coherence' : 'Optimal Metabolic Progression'}</span>
            </div>
            <div className="text-[10px] text-gray-400 font-sans mt-0.5">
              4-Pillar Metabolic Telemetry Coherence
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry Progress Bars */}
        <div className="md:col-span-7 space-y-3.5 font-mono">
          {viewMode === 'fitness' && (
            <>
              {/* Gym Progress */}
              <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border/80 space-y-2 hover:border-brand-500/50 transition-all">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-400 font-bold flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-brand-400" /> Gym Overload Volume
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-extrabold tabular-nums border border-brand-400/30">
                    85% Completed
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-dark-surface overflow-hidden border border-brand-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                    style={{ width: `85%` }}
                  />
                </div>
              </div>

              {/* Energy Burn */}
              <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border/80 space-y-2 hover:border-amber-500/50 transition-all">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-400 font-bold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" /> Active Energy Burn ({today?.caloriesBurned || 0} / {user?.calorieGoal || 2200} kcal)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold tabular-nums border border-amber-400/30">
                    {caloriePercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-dark-surface overflow-hidden border border-amber-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                    style={{ width: `${caloriePercent}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {viewMode === 'lifestyle' && (
            <>
              {/* Sleep Recovery */}
              <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border/80 space-y-2 hover:border-purple-500/50 transition-all">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-400 font-bold flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-400" /> Sleep Recovery ({Math.round(((today?.sleepMinutes || 0) / 60) * 10) / 10}h / {((user?.sleepGoal || 480) / 60).toFixed(1)}h)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold tabular-nums border border-purple-400/30">
                    {sleepPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-dark-surface overflow-hidden border border-purple-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                    style={{ width: `${sleepPercent}%` }}
                  />
                </div>
              </div>

              {/* Mind & Calm */}
              <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border/80 space-y-2 hover:border-pink-500/50 transition-all">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-pink-400 font-bold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" /> Mind & Calm Score (Optimal Coherence)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-extrabold tabular-nums border border-pink-400/30">
                    92%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-dark-surface overflow-hidden border border-pink-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(236,72,153,0.6)]"
                    style={{ width: `92%` }}
                  />
                </div>
              </div>
            </>
          )}

          {viewMode === 'recovery' && (
            <>
              {/* Deep Sleep Recovery */}
              <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border/80 space-y-2 hover:border-purple-500/50 transition-all">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-400 font-bold flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-400" /> Deep Sleep Rest ({Math.round(((today?.sleepMinutes || 0) / 60) * 10) / 10}h / {((user?.sleepGoal || 480) / 60).toFixed(1)}h)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold tabular-nums border border-purple-400/30">
                    {sleepPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-dark-surface overflow-hidden border border-purple-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                    style={{ width: `${sleepPercent}%` }}
                  />
                </div>
              </div>

              {/* HRV Neural Coherence */}
              <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border/80 space-y-2 hover:border-emerald-500/50 transition-all">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" /> HRV Neural Coherence (Optimal Autonomic Balance)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold tabular-nums border border-emerald-400/30">
                    96%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-dark-surface overflow-hidden border border-emerald-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                    style={{ width: `96%` }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Hydration Progress Bar (Shared) */}
          <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border/80 space-y-2 hover:border-cyan-500/50 transition-all">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cyan-400 font-bold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" /> Hydration Balance ({((today?.waterMl || 0) / 1000).toFixed(2)}L / {((user?.waterGoal || 2500) / 1000).toFixed(1)}L)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold tabular-nums border border-cyan-400/30">
                {waterPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-dark-surface overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
