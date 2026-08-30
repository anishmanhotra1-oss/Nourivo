import React from 'react';
import { X, Navigation, Timer, Gauge, Zap, Flame, Mountain, Footprints, Trophy } from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';

interface RunDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  run: {
    activityType?: string;
    distance: number;
    activeDuration: number;
    elapsedDuration: number;
    averageSpeed: number;
    maximumSpeed: number;
    averagePace: string;
    calories: number;
    elevationGain: number;
    cadence: number;
    routePoints: string;
    startTime: string;
  } | null;
}

export const RunDetailModal: React.FC<RunDetailModalProps> = ({ isOpen, onClose, run }) => {
  if (!isOpen || !run) return null;

  let routeCoords: [number, number][] = [];
  try {
    const parsed = JSON.parse(run.routePoints);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Handle both [{lat, lng}] and [[lat, lng]] formats
      if (typeof parsed[0] === 'object' && 'lat' in parsed[0]) {
        routeCoords = parsed.map((p: any) => [p.lat, p.lng]);
      } else {
        routeCoords = parsed;
      }
    }
  } catch {}

  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const activityName = run.activityType || 'Running';
  const dateStr = new Date(run.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = new Date(run.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-slide-up">
      <div className="telemetry-card w-full max-w-2xl rounded-2xl p-5 sm:p-6 space-y-5 border border-brand-500/40 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-400">
                {activityName.toUpperCase()} SESSION
              </span>
              <h2 className="text-lg font-extrabold text-white font-display">
                Run Details
              </h2>
              <p className="text-[11px] text-gray-400 font-sans">{dateStr} at {timeStr}</p>
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
        {routeCoords.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-mono text-gray-400 uppercase">Route Map</span>
            <GoogleMapView coords={routeCoords} height="220px" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center font-mono">
          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Navigation className="w-3.5 h-3.5 text-brand-400" />
              <span>Distance</span>
            </div>
            <div className="text-xl font-bold text-white tabular-nums">{run.distance}</div>
            <div className="text-[10px] text-gray-500">km</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Timer className="w-3.5 h-3.5 text-brand-400" />
              <span>Active Time</span>
            </div>
            <div className="text-xl font-bold text-white tabular-nums">{formatDuration(run.activeDuration)}</div>
            <div className="text-[10px] text-gray-500">hh:mm:ss</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg Pace</span>
            </div>
            <div className="text-xl font-bold text-cyan-400 tabular-nums">{run.averagePace || '--:--'}</div>
            <div className="text-[10px] text-gray-500">/km</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg Speed</span>
            </div>
            <div className="text-xl font-bold text-cyan-300 tabular-nums">{run.averageSpeed}</div>
            <div className="text-[10px] text-gray-500">km/h</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Max Speed</span>
            </div>
            <div className="text-xl font-bold text-cyan-300 tabular-nums">{run.maximumSpeed}</div>
            <div className="text-[10px] text-gray-500">km/h</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Calories</span>
            </div>
            <div className="text-xl font-bold text-amber-400 tabular-nums">{run.calories}</div>
            <div className="text-[10px] text-gray-500">kcal</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Mountain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Elevation</span>
            </div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">+{run.elevationGain}</div>
            <div className="text-[10px] text-gray-500">m</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Footprints className="w-3.5 h-3.5 text-purple-400" />
              <span>Cadence</span>
            </div>
            <div className="text-xl font-bold text-purple-400 tabular-nums">{run.cadence || '--'}</div>
            <div className="text-[10px] text-gray-500">spm</div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Timer className="w-3.5 h-3.5 text-gray-400" />
              <span>Elapsed</span>
            </div>
            <div className="text-xl font-bold text-gray-300 tabular-nums">{formatDuration(run.elapsedDuration)}</div>
            <div className="text-[10px] text-gray-500">total</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
