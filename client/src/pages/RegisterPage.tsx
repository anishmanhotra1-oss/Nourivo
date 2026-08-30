import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { AuthBackgroundAnimation } from '../components/common/AuthBackgroundAnimation';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [athleteFullName, setAthleteFullName] = useState('');
  const [initialBodyWeightKg, setInitialBodyWeightKg] = useState('70');
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegistrationSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegistrationError(null);
    setIsSubmitting(true);

    try {
      await register({
        email: newAccountEmail,
        password: newAccountPassword,
        name: athleteFullName,
        weight: parseFloat(initialBodyWeightKg) || 70,
      });
    } catch (error: any) {
      setRegistrationError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-dark-bg relative overflow-hidden">
      {/* Animated Fitness Telemetry Background */}
      <AuthBackgroundAnimation />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md telemetry-card rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl border border-brand-500/30">
        <div className="text-center space-y-2 flex flex-col items-center justify-center">
          <Logo size="md" />
          <p className="text-[11px] sm:text-xs font-mono text-gray-400">
            Initialize your NouRivo telemetry profile
          </p>
        </div>

        {registrationError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono text-center">
            {registrationError}
          </div>
        )}

        <form onSubmit={handleRegistrationSubmission} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-gray-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={athleteFullName}
                onChange={(e) => setAthleteFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs sm:text-sm font-sans text-white focus:outline-none focus:border-brand-500"
                placeholder="Alex Morgan"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={newAccountEmail}
                onChange={(e) => setNewAccountEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs sm:text-sm font-sans text-white focus:outline-none focus:border-brand-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-gray-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  value={newAccountPassword}
                  onChange={(e) => setNewAccountPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs sm:text-sm font-sans text-white focus:outline-none focus:border-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-gray-400">Mass (kg)</label>
              <input
                type="number"
                required
                value={initialBodyWeightKg}
                onChange={(e) => setInitialBodyWeightKg(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-brand-500"
                placeholder="70"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Creating Profile...' : 'Initialize Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-dark-border/80 space-y-2">
          <p className="text-xs text-gray-400 font-sans">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-brand-400 hover:text-brand-300 font-bold cursor-pointer underline underline-offset-2"
            >
              Sign In
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
