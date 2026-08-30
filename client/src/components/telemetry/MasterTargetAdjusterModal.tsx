import React, { useState } from 'react';
import { X, Target, Dumbbell, Droplets, Flame, Moon, CheckCircle2, Zap, Sparkles } from 'lucide-react';

interface MasterTargetAdjusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargets: {
    stepGoal: number;
    waterGoal: number;
    calorieGoal: number;
    sleepGoal: number;
  };
  onApplyTargets: (newTargets: {
    stepGoal: number;
    waterGoal: number;
    calorieGoal: number;
    sleepGoal: number;
  }) => Promise<void>;
}

export const MasterTargetAdjusterModal: React.FC<MasterTargetAdjusterModalProps> = ({
  isOpen,
  onClose,
  initialTargets,
  onApplyTargets,
}) => {
  const [stepGoal, setStepGoal] = useState<number>(initialTargets.stepGoal || 10000);
  const [waterGoal, setWaterGoal] = useState<number>(initialTargets.waterGoal || 2500);
  const [calorieGoal, setCalorieGoal] = useState<number>(initialTargets.calorieGoal || 2200);
  const [sleepGoal, setSleepGoal] = useState<number>(initialTargets.sleepGoal || 480);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      name: 'Fat Loss Sprint',
      badge: 'Deficit Focus',
      stepGoal: 12500,
      waterGoal: 3200,
      calorieGoal: 1900,
      sleepGoal: 480,
    },
    {
      name: 'Muscle Hypertrophy',
      badge: 'Mass Build',
      stepGoal: 10000,
      waterGoal: 3500,
      calorieGoal: 3100,
      sleepGoal: 510,
    },
    {
      name: 'Endurance Peak',
      badge: 'Stamina',
      stepGoal: 15000,
      waterGoal: 4000,
      calorieGoal: 2800,
      sleepGoal: 540,
    },
    {
      name: 'Balanced Health',
      badge: 'Maintenance',
      stepGoal: 10000,
      waterGoal: 2500,
      calorieGoal: 2200,
      sleepGoal: 480,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setStepGoal(p.stepGoal);
    setWaterGoal(p.waterGoal);
    setCalorieGoal(p.calorieGoal);
    setSleepGoal(p.sleepGoal);
  };

  const handleSave = async () => {
    setIsApplying(true);
    try {
      await onApplyTargets({ stepGoal, waterGoal, calorieGoal, sleepGoal });
      onClose();
    } catch (err) {
      console.error('Failed to sync master targets:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-2 sm:pt-4 p-2 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="telemetry-card max-w-lg w-full max-h-[calc(100vh-1.5rem)] flex flex-col justify-between rounded-2xl border border-brand-500/50 shadow-2xl relative overflow-hidden">
        
        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dark-border/80 pb-3 font-mono">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
                <Target className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  Master Fitness Target Command Modal
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">4-Pillar Daily Target Tuning</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-dark-bg hover:bg-dark-surface text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Target Presets */}
          <div className="space-y-2 font-mono">
            <label className="text-xs text-gray-400 uppercase block">1. Smart Target Presets</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 rounded-xl bg-dark-bg hover:bg-brand-600/20 border border-dark-border/80 hover:border-brand-500/40 text-left transition-all cursor-pointer space-y-1"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-brand-400 font-bold">{p.badge}</span>
                  </div>
                  <div className="text-xs font-bold text-white font-sans">{p.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {p.stepGoal.toLocaleString()}s • {p.waterGoal}ml
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4 Interactive Target Sliders */}
          <div className="space-y-3 font-mono">
            <label className="text-xs text-gray-400 uppercase block">2. Fine-Tune Master Targets</label>

            {/* Gym Target Slider */}
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Gym Target
                </span>
                <span className="text-white font-extrabold tabular-nums">{stepGoal.toLocaleString()} lbs Target</span>
              </div>
              <input
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={stepGoal}
                onChange={(e) => setStepGoal(Number(e.target.value))}
                className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Water Slider */}
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Hydration Target
                </span>
                <span className="text-white font-extrabold tabular-nums">{(waterGoal / 1000).toFixed(1)} L ({waterGoal} mL)</span>
              </div>
              <input
                type="range"
                min="1500"
                max="5000"
                step="250"
                value={waterGoal}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
                className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Calories Slider */}
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Calorie Energy Target
                </span>
                <span className="text-white font-extrabold tabular-nums">{calorieGoal.toLocaleString()} kcal</span>
              </div>
              <input
                type="range"
                min="1500"
                max="4500"
                step="100"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
                className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Sleep Slider */}
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-400 font-bold flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-purple-400" /> Sleep Rest Target
                </span>
                <span className="text-white font-extrabold tabular-nums">
                  {Math.floor(sleepGoal / 60)}h {sleepGoal % 60}m ({sleepGoal} mins)
                </span>
              </div>
              <input
                type="range"
                min="360"
                max="600"
                step="30"
                value={sleepGoal}
                onChange={(e) => setSleepGoal(Number(e.target.value))}
                className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-3.5 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border/80 sticky bottom-0 z-20">
          <button
            onClick={handleSave}
            disabled={isApplying}
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{isApplying ? 'Syncing Master Targets...' : 'Sync Master Targets to Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
