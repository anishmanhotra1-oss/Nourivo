import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

const logWeightSchema = z.object({
  weight: z.number().min(20).max(300),
});

// GET /api/weight - Weight history & trends
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const weightLogs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'asc' },
      take: 50,
    });
    res.json(weightLogs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch weight logs' });
  }
});

// POST /api/weight/log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const data = logWeightSchema.parse(req.body);

    const log = await prisma.weightLog.create({
      data: {
        userId,
        weight: data.weight,
      },
    });

    // Also update current weight on user profile
    await prisma.user.update({
      where: { id: userId },
      data: { weight: data.weight },
    });

    res.status(201).json(log);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: 'Failed to log weight' });
  }
});

export default router;
