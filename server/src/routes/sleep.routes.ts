import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

const logSleepSchema = z.object({
  date: z.string().optional(), // ISO YYYY-MM-DD
  durationMinutes: z.number().min(0),
  quality: z.number().min(1).max(5).optional().default(3),
});

// GET /api/sleep - Weekly sleep logs
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const sleepLogs = await prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 14,
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const targetMinutes = user ? user.sleepGoal : 480;

    res.json({ sleepLogs: sleepLogs.reverse(), targetMinutes });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch sleep logs' });
  }
});

// POST /api/sleep/log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const data = logSleepSchema.parse(req.body);
    const dateStr = data.date || new Date().toISOString().split('T')[0];

    const sleepLog = await prisma.sleepLog.upsert({
      where: { userId_date: { userId, date: dateStr } },
      update: {
        durationMinutes: data.durationMinutes,
        quality: data.quality,
      },
      create: {
        userId,
        date: dateStr,
        durationMinutes: data.durationMinutes,
        quality: data.quality,
      },
    });

    res.json(sleepLog);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: 'Failed to log sleep' });
  }
});

export default router;
