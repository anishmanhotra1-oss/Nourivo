import Dexie, { Table } from 'dexie';

export interface PendingStep {
  id?: number;
  date: string;
  stepCount: number;
  source: string;
  timestamp: number;
}

export interface PendingWorkout {
  id?: number;
  type: string;
  startTime: string;
  endTime: string;
  distance: number;
  duration: number;
  avgSpeed?: number;
  maxSpeed?: number;
  caloriesBurned?: number;
  routeGeoJson?: string;
  timestamp: number;
}

export interface RunRecord {
  id?: number;
  startTime: string;
  endTime: string;
  activeDuration: number;
  elapsedDuration: number;
  distance: number;
  averageSpeed: number;
  maximumSpeed: number;
  averagePace: string;
  calories: number;
  elevationGain: number;
  cadence: number;
  routePoints: string;
  activityType: string;
  synced: number;
  timestamp: number;
}

export interface PendingFood {
  id?: number;
  productBarcode?: string;
  productName: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  servingSize?: string;
  timestamp: number;
}

export interface PendingWater {
  id?: number;
  amountMl: number;
  timestamp: number;
}

export interface PendingSleep {
  id?: number;
  date: string;
  durationMinutes: number;
  quality: number;
  timestamp: number;
}

export interface PendingWeight {
  id?: number;
  weight: number;
  timestamp: number;
}

export interface CachedProfile {
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

export class NouRivoDB extends Dexie {
  pendingSteps!: Table<PendingStep>;
  pendingWorkouts!: Table<PendingWorkout>;
  pendingFood!: Table<PendingFood>;
  pendingWater!: Table<PendingWater>;
  pendingSleep!: Table<PendingSleep>;
  pendingWeight!: Table<PendingWeight>;
  cachedProfile!: Table<CachedProfile>;
  runHistory!: Table<RunRecord>;

  constructor() {
    super('NouRivoDB');
    this.version(1).stores({
      pendingSteps: '++id, date, timestamp',
      pendingWorkouts: '++id, timestamp',
      pendingFood: '++id, timestamp',
      pendingWater: '++id, timestamp',
      pendingSleep: '++id, date, timestamp',
      pendingWeight: '++id, timestamp',
      cachedProfile: 'id',
    });
    this.version(2).stores({
      pendingSteps: '++id, date, timestamp',
      pendingWorkouts: '++id, timestamp',
      pendingFood: '++id, timestamp',
      pendingWater: '++id, timestamp',
      pendingSleep: '++id, date, timestamp',
      pendingWeight: '++id, timestamp',
      cachedProfile: 'id',
      runHistory: '++id, startTime, activityType, timestamp',
    });
  }
}

export const db = new NouRivoDB();

// Helper to count total pending items in sync queue
export async function getPendingSyncCount(): Promise<number> {
  const [steps, workouts, food, water, sleep, weight] = await Promise.all([
    db.pendingSteps.count(),
    db.pendingWorkouts.count(),
    db.pendingFood.count(),
    db.pendingWater.count(),
    db.pendingSleep.count(),
    db.pendingWeight.count(),
  ]);

  return steps + workouts + food + water + sleep + weight;
}

// Background Sync Engine to flush IndexedDB queue to backend
export async function flushSyncQueueToServer(token: string): Promise<number> {
  if (!navigator.onLine || !token) return 0;

  const [steps, workouts, foodLogs, waterLogs, sleepLogs, weightLogs] = await Promise.all([
    db.pendingSteps.toArray(),
    db.pendingWorkouts.toArray(),
    db.pendingFood.toArray(),
    db.pendingWater.toArray(),
    db.pendingSleep.toArray(),
    db.pendingWeight.toArray(),
  ]);

  const totalCount =
    steps.length + workouts.length + foodLogs.length + waterLogs.length + sleepLogs.length + weightLogs.length;

  if (totalCount === 0) return 0;

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        steps,
        workouts,
        foodLogs,
        waterLogs,
        sleepLogs,
        weightLogs,
      }),
    });

    if (res.ok) {
      await Promise.all([
        db.pendingSteps.clear(),
        db.pendingWorkouts.clear(),
        db.pendingFood.clear(),
        db.pendingWater.clear(),
        db.pendingSleep.clear(),
        db.pendingWeight.clear(),
      ]);
      console.log(`✅ Synced ${totalCount} items from IndexedDB to server!`);
      return totalCount;
    }
  } catch (err) {
    console.warn('⚠️ Offline sync flush attempt failed:', err);
  }

  return 0;
}
