import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

const logWaterSchema = z.object({
  amountMl: z.number().min(1),
});

// GET /api/water - Today's water intake
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const logs = await prisma.waterLog.findMany({
      where: {
        userId,
        loggedAt: { gte: todayStart },
      },
      orderBy: { loggedAt: 'desc' },
    });

    const totalMl = logs.reduce((sum, w) => sum + w.amountMl, 0);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const targetMl = user ? user.waterGoal : 2500;

    res.json({ logs, totalMl, targetMl, percentage: Math.min(100, Math.round((totalMl / targetMl) * 100)) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch water logs' });
  }
});

// POST /api/water/log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const data = logWaterSchema.parse(req.body);

    const log = await prisma.waterLog.create({
      data: {
        userId,
        amountMl: data.amountMl,
      },
    });

    // Check achievement for hydration target
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLogs = await prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: todayStart } },
    });
    const totalMl = todayLogs.reduce((sum, w) => sum + w.amountMl, 0);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user && totalMl >= user.waterGoal) {
      const existingBadge = await prisma.achievement.findFirst({
        where: { userId, code: 'HYDRATED' },
      });
      if (!existingBadge) {
        await prisma.achievement.create({
          data: {
            userId,
            code: 'HYDRATED',
            title: 'Hydration Master',
            description: `Reached daily target of ${user.waterGoal}ml water!`,
          },
        });
      }
    }

    res.status(201).json(log);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: 'Failed to log water intake' });
  }
});

export default router;
