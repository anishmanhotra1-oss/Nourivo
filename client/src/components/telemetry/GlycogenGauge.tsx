import React from 'react';
import { Zap, Flame, BatteryCharging } from 'lucide-react';

interface GlycogenGaugeProps {
  carbsGrams?: number;
  proteinGrams?: number;
  caloriesBurned?: number;
  stepCount?: number;
  className?: string;
}

export const GlycogenGauge: React.FC<GlycogenGaugeProps> = ({
  carbsGrams = 120,
  proteinGrams = 60,
  caloriesBurned = 400,
  stepCount = 5000,
  className = '',
}) => {
  // Glycogen Tank Calculation Formula
  // Carbs supply ~4kcal/g; steps & workout burn glycogen first.
  const glycogenAdded = carbsGrams * 0.7; // ~70% converts to muscle glycogen
  const glycogenBurned = (caloriesBurned + stepCount * 0.035) / 4;
  const netGlycogenUnits = Math.max(10, Math.min(100, Math.round(50 + glycogenAdded - glycogenBurned * 0.4)));

  let statusBadge = {
    label: 'PEAK GLYCOGEN',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    barColor: 'bg-emerald-500',
    advice: 'Optimal fuel level for high-intensity GPS interval sprints.',
  };

  if (netGlycogenUnits < 25) {
    statusBadge = {
      label: 'CRITICAL FUEL RESERVE',
      color: 'text-red-400 border-red-500/30 bg-red-500/10',
      barColor: 'bg-red-500',
      advice: 'Fuel tank low — consume 30g fast carbs before training.',
    };
  } else if (netGlycogenUnits < 55) {
    statusBadge = {
      label: 'PEAK FAT-BURN ZONE',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      barColor: 'bg-amber-500',
      advice: 'Glycogen depleted. Body is burning stored body fat for energy!',
    };
  } else if (netGlycogenUnits < 85) {
    statusBadge = {
      label: 'OPTIMAL STAMINA PACING',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      barColor: 'bg-cyan-500',
      advice: 'Balanced glycogen reserves active for sustained endurance.',
    };
  }

  return (
    <div className={`telemetry-card rounded-2xl p-5 space-y-4 border border-brand-500/30 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Muscle Glycogen Fuel Gauge
          </h3>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Fuel Gauge Progress Meter */}
      <div className="space-y-2 font-mono">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-gray-400 uppercase">Live Muscle Fuel Reserve</span>
          <span className="text-2xl font-bold text-white tabular-nums">{netGlycogenUnits}%</span>
        </div>

        <div className="h-3 w-full bg-dark-bg border border-dark-border/80 rounded-full overflow-hidden p-0.5 relative">
          <div
            className={`h-full rounded-full transition-all duration-500 shadow-glow ${statusBadge.barColor}`}
            style={{ width: `${netGlycogenUnits}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-dark-border/80 text-[11px] text-gray-300 font-sans">
        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="leading-tight">{statusBadge.advice}</span>
      </div>
    </div>
  );
};
