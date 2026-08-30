import React, { useState } from 'react';
import { X, Swords, Footprints, MapPin, Droplets, Zap, CheckCircle2, Trophy } from 'lucide-react';

interface CreateFriendChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendName: string;
  onSendChallengeBroadcast: (challengeMessage: string, category: 'steps' | 'distance' | 'water', goalVal: number) => Promise<void>;
}

export const CreateFriendChallengeModal: React.FC<CreateFriendChallengeModalProps> = ({
  isOpen,
  onClose,
  friendName,
  onSendChallengeBroadcast,
}) => {
  const [category, setCategory] = useState<'steps' | 'distance' | 'water'>('steps');
  const [goalValue, setGoalValue] = useState<number>(10000);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: 'steps' | 'distance' | 'water') => {
    setCategory(cat);
    if (cat === 'steps') setGoalValue(10000);
    if (cat === 'distance') setGoalValue(5.0);
    if (cat === 'water') setGoalValue(2500);
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const categoryLabel = category === 'steps' ? 'Step Count' : category === 'distance' ? 'GPS Distance Run' : 'Hydration Volume';
      const unitLabel = category === 'steps' ? 'steps' : category === 'distance' ? 'km' : 'mL';
      
      const challengeMessage = `⚔️ ATHLETE TARGET CHALLENGE: I challenge ${friendName} to a ${goalValue} ${unitLabel} ${categoryLabel} duel over ${durationDays} day(s)! Accept the target challenge!`;
      
      await onSendChallengeBroadcast(challengeMessage, category, goalValue);
      onClose();
    } catch (err) {
      console.error('Failed to send target challenge:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-4 sm:pt-8 p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="telemetry-card max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6 border border-brand-500/40 space-y-5 shadow-2xl relative font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
              <Swords className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Create Friend Target Challenge
              </h3>
              <p className="text-xs text-gray-400 font-mono">Target Duel with {friendName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-bg hover:bg-dark-surface text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Category Selector */}
        <div className="space-y-2 font-mono">
          <label className="text-xs text-gray-400 uppercase block">1. Select Target Category</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: 'steps', label: 'Step Volume', icon: Footprints, color: 'text-emerald-400' },
              { id: 'distance', label: 'GPS Run', icon: MapPin, color: 'text-cyan-400' },
              { id: 'water', label: 'Hydration', icon: Droplets, color: 'text-blue-400' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    category === item.id
                      ? 'bg-brand-600/20 border-brand-500 text-white font-bold shadow-glow'
                      : 'bg-dark-bg border-dark-border text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-[11px] font-sans">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Goal Value Input */}
        <div className="p-4 rounded-xl bg-dark-bg border border-dark-border/80 space-y-2 font-mono">
          <div className="flex justify-between items-center text-xs">
            <label className="text-gray-400 uppercase">2. Target Goal Limit</label>
            <span className="font-bold text-emerald-400 text-sm">
              {goalValue} {category === 'steps' ? 'steps' : category === 'distance' ? 'km' : 'mL'}
            </span>
          </div>

          <input
            type="number"
            step={category === 'distance' ? '0.5' : '100'}
            min="1"
            value={goalValue}
            onChange={(e) => setGoalValue(Number(e.target.value))}
            className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm font-bold text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Duration Days Selector */}
        <div className="space-y-2 font-mono">
          <label className="text-xs text-gray-400 uppercase block">3. Challenge Duration</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { days: 1, label: '24 Hours (1 Day)' },
              { days: 3, label: '3 Days Sprint' },
              { days: 7, label: '7 Days Endurance' },
            ].map((dur) => (
              <button
                key={dur.days}
                type="button"
                onClick={() => setDurationDays(dur.days)}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  durationDays === dur.days
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-glow'
                    : 'bg-dark-bg border-dark-border text-gray-400 hover:text-white'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* Send Action Button */}
        <button
          onClick={handleSend}
          disabled={isSending}
          className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>{isSending ? 'Sending Challenge...' : `Send Challenge to ${friendName}`}</span>
        </button>
      </div>
    </div>
  );
};
