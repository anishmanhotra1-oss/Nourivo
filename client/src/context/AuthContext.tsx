import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { db } from '../db/dexie';

interface User {
  id: string;
  email: string;
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  stepGoal: number;
  waterGoal: number;
  calorieGoal: number;
  sleepGoal: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('nourivo_token');
      if (token) {
        try {
          if (navigator.onLine) {
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
              await db.cachedProfile.put(userData);
            } catch (netErr: any) {
              // Fallback to cached profile if server call fails or is unreachable
              const cached = await db.cachedProfile.toCollection().first();
              if (cached) {
                setUser(cached as User);
              } else if (netErr.message?.includes('401') || netErr.message?.includes('403')) {
                authService.logout();
              }
            }
          } else {
            // Read from Dexie cachedProfile when offline
            const cached = await db.cachedProfile.toCollection().first();
            if (cached) {
              setUser(cached as User);
            }
          }
        } catch (err) {
          console.error('Failed to load user session', err);
        }
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    await db.cachedProfile.put(res.user);
  };

  const register = async (userData: any) => {
    const res = await authService.register(userData);
    setUser(res.user);
    await db.cachedProfile.put(res.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: any) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    await db.cachedProfile.put(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
