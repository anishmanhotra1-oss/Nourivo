import React, { useState } from 'react';
import {
  LogOut,
  User as UserIcon,
  Zap,
  Menu,
  X,
  LayoutDashboard,
  Dumbbell,
  MapPin,
  ScanBarcode,
  Users,
  Droplets,
  Moon,
  Scale,
  Award,
  Sparkles,
  ChevronRight,
  Heart,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAutoTracker } from '../../context/AutoTrackerContext';
import { OfflineBadge } from '../common/OfflineBadge';
import { Logo } from '../common/Logo';
import { Tooltip } from '../common/Tooltip';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { isAutoMovementActive } = useAutoTracker();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', desc: 'Vitality Score', icon: LayoutDashboard, color: 'from-blue-600 to-indigo-600' },
    { id: 'gym', label: 'Gym Builder', desc: 'Routines & Vault', icon: Dumbbell, color: 'from-brand-600 to-cyan-600' },
    { id: 'workout', label: 'GPS Run HUD', desc: 'Live Map Run', icon: MapPin, color: 'from-amber-600 to-orange-600' },
    { id: 'nutrition', label: 'Food Scanner', desc: 'Barcode Scan', icon: ScanBarcode, color: 'from-emerald-600 to-teal-600' },
    { id: 'social', label: 'Friends Chat', desc: 'Real-time Duel', icon: Users, color: 'from-purple-600 to-pink-600' },
    { id: 'water', label: 'Hydration', desc: 'Water Target', icon: Droplets, color: 'from-cyan-600 to-blue-600' },
    { id: 'sleep', label: 'Sleep Rest', desc: 'Circadian Cycles', icon: Moon, color: 'from-indigo-600 to-purple-600' },
    { id: 'weight', label: 'Weight Trends', desc: 'Body Composition', icon: Scale, color: 'from-teal-600 to-emerald-600' },
    { id: 'achievements', label: 'Badges Vault', desc: 'Level & Ranks', icon: Award, color: 'from-amber-500 to-yellow-600' },
    { id: 'profile', label: 'Profile Settings', desc: 'Telemetry Targets', icon: UserIcon, color: 'from-gray-600 to-slate-700' },
  ];

  const handleTabSelection = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-dark-border px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-xl bg-dark-surface hover:bg-dark-hover text-gray-300 border border-dark-border/80 transition-all cursor-pointer shadow-glow"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 text-brand-400" />
              </button>
            )}

            <Logo size="sm" onClick={() => handleTabSelection('dashboard')} />
          </div>

          {/* Right: Offline, Auto-Tracker & User Controls */}
          <div className="flex items-center gap-3">
            <OfflineBadge />

            {/* Live Gym Routine Status Indicator */}
            {user && (
              <Tooltip content="⚡ Gym Engine Active & Auto-Tracking Background Telemetry" position="bottom">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/15 border border-brand-500/30 text-brand-400 text-[11px] font-mono font-bold shadow-glow cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gym Engine</span>
                </div>
              </Tooltip>
            )}

            {user && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Tooltip content={`👤 ${user.name} • View Settings`} position="bottom">
                  <button
                    onClick={() => handleTabSelection('profile')}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-hover border border-dark-border transition-colors text-xs font-medium text-gray-200"
                  >
                    <UserIcon className="w-4 h-4 text-brand-500" />
                    <span>{user.name}</span>
                  </button>
                </Tooltip>

                <Tooltip content="Sign Out of Session" position="bottom">
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg bg-dark-surface hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-dark-border hover:border-red-500/30 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Creative & Unique Mobile Full Screen Modal Navigation Drawer */}
      {isMobileMenuOpen && user && (
        <div className="lg:hidden fixed inset-0 z-[500] bg-dark-bg/95 backdrop-blur-2xl flex flex-col animate-fade-in p-4 sm:p-6 font-sans overflow-hidden">
          {/* Futuristic Background Blur Light Blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Drawer Top Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-dark-border/80 pb-4 mb-4">
            <Logo size="sm" onClick={() => handleTabSelection('dashboard')} />

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-dark-surface text-gray-300 hover:text-white border border-brand-500/40 transition-all cursor-pointer shadow-glow"
              title="Close Menu"
            >
              <X className="w-5 h-5 text-brand-400" />
            </button>
          </div>

          {/* Main Scrollable Drawer Content */}
          <div className="relative z-10 flex-1 overflow-y-auto space-y-4 pb-8 pr-1">
            {/* Athlete Profile Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/40 via-dark-surface to-dark-bg border border-brand-500/40 shadow-glow flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white font-mono font-bold text-sm flex items-center justify-center shadow-glow border border-brand-400/40">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'NO'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white font-display">{user.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-[10px] font-mono text-brand-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Peak Vitality Athlete
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer text-xs font-mono font-bold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>

            {/* Creative 2-Column Grid Navigation Cards */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono flex items-center justify-between px-1">
                <span>SELECT TELEMETRY HUB</span>
                <span className="text-brand-400 font-bold">10 MODULES</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelection(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-2 group ${
                        isActive
                          ? 'bg-gradient-to-br from-brand-600/30 via-dark-surface to-dark-bg border-brand-400 text-white shadow-glow'
                          : 'bg-dark-surface/80 border-dark-border hover:border-brand-500/50 hover:bg-dark-hover text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-2 rounded-xl border transition-all ${
                            isActive
                              ? `bg-gradient-to-tr ${item.color} text-white border-white/40 shadow-glow`
                              : 'bg-dark-bg text-brand-400 border-dark-border group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-brand-400 translate-x-0.5' : 'text-gray-600 group-hover:text-gray-300'}`} />
                      </div>

                      <div>
                        <div className="text-xs font-bold font-display text-white truncate">{item.label}</div>
                        <div className="text-[9px] font-mono text-gray-400 truncate">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Menu Quick Control Dock */}
            <div className="p-4 rounded-2xl bg-dark-surface/90 border border-dark-border space-y-2.5 font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Mobile Quick Control Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTabSelection('gym')}
                  className="p-2.5 rounded-xl bg-dark-bg hover:bg-brand-600/20 text-brand-300 border border-dark-border text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-brand-400" />
                  <span>Gym Builder</span>
                </button>

                <button
                  onClick={() => handleTabSelection('workout')}
                  className="p-2.5 rounded-xl bg-dark-bg hover:bg-amber-600/20 text-amber-300 border border-dark-border text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>GPS Run HUD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
