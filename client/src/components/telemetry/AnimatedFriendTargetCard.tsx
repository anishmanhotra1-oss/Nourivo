import React from 'react';
import { Swords, Trophy, Flame, Footprints, MapPin, Droplets, Zap, ArrowUpRight } from 'lucide-react';

interface AnimatedFriendTargetCardProps {
  friendName: string;
  myScore?: number;
  friendScore?: number;
  targetGoal?: number;
  targetCategory?: 'steps' | 'distance' | 'water';
  onLaunchChallenge?: () => void;
}

export const AnimatedFriendTargetCard: React.FC<AnimatedFriendTargetCardProps> = ({
  friendName,
  myScore = 7800,
  friendScore = 6400,
  targetGoal = 10000,
  targetCategory = 'steps',
  onLaunchChallenge,
}) => {
  const myPercent = Math.min(100, Math.round((myScore / targetGoal) * 100));
  const friendPercent = Math.min(100, Math.round((friendScore / targetGoal) * 100));

  const scoreDiff = myScore - friendScore;
  const isLeading = scoreDiff > 0;
  const isTied = scoreDiff === 0;

  const categoryMeta = {
    steps: { label: 'Daily Steps', unit: 'steps', icon: Footprints, color: 'text-emerald-400' },
    distance: { label: 'GPS Run Distance', unit: 'km', icon: MapPin, color: 'text-cyan-400' },
    water: { label: 'Hydration Target', unit: 'mL', icon: Droplets, color: 'text-blue-400' },
  }[targetCategory];

  const CategoryIcon = categoryMeta.icon;

  return (
    <div className="telemetry-card rounded-2xl p-4 sm:p-5 border border-brand-500/30 space-y-4 shadow-xl relative overflow-hidden font-sans">
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
            <Swords className="w-4 h-4 text-brand-400 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Friend Target Duel</div>
            <h4 className="text-sm font-bold text-white font-display">
              You vs {friendName}
            </h4>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border ${
          isTied
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : isLeading
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow'
            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        }`}>
          <Trophy className="w-3 h-3" />
          <span>
            {isTied ? 'Tied Target' : isLeading ? `Ahead +${scoreDiff.toLocaleString()} ${categoryMeta.unit}` : `Behind ${scoreDiff.toLocaleString()} ${categoryMeta.unit}`}
          </span>
        </div>
      </div>

      {/* Animated Head-to-Head Comparison Bars */}
      <div className="space-y-3 font-mono">
        {/* Your Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-400" /> You (Current)
            </span>
            <span className="text-white font-extrabold tabular-nums">
              {myScore.toLocaleString()} / {targetGoal.toLocaleString()} {categoryMeta.unit} ({myPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-dark-bg border border-dark-border/80 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-glow"
              style={{ width: `${myPercent}%` }}
            />
          </div>
        </div>

        {/* Friend's Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> {friendName}
            </span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {friendScore.toLocaleString()} / {targetGoal.toLocaleString()} {categoryMeta.unit} ({friendPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-dark-bg border border-dark-border/80 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-teal-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${friendPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Challenge Launcher Button */}
      {onLaunchChallenge && (
        <button
          onClick={onLaunchChallenge}
          className="w-full py-2.5 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-glow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Launch Target Duel Challenge</span>
        </button>
      )}
    </div>
  );
};
