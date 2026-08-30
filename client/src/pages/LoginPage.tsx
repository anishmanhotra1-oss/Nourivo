import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { AuthBackgroundAnimation } from '../components/common/AuthBackgroundAnimation';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [userEmailAddress, setUserEmailAddress] = useState('');
  const [userPasswordSecret, setUserPasswordSecret] = useState('');
  const [authenticationError, setAuthenticationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthenticationSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthenticationError(null);
    setIsSubmitting(true);

    try {
      await login({ email: userEmailAddress, password: userPasswordSecret });
    } catch (error: any) {
      setAuthenticationError(error.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-dark-bg relative overflow-hidden">
      {/* Animated Fitness Telemetry Background */}
      <AuthBackgroundAnimation />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md telemetry-card rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl border border-brand-500/30">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center justify-center">
          <Logo size="md" />
          <p className="text-[11px] sm:text-xs font-mono text-gray-400">
            Sign in to sync your workout & nutrition telemetries
          </p>
        </div>

        {authenticationError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono text-center">
            {authenticationError}
          </div>
        )}

        <form onSubmit={handleAuthenticationSubmission} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={userEmailAddress}
                onChange={(e) => setUserEmailAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs sm:text-sm font-sans text-white focus:outline-none focus:border-brand-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={userPasswordSecret}
                onChange={(e) => setUserPasswordSecret(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs sm:text-sm font-sans text-white focus:outline-none focus:border-brand-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-dark-border/80 space-y-2">
          <p className="text-xs text-gray-400 font-sans">
            Need an athlete account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-brand-400 hover:text-brand-300 font-bold cursor-pointer underline underline-offset-2"
            >
              Create Account
            </button>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>256-Bit Encrypted Telemetry Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
