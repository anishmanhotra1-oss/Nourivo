import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  // Dimensions for icon based on size
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-15 h-15',
  }[size];

  // Font sizes for text based on size
  const titleSize = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  }[size];

  const taglineSize = {
    sm: 'text-[7.5px] sm:text-[8.5px]',
    md: 'text-[9.5px] sm:text-[10.5px]',
    lg: 'text-[11.5px] sm:text-[12.5px]',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none text-left ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Hexagonal N Emblem */}
      <div className={`relative flex-shrink-0 ${iconDimensions} transition-transform hover:scale-105`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nBlueLeftGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="nBlueRightGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#2451D6" />
            </linearGradient>
            <linearGradient id="nWhiteGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
            <linearGradient id="nGlowGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Hexagon Outer Container */}
          <polygon
            points="60,6 108,33 108,87 60,114 12,87 12,33"
            fill="#0A0F1D"
            stroke="url(#nGlowGradLogo)"
            strokeWidth="7"
          />

          {/* Silver Top Crown Accent */}
          <polygon points="48,24 60,17 60,34 48,41" fill="url(#nWhiteGradLogo)" />
          <polygon points="60,17 72,24 72,41 60,34" fill="#CBD5E1" />

          {/* Folded 3D 'N' Emblem */}
          <polygon points="26,44 48,32 48,84 26,96" fill="url(#nBlueLeftGradLogo)" stroke="#60A5FA" strokeWidth="1.5" />
          <polygon points="48,32 94,68 94,84 48,48" fill="url(#nGlowGradLogo)" />
          <polygon points="64,44 88,32 88,88 64,100" fill="url(#nBlueRightGradLogo)" stroke="#38BDF8" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Brand Text & Tagline */}
      {showText && (
        <div className="flex flex-col justify-center items-start text-left shrink-0">
          <div className={`font-black tracking-tight text-white font-display leading-none ${titleSize}`}>
            Nou<span className="text-brand-500">Rivo</span>
          </div>
          <div className={`w-full flex items-center justify-between text-brand-400/90 font-bold uppercase leading-none mt-1 font-mono ${taglineSize}`}>
            <span>MOVE</span>
            <span className="text-brand-500/60 font-normal">•</span>
            <span>NOURISH</span>
            <span className="text-brand-500/60 font-normal">•</span>
            <span>THRIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};
