import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  weight: z.number().optional().default(70),
  height: z.number().optional().default(175),
  age: z.number().optional().default(25),
  gender: z.string().optional().default('other'),
  stepGoal: z.number().optional().default(10000),
  waterGoal: z.number().optional().default(2500),
  calorieGoal: z.number().optional().default(2200),
  sleepGoal: z.number().optional().default(480),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  stepGoal: z.number().optional(),
  waterGoal: z.number().optional(),
  calorieGoal: z.number().optional(),
  sleepGoal: z.number().optional(),
});

// POST /api/auth/register
router.post('/register', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        weight: data.weight,
        height: data.height,
        age: data.age,
        gender: data.gender,
        stepGoal: data.stepGoal,
        waterGoal: data.waterGoal,
        calorieGoal: data.calorieGoal,
        sleepGoal: data.sleepGoal,
      },
    });

    const secret = process.env.JWT_SECRET || 'nourivo_jwt_super_secret_key_2026_fitness_tracker';
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'nourivo_jwt_super_secret_key_2026_fitness_tracker';
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data,
    });
    const { passwordHash: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
