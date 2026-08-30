import React from 'react';
import { X, Play, Dumbbell, Target, CheckCircle2, ShieldAlert, Sparkles, Activity } from 'lucide-react';

export interface DetailedExerciseInfo {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primaryMuscle: string;
  imageUrl: string;
  instructions: string[];
  secondaryMuscles?: string[];
  proTip?: string;
  tempo?: string;
}

interface ExerciseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: DetailedExerciseInfo | null;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  isOpen,
  onClose,
  exercise,
}) => {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-start justify-center pt-4 sm:pt-8 p-3 sm:p-4 bg-dark-bg/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="telemetry-card max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6 border border-brand-500/40 space-y-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
              <Dumbbell className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-wider block">
                VISUAL EXECUTION GUIDE
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                {exercise.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-bg hover:bg-dark-surface text-gray-400 hover:text-white border border-dark-border transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Movement Image Visual Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-dark-border bg-dark-bg group">
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80" />

          {/* Badges overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-brand-600/80 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-brand-400/40">
              {exercise.category} • {exercise.equipment}
            </span>

            <span className="px-3 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Tempo: {exercise.tempo || '3-1-1'}
            </span>
          </div>
        </div>

        {/* Targeted Muscles Tags */}
        <div className="space-y-1.5 font-mono text-xs">
          <span className="text-gray-400 text-[11px] uppercase block">Target Muscle Biomechanics</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
              <Target className="w-3 h-3" /> Primary: {exercise.primaryMuscle}
            </span>
            {exercise.secondaryMuscles?.map((m) => (
              <span key={m} className="px-2.5 py-1 rounded-lg bg-dark-bg text-gray-300 border border-dark-border">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Step-by-Step Technique Instructions */}
        <div className="space-y-2 font-sans">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
            Step-by-Step Form Execution
          </span>

          <div className="space-y-2 text-xs">
            {exercise.instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-dark-bg border border-dark-border/80">
                <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-gray-300 leading-relaxed font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip Box */}
        {exercise.proTip && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 font-mono block mb-0.5 uppercase text-[10px]">
                Pro Hypertrophy Tip
              </span>
              <p className="text-gray-300 leading-snug">{exercise.proTip}</p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-glow transition-all cursor-pointer"
        >
          Got It, Start Movement
        </button>
      </div>
    </div>
  );
};
