import React, { useEffect, useState } from 'react';
import { Award, Lock, CheckCircle2, Sparkles, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { achievementService } from '../services/api';

export const AchievementsPage: React.FC = () => {
  const [milestoneBadgesList, setMilestoneBadgesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMilestoneBadges = async () => {
    try {
      const response = await achievementService.getAchievements();
      setMilestoneBadgesList(response);
      if (response.some((badge: any) => badge.unlocked)) {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.6 },
        });
      }
    } catch (error) {
      console.error('Failed to load milestone achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestoneBadges();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-gray-500">Retrieving milestone achievements...</span>
      </div>
    );
  }

  const unlockedMilestoneCount = milestoneBadgesList.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6 pb-16 lg:pb-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>PERFORMANCE MILESTONES</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Badges & Milestones
          </h2>
        </div>

        <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{unlockedMilestoneCount} / {milestoneBadgesList.length} Badges Unlocked</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestoneBadgesList.map((badge) => (
          <div
            key={badge.code}
            className={`p-6 rounded-2xl border transition-all ${
              badge.unlocked
                ? 'telemetry-card border-amber-500/40 shadow-glow'
                : 'bg-dark-bg/60 border-dark-border/80 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{badge.icon}</div>
              {badge.unlocked ? (
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>UNLOCKED</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-gray-500 bg-dark-surface px-2.5 py-1 rounded-full border border-dark-border/80 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>LOCKED</span>
                </div>
              )}
            </div>

            <h3 className="text-base font-bold text-white font-sans mb-1">{badge.title}</h3>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">{badge.description}</p>

            {badge.earnedAt && (
              <div className="mt-4 pt-3 border-t border-dark-border/80 text-[11px] font-mono text-amber-400 font-medium">
                Unlocked {new Date(badge.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
