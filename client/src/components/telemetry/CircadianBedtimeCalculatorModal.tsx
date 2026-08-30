import React, { useState } from 'react';
import { X, Moon, Clock, Sparkles, CheckCircle2, Bed, Sunrise } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CircadianBedtimeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTargetMinutes: (newTargetMinutes: number) => Promise<void>;
}

export const CircadianBedtimeCalculatorModal: React.FC<CircadianBedtimeCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyTargetMinutes,
}) => {
  const { user } = useAuth();
  const [calculationMode, setCalculationMode] = useState<'wake' | 'bed'>('wake');
  const [targetTimeStr, setTargetTimeStr] = useState<string>('07:00');
  const [selectedCycleMinutes, setSelectedCycleMinutes] = useState<number>(user?.sleepGoal || 450); // Default 7.5 hrs (450 mins)
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  // Convert "HH:MM" string to minutes from midnight
  const parseTimeStrToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Convert minutes from midnight to 12-hour formatted time string (e.g. "11:30 PM")
  const formatMinutesTo12Hour = (totalMins: number) => {
    let normalized = ((totalMins % 1440) + 1440) % 1440;
    let hours = Math.floor(normalized / 60);
    const mins = Math.floor(normalized % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const currentInputMins = parseTimeStrToMinutes(targetTimeStr);

  // 90-Minute REM Cycle Candidates
  const cycleOptions = [
    { cycles: 4, minutes: 360, label: '6 Hours (4 REM Cycles)', quality: 'Fair Rest', color: 'border-blue-500/40 text-blue-300' },
    { cycles: 5, minutes: 450, label: '7.5 Hours (5 REM Cycles)', quality: 'Optimal Target', color: 'border-purple-500/50 text-purple-300' },
    { cycles: 6, minutes: 540, label: '9 Hours (6 REM Cycles)', quality: 'Deep Athletic Rest', color: 'border-emerald-500/50 text-emerald-300' },
  ];

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApplyTargetMinutes(selectedCycleMinutes);
      onClose();
    } catch (err) {
      console.error('Failed to apply sleep target:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-4 sm:pt-8 p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="telemetry-card max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6 border border-purple-500/40 space-y-5 shadow-2xl relative font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Circadian Bedtime & Target Engine
              </h3>
              <p className="text-xs text-gray-400 font-mono">90-Minute Sleep Cycle Architecture</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-bg hover:bg-dark-surface text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculation Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-dark-bg border border-dark-border/80 text-xs font-mono">
          <button
            type="button"
            onClick={() => setCalculationMode('wake')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              calculationMode === 'wake'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sunrise className="w-4 h-4" />
            <span>Target Wake Time</span>
          </button>
          <button
            type="button"
            onClick={() => setCalculationMode('bed')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              calculationMode === 'bed'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Planned Bedtime</span>
          </button>
        </div>

        {/* Time Selector */}
        <div className="p-4 rounded-xl bg-dark-bg border border-dark-border/80 space-y-2 font-mono">
          <label className="text-xs text-gray-400 uppercase block">
            {calculationMode === 'wake' ? 'I Want To Wake Up At:' : 'I Plan To Go To Bed At:'}
          </label>
          <input
            type="time"
            value={targetTimeStr}
            onChange={(e) => setTargetTimeStr(e.target.value)}
            className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-base text-white font-bold focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* REM Cycle Target Options */}
        <div className="space-y-2 font-mono">
          <label className="text-xs text-gray-400 uppercase block">Calculated Bedtime / Wake Options</label>
          <div className="space-y-2">
            {cycleOptions.map((option) => {
              // Calculate resulting time subtracting or adding 15 mins fall-asleep latency + cycle length
              const sleepDurationWithLatencyMins = option.minutes + 15;
              const resultTimeMins =
                calculationMode === 'wake'
                  ? currentInputMins - sleepDurationWithLatencyMins
                  : currentInputMins + sleepDurationWithLatencyMins;

              const formattedResultTime = formatMinutesTo12Hour(resultTimeMins);
              const isSelected = selectedCycleMinutes === option.minutes;

              return (
                <button
                  key={option.cycles}
                  type="button"
                  onClick={() => setSelectedCycleMinutes(option.minutes)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-glow'
                      : 'bg-dark-bg border-dark-border/80 text-gray-300 hover:bg-dark-surface'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold font-sans flex items-center gap-2">
                      <span>{option.label}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md bg-dark-surface ${option.color}`}>
                        {option.quality}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">
                      {calculationMode === 'wake' ? `Go to bed at: ` : `Wake up at: `}
                      <strong className="text-purple-300 font-bold">{formattedResultTime}</strong>
                      <span className="text-gray-500 font-normal"> (incl. 15m fall-asleep time)</span>
                    </div>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply Action Button */}
        <button
          onClick={handleApply}
          disabled={isApplying}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{isApplying ? 'Setting Sleep Target...' : `Set ${(selectedCycleMinutes / 60).toFixed(1)}h as Active Target`}</span>
        </button>
      </div>
    </div>
  );
};
