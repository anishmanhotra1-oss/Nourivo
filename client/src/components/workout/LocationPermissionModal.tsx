import React from 'react';
import { Navigation, ShieldAlert, X, Globe, MapPin } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  permissionState: 'granted' | 'denied' | 'prompt';
  errorMessage: string | null;
  onRequestAccess: () => void;
  onUseDemoRoute: () => void;
  onClose: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  permissionState,
  errorMessage,
  onRequestAccess,
  onUseDemoRoute,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-3 inset-x-3 sm:top-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[380px] z-[1000] font-sans animate-fade-in pointer-events-auto">
      {/* High-Contrast Compact Popup Box */}
      <div className="relative w-full rounded-2xl bg-[#121624] border-2 border-brand-500 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)] space-y-3 font-sans overflow-hidden">
        
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500" />

        {/* Top Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-dark-bg hover:bg-gray-800 text-gray-400 hover:text-white border border-dark-border/80 transition-all cursor-pointer z-10"
          title="Close Popup"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Compact Header: Icon + Title + Text */}
        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 border border-brand-400/60 flex items-center justify-center shrink-0 shadow-glow mt-0.5">
            <Navigation className="w-5 h-5 text-white fill-white transform rotate-45 animate-pulse" />
          </div>

          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>GPS Telemetry</span>
            </div>
            <h3 className="text-sm font-extrabold text-white font-display leading-tight">
              Enable Location Access
            </h3>
            <p className="text-[11px] text-gray-300 leading-snug font-sans">
              Allow location to record your live route & pace on Google Maps. Motion sensors help detect cadence & activity.
            </p>
          </div>
        </div>

        {/* Error / Denial Alert Banner */}
        {permissionState === 'denied' && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 font-mono text-[10px] space-y-1.5 text-left">
            <div className="flex items-center gap-1 font-bold text-red-400 uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{errorMessage?.includes('secure origins') ? 'Chrome HTTP Security Limit' : 'Location Permission Blocked'}</span>
            </div>
            
            {errorMessage?.includes('secure origins') ? (
              <div className="space-y-1.5 text-gray-300 font-sans text-[11px] leading-tight">
                <p>Chrome restricts real mobile GPS to <strong>HTTPS</strong> origins on local network IPs.</p>
                <div className="p-2 rounded-lg bg-black/50 border border-amber-500/40 text-[10px] font-mono text-amber-300 space-y-1">
                  <div>👉 <strong>Open via HTTPS:</strong> Use <strong>https://{window.location.hostname}:{window.location.port || '3030'}</strong> on phone</div>
                  <div>⚡ <strong>Quick Testing:</strong> Tap <strong>Run Demo Simulated Route</strong> below</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 font-sans text-[11px] leading-tight">
                {errorMessage || 'Blocked by browser. Tap lock icon near URL bar to allow.'}
              </p>
            )}
          </div>
        )}


        {/* High-Contrast Compact Action Buttons */}
        <div className="space-y-2 font-mono pt-1">
          <button
            onClick={onRequestAccess}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>{permissionState === 'denied' ? 'Retry GPS Location' : 'Allow GPS Location'}</span>
          </button>

          <button
            onClick={() => {
              onUseDemoRoute();
              onClose();
            }}
            className="w-full py-2 px-3 bg-dark-bg hover:bg-brand-600/20 text-cyan-300 hover:text-white border border-cyan-500/30 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Run Demo Simulated Route</span>
          </button>
        </div>
      </div>
    </div>
  );
};
