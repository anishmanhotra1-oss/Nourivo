import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { AutoTrackerProvider } from './context/AutoTrackerContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { GymPage } from './pages/GymPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { NutritionPage } from './pages/NutritionPage';
import { WaterPage } from './pages/WaterPage';
import { SleepPage } from './pages/SleepPage';
import { WeightPage } from './pages/WeightPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SocialPage } from './pages/SocialPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { Logo } from './components/common/Logo';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Reset scroll position to top whenever active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="md" />
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'gym':
        return <GymPage />;
      case 'workout':
        return <WorkoutPage />;
      case 'nutrition':
        return <NutritionPage />;
      case 'water':
        return <WaterPage />;
      case 'sleep':
        return <SleepPage />;
      case 'weight':
        return <WeightPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'social':
        return <SocialPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 md:p-8 flex flex-col space-y-6 overflow-y-auto">
          <div key={activeTab} className="animate-slide-up">
            {renderActivePage()}
          </div>
          <Footer />
        </main>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SyncProvider>
          <AutoTrackerProvider>
            <AppContent />
          </AutoTrackerProvider>
        </SyncProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
