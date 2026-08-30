import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 w-full border-t border-dark-border/60 bg-gradient-to-b from-dark-surface/30 to-dark-bg/80 backdrop-blur-md pt-6 pb-24 lg:pb-8 px-4 md:px-8">
      {/* Top Gradient Divider Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-brand-500/50 via-cyan-400/50 to-transparent -mt-6 mb-6" />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Brand Logo */}
        <div className="flex justify-center sm:justify-start">
          <Logo size="sm" />
        </div>

        {/* Center/Right: "Designed by Anish" Badge & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
          <div className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-dark-surface/95 border border-brand-500/50 shadow-glow hover:border-cyan-400 transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 opacity-40 blur group-hover:opacity-80 transition duration-300" />

            <div className="relative flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-white">
              <span className="flex items-center gap-1 text-gray-300 font-normal">
                Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-bold tracking-wide">
                Designed by <span className="text-cyan-300 font-extrabold text-xs tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.95)]">Anish</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-500">
            <span>© 2026 NouRivo</span>
            <span>•</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
