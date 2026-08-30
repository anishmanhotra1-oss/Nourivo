import React from 'react';
import { Target, Droplets, Flame, Moon, Sparkles, Zap, Award } from 'lucide-react';

interface AnimatedProfileTargetRadarProps {
  waterGoal: number;
  calorieGoal: number;
  sleepGoal: number;
  onSelectPreset: (preset: { waterGoal: number; calorieGoal: number; sleepGoal: number }) => void;
}

export const AnimatedProfileTargetRadar: React.FC<AnimatedProfileTargetRadarProps> = ({
  waterGoal,
  calorieGoal,
  sleepGoal,
  onSelectPreset,
}) => {
  // Athletic Profile Rank Badge Calculation
  const getAthleticRank = () => {
    if (calorieGoal >= 2600 || waterGoal >= 3200) return { title: 'PRO ATHLETE POWER', color: 'text-amber-400 border-amber-500/40 bg-amber-500/20' };
    if (waterGoal >= 2800) return { title: 'HYPERTROPHY PERFORMER', color: 'text-brand-400 border-brand-500/40 bg-brand-500/20' };
    return { title: 'ACTIVE RECOVERY PACING', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/20' };
  };

  const rank = getAthleticRank();

  // Preset Configurations
  const presets = [
    {
      id: 'fatloss',
      name: 'Fat Loss Sprint',
      desc: 'High hydration & calorie deficit pacing',
      icon: Flame,
      color: 'border-amber-500/40 text-amber-300',
      data: { waterGoal: 3000, calorieGoal: 2600, sleepGoal: 480 },
    },
    {
      id: 'muscle',
      name: 'Muscle Hypertrophy',
      desc: 'High hydration & 9h deep rest',
      icon: Zap,
      color: 'border-purple-500/40 text-purple-300',
      data: { waterGoal: 3500, calorieGoal: 2800, sleepGoal: 540 },
    },
    {
      id: 'endurance',
      name: 'Endurance Pacing',
      desc: 'Balanced hydration & active rest',
      icon: Target,
      color: 'border-brand-500/40 text-brand-300',
      data: { waterGoal: 2800, calorieGoal: 2200, sleepGoal: 450 },
    },
    {
      id: 'maintenance',
      name: 'Active Maintenance',
      desc: 'Standard daily wellness baseline',
      icon: Award,
      color: 'border-emerald-500/40 text-emerald-300',
      data: { waterGoal: 2500, calorieGoal: 2000, sleepGoal: 480 },
    },
  ];

  return (
    <div className="telemetry-card rounded-2xl p-4 sm:p-6 border border-brand-500/30 space-y-6 shadow-2xl relative overflow-hidden font-sans">
      {/* Subtle Glow Background */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info & Athletic Rank Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-brand-400 font-bold uppercase tracking-wider">
            <Target className="w-4 h-4 text-brand-400 animate-pulse" />
            <span>Interactive Target Telemetry Radar</span>
          </div>
          <h3 className="text-lg font-bold text-white font-display">
            Daily Goal Architecture
          </h3>
        </div>

        <div className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-glow ${rank.color}`}>
          <Award className="w-3.5 h-3.5" />
          <span>{rank.title}</span>
        </div>
      </div>

      {/* Target Progress Bar Architecture Grid (3 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono">
        {/* Water Target Card */}
        <div className="p-3.5 rounded-xl bg-dark-bg/80 border border-cyan-500/30 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" /> Water Intake
            </span>
            <span className="text-white font-extrabold tabular-nums">
              {(waterGoal / 1000).toFixed(1)} L ({waterGoal} mL)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-dark-surface overflow-hidden">
            <div className="h-full bg-gradient-to-b from-cyan-500 to-teal-600 rounded-full w-full shadow-glow" />
          </div>
        </div>

        {/* Calorie Target Card */}
        <div className="p-3.5 rounded-xl bg-dark-bg/80 border border-amber-500/30 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" /> Energy Burn
            </span>
            <span className="text-white font-extrabold tabular-nums">
              {calorieGoal.toLocaleString()} kcal
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-dark-surface overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full w-full shadow-glow" />
          </div>
        </div>

        {/* Sleep Target Card */}
        <div className="p-3.5 rounded-xl bg-dark-bg/80 border border-purple-500/30 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-purple-400 font-bold flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-purple-400" /> Rest Target
            </span>
            <span className="text-white font-extrabold tabular-nums">
              {(sleepGoal / 60).toFixed(1)} hrs ({sleepGoal} mins)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-dark-surface overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full w-full shadow-glow" />
          </div>
        </div>
      </div>

      {/* Smart Fitness Goal Preset Generator Section */}
      <div className="space-y-3 font-mono border-t border-dark-border/80 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Smart Target Presets</span>
          </span>
          <span className="text-[10px] text-gray-500 font-normal">Click preset to apply values</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.data)}
                className={`p-3 rounded-xl border bg-dark-bg/80 hover:bg-dark-surface text-left transition-all cursor-pointer flex items-center justify-between gap-2 shadow-glow active:scale-95 ${preset.color}`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-bold font-sans text-white truncate flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{preset.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono truncate">{preset.desc}</div>
                </div>

                <div className="text-[10px] font-mono px-2 py-1 rounded bg-dark-surface text-gray-300 shrink-0 font-bold border border-dark-border">
                  Apply
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
