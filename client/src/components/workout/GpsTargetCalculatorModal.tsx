import React, { useState } from 'react';
import { X, Navigation, Timer, Flame, Gauge, CheckCircle2, Zap, Trophy, Activity } from 'lucide-react';

interface GpsTargetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTarget: (targetDistanceKm: number, targetPaceMinKm: string) => void;
}

export const GpsTargetCalculatorModal: React.FC<GpsTargetCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyTarget,
}) => {
  const [targetDistanceKm, setTargetDistanceKm] = useState<number>(5.0);
  const [targetPaceMinKm, setTargetPaceMinKm] = useState<string>('5.5'); // 5.5 min/km = 5:30 min/km

  if (!isOpen) return null;

  const presets = [
    { name: '3.0 km Active Jog', distance: 3.0, defaultPace: '6.0', badge: 'Light Jog' },
    { name: '5.0 km 5K Benchmark', distance: 5.0, defaultPace: '5.5', badge: 'Popular 5K' },
    { name: '10.0 km 10K Endurance', distance: 10.0, defaultPace: '5.5', badge: '10K Challenge' },
    { name: '21.1 km Half-Marathon', distance: 21.1, defaultPace: '5.8', badge: 'Half-Marathon' },
  ];

  // Convert decimal pace (e.g. 5.5) to formatted "5:30 min/km"
  const formatPaceStr = (decimalPace: string) => {
    const p = parseFloat(decimalPace);
    const mins = Math.floor(p);
    const secs = Math.round((p - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')} min/km`;
  };

  // Calculate target duration in seconds
  const totalTargetSeconds = Math.round(targetDistanceKm * parseFloat(targetPaceMinKm) * 60);
  const targetHrs = Math.floor(totalTargetSeconds / 3600);
  const targetMins = Math.floor((totalTargetSeconds % 3600) / 60);
  const targetSecs = totalTargetSeconds % 60;
  const formattedDuration = `${targetHrs > 0 ? `${targetHrs}h ` : ''}${targetMins}m ${targetSecs}s`;

  const estimatedCalories = Math.round(targetDistanceKm * 65);

  const handleApply = () => {
    onApplyTarget(targetDistanceKm, formatPaceStr(targetPaceMinKm));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="telemetry-card max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 border border-cyan-500/40 space-y-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/80 pb-4 font-mono">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Navigation className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                GPS Target Distance & Pace Engine
              </h3>
              <p className="text-xs text-gray-400">Live Telemetry Pacer Goal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-bg hover:bg-dark-surface text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distance Target Presets */}
        <div className="space-y-2 font-mono">
          <label className="text-xs text-gray-400 uppercase block">1. Select Target Distance</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {presets.map((preset) => {
              const isSelected = targetDistanceKm === preset.distance;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setTargetDistanceKm(preset.distance);
                    setTargetPaceMinKm(preset.defaultPace);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-cyan-600/20 border-cyan-500 text-white font-bold shadow-glow'
                      : 'bg-dark-bg border-dark-border/80 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-cyan-300 font-bold">{preset.badge}</span>
                  </div>
                  <div className="text-xs font-bold text-white font-sans">{preset.name}</div>
                  <div className="text-[10px] text-gray-400">{preset.distance} km target</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Distance Slider */}
        <div className="p-4 rounded-xl bg-dark-bg border border-dark-border/80 space-y-2 font-mono">
          <div className="flex justify-between items-center text-xs">
            <label className="text-gray-400 uppercase">2. Custom Distance Goal</label>
            <span className="font-extrabold text-cyan-300 text-sm tabular-nums">
              {targetDistanceKm.toFixed(1)} km
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="42.2"
            step="0.5"
            value={targetDistanceKm}
            onChange={(e) => setTargetDistanceKm(Number(e.target.value))}
            className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>1 km</span>
            <span>10 km</span>
            <span>42.2 km (Marathon)</span>
          </div>
        </div>

        {/* Target Pace Picker */}
        <div className="space-y-2 font-mono">
          <label className="text-xs text-gray-400 uppercase block">3. Target Split Pace</label>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { val: '4.5', label: '4:30' },
              { val: '5.0', label: '5:00' },
              { val: '5.5', label: '5:30' },
              { val: '6.0', label: '6:00' },
            ].map((pace) => (
              <button
                key={pace.val}
                type="button"
                onClick={() => setTargetPaceMinKm(pace.val)}
                className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  targetPaceMinKm === pace.val
                    ? 'bg-brand-600/30 border-brand-500 text-white shadow-glow'
                    : 'bg-dark-bg border-dark-border/80 text-gray-400 hover:text-white'
                }`}
              >
                {pace.label} /km
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Target Breakdown */}
        <div className="grid grid-cols-2 gap-3 font-mono text-center">
          <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 space-y-0.5">
            <span className="text-[10px] text-gray-500 uppercase block">Target Duration</span>
            <span className="text-sm font-extrabold text-white tabular-nums block">{formattedDuration}</span>
          </div>
          <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 space-y-0.5">
            <span className="text-[10px] text-gray-500 uppercase block">Est. Calorie Burn</span>
            <span className="text-sm font-extrabold text-amber-400 tabular-nums block">{estimatedCalories} kcal</span>
          </div>
        </div>

        {/* Apply Action Button */}
        <button
          onClick={handleApply}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Apply {targetDistanceKm} km GPS Target Goal</span>
        </button>
      </div>
    </div>
  );
};
