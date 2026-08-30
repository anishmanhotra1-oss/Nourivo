import { Router, Response } from 'express';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const todayStr = new Date().toISOString().split('T')[0];

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Fetch Today's Steps
    const stepLog = await prisma.stepLog.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });
    const todaySteps = stepLog ? stepLog.stepCount : 0;

    // Fetch Today's Food / Calories In & Macros
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const foodLogs = await prisma.foodLog.findMany({
      where: {
        userId,
        loggedAt: { gte: todayStart },
      },
    });

    const caloriesIn = Math.round(foodLogs.reduce((sum, f) => sum + f.calories, 0));
    const proteinIn = Math.round(foodLogs.reduce((sum, f) => sum + f.protein, 0) * 10) / 10;
    const carbsIn = Math.round(foodLogs.reduce((sum, f) => sum + f.carbs, 0) * 10) / 10;
    const fatIn = Math.round(foodLogs.reduce((sum, f) => sum + f.fat, 0) * 10) / 10;

    // Fetch Today's Workouts & Calories Burned
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        startTime: { gte: todayStart },
      },
    });

    const workoutCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const activeMinutes = Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / 60);

    // Step calorie burn estimation (~0.04 calories per step)
    const stepCalories = Math.round(todaySteps * 0.04);
    const totalCaloriesBurned = Math.round(workoutCalories + stepCalories);

    // Fetch Today's Water
    const waterLogs = await prisma.waterLog.findMany({
      where: {
        userId,
        loggedAt: { gte: todayStart },
      },
    });
    const todayWater = waterLogs.reduce((sum, w) => sum + w.amountMl, 0);

    // Fetch Today's Sleep
    const sleepLog = await prisma.sleepLog.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });
    const todaySleepMinutes = sleepLog ? sleepLog.durationMinutes : 0;

    // Fetch Latest Weight
    const latestWeightLog = await prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
    });
    const currentWeight = latestWeightLog ? latestWeightLog.weight : user.weight;

    // Achievements count
    const achievementsCount = await prisma.achievement.count({ where: { userId } });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        stepGoal: user.stepGoal,
        waterGoal: user.waterGoal,
        calorieGoal: user.calorieGoal,
        sleepGoal: user.sleepGoal,
        weight: currentWeight,
      },
      today: {
        steps: todaySteps,
        stepProgress: Math.min(100, Math.round((todaySteps / user.stepGoal) * 100)),
        caloriesIn,
        proteinIn,
        carbsIn,
        fatIn,
        caloriesBurned: totalCaloriesBurned,
        activeMinutes,
        waterMl: todayWater,
        waterProgress: Math.min(100, Math.round((todayWater / user.waterGoal) * 100)),
        sleepMinutes: todaySleepMinutes,
        sleepProgress: Math.min(100, Math.round((todaySleepMinutes / user.sleepGoal) * 100)),
        workoutsCount: workouts.length,
      },
      achievementsCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate dashboard summary' });
  }
});

export default router;
