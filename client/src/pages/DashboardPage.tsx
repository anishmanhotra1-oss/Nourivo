import React, { useEffect, useState } from 'react';
import {
  Dumbbell,
  Flame,
  MapPin,
  ScanBarcode,
  Droplets,
  Moon,
  Zap,
  ArrowUpRight,
  Activity,
  Smile,
  Sparkles,
  Heart,
  Plus,
  Compass,
  CheckCircle2,
  Brain,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  Footprints,
  ChevronRight,
  Award,
} from 'lucide-react';
import { dashboardService, waterService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProgressRing } from '../components/common/ProgressRing';
import { MasterTargetCommandCenter } from '../components/telemetry/MasterTargetCommandCenter';
import { MasterTargetAdjusterModal } from '../components/telemetry/MasterTargetAdjusterModal';
import { BoxBreathingModal } from '../components/telemetry/BoxBreathingModal';
import { Tooltip } from '../components/common/Tooltip';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { user, updateProfile } = useAuth();
  const [dashboardTelemetry, setDashboardTelemetry] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTargetAdjusterOpen, setIsTargetAdjusterOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);

  // Quick Mood & Energy Check-in state
  const [selectedMood, setSelectedMood] = useState<'Energetic' | 'Focused' | 'Calm' | 'Rested'>('Energetic');
  const [moodSavedNotice, setMoodSavedNotice] = useState(false);

  // Quick Water Dose state
  const [quickWaterLogged, setQuickWaterLogged] = useState(false);

  const fetchDashboardTelemetry = async () => {
    try {
      const data = await dashboardService.getSummary();
      setDashboardTelemetry(data);
    } catch (error) {
      console.error('Failed to load dashboard telemetry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardTelemetry();
  }, []);

  const handleApplyMasterTargets = async (newTargets: {
    stepGoal: number;
    waterGoal: number;
    calorieGoal: number;
    sleepGoal: number;
  }) => {
    try {
      await updateProfile(newTargets);
      fetchDashboardTelemetry();
    } catch (err) {
      console.error('Failed to sync master targets in profile:', err);
    }
  };

  const handleQuickAddWaterDose = async () => {
    try {
      await waterService.logWater(250);
      setQuickWaterLogged(true);
      if (dashboardTelemetry) {
        setDashboardTelemetry({
          ...dashboardTelemetry,
          today: {
            ...dashboardTelemetry.today,
            waterMl: (dashboardTelemetry.today.waterMl || 0) + 250,
            waterProgress: Math.min(
              100,
              Math.round(
                (((dashboardTelemetry.today.waterMl || 0) + 250) /
                  (dashboardTelemetry.user?.waterGoal || 2500)) *
                  100
              )
            ),
          },
        });
      }
      setTimeout(() => setQuickWaterLogged(false), 2500);
    } catch (err) {
      console.error('Failed to record quick water dose:', err);
    }
  };

  const handleMoodSelect = (mood: 'Energetic' | 'Focused' | 'Calm' | 'Rested') => {
    setSelectedMood(mood);
    setMoodSavedNotice(true);
    setTimeout(() => setMoodSavedNotice(false), 2500);
  };

  // Determine Greeting & Icon based on time of day
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  let TimeIcon = Sunrise;
  let timeBadgeColor = 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300';

  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good Afternoon';
    TimeIcon = Sun;
    timeBadgeColor = 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300';
  } else if (currentHour >= 17) {
    timeGreeting = 'Good Evening';
    TimeIcon = Sunset;
    timeBadgeColor = 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300';
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 font-mono">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400 animate-pulse">Initializing Cybernetic Vitality Telemetry...</span>
      </div>
    );
  }

  const today = dashboardTelemetry?.today || {
    steps: 7420,
    stepProgress: 74,
    caloriesIn: 1850,
    proteinIn: 135,
    carbsIn: 180,
    fatIn: 55,
    caloriesBurned: 620,
    waterMl: 1800,
    waterProgress: 72,
    sleepMinutes: 450,
    sleepProgress: 93,
    workoutsCount: 1,
  };

  const userGoals = dashboardTelemetry?.user || {
    name: user?.name || 'Athlete',
    stepGoal: user?.stepGoal || 10000,
    waterGoal: user?.waterGoal || 2500,
    calorieGoal: user?.calorieGoal || 2200,
    sleepGoal: user?.sleepGoal || 480,
  };

  const stepProgress = Math.min(100, Math.round(((today?.steps || 0) / (userGoals?.stepGoal || 10000)) * 100));
  const waterProgress = Math.min(100, Math.round(((today?.waterMl || 0) / (userGoals?.waterGoal || 2500)) * 100));
  const sleepHours = ((today?.sleepMinutes || 0) / 60).toFixed(1);

  return (
    <div className="space-y-6 pb-20 lg:pb-6 max-w-7xl mx-auto font-sans">
      {/* Box Breathing Stress Reduction Modal */}
      <BoxBreathingModal
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
      />

      {/* Target Adjuster Modal */}
      <MasterTargetAdjusterModal
        isOpen={isTargetAdjusterOpen}
        onClose={() => setIsTargetAdjusterOpen(false)}
        initialTargets={userGoals}
        onApplyTargets={handleApplyMasterTargets}
      />

      {/* CREATIVE ANIMATED CHAMPION COMMAND HERO CANOPY */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-dark-surface via-brand-950/40 to-dark-bg border border-brand-500/50 shadow-[0_0_50px_rgba(37,99,235,0.25)] relative overflow-hidden font-sans group">
        {/* Layered Animated Ambient Background Light Orbs */}
        <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Status Pills Bar */}
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              <div className={`px-3.5 py-1 rounded-full bg-gradient-to-r ${timeBadgeColor} border font-bold flex items-center gap-2 shadow-glow animate-fade-in`}>
                <TimeIcon className="w-4 h-4" />
                <span>{timeGreeting}, {userGoals.name}!</span>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold flex items-center gap-2 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>BIOMETRIC CORE ONLINE</span>
              </div>
            </div>

            {/* Motivational Champion Headline */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Ready Champion, <span className="bg-gradient-to-r from-cyan-300 via-brand-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse">{userGoals.name}</span>! Let's Conquer Your Targets Today 🚀
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
              Your cellular metabolic engine is primed for peak overload performance.
            </p>

          </div>

          {/* Quick Command Launch Glass Dock - Single Horizontal Line */}
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 overflow-x-auto whitespace-nowrap font-mono shrink-0 py-1 max-w-full no-scrollbar">
            <button
              onClick={() => setIsBreathingModalOpen(true)}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-purple-400/40 shrink-0"
            >
              <Wind className="w-4 h-4 text-purple-200 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Mind Calm</span>
            </button>

            <button
              onClick={handleQuickAddWaterDose}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-cyan-600/25 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 font-bold text-xs uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>{quickWaterLogged ? '✨ +250mL Logged!' : '+250mL Water'}</span>
            </button>

            <button
              onClick={() => setIsTargetAdjusterOpen(true)}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-dark-bg/90 hover:bg-brand-600/20 text-gray-200 hover:text-white border border-dark-border hover:border-brand-500/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Adjust Goals</span>
            </button>
          </div>
        </div>
      </div>

      {/* MASTER TARGET COMMAND CENTER DIAL */}
      <MasterTargetCommandCenter
        user={userGoals}
        today={today}
        onOpenAdjuster={() => setIsTargetAdjusterOpen(true)}
      />

      {/* DISTINCTLY STYLED BIONIC TELEMETRY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 2. NUTRITION & MACRO FUEL - Fresh Emerald Glassmorphism Theme */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-950/70 via-dark-surface to-dark-bg border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-600/30 text-emerald-400 border border-emerald-400/40 shadow-glow">
                <ScanBarcode className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">Nutritional Fuel</span>
                <h3 className="text-base font-bold text-white font-display">Macro Matrix</h3>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('nutrition')}
              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all cursor-pointer shadow-glow"
              title="Open Nutrition Barcode Scanner"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 font-mono relative z-10">
            <div className="flex justify-between items-baseline p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-2xl font-extrabold text-emerald-300 tabular-nums">🍏 {today?.caloriesIn || 0} kcal</span>
              <span className="text-xs text-emerald-400">/ {userGoals?.calorieGoal || 2200} goal</span>
            </div>

            {/* Custom Styled Macro Pill Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-dark-bg border border-red-500/30 space-y-0.5">
                <span className="text-red-400 font-extrabold block text-xs">🥩 {today?.proteinIn || 0}g</span>
                <span className="text-gray-400">Protein</span>
              </div>
              <div className="p-2 rounded-xl bg-dark-bg border border-amber-500/30 space-y-0.5">
                <span className="text-amber-400 font-extrabold block text-xs">🍞 {today?.carbsIn || 0}g</span>
                <span className="text-gray-400">Carbs</span>
              </div>
              <div className="p-2 rounded-xl bg-dark-bg border border-yellow-500/30 space-y-0.5">
                <span className="text-yellow-400 font-extrabold block text-xs">🥑 {today?.fatIn || 0}g</span>
                <span className="text-gray-400">Fat</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-dark-bg border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300 relative z-10">
            <span>Calorie Budget Remaining:</span>
            <span className="font-bold text-white tabular-nums">{Math.max(0, (userGoals?.calorieGoal || 2200) - (today?.caloriesIn || 0))} kcal</span>
          </div>
        </div>

        {/* 3. HYDRATION CELL - Deep Hydro Ocean Blue Theme */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-cyan-950/70 via-dark-surface to-dark-bg border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-600/30 text-cyan-400 border border-cyan-400/40 shadow-glow">
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider">Fluid Balance</span>
                <h3 className="text-base font-bold text-white font-display">Daily Hydration Cell</h3>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('water')}
              className="p-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 transition-all cursor-pointer shadow-glow"
              title="Open Hydration Tracker"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-2 relative z-10">
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                💧 {((today?.waterMl || 0) / 1000).toFixed(2)} L
              </div>
              <div className="text-xs text-cyan-300 font-mono">
                Target: <strong className="text-white">{((userGoals?.waterGoal || 2500) / 1000).toFixed(1)} L</strong>
              </div>
              <div className="text-[11px] text-cyan-400 font-mono font-bold">
                ✨ {waterProgress >= 100 ? 'Target Achieved!' : `${Math.max(0, (userGoals?.waterGoal || 2500) - (today?.waterMl || 0))} mL remaining`}
              </div>
            </div>

            <div className="shrink-0 cursor-pointer">
              <ProgressRing progress={waterProgress} radius={48} stroke={8} color="#06B6D4">
                <span className="text-xs font-bold text-white font-mono">{waterProgress}%</span>
              </ProgressRing>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono relative z-10">
            <button
              onClick={handleQuickAddWaterDose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-600/25 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer text-center shadow-glow active:scale-95"
            >
              💧 +250 mL
            </button>
            <button
              onClick={async () => {
                await waterService.logWater(500);
                fetchDashboardTelemetry();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-600/25 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer text-center shadow-glow active:scale-95"
            >
              💧 +500 mL
            </button>
          </div>
        </div>

        {/* 4. CIRCADIAN SLEEP & RECOVERY - Midnight Cosmic Violet Theme */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-purple-950/70 via-dark-surface to-dark-bg border border-purple-500/40 hover:border-purple-400 shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-600/30 text-purple-400 border border-purple-400/40 shadow-glow">
                <Moon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-purple-400 tracking-wider">Circadian Recovery</span>
                <h3 className="text-base font-bold text-white font-display">Sleep & Rest Dial</h3>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('sleep')}
              className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all cursor-pointer shadow-glow"
              title="Open Sleep Telemetry"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 font-mono relative z-10">
            <div className="flex justify-between items-baseline p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
              <span className="text-3xl font-extrabold text-purple-300 tabular-nums">🌙 {sleepHours} h</span>
              <span className="text-xs text-purple-300 font-bold">Deep Recovery</span>
            </div>
            <div className="text-xs text-gray-300">
              Target: <strong className="text-purple-300">{((userGoals?.sleepGoal || 480) / 60).toFixed(1)} h</strong> (8h cycle)
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-dark-bg border border-purple-500/30 flex items-center justify-between text-xs font-mono relative z-10">
            <span className="text-gray-400">Target Bedtime:</span>
            <span className="text-purple-300 font-bold">10:30 PM (Optimal)</span>
          </div>
        </div>

        {/* 5. STRENGTH & GYM VAULT - Neon Crimson Gym Theme */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-950/70 via-dark-surface to-dark-bg border border-rose-500/40 hover:border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)] transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-400/40 shadow-glow">
                <Dumbbell className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-rose-400 tracking-wider">Hypertrophy Vault</span>
                <h3 className="text-base font-bold text-white font-display">Strength Engine</h3>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('gym')}
              className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-glow"
              title="Open Gym Routines"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 font-mono relative z-10">
            <div className="text-xl font-bold text-white">
              🏋️ Push / Pull / Legs Split
            </div>
            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-bold">
              Total Overload: 14.5k lbs Logged
            </div>
          </div>

          <button
            onClick={() => setActiveTab('gym')}
            className="w-full py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10 active:scale-95"
          >
            <Dumbbell className="w-4 h-4 text-white" />
            <span>Open Gym Builder</span>
          </button>
        </div>

        {/* 6. GPS RUN HUD - High-Visibility Solar Amber Theme */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-950/70 via-dark-surface to-dark-bg border border-amber-500/40 hover:border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-600/30 text-amber-400 border border-amber-400/40 shadow-glow">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">GPS Continuous Watch</span>
                <h3 className="text-base font-bold text-white font-display">Live Run HUD</h3>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('workout')}
              className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 transition-all cursor-pointer shadow-glow"
              title="Open GPS Tracker"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 font-mono relative z-10">
            <div className="flex justify-between items-baseline p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/30">
              <span className="text-3xl font-extrabold text-amber-300 tabular-nums">📍 5.2 km</span>
              <span className="text-xs text-amber-400 font-bold">⚡ 5:24 min/km</span>
            </div>
            <div className="text-xs text-gray-300">
              Target Goal: <strong className="text-amber-300">5.0 km GPS Target Goal</strong>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('workout')}
            className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10 active:scale-95"
          >
            <Compass className="w-4 h-4 text-white" />
            <span>Launch Strava Run HUD</span>
          </button>
        </div>
      </div>

      {/* AI BIO-COPILOT INSIGHTS & MOOD SELECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* AI Bio-CoPilot Insights Card - Cybernetic Holographic Theme */}
        <div className="lg:col-span-7 rounded-3xl p-6 bg-gradient-to-br from-indigo-950/70 via-dark-surface to-dark-bg border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 space-y-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between font-mono relative z-10">
            <div className="flex items-center gap-2.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <div className="p-2 rounded-xl bg-cyan-600/25 border border-cyan-400/40">
                <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <span>Cybernetic AI Bio-CoPilot Insights</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
              REAL-TIME ADAPTIVE
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-dark-bg/80 border border-cyan-500/30 space-y-2 relative z-10">
            <div className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Optimal Glycogen & Hypertrophy Window
            </div>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Your recovery score is at <strong className="text-cyan-300">94%</strong> with 1,800mL hydration logged. Today is an ideal day for a heavy lower-body strength session or a 5km threshold run.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-1 relative z-10">
            <span>Next AI Sync: <strong className="text-cyan-300">In 45 mins</strong></span>
            <button
              onClick={() => setIsBreathingModalOpen(true)}
              className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>Trigger Mind Calm Reset</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Quick Mood Check-in Station - Glowing Neon Pink/Purple Theme */}
        <div className="lg:col-span-5 rounded-3xl p-6 bg-gradient-to-br from-pink-950/70 via-dark-surface to-dark-bg border border-pink-500/40 hover:border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.2)] transition-all duration-300 space-y-4 font-mono flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-pink-300 uppercase tracking-wide flex items-center gap-2">
              <Smile className="w-4 h-4 text-pink-400" /> Daily Energy & Mood Check-in
            </span>
            {moodSavedNotice && (
              <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
                ✨ Mood Synced!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 relative z-10">
            {(['Energetic', 'Focused', 'Calm', 'Rested'] as const).map((mood) => {
              const symbols: Record<string, string> = {
                Energetic: '⚡',
                Focused: '🧠',
                Calm: '🌿',
                Rested: '🌙',
              };
              const isSelected = selectedMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className={`w-full p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 shadow-glow font-bold scale-[1.02]'
                      : 'bg-dark-bg/90 text-gray-300 border-pink-500/20 hover:border-pink-400/50 hover:bg-dark-hover'
                  }`}
                >
                  <span>{symbols[mood]}</span>
                  <span className="text-xs font-sans font-bold">{mood}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
