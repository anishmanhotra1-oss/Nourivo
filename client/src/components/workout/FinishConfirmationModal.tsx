import React from 'react';
import { AlertTriangle, CheckCircle2, X, Navigation, Timer, Gauge } from 'lucide-react';

interface FinishConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  distanceKm: number;
  durationFormatted: string;
  paceFormatted: string;
}

export const FinishConfirmationModal: React.FC<FinishConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  distanceKm,
  durationFormatted,
  paceFormatted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-slide-up">
      <div className="telemetry-card w-full max-w-md rounded-2xl p-5 sm:p-6 space-y-5 border border-amber-500/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white font-display">
                Finish This Run?
              </h2>
              <p className="text-xs text-gray-400 font-sans">
                This will end your current workout session.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-dark-bg hover:bg-dark-surface text-gray-400 hover:text-white border border-dark-border/80 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Stats Preview */}
        <div className="grid grid-cols-3 gap-3 text-center font-mono">
          <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Navigation className="w-3 h-3 text-brand-400" />
              <span>Distance</span>
            </div>
            <div className="text-lg font-bold text-white tabular-nums">{distanceKm}</div>
            <div className="text-[10px] text-gray-500">km</div>
          </div>

          <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Timer className="w-3 h-3 text-brand-400" />
              <span>Time</span>
            </div>
            <div className="text-lg font-bold text-white tabular-nums">{durationFormatted}</div>
            <div className="text-[10px] text-gray-500">active</div>
          </div>

          <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              <span>Pace</span>
            </div>
            <div className="text-lg font-bold text-cyan-400 tabular-nums">{paceFormatted}</div>
            <div className="text-[10px] text-gray-500">/km</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 font-mono">
          <button
            onClick={onCancel}
            className="py-3 px-4 bg-dark-bg hover:bg-dark-surface text-gray-300 hover:text-white border border-dark-border font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Keep Running
          </button>
          <button
            onClick={onConfirm}
            className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
