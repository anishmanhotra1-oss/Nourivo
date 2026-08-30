import React, { useEffect, useRef } from 'react';
import {
  HeartPulse,
  Flame,
  Footprints,
  Droplets,
  Activity,
  Zap,
  Compass,
  Moon,
  ShieldCheck,
  Dumbbell,
  Trophy,
} from 'lucide-react';

export const AuthBackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // ECG Heartbeat line variables
    let ecgX = 0;
    const speed = 2.5;
    const points: { x: number; y: number }[] = [];
    const maxPoints = Math.floor(width / speed);

    // Particle nodes for ambient mesh
    const particleCount = Math.min(Math.floor(width / 35), 45);
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }[] = [];

    const colors = ['rgba(59, 130, 246, 0.4)', 'rgba(6, 182, 212, 0.4)', 'rgba(168, 85, 247, 0.3)', 'rgba(16, 185, 129, 0.3)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Function to calculate ECG wave offset at a position
    const getEcgY = (xPos: number, centerY: number) => {
      const cycleLength = 240;
      const pos = xPos % cycleLength;

      if (pos > 70 && pos < 80) {
        return centerY - 8 * Math.sin(((pos - 70) / 10) * Math.PI); // P Wave
      } else if (pos >= 100 && pos < 105) {
        return centerY + 12; // Q dip
      } else if (pos >= 105 && pos < 120) {
        return centerY - 55 * Math.sin(((pos - 105) / 15) * Math.PI); // R Spike
      } else if (pos >= 120 && pos < 128) {
        return centerY + 22 * Math.sin(((pos - 120) / 8) * Math.PI); // S Dip
      } else if (pos >= 150 && pos < 185) {
        return centerY - 14 * Math.sin(((pos - 150) / 35) * Math.PI); // T Wave
      }

      return centerY + (Math.random() - 0.5) * 1.5;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint cyber grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw ambient telemetry nodes & connecting lines
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Update Heartbeat ECG wave
      ecgX += speed;
      if (ecgX > width) ecgX = 0;

      const lineY1 = height * 0.35;
      const lineY2 = height * 0.72;

      const yVal1 = getEcgY(ecgX, lineY1);
      const yVal2 = getEcgY(ecgX + 120, lineY2);

      points.push({ x: ecgX, y: yVal1 });
      if (points.length > maxPoints) {
        points.shift();
      }

      // Render Primary Glowing Cyan ECG Wave Trace across top third
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      const grad1 = ctx.createLinearGradient(0, 0, width, 0);
      grad1.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
      grad1.addColorStop(0.5, 'rgba(59, 130, 246, 0.45)');
      grad1.addColorStop(1, 'rgba(16, 185, 129, 0.8)');

      ctx.strokeStyle = grad1;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#06B6D4';

      for (let i = 0; i < points.length - 1; i++) {
        if (Math.abs(points[i + 1].x - points[i].x) < 20) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[i + 1].x, points[i + 1].y);
          ctx.stroke();
        }
      }

      // Pulse leading dot
      ctx.beginPath();
      ctx.arc(ecgX, yVal1, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#38BDF8';
      ctx.fill();

      // Render Secondary Deep Emerald Wave Trace across lower screen
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#10B981';

      ctx.moveTo(0, lineY2);
      for (let x = 0; x < width; x += 5) {
        ctx.lineTo(x, getEcgY(x + ecgX * 0.8, lineY2));
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* HTML5 ECG Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Radial Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-16 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-16 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />

      {/* Rotating Concentric Biometric Activity Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] opacity-20 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_40s_linear_infinite]">
          <circle cx="100" cy="100" r="90" fill="none" stroke="url(#ringGrad1)" strokeWidth="1.5" strokeDasharray="12 18" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="url(#ringGrad2)" strokeWidth="1" strokeDasharray="40 10 5 10" />
          <circle cx="100" cy="100" r="54" fill="none" stroke="url(#ringGrad3)" strokeWidth="2" strokeDasharray="8 6" />
          <defs>
            <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="ringGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Fitness Telemetry Badges (Desktop & Tablet Ambient Cards) */}
      {/* Badge 1: Heart Rate */}
      <div className="hidden lg:flex absolute top-16 left-[8%] items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border border-rose-500/30 shadow-lg shadow-rose-950/20 backdrop-blur-md animate-[float-levitate_5s_infinite_ease-in-out]">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-gray-400 tracking-wider">Live Pulse</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-sm font-bold font-mono text-white flex items-baseline gap-1">
            <span>142</span>
            <span className="text-[11px] font-normal text-rose-400">BPM</span>
          </div>
        </div>
      </div>

      {/* Badge 2: Steps Telemetry */}
      <div className="hidden lg:flex absolute bottom-24 left-[10%] items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border border-emerald-500/30 shadow-lg shadow-emerald-950/20 backdrop-blur-md animate-[float-levitate_6s_infinite_ease-in-out]" style={{ animationDelay: '1s' }}>
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Footprints className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wider">Daily Target</div>
          <div className="text-sm font-bold font-mono text-white flex items-baseline gap-1">
            <span>10,480</span>
            <span className="text-[11px] font-normal text-emerald-400">/ 12k steps</span>
          </div>
        </div>
      </div>

      {/* Badge 3: Active Calories */}
      <div className="hidden lg:flex absolute top-24 right-[8%] items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border border-amber-500/30 shadow-lg shadow-amber-950/20 backdrop-blur-md animate-[float-levitate_5.5s_infinite_ease-in-out]" style={{ animationDelay: '2s' }}>
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wider">Active Energy</div>
          <div className="text-sm font-bold font-mono text-white flex items-baseline gap-1">
            <span>740</span>
            <span className="text-[11px] font-normal text-amber-400">kcal burned</span>
          </div>
        </div>
      </div>

      {/* Badge 4: GPS Route */}
      <div className="hidden lg:flex absolute bottom-28 right-[10%] items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border border-cyan-500/30 shadow-lg shadow-cyan-950/20 backdrop-blur-md animate-[float-levitate_6.5s_infinite_ease-in-out]" style={{ animationDelay: '0.5s' }}>
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Compass className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wider">GPS Workout</div>
          <div className="text-sm font-bold font-mono text-white flex items-baseline gap-1">
            <span>5.2 km</span>
            <span className="text-[11px] font-normal text-cyan-400">4'32"/km</span>
          </div>
        </div>
      </div>

      {/* Badge 5: Hydration (Center-Top small floating) */}
      <div className="hidden md:flex absolute top-10 left-1/2 -translate-x-1/2 items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-blue-500/30 shadow-md backdrop-blur-md animate-[float-levitate_4.5s_infinite_ease-in-out]" style={{ animationDelay: '1.2s' }}>
        <Droplets className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-mono text-gray-200">Hydration Sync: <strong className="text-blue-400">2.4L / 3.0L</strong></span>
      </div>

      {/* Floating Fitness Icon Orbs (Drifting subtly around screen) */}
      <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 blur-[0.5px] animate-[float-levitate_7s_infinite_ease-in-out]" style={{ animationDelay: '0.8s' }}>
        <Dumbbell className="w-5 h-5 rotate-45" />
      </div>

      <div className="absolute top-[62%] right-[5%] w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 blur-[0.5px] animate-[float-levitate_8s_infinite_ease-in-out]" style={{ animationDelay: '2.5s' }}>
        <Trophy className="w-5 h-5" />
      </div>

      <div className="absolute bottom-[12%] left-[45%] w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 blur-[0.5px] animate-[float-levitate_6s_infinite_ease-in-out]" style={{ animationDelay: '3.2s' }}>
        <Zap className="w-4 h-4" />
      </div>

      <div className="absolute top-[20%] right-[32%] w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 blur-[0.5px] animate-[float-levitate_5.2s_infinite_ease-in-out]" style={{ animationDelay: '1.8s' }}>
        <Moon className="w-4 h-4" />
      </div>
    </div>
  );
};
