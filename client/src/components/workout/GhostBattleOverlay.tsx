import React from 'react';
import { Trophy } from 'lucide-react';

interface GhostBattleOverlayProps {
  currentDistanceKm: number;
  currentPaceMinKm: string;
  isGhostActive: boolean;
  onToggleGhost: () => void;
}

export const GhostBattleOverlay: React.FC<GhostBattleOverlayProps> = ({
  currentDistanceKm,
  currentPaceMinKm,
  isGhostActive,
  onToggleGhost,
}) => {
  // Simulated Personal Record (PR) Ghost Pace: 05:15 min/km
  const prTargetPaceMinKm = 5.25;
  const currentPaceValue = parseFloat(currentPaceMinKm) || 6.0;
  const paceDiff = prTargetPaceMinKm - currentPaceValue; // Positive = user faster than ghost

  const distanceDeltaMeters = Math.round(paceDiff * 10 * currentDistanceKm * 10);

  return (
    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-[400] flex items-center justify-between gap-2 p-2 sm:p-3 rounded-xl bg-dark-bg/95 backdrop-blur-md border border-brand-500/40 shadow-xl font-mono">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-brand-600 to-indigo-600 text-white shrink-0 shadow-glow">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
        </div>

        <div className="truncate">
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider truncate">
            <span>PR GHOST</span>
            <span className="text-amber-400 font-bold">05:15/KM</span>
          </div>

          <div className="text-[11px] sm:text-xs font-bold text-white truncate">
            {isGhostActive ? (
              distanceDeltaMeters >= 0 ? (
                <span className="text-emerald-400 font-bold">LEAD +{distanceDeltaMeters}m</span>
              ) : (
                <span className="text-rose-400 font-bold">BEHIND {Math.abs(distanceDeltaMeters)}m</span>
              )
            ) : (
              <span className="text-gray-300 font-sans font-normal truncate">PR Ghost Racing</span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onToggleGhost}
        className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
          isGhostActive
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow'
            : 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow'
        }`}
      >
        {isGhostActive ? 'Active' : 'Engage Ghost'}
      </button>
    </div>
  );
};
