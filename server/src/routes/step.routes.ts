import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

const logStepSchema = z.object({
  date: z.string().optional(), // ISO YYYY-MM-DD
  stepCount: z.number().min(0),
  source: z.string().optional().default('manual'),
});

// GET /api/steps/daily
router.get('/daily', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const stepLogs = await prisma.stepLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const stepGoal = user ? user.stepGoal : 10000;

    // Compute Streak (consecutive days stepGoal reached)
    let streak = 0;
    const sortedLogs = [...stepLogs].sort((a, b) => b.date.localeCompare(a.date));
    
    for (const log of sortedLogs) {
      if (log.stepCount >= stepGoal) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ stepLogs: sortedLogs.reverse(), streak, stepGoal });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch step logs' });
  }
});

// POST /api/steps/log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const data = logStepSchema.parse(req.body);
    const dateStr = data.date || new Date().toISOString().split('T')[0];

    const stepLog = await prisma.stepLog.upsert({
      where: { userId_date: { userId, date: dateStr } },
      update: {
        stepCount: data.stepCount,
        source: data.source,
      },
      create: {
        userId,
        date: dateStr,
        stepCount: data.stepCount,
        source: data.source,
      },
    });

    // Check achievement 10k steps
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && data.stepCount >= user.stepGoal) {
      const existingBadge = await prisma.achievement.findFirst({
        where: { userId, code: 'STEPS_10K' },
      });
      if (!existingBadge) {
        await prisma.achievement.create({
          data: {
            userId,
            code: 'STEPS_10K',
            title: 'Goal Crusher',
            description: `Reached your target of ${user.stepGoal} steps!`,
          },
        });
      }
    }

    res.json(stepLog);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: 'Failed to log steps' });
  }
});

export default router;
