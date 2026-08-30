import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import { calculateCaloriesBurned } from '../utils/calculator';

const router = Router();

const logWorkoutSchema = z.object({
  type: z.string().default('running'),
  startTime: z.string(),
  endTime: z.string(),
  distance: z.number().min(0), // km
  duration: z.number().min(0), // seconds
  avgSpeed: z.number().optional(), // km/h
  maxSpeed: z.number().optional(), // km/h
  caloriesBurned: z.number().optional(),
  routeGeoJson: z.string().optional(),
  averagePace: z.string().optional(),
  elevationGain: z.number().optional(),
  cadence: z.number().optional(),
  activeDuration: z.number().optional(),
});

// GET /api/workouts
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 50,
    });
    res.json(workouts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// POST /api/workouts/log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const data = logWorkoutSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userWeight = user ? user.weight : 70;

    // Calculate calories if not provided
    const caloriesBurned =
      data.caloriesBurned && data.caloriesBurned > 0
        ? data.caloriesBurned
        : calculateCaloriesBurned(data.type, userWeight, data.duration);

    // Calculate average speed in km/h if duration > 0 and speed not provided
    const durationHours = data.duration / 3600;
    const computedAvgSpeed =
      data.avgSpeed !== undefined && data.avgSpeed >= 0
        ? data.avgSpeed
        : durationHours > 0
        ? Math.round((data.distance / durationHours) * 100) / 100
        : 0;

    const workout = await prisma.workout.create({
      data: {
        userId,
        type: data.type,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        distance: data.distance,
        duration: data.duration,
        avgSpeed: computedAvgSpeed,
        maxSpeed: data.maxSpeed || computedAvgSpeed,
        caloriesBurned,
        routeGeoJson: data.routeGeoJson || null,
        averagePace: data.averagePace || null,
        elevationGain: data.elevationGain || null,
        cadence: data.cadence || null,
        activeDuration: data.activeDuration || null,
      },
    });

    // Check achievement for first workout
    const firstRunBadge = await prisma.achievement.findFirst({
      where: { userId, code: 'FIRST_RUN' },
    });
    if (!firstRunBadge) {
      await prisma.achievement.create({
        data: {
          userId,
          code: 'FIRST_RUN',
          title: 'First Workout Logged',
          description: `Completed your first ${data.type} session!`,
        },
      });
    }

    res.status(201).json(workout);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

export default router;
