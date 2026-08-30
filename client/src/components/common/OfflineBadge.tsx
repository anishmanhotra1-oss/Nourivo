import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSync } from '../../context/SyncContext';

export const OfflineBadge: React.FC = () => {
  const { isOnline, pendingSyncCount, triggerSync, isSyncing } = useSync();

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Wifi className="w-3.5 h-3.5" />
          <span>Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode</span>
        </div>
      )}

      {pendingSyncCount > 0 && (
        <button
          onClick={triggerSync}
          disabled={!isOnline || isSyncing}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-600/20 text-brand-400 border border-brand-500/30 hover:bg-brand-600/30 transition-all cursor-pointer disabled:opacity-50"
          title="Click to sync pending items"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{pendingSyncCount} Pending Sync</span>
        </button>
      )}
    </div>
  );
};
