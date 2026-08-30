import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment defaults for Vercel Serverless Function
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(process.cwd(), 'server', 'prisma', 'dev.db')}`;
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'nourivo_jwt_super_secret_key_2026_fitness_tracker';
}

import authRoutes from '../server/src/routes/auth.routes';
import dashboardRoutes from '../server/src/routes/dashboard.routes';
import stepRoutes from '../server/src/routes/step.routes';
import workoutRoutes from '../server/src/routes/workout.routes';
import foodRoutes from '../server/src/routes/food.routes';
import waterRoutes from '../server/src/routes/water.routes';
import sleepRoutes from '../server/src/routes/sleep.routes';
import weightRoutes from '../server/src/routes/weight.routes';
import achievementRoutes from '../server/src/routes/achievement.routes';
import syncRoutes from '../server/src/routes/sync.routes';
import socialRoutes from '../server/src/routes/social.routes';
import { errorHandler } from '../server/src/middleware/error.middleware';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NouRivo Full-Stack API Server',
    environment: 'Vercel Serverless Production',
    timestamp: new Date().toISOString(),
  });
});

// Full-Stack Express API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/steps', stepRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/social', socialRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
