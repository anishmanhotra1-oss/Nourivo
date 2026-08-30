import React, { useEffect, useState } from 'react';
import { Star, Plus, Activity, Moon, Calculator } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { sleepService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AnimatedSleepMoonDial } from '../components/telemetry/AnimatedSleepMoonDial';
import { CircadianBedtimeCalculatorModal } from '../components/telemetry/CircadianBedtimeCalculatorModal';
import { Tooltip as HoverTooltip } from '../components/common/Tooltip';

export const SleepPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [sleepRecoveryLogs, setSleepRecoveryLogs] = useState<any[]>([]);
  const [sleepDurationHours, setSleepDurationHours] = useState('7.5');
  const [recoveryRatingScore, setRecoveryRatingScore] = useState(4);
  const [targetSleepMinutes, setTargetSleepMinutes] = useState(user?.sleepGoal || 480);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

  const fetchSleepTelemetry = async () => {
    try {
      const response = await sleepService.getSleepLogs();
      setSleepRecoveryLogs(response.sleepLogs || []);
      setTargetSleepMinutes(user?.sleepGoal || 480);
    } catch (error) {
      console.error('Failed to load sleep telemetry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepTelemetry();
  }, []);

  const handleRecordSleepSession = async (event: React.FormEvent) => {
    event.preventDefault();
    const durationMinutes = Math.round(parseFloat(sleepDurationHours) * 60);
    if (isNaN(durationMinutes) || durationMinutes <= 0) return;

    try {
      await sleepService.logSleep(durationMinutes, recoveryRatingScore);
      fetchSleepTelemetry();
    } catch (error) {
      console.error('Failed to record sleep session telemetry:', error);
    }
  };

  const handleApplySleepTargetMinutes = async (newTargetMinutes: number) => {
    try {
      await updateProfile({ sleepGoal: newTargetMinutes });
      setTargetSleepMinutes(newTargetMinutes);
      fetchSleepTelemetry();
    } catch (err) {
      console.error('Failed to update sleep target profile:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-gray-500">Retrieving sleep & recovery telemetry...</span>
      </div>
    );
  }

  // Real user sleep chart data strictly from user DB records
  const chartData = sleepRecoveryLogs.map((log) => ({
    date: log.date,
    hours: Math.round((log.durationMinutes / 60) * 10) / 10,
    quality: log.quality,
  }));

  const latestLoggedMinutes =
    sleepRecoveryLogs.length > 0
      ? sleepRecoveryLogs[sleepRecoveryLogs.length - 1].durationMinutes
      : Math.round(parseFloat(sleepDurationHours) * 60) || 450;

  const recoveryLabels = ['Poor', 'Fair', 'Optimal', 'Deep', 'Peak Recovery'];

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-4 max-w-5xl mx-auto font-sans">
      {/* Circadian Bedtime Target Calculator Modal */}
      <CircadianBedtimeCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        onApplyTargetMinutes={handleApplySleepTargetMinutes}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>CIRCADIAN SLEEP & RECOVERY ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
            Sleep Duration & Circadian Target
          </h2>
        </div>

        {/* Target Calculator Action Button */}
        <HoverTooltip content="Calculate optimal bedtime & sleep cycles based on wake time" position="left">
          <button
            onClick={() => setIsCalculatorModalOpen(true)}
            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Calculator className="w-4 h-4 text-purple-200" />
            <span>Calculate Bedtime</span>
          </button>
        </HoverTooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Animated Lunar Moon Progress Dial Container */}
        <div className="lg:col-span-5">
          <AnimatedSleepMoonDial
            loggedMinutes={latestLoggedMinutes}
            targetMinutes={targetSleepMinutes}
            onOpenCalculator={() => setIsCalculatorModalOpen(true)}
          />
        </div>

        {/* Right Section: Logger & Duration Pacing Graph */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 flex flex-col justify-between">
          {/* Logger Station Card */}
          <div className="telemetry-card rounded-2xl p-4 sm:p-6 space-y-4 border border-purple-500/30">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide">
              Record Sleep Session
            </h3>

            <form onSubmit={handleRecordSleepSession} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase">Sleep Duration (Hours)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={sleepDurationHours}
                  onChange={(e) => setSleepDurationHours(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-purple-500 font-bold"
                  placeholder="7.5"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 uppercase">
                  <span>Recovery Quality Rating</span>
                  <span className="text-purple-300 font-bold">{recoveryLabels[recoveryRatingScore - 1]}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  {[1, 2, 3, 4, 5].map((starRating) => (
                    <HoverTooltip key={starRating} content={`Rating: ${recoveryLabels[starRating - 1]}`} position="top" className="flex-1">
                      <button
                        type="button"
                        onClick={() => setRecoveryRatingScore(starRating)}
                        className={`w-full py-2.5 px-1 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                          starRating <= recoveryRatingScore
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-glow'
                            : 'bg-dark-bg border-dark-border/80 text-gray-600'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            starRating <= recoveryRatingScore ? 'fill-purple-400 text-purple-400' : 'text-gray-600'
                          }`}
                        />
                      </button>
                    </HoverTooltip>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save Sleep Record</span>
              </button>
            </form>
          </div>

          {/* Duration Trend Chart Card */}
          <div className="telemetry-card rounded-2xl p-4 sm:p-6 space-y-4 border border-dark-border/80 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide">
              Sleep Duration Pacing & History
            </h3>

            {chartData.length > 0 ? (
              <div className="w-full h-[190px] relative overflow-hidden">
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#6B7280" tick={{ fontSize: 9, fontFamily: 'monospace' }} domain={[0, 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#121215', borderColor: '#22242D', borderRadius: '12px', fontFamily: 'monospace' }} />
                    <Area type="monotone" dataKey="hours" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#sleepGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[190px] border border-dashed border-dark-border/80 rounded-xl p-6 text-center space-y-2">
                <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-display">No Sleep Telemetry Logged Yet</div>
                  <div className="text-xs text-gray-400 font-sans mt-1">Record your first sleep session to generate your real recovery graph!</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

