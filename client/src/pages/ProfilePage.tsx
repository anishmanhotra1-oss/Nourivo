import React, { useState } from 'react';
import { User as UserIcon, Save, Settings, ShieldCheck, Dumbbell, Droplets, Flame, Moon, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatedProfileTargetRadar } from '../components/telemetry/AnimatedProfileTargetRadar';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [bodyWeightKg, setBodyWeightKg] = useState(user?.weight?.toString() || '70');
  const [bodyHeightCm, setBodyHeightCm] = useState(user?.height?.toString() || '175');
  const [userAgeYears, setUserAgeYears] = useState(user?.age?.toString() || '25');
  const [userGender, setUserGender] = useState(user?.gender || 'other');

  const [targetWaterGoalMl, setTargetWaterGoalMl] = useState(user?.waterGoal?.toString() || '2500');
  const [targetCalorieGoalKcal, setTargetCalorieGoalKcal] = useState(user?.calorieGoal?.toString() || '2200');
  const [targetSleepGoalMinutes, setTargetSleepGoalMinutes] = useState(user?.sleepGoal?.toString() || '480');

  const [isUpdateSuccess, setIsUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPreset = (preset: { waterGoal: number; calorieGoal: number; sleepGoal: number }) => {
    setTargetWaterGoalMl(preset.waterGoal.toString());
    setTargetCalorieGoalKcal(preset.calorieGoal.toString());
    setTargetSleepGoalMinutes(preset.sleepGoal.toString());
  };

  const handleProfileSettingsSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUpdateSuccess(false);
    setIsSubmitting(true);

    try {
      await updateProfile({
        name: profileName,
        weight: parseFloat(bodyWeightKg) || 70,
        height: parseFloat(bodyHeightCm) || 175,
        age: parseInt(userAgeYears) || 25,
        gender: userGender,
        waterGoal: parseInt(targetWaterGoalMl) || 2500,
        calorieGoal: parseInt(targetCalorieGoalKcal) || 2200,
        sleepGoal: parseInt(targetSleepGoalMinutes) || 480,
      });
      setIsUpdateSuccess(true);
      setTimeout(() => setIsUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile telemetry settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-4 max-w-4xl mx-auto font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-brand-500" />
            <span>ATHLETE SETTINGS & TARGETS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Profile & Telemetry Targets
          </h2>
        </div>
      </div>

      {isUpdateSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold text-center flex items-center justify-center gap-2 animate-fade-in shadow-glow">
          <ShieldCheck className="w-4 h-4" />
          <span>Profile telemetry & targets saved successfully.</span>
        </div>
      )}

      {/* Interactive Animated Target Telemetry Radar Card */}
      <AnimatedProfileTargetRadar
        waterGoal={parseInt(targetWaterGoalMl) || 2500}
        calorieGoal={parseInt(targetCalorieGoalKcal) || 2200}
        sleepGoal={parseInt(targetSleepGoalMinutes) || 480}
        onSelectPreset={handleSelectPreset}
      />

      <form onSubmit={handleProfileSettingsSubmission} className="space-y-4 sm:space-y-6">
        {/* Personal Details Panel */}
        <div className="telemetry-card rounded-2xl p-4 sm:p-6 space-y-4">
          <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-400" />
            <span>Personal Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase">Athlete Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-sm font-sans text-white focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase">Email Account (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-dark-bg/50 border border-dark-border/80 rounded-xl text-sm font-mono text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase">Mass Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={bodyWeightKg}
                onChange={(e) => setBodyWeightKg(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase">Height (cm)</label>
              <input
                type="number"
                required
                value={bodyHeightCm}
                onChange={(e) => setBodyHeightCm(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Daily Telemetry Targets Panel */}
        <div className="telemetry-card rounded-2xl p-4 sm:p-6 space-y-4">
          <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide">
            Daily Target Pacing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 uppercase flex items-center gap-1.5 font-bold">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Water Goal (mL)</span>
              </label>
              <input
                type="number"
                required
                value={targetWaterGoalMl}
                onChange={(e) => setTargetWaterGoalMl(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 uppercase flex items-center gap-1.5 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Calorie Goal (kcal)</span>
              </label>
              <input
                type="number"
                required
                value={targetCalorieGoalKcal}
                onChange={(e) => setTargetCalorieGoalKcal(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 uppercase flex items-center gap-1.5 font-bold">
                <Moon className="w-3.5 h-3.5 text-purple-400" />
                <span>Sleep Target (Minutes)</span>
              </label>
              <input
                type="number"
                required
                value={targetSleepGoalMinutes}
                onChange={(e) => setTargetSleepGoalMinutes(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving Telemetry Settings...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};
