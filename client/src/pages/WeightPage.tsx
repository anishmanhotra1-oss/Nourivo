import React, { useEffect, useState } from 'react';
import { Plus, Activity, Scale } from 'lucide-react';
import { weightService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BmiCalculatorSection } from '../components/telemetry/BmiCalculatorSection';
import { Tooltip } from '../components/common/Tooltip';

export const WeightPage: React.FC = () => {
  const { updateProfile } = useAuth();
  const [bodyWeightHistory, setBodyWeightHistory] = useState<any[]>([]);
  const [weightInputValue, setWeightInputValue] = useState('70');
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeightTelemetry = async () => {
    try {
      const records = await weightService.getWeightLogs();
      setBodyWeightHistory(records || []);
      if (records && records.length > 0) {
        setWeightInputValue(records[records.length - 1].weight.toString());
      }
    } catch (error) {
      console.error('Failed to load body weight logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightTelemetry();
  }, []);

  const handleWeightLogSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedWeight = parseFloat(weightInputValue);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;

    try {
      await weightService.logWeight(parsedWeight);
      await updateProfile({ weight: parsedWeight });
      fetchWeightTelemetry();
    } catch (error) {
      console.error('Failed to log weight entry:', error);
    }
  };

  const handleTargetWeightUpdate = async (targetWeightKg: number) => {
    try {
      setWeightInputValue(targetWeightKg.toString());
      await updateProfile({ weight: targetWeightKg });
      await weightService.logWeight(targetWeightKg);
      fetchWeightTelemetry();
    } catch (err) {
      console.error('Failed to sync target weight:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-gray-500">Retrieving body mass telemetry...</span>
      </div>
    );
  }

  const latestWeight = bodyWeightHistory.length > 0 ? bodyWeightHistory[bodyWeightHistory.length - 1].weight : parseFloat(weightInputValue) || 70;

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-4 max-w-6xl mx-auto font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-brand-500" />
            <span>WHO BODY MASS INDEX & TELEMETRY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            BMI Target Goal Simulator & Mass Analytics
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Quick Weight Logger Station */}
        <div className="lg:col-span-4 telemetry-card rounded-2xl p-4 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide">
              Record Body Weight
            </h3>

            <Tooltip content="Latest recorded body weight mass in database" position="top" className="w-full">
              <div className="p-4 rounded-xl bg-dark-bg border border-dark-border/80 text-center font-mono space-y-1 w-full cursor-pointer">
                <div className="text-[10px] text-gray-500 uppercase">Latest Recorded Mass</div>
                <div className="text-3xl font-extrabold text-emerald-400 tabular-nums">
                  ⚖️ {latestWeight ? `${latestWeight} kg` : '70.0 kg'}
                </div>
                <div className="text-[10px] text-gray-400 font-sans">
                  {bodyWeightHistory.length} entry log records in database
                </div>
              </div>
            </Tooltip>

            <form onSubmit={handleWeightLogSubmission} className="space-y-3 font-mono">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase">New Mass Entry (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightInputValue}
                  onChange={(e) => setWeightInputValue(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                  placeholder="70.0"
                />
              </div>

              <Tooltip content="Save body weight log & update profile target" position="top" className="w-full">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Weight Log</span>
                </button>
              </Tooltip>
            </form>
          </div>
        </div>

        {/* 100% Accurately Animated BMI Calculator Section */}
        <div className="lg:col-span-8">
          <BmiCalculatorSection
            initialWeightKg={latestWeight}
            onWeightUpdate={handleTargetWeightUpdate}
          />
        </div>
      </div>
    </div>
  );
};


