import React, { useState, useEffect } from 'react';
import { Scale, HeartPulse, Sparkles, Sliders, Activity, Info, CheckCircle2, ArrowRight, Target, Zap, Clock } from 'lucide-react';

interface BmiCalculatorSectionProps {
  initialWeightKg?: number;
  onWeightUpdate?: (newWeight: number) => void;
}

export const BmiCalculatorSection: React.FC<BmiCalculatorSectionProps> = ({
  initialWeightKg = 70,
  onWeightUpdate,
}) => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  
  // Metric States
  const [weightKg, setWeightKg] = useState<number>(initialWeightKg);
  const [heightCm, setHeightCm] = useState<number>(175);

  // Imperial States
  const [weightLbs, setWeightLbs] = useState<number>(Math.round(initialWeightKg * 2.20462));
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);

  // Target BMI Simulator State (Default 22.0 kg/m² optimal healthy target)
  const [targetBmi, setTargetBmi] = useState<number>(22.0);
  const [isSavedTargetSuccess, setIsSavedTargetSuccess] = useState(false);

  // Sync when initialWeightKg changes from props
  useEffect(() => {
    if (initialWeightKg && initialWeightKg > 0) {
      setWeightKg(initialWeightKg);
      setWeightLbs(Math.round(initialWeightKg * 2.20462));
    }
  }, [initialWeightKg]);

  // Sync values when toggling unit system
  const handleUnitToggle = (newUnit: 'metric' | 'imperial') => {
    if (newUnit === 'imperial' && unitSystem === 'metric') {
      setWeightLbs(Math.round(weightKg * 2.20462));
      const totalInches = Math.round(heightCm / 2.54);
      setHeightFt(Math.floor(totalInches / 12));
      setHeightIn(totalInches % 12);
    } else if (newUnit === 'metric' && unitSystem === 'imperial') {
      const totalInches = heightFt * 12 + heightIn;
      setHeightCm(Math.round(totalInches * 2.54));
      setWeightKg(Math.round((weightLbs / 2.20462) * 10) / 10);
    }
    setUnitSystem(newUnit);
  };

  // 100% Accurate BMI Computation
  let calculatedBmi = 0;
  let effectiveWeightKg = weightKg;
  let effectiveHeightCm = heightCm;

  if (unitSystem === 'metric') {
    effectiveWeightKg = weightKg;
    effectiveHeightCm = heightCm;
    if (heightCm > 0) {
      const heightM = heightCm / 100;
      calculatedBmi = weightKg / (heightM * heightM);
    }
  } else {
    const totalInches = heightFt * 12 + heightIn;
    if (totalInches > 0) {
      calculatedBmi = (703 * weightLbs) / (totalInches * totalInches);
      effectiveWeightKg = Math.round((weightLbs / 2.20462) * 10) / 10;
      effectiveHeightCm = Math.round(totalInches * 2.54);
    }
  }

  const bmiScore = Math.max(10, Math.min(50, Math.round(calculatedBmi * 10) / 10));
  const bmiPrime = Math.round((calculatedBmi / 25.0) * 100) / 100;

  // Target BMI Simulator Calculations
  const heightM = effectiveHeightCm / 100;
  const targetWeightKg = Math.round(targetBmi * heightM * heightM * 10) / 10;
  const targetWeightLbs = Math.round(targetWeightKg * 2.20462);
  const targetWeightDeltaKg = Math.round((targetWeightKg - effectiveWeightKg) * 10) / 10;
  const estimatedWeeksToTarget = Math.max(1, Math.round(Math.abs(targetWeightDeltaKg) / 0.5));

  // WHO Health Classification Specs
  let categoryInfo = {
    label: 'Normal / Healthy Weight',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    badgeColor: 'bg-emerald-500/20 text-emerald-300',
    advice: 'Your body mass index is in the optimal healthy range! Maintain balanced nutrition & routine workouts.',
    riskLevel: 'Optimal Health',
  };

  if (calculatedBmi < 18.5) {
    categoryInfo = {
      label: 'Underweight',
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-500/10',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
      advice: 'Below optimal range. Consider increasing nutrient-dense whole foods and muscle-building strength workouts.',
      riskLevel: 'Increased Risk',
    };
  } else if (calculatedBmi >= 18.5 && calculatedBmi <= 24.9) {
    categoryInfo = {
      label: 'Normal / Healthy Weight',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-500/10',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      advice: 'Your body mass index is in the optimal healthy range! Maintain balanced nutrition & routine workouts.',
      riskLevel: 'Optimal Health',
    };
  } else if (calculatedBmi >= 25.0 && calculatedBmi <= 29.9) {
    categoryInfo = {
      label: 'Overweight',
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-500/10',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      advice: 'Slightly above recommended range. Incorporate daily 30-min cardio sessions and deficit nutrition.',
      riskLevel: 'Moderate Risk',
    };
  } else if (calculatedBmi >= 30.0 && calculatedBmi <= 34.9) {
    categoryInfo = {
      label: 'Obese Class I',
      color: 'text-orange-400',
      borderColor: 'border-orange-500/40',
      bgColor: 'bg-orange-500/10',
      badgeColor: 'bg-orange-500/20 text-orange-300',
      advice: 'Class I obesity profile. Focus on progressive step volume targets and structured calorie control.',
      riskLevel: 'High Risk',
    };
  } else {
    categoryInfo = {
      label: 'Obese Class II / III',
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgColor: 'bg-rose-500/10',
      badgeColor: 'bg-rose-500/20 text-rose-300',
      advice: 'High body mass profile. Consult a healthcare provider for personalized medical & fitness guidance.',
      riskLevel: 'Very High Risk',
    };
  }

  // Ideal Weight Range Calculation (based on height)
  const minIdealKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxIdealKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  // Needle Angles for Semi-Circle Arc (BMI 15 to 40)
  const clampedBmiForGauge = Math.max(15, Math.min(40, bmiScore));
  const gaugePercent = (clampedBmiForGauge - 15) / (40 - 15);
  const needleAngleDeg = -90 + gaugePercent * 180;

  const clampedTargetBmi = Math.max(15, Math.min(40, targetBmi));
  const targetGaugePercent = (clampedTargetBmi - 15) / (40 - 15);
  const targetNeedleAngleDeg = -90 + targetGaugePercent * 180;

  const handleApplyTargetWeight = () => {
    if (onWeightUpdate) {
      onWeightUpdate(targetWeightKg);
      setIsSavedTargetSuccess(true);
      setTimeout(() => setIsSavedTargetSuccess(false), 3000);
    }
  };

  return (
    <div className="telemetry-card rounded-2xl p-4 sm:p-6 border border-brand-500/30 space-y-6 shadow-2xl font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 font-medium mb-1">
            <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>WHO BIOMETRIC HEALTH & TARGET ENGINE</span>
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            BMI & Target Weight Goal Simulator
          </h3>
        </div>

        {/* Unit Switcher Pills */}
        <div className="flex items-center p-1 rounded-xl bg-dark-bg border border-dark-border/80 text-xs font-mono">
          <button
            onClick={() => handleUnitToggle('metric')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              unitSystem === 'metric'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Metric (kg / cm)
          </button>
          <button
            onClick={() => handleUnitToggle('imperial')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              unitSystem === 'imperial'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Imperial (lbs / in)
          </button>
        </div>
      </div>

      {isSavedTargetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold text-center flex items-center justify-center gap-2 shadow-glow animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Target Weight ({targetWeightKg} kg) applied to profile successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Input Controls & Target Simulator */}
        <div className="lg:col-span-5 space-y-4 font-mono">
          <div className="p-4 rounded-xl bg-dark-bg border border-dark-border/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Body Measurements</span>
              </span>
              <span className="text-[10px] text-gray-400">Live Telemetry</span>
            </div>

            {/* Height Control */}
            {unitSystem === 'metric' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-gray-400 uppercase">Height (cm)</label>
                  <span className="font-bold text-white text-sm">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase block">Height (ft & in)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Feet</span>
                    <input
                      type="number"
                      min="4"
                      max="7"
                      value={heightFt}
                      onChange={(e) => setHeightFt(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Inches</span>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightIn}
                      onChange={(e) => setHeightIn(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Weight Control */}
            {unitSystem === 'metric' ? (
              <div className="space-y-2 pt-2 border-t border-dark-border/80">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-gray-400 uppercase">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="220"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-dark-surface border border-dark-border rounded-lg text-right font-bold text-emerald-400 text-sm"
                  />
                </div>
                <input
                  type="range"
                  min="35"
                  max="180"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-dark-border/80">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-gray-400 uppercase">Current Weight (lbs)</label>
                  <input
                    type="number"
                    min="70"
                    max="450"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-dark-surface border border-dark-border rounded-lg text-right font-bold text-emerald-400 text-sm"
                  />
                </div>
                <input
                  type="range"
                  min="80"
                  max="350"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Number(e.target.value))}
                  className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}

            {/* Target BMI Goal Simulator Controls */}
            <div className="space-y-2.5 pt-3 border-t border-cyan-500/30">
              <div className="flex justify-between items-center text-xs">
                <label className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target BMI Goal</span>
                </label>
                <span className="font-extrabold text-cyan-300 text-sm tabular-nums">
                  {targetBmi.toFixed(1)} kg/m²
                </span>
              </div>
              <input
                type="range"
                min="18.5"
                max="29.9"
                step="0.1"
                value={targetBmi}
                onChange={(e) => setTargetBmi(Number(e.target.value))}
                className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>18.5 (Lean)</span>
                <span className="text-cyan-400 font-bold">22.0 (Optimal)</span>
                <span>24.9 (Upper Normal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Animated Dual-Needle Arc Gauge & Target Simulator Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-5 sm:p-6 rounded-2xl bg-dark-bg border ${categoryInfo.borderColor} flex flex-col items-center justify-between space-y-4 shadow-lg`}>
            
            {/* SVG Animated Dual-Needle Arc Gauge */}
            <div className="relative w-64 h-36 flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                <defs>
                  <linearGradient id="bmiArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="30%" stopColor="#10B981" />
                    <stop offset="60%" stopColor="#F59E0B" />
                    <stop offset="85%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>

                {/* Track Arc Background */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1E2028" strokeWidth="16" strokeLinecap="round" />

                {/* Active Colored Gradient Arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#bmiArcGradient)" strokeWidth="14" strokeLinecap="round" />

                {/* Target Ghost Needle Pointer (Cyan/Amber Pulse) */}
                <g
                  style={{
                    transform: `rotate(${targetNeedleAngleDeg}deg)`,
                    transformOrigin: '100px 100px',
                    transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <line x1="100" y1="100" x2="100" y2="26" stroke="#06B6D4" strokeWidth="2.5" strokeDasharray="3 3" />
                  <circle cx="100" cy="24" r="3.5" fill="#06B6D4" className="animate-ping" />
                </g>

                {/* Current Needle Pointer (Solid White) */}
                <g
                  style={{
                    transform: `rotate(${needleAngleDeg}deg)`,
                    transformOrigin: '100px 100px',
                    transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <line x1="100" y1="100" x2="100" y2="30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <polygon points="100,24 96,34 104,34" fill="#FFFFFF" />
                </g>

                {/* Gauge Needle Center Pivot */}
                <circle cx="100" cy="100" r="7" fill="#FFFFFF" />
                <circle cx="100" cy="100" r="3" fill="#0A0A0A" />
              </svg>

              {/* Central Floating Live Score */}
              <div className="absolute bottom-0 text-center font-mono space-y-0.5">
                <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight block">
                  {bmiScore}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-sans">
                  Current BMI (kg/m²)
                </span>
              </div>
            </div>

            {/* Classification & Target Goal Details */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              {/* Target Weight Goal Card */}
              <div className="p-3.5 rounded-xl bg-cyan-600/10 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Target Weight Goal ({targetBmi} BMI)
                </span>
                <div className="text-base font-extrabold text-white tabular-nums">
                  {unitSystem === 'metric' ? `${targetWeightKg} kg` : `${targetWeightLbs} lbs`}
                </div>
                <div className={`text-[11px] font-bold ${targetWeightDeltaKg > 0 ? 'text-amber-400' : targetWeightDeltaKg < 0 ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {targetWeightDeltaKg > 0
                    ? `+${targetWeightDeltaKg} kg Weight Gain Goal`
                    : targetWeightDeltaKg < 0
                    ? `${targetWeightDeltaKg} kg Weight Loss Goal`
                    : '✨ Currently at Target Weight!'}
                </div>
              </div>

              {/* Pacing Timeline Card */}
              <div className="p-3.5 rounded-xl bg-purple-600/10 border border-purple-500/30 space-y-1">
                <span className="text-[10px] text-purple-300 uppercase font-bold block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Healthy Timeline Pacing
                </span>
                <div className="text-base font-extrabold text-white tabular-nums">
                  ~{estimatedWeeksToTarget} Weeks
                </div>
                <div className="text-[11px] text-gray-400">
                  @ 0.5 kg/week healthy pace
                </div>
              </div>
            </div>

            {/* Apply Target Goal Action Button */}
            <button
              onClick={handleApplyTargetWeight}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Apply {targetWeightKg} kg Target Weight to Profile</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

