import { Router, Response } from 'express';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/achievements
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const userAchievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    const allBadges = [
      {
        code: 'FIRST_RUN',
        title: 'First Step',
        description: 'Complete your first workout session',
        icon: '🏃',
      },
      {
        code: 'STEPS_10K',
        title: '10K Crusher',
        description: 'Reach 10,000 steps in a single day',
        icon: '👟',
      },
      {
        code: 'HYDRATED',
        title: 'Hydration Master',
        description: 'Hit your daily water target',
        icon: '💧',
      },
      {
        code: 'NUTRITION_MASTER',
        title: 'Nutrition Master',
        description: 'Log 5 healthy meals using the barcode scanner',
        icon: '🥗',
      },
      {
        code: 'CENTURION_RUN',
        title: 'Distance Warrior',
        description: 'Log over 25km of total running distance',
        icon: '🥇',
      },
    ];

    const unlockedCodes = new Set(userAchievements.map((a) => a.code));

    const result = allBadges.map((badge) => {
      const earned = userAchievements.find((a) => a.code === badge.code);
      return {
        ...badge,
        unlocked: unlockedCodes.has(badge.code),
        earnedAt: earned ? earned.earnedAt : null,
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

export default router;
