import React from 'react';
import { LayoutDashboard, Dumbbell, MapPin, ScanBarcode, Droplets, Moon, Scale, Award, User, Wifi, Users } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const sidebarNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', symbol: '📊', desc: 'Holistic Vitality Score', icon: LayoutDashboard },
    { id: 'gym', label: 'Gym Routine', symbol: '🏋️', desc: 'Routines & Strength Vault', icon: Dumbbell },
    { id: 'workout', label: 'GPS Run HUD', symbol: '📍', desc: 'Live Map Workout Tracking', icon: MapPin },
    { id: 'nutrition', label: 'Nutrition', symbol: '🍏', desc: 'Open Food Facts Scanner', icon: ScanBarcode },
    { id: 'social', label: 'Friends & Chat', symbol: '💬', desc: 'Real-time Social Duels', icon: Users },
    { id: 'water', label: 'Hydration', symbol: '💧', desc: 'Daily Water Pacing', icon: Droplets },
    { id: 'sleep', label: 'Sleep Rest', symbol: '🌙', desc: 'Circadian Sleep Cycles', icon: Moon },
    { id: 'weight', label: 'Weight Trends', symbol: '⚖️', desc: 'BMI & Body Composition', icon: Scale },
    { id: 'achievements', label: 'Milestones', symbol: '🏆', desc: 'Rank Badges & Trophies', icon: Award },
    { id: 'profile', label: 'Profile', symbol: '👤', desc: 'Settings & Telemetry Targets', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-dark-border/80 min-h-[calc(100vh-65px)] p-4 space-y-2 select-none">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-3 py-2 font-display flex items-center justify-between">
        <span>CONTROL HUB</span>
        <span className="text-[10px] text-brand-400 font-mono">10 MODULES</span>
      </div>

      <nav className="space-y-1">
        {sidebarNavigationItems.map((navItem) => {
          const ItemIcon = navItem.icon;
          const isTabActive = activeTab === navItem.id;
          return (
            <Tooltip
              key={navItem.id}
              content={`${navItem.symbol} ${navItem.label} • ${navItem.desc}`}
              position="right"
              className="w-full"
            >
              <button
                onClick={() => setActiveTab(navItem.id)}
                className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isTabActive
                    ? 'bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 text-white shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-dark-surface border border-transparent hover:border-dark-border/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{navItem.symbol}</span>
                  <ItemIcon className={`w-4 h-4 transition-colors ${isTabActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-400'}`} />
                </div>
                <span className="font-sans text-xs font-semibold tracking-wide">{navItem.label}</span>
                {isTabActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
                )}
              </button>
            </Tooltip>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-dark-border/80">
        <Tooltip content="IndexedDB Offline Sync Engine Active (Workouts & Food queue automatically)" position="top" className="w-full">
          <div className="p-2.5 rounded-xl telemetry-card text-xs text-gray-400 flex items-center justify-between border border-emerald-500/30 cursor-pointer hover:border-emerald-500/60 transition-all">
            <div className="flex items-center gap-2 font-mono font-bold text-emerald-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Wifi className="w-3.5 h-3.5" />
              <span>Offline Sync Engine</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
              🟢 ACTIVE
            </span>
          </div>
        </Tooltip>
      </div>
    </aside>
  );
};

