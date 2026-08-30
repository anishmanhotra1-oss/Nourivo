import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import stepRoutes from './routes/step.routes';
import workoutRoutes from './routes/workout.routes';
import foodRoutes from './routes/food.routes';
import waterRoutes from './routes/water.routes';
import sleepRoutes from './routes/sleep.routes';
import weightRoutes from './routes/weight.routes';
import achievementRoutes from './routes/achievement.routes';
import syncRoutes from './routes/sync.routes';
import socialRoutes from './routes/social.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Root & Health Check
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; background: #0a0a0a; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <h1 style="color: #3b82f6; margin-bottom: 8px;">🚀 NouRivo API Server</h1>
      <p style="color: #9ca3af; font-size: 1.1rem;">The backend API server is running on <strong>Port 5000</strong>.</p>
      <p style="margin-top: 16px;">👉 To open the <strong>User Interface (Web App)</strong>, visit: <a href="http://localhost:3030" style="color: #60a5fa; font-weight: bold;">http://localhost:3030</a></p>
    </div>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NouRivo Fitness API', timestamp: new Date().toISOString() });
});

// API Routes
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

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 NouRivo API Server running on http://localhost:${PORT}`);
});
