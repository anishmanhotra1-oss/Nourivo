import { Router, Response } from 'express';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import { calculateCaloriesBurned } from '../utils/calculator';

const router = Router();

// POST /api/sync - Process offline payload flushes
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { steps, workouts, foodLogs, waterLogs, sleepLogs, weightLogs } = req.body;

    let syncedCount = 0;

    // 1. Process Sync Steps
    if (Array.isArray(steps)) {
      for (const item of steps) {
        if (item.stepCount !== undefined) {
          const dateStr = item.date || new Date().toISOString().split('T')[0];
          await prisma.stepLog.upsert({
            where: { userId_date: { userId, date: dateStr } },
            update: { stepCount: item.stepCount, source: item.source || 'sync' },
            create: { userId, date: dateStr, stepCount: item.stepCount, source: item.source || 'sync' },
          });
          syncedCount++;
        }
      }
    }

    // 2. Process Sync Workouts
    if (Array.isArray(workouts)) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const weight = user ? user.weight : 70;

      for (const w of workouts) {
        if (w.distance !== undefined && w.duration !== undefined) {
          const calories = w.caloriesBurned || calculateCaloriesBurned(w.type || 'running', weight, w.duration);
          const durationHours = w.duration / 3600;
          const avgSpeed = w.avgSpeed || (durationHours > 0 ? w.distance / durationHours : 0);

          await prisma.workout.create({
            data: {
              userId,
              type: w.type || 'running',
              startTime: w.startTime ? new Date(w.startTime) : new Date(),
              endTime: w.endTime ? new Date(w.endTime) : new Date(),
              distance: w.distance,
              duration: w.duration,
              avgSpeed: Math.round(avgSpeed * 100) / 100,
              maxSpeed: w.maxSpeed || Math.round(avgSpeed * 100) / 100,
              caloriesBurned: calories,
              routeGeoJson: w.routeGeoJson || null,
            },
          });
          syncedCount++;
        }
      }
    }

    // 3. Process Sync Food Logs
    if (Array.isArray(foodLogs)) {
      for (const f of foodLogs) {
        if (f.productName && f.calories !== undefined) {
          await prisma.foodLog.create({
            data: {
              userId,
              productBarcode: f.productBarcode || null,
              productName: f.productName,
              brand: f.brand || null,
              calories: f.calories,
              protein: f.protein || 0,
              carbs: f.carbs || 0,
              fat: f.fat || 0,
              sugar: f.sugar || 0,
              servingSize: f.servingSize || '100g',
            },
          });
          syncedCount++;
        }
      }
    }

    // 4. Process Sync Water Logs
    if (Array.isArray(waterLogs)) {
      for (const w of waterLogs) {
        if (w.amountMl) {
          await prisma.waterLog.create({
            data: {
              userId,
              amountMl: w.amountMl,
            },
          });
          syncedCount++;
        }
      }
    }

    // 5. Process Sync Sleep Logs
    if (Array.isArray(sleepLogs)) {
      for (const s of sleepLogs) {
        if (s.durationMinutes) {
          const dateStr = s.date || new Date().toISOString().split('T')[0];
          await prisma.sleepLog.upsert({
            where: { userId_date: { userId, date: dateStr } },
            update: { durationMinutes: s.durationMinutes, quality: s.quality || 3 },
            create: { userId, date: dateStr, durationMinutes: s.durationMinutes, quality: s.quality || 3 },
          });
          syncedCount++;
        }
      }
    }

    // 6. Process Sync Weight Logs
    if (Array.isArray(weightLogs)) {
      for (const w of weightLogs) {
        if (w.weight) {
          await prisma.weightLog.create({
            data: { userId, weight: w.weight },
          });
          await prisma.user.update({
            where: { id: userId },
            data: { weight: w.weight },
          });
          syncedCount++;
        }
      }
    }

    res.json({ success: true, syncedCount, syncedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process sync payload: ' + err.message });
  }
});

export default router;
