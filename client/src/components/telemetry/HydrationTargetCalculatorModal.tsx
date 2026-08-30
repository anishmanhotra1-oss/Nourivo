import React, { useState } from 'react';
import { X, Calculator, Droplets, Sun, Flame, Scale, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HydrationTargetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeightKg?: number;
  onApplyTarget: (newTargetMl: number) => Promise<void>;
}

export const HydrationTargetCalculatorModal: React.FC<HydrationTargetCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeightKg = 70,
  onApplyTarget,
}) => {
  const { user } = useAuth();
  const [weightKg, setWeightKg] = useState<number>(user?.weight || initialWeightKg);
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'intense'>('moderate');
  const [climateTemp, setClimateTemp] = useState<'mild' | 'warm' | 'hot'>('warm');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  // Personalized Hydration Target Formula
  const baseWaterMl = weightKg * 35;
  const activityBonusMl = activityLevel === 'low' ? 0 : activityLevel === 'moderate' ? 400 : 800;
  const climateBonusMl = climateTemp === 'mild' ? 0 : climateTemp === 'warm' ? 300 : 600;

  const calculatedTargetMl = Math.round((baseWaterMl + activityBonusMl + climateBonusMl) / 50) * 50;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApplyTarget(calculatedTargetMl);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-2 sm:pt-4 p-2 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="telemetry-card max-w-lg w-full max-h-[calc(100vh-1.5rem)] flex flex-col justify-between rounded-2xl border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        
        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  Personalized Hydration Target Calculator
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">Scientific Metabolic Water Requirement Engine</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-dark-bg hover:bg-dark-surface text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Input Parameters */}
          <div className="space-y-4 font-mono">
            {/* Weight Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-gray-400 uppercase flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Body Mass Weight (kg)</span>
                </label>
                <span className="font-bold text-white">{weightKg} kg</span>
              </div>
              <input
                type="range"
                min="35"
                max="160"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Activity Level Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily Workout Activity Level</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'low', label: 'Light / Desk', bonus: '+0 mL' },
                  { id: 'moderate', label: 'Moderate (45m)', bonus: '+400 mL' },
                  { id: 'intense', label: 'Athlete (60m+)', bonus: '+800 mL' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivityLevel(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      activityLevel === item.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold shadow-glow'
                        : 'bg-dark-bg border-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-sans font-semibold">{item.label}</div>
                    <div className="text-[10px] text-amber-400 font-mono mt-0.5">{item.bonus}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Climate Temperature Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 uppercase flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ambient Climate Temperature</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'mild', label: 'Mild (<20°C)', bonus: '+0 mL' },
                  { id: 'warm', label: 'Warm (20-30°C)', bonus: '+300 mL' },
                  { id: 'hot', label: 'Hot / Summer (30°C+)', bonus: '+600 mL' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setClimateTemp(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      climateTemp === item.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-bold shadow-glow'
                        : 'bg-dark-bg border-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-sans font-semibold">{item.label}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{item.bonus}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculated Result Display */}
          <div className="p-4 rounded-xl bg-dark-bg border border-cyan-500/40 text-center font-mono space-y-1">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">Recommended Daily Water Intake</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tabular-nums">
              {calculatedTargetMl.toLocaleString()} mL <span className="text-base font-normal text-gray-400">({(calculatedTargetMl / 1000).toFixed(2)} L)</span>
            </div>
            <div className="text-[11px] text-gray-400 font-sans">
              Base: {baseWaterMl}mL • Activity: +{activityBonusMl}mL • Climate: +{climateBonusMl}mL
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-3.5 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border/80 sticky bottom-0 z-20">
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{isApplying ? 'Applying Target to Profile...' : 'Apply Target to My Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
