import React from 'react';
import { Moon, Sun, Activity, Zap, ShieldCheck } from 'lucide-react';

interface CircadianPredictorProps {
  sleepMinutes?: number;
  sleepQuality?: number;
  stepCount?: number;
  className?: string;
}

export const CircadianPredictor: React.FC<CircadianPredictorProps> = ({
  sleepMinutes = 450,
  sleepQuality = 4,
  stepCount = 6500,
  className = '',
}) => {
  // Circadian Readiness Formula: 60% Sleep + 40% Step recovery pacing
  const sleepFactor = Math.min(100, ((sleepMinutes / 480) * 0.7 + (sleepQuality / 5) * 0.3) * 100);
  const readinessScore = Math.min(100, Math.max(40, Math.round(sleepFactor * 0.85 + (stepCount > 1000 ? 15 : 5))));

  let energyTier = {
    title: 'PEAK ATHLETIC READINESS',
    window: '4:30 PM – 6:15 PM',
    intensity: 'Optimal window for high-intensity interval training or GPS speed run.',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    barColor: 'bg-emerald-500',
  };

  if (readinessScore < 60) {
    energyTier = {
      title: 'ACTIVE RECOVERY RECOMMENDED',
      window: '5:00 PM – 6:00 PM',
      intensity: 'Elevated fatigue detected. Recommending a light 20-min walking session.',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      barColor: 'bg-amber-500',
    };
  } else if (readinessScore < 82) {
    energyTier = {
      title: 'STEADY ENDURANCE PACING',
      window: '5:15 PM – 6:45 PM',
      intensity: 'Moderate stamina reserves active for steady-state aerobic run.',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      barColor: 'bg-cyan-500',
    };
  }

  return (
    <div className={`telemetry-card rounded-2xl p-5 space-y-4 border border-purple-500/30 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Circadian Recovery & Energy Predictor
          </h3>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${energyTier.color}`}>
          {energyTier.title}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center font-mono">
        <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80">
          <div className="text-[10px] text-gray-500 uppercase">Readiness Score</div>
          <div className="text-2xl font-bold text-white tabular-nums">{readinessScore}/100</div>
        </div>

        <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80">
          <div className="text-[10px] text-gray-500 uppercase">Peak Energy Window</div>
          <div className="text-sm font-bold text-amber-400 tabular-nums mt-1">{energyTier.window}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-dark-border/80 text-[11px] text-gray-300 font-sans">
        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="leading-tight">{energyTier.intensity}</span>
      </div>
    </div>
  );
};
