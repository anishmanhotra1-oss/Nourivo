import React, { useEffect, useState } from 'react';
import { Droplets, Plus, Activity, Calculator, Timer, Sparkles, Volume2, CheckCircle2 } from 'lucide-react';
import { waterService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProgressRing } from '../components/common/ProgressRing';
import { AnimatedWaterBottle } from '../components/telemetry/AnimatedWaterBottle';
import { HydrationTargetCalculatorModal } from '../components/telemetry/HydrationTargetCalculatorModal';
import { Tooltip } from '../components/common/Tooltip';

// Web Audio API Synthesized Water Drop Sound
const playWaterDropSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    // Audio context policy fallback
  }
};

export const WaterPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [dailyWaterLogMl, setDailyWaterLogMl] = useState(0);
  const [hydrationTargetMl, setHydrationTargetMl] = useState(user?.waterGoal || 2500);
  const [hydrationProgressPercent, setHydrationProgressPercent] = useState(0);
  const [customWaterMl, setCustomWaterMl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Pacing Timer State
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [lastDoseTime, setLastDoseTime] = useState<Date>(new Date());
  const [nextPacingMins, setNextPacingMins] = useState(90);

  const fetchWaterTelemetry = async () => {
    try {
      const response = await waterService.getWaterLogs();
      setDailyWaterLogMl(response.totalMl);
      setHydrationTargetMl(response.targetMl || user?.waterGoal || 2500);
      setHydrationProgressPercent(response.percentage);
    } catch (error) {
      console.error('Failed to load hydration telemetry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterTelemetry();
  }, []);

  // Update next drink pacing countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const diffMins = Math.max(0, 90 - Math.floor((new Date().getTime() - lastDoseTime.getTime()) / 60000));
      setNextPacingMins(diffMins);
    }, 10000);
    return () => clearInterval(interval);
  }, [lastDoseTime]);

  const recordHydrationDose = async (doseAmountMl: number) => {
    if (doseAmountMl <= 0) return;
    try {
      playWaterDropSound();
      await waterService.logWater(doseAmountMl);
      setLastDoseTime(new Date());
      setNextPacingMins(90);
      fetchWaterTelemetry();
    } catch (error) {
      console.error('Failed to record hydration dose:', error);
    }
  };

  const handleCustomWaterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customWaterMl);
    if (!isNaN(parsed) && parsed > 0) {
      await recordHydrationDose(parsed);
      setCustomWaterMl('');
    }
  };

  const handleApplyCalculatedTarget = async (newTargetMl: number) => {
    try {
      await updateProfile({ waterGoal: newTargetMl });
      setHydrationTargetMl(newTargetMl);
      fetchWaterTelemetry();
    } catch (err) {
      console.error('Failed to apply new water target to profile:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-gray-500">Retrieving hydration telemetry...</span>
      </div>
    );
  }

  const remainingHydrationMl = Math.max(0, hydrationTargetMl - dailyWaterLogMl);

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-4 max-w-5xl mx-auto font-sans">
      {/* Hydration Target Calculator Modal */}
      <HydrationTargetCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        initialWeightKg={user?.weight || 70}
        onApplyTarget={handleApplyCalculatedTarget}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            <span>METABOLIC HYDRATION TELEMETRY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
            Daily Hydration Target & Liquid Engine
          </h2>
        </div>

        {/* Target Calculator Action Button */}
        <Tooltip content="Adjust daily water goal based on body weight & sweat rate" position="left">
          <button
            onClick={() => setIsCalculatorModalOpen(true)}
            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Calculator className="w-4 h-4 text-cyan-200" />
            <span>Calculate Target</span>
          </button>
        </Tooltip>
      </div>

      {/* Drink Pacing Timer Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            <Timer className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-white uppercase text-xs">Optimal Hydration Pacing</div>
            <div className="text-gray-400 text-[11px]">
              Next recommended drink dose in <strong className="text-cyan-300">{nextPacingMins} mins</strong> (90-min interval)
            </div>
          </div>
        </div>

        <Tooltip content="Instantly record +250 mL water intake" position="left">
          <button
            onClick={() => recordHydrationDose(250)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>💧 Drink Now (+250mL)</span>
          </button>
        </Tooltip>
      </div>

      {/* Main Hydration Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Animated Water Flask Container */}
        <div className="lg:col-span-5">
          <AnimatedWaterBottle
            currentMl={dailyWaterLogMl}
            targetMl={hydrationTargetMl}
            onQuickAddDose={recordHydrationDose}
          />
        </div>

        {/* Main Gauge & Dose Control Station */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 flex flex-col justify-between">
          {/* Main Hydration Ring Gauge Card */}
          <div className="telemetry-card rounded-2xl p-4 sm:p-6 border border-cyan-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Target Progress Pacing
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums truncate">
                {(dailyWaterLogMl / 1000).toFixed(2)} L
              </div>
              <div className="text-xs text-cyan-300 font-mono font-bold truncate">
                {hydrationProgressPercent >= 100
                  ? '✨ Daily Target Achieved!'
                  : `${remainingHydrationMl.toLocaleString()} mL remaining`}
              </div>
            </div>

            <Tooltip content={`Hydration Goal Progress: ${hydrationProgressPercent}%`} position="left">
              <div className="shrink-0 cursor-pointer">
                <ProgressRing progress={hydrationProgressPercent} radius={52} stroke={8} color="#06B6D4">
                  <span className="text-xs sm:text-sm font-extrabold text-white font-mono">{hydrationProgressPercent}%</span>
                </ProgressRing>
              </div>
            </Tooltip>
          </div>

          {/* Quick Dose Control Station */}
          <div className="telemetry-card rounded-2xl p-4 sm:p-6 space-y-4">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide">
              Record Hydration Dose
            </h3>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 font-mono">
              {[
                { amount: 250, label: '💧 +250 mL Glass' },
                { amount: 500, label: '💧 +500 mL Bottle' },
                { amount: 750, label: '💧 +750 mL Flask' },
                { amount: 1000, label: '💧 +1000 mL Pitcher' },
              ].map((dose) => (
                <Tooltip key={dose.amount} content={`Log ${dose.amount} mL water intake`} position="top" className="w-full">
                  <button
                    onClick={() => recordHydrationDose(dose.amount)}
                    className="w-full p-3 sm:p-3.5 rounded-xl bg-dark-bg hover:bg-cyan-600/20 border border-dark-border/80 hover:border-cyan-500/50 text-cyan-400 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-glow"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{dose.label}</span>
                  </button>
                </Tooltip>
              ))}
            </div>

            {/* Custom Amount Form */}
            <form onSubmit={handleCustomWaterSubmit} className="space-y-2 pt-2 border-t border-dark-border/80 font-mono">
              <label className="text-[10px] uppercase text-gray-400 font-bold block">Custom Water Dose (mL)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={customWaterMl}
                  onChange={(e) => setCustomWaterMl(e.target.value)}
                  placeholder="Enter custom mL (e.g. 330)..."
                  className="flex-1 px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Dose</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

