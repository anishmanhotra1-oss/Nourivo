import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, flushSyncQueueToServer } from '../db/dexie';

interface SyncContextType {
  isOnline: boolean;
  pendingSyncCount: number;
  triggerSync: () => Promise<void>;
  isSyncing: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Live count of total pending sync items across IndexedDB tables
  const pendingSteps = useLiveQuery(() => db.pendingSteps.count(), []) || 0;
  const pendingWorkouts = useLiveQuery(() => db.pendingWorkouts.count(), []) || 0;
  const pendingFood = useLiveQuery(() => db.pendingFood.count(), []) || 0;
  const pendingWater = useLiveQuery(() => db.pendingWater.count(), []) || 0;
  const pendingSleep = useLiveQuery(() => db.pendingSleep.count(), []) || 0;
  const pendingWeight = useLiveQuery(() => db.pendingWeight.count(), []) || 0;

  const pendingSyncCount =
    pendingSteps + pendingWorkouts + pendingFood + pendingWater + pendingSleep + pendingWeight;

  const triggerSync = async () => {
    const token = localStorage.getItem('nourivo_token');
    if (!token || !isOnline || pendingSyncCount === 0 || isSyncing) return;

    setIsSyncing(true);
    try {
      await flushSyncQueueToServer(token);
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount if online and items exist
    if (navigator.onLine && pendingSyncCount > 0) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSyncCount]);

  return (
    <SyncContext.Provider value={{ isOnline, pendingSyncCount, triggerSync, isSyncing }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
