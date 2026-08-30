import React from 'react';
import { Trophy, CheckCircle2, Flame, Timer, Navigation, Gauge, Zap, Mountain, Footprints, X } from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: {
    type?: string;
    activityType?: string;
    distanceKm?: number;
    durationSeconds?: number;
    avgSpeedKmh?: number;
    maxSpeedKmh?: number;
    caloriesBurned?: number;
    paceMinKm?: string;
    avgPaceMinKm?: string;
    avgPaceFormatted?: string;
    routeCoords?: [number, number][];
    gpsPath?: [number, number][];
    elevationGainMeters?: number;
    cadenceSpm?: number;
  } | null;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  isOpen,
  onClose,
  summaryData,
}) => {
  if (!isOpen || !summaryData) return null;

  const coordsList = summaryData.routeCoords || summaryData.gpsPath || [];
  const activityName = summaryData.type || summaryData.activityType || 'Workout';
  const pace = summaryData.avgPaceFormatted || summaryData.paceMinKm || summaryData.avgPaceMinKm || '--:--';
  const distance = summaryData.distanceKm ?? 0;
  const duration = summaryData.durationSeconds ?? 0;
  const avgSpeed = summaryData.avgSpeedKmh ?? 0;
  const maxSpeed = summaryData.maxSpeedKmh ?? 0;
  const calories = summaryData.caloriesBurned ?? 0;
  const elevation = summaryData.elevationGainMeters ?? 0;
  const cadence = summaryData.cadenceSpm ?? 0;

  const formatElapsedDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? hours + ':' : ''}${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-slide-up">
      <div className="telemetry-card w-full max-w-2xl rounded-2xl p-5 sm:p-6 space-y-5 border border-brand-500/40 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                RUN COMPLETE ✓
              </span>
              <h2 className="text-xl font-extrabold text-white font-display uppercase tracking-wide">
                Workout Session Summary
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-bg hover:bg-dark-surface text-gray-400 hover:text-white border border-dark-border/80 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Map */}
        {coordsList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400 uppercase">Covered Route & Area Tracked</span>
              <span className="text-brand-400 font-bold capitalize">{activityName} Session</span>
            </div>
            <GoogleMapView coords={coordsList} height="220px" />
          </div>
        )}

        {/* Summary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center font-mono">
          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Navigation className="w-3.5 h-3.5 text-brand-400" />
              <span>Distance</span>
            </div>
            <div className="text-xl font-bold text-white tabular-nums">{distance}</div>
            <div className="text-[10px] text-gray-500">km</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Timer className="w-3.5 h-3.5 text-brand-400" />
              <span>Duration</span>
            </div>
            <div className="text-xl font-bold text-white tabular-nums">
              {formatElapsedDuration(duration)}
            </div>
            <div className="text-[10px] text-gray-500">active time</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg Pace</span>
            </div>
            <div className="text-xl font-bold text-cyan-400 tabular-nums">{pace}</div>
            <div className="text-[10px] text-gray-500">/km</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg Speed</span>
            </div>
            <div className="text-xl font-bold text-cyan-300 tabular-nums">{avgSpeed}</div>
            <div className="text-[10px] text-gray-500">km/h</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Peak Speed</span>
            </div>
            <div className="text-xl font-bold text-cyan-300 tabular-nums">{maxSpeed}</div>
            <div className="text-[10px] text-gray-500">km/h</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Calories</span>
            </div>
            <div className="text-xl font-bold text-amber-400 tabular-nums">{calories}</div>
            <div className="text-[10px] text-gray-500">kcal</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Mountain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Elevation</span>
            </div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">+{elevation}</div>
            <div className="text-[10px] text-gray-500">m</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Footprints className="w-3.5 h-3.5 text-purple-400" />
              <span>Cadence</span>
            </div>
            <div className="text-xl font-bold text-purple-400 tabular-nums">{cadence || '--'}</div>
            <div className="text-[10px] text-gray-500">spm</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80 flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 uppercase mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Milestone</span>
            </div>
            <div className="text-xs font-bold text-emerald-400">SESSION SAVED</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow cursor-pointer"
        >
          Confirm & Close Summary
        </button>
      </div>
    </div>
  );
};
