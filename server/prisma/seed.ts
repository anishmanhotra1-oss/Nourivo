import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing clean NouRivo database schema & seeding demo user...');

  // Clean existing tables to ensure clean slate
  await prisma.chatMessage.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.weightLog.deleteMany();
  await prisma.sleepLog.deleteMany();
  await prisma.waterLog.deleteMany();
  await prisma.foodLog.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.stepLog.deleteMany();
  await prisma.user.deleteMany();

  // Create Alex Morgan Demo Account (demo@nourivo.app / password123)
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@nourivo.app',
      passwordHash,
      name: 'Alex Morgan',
      weight: 68.5,
      height: 172.0,
      age: 27,
      gender: 'female',
      stepGoal: 10000,
      waterGoal: 2500,
      calorieGoal: 2200,
      sleepGoal: 480,
    },
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Seed Step Log
  await prisma.stepLog.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      stepCount: 7850,
      source: 'auto_pedometer',
    },
  });

  // Seed Sample Workout
  await prisma.workout.create({
    data: {
      userId: demoUser.id,
      type: 'running',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(),
      distance: 5.2,
      duration: 1800,
      avgSpeed: 10.4,
      maxSpeed: 14.2,
      caloriesBurned: 420,
      routeGeoJson: JSON.stringify([
        [28.6139, 77.2090],
        [28.6150, 77.2105],
        [28.6165, 77.2120],
        [28.6180, 77.2135],
        [28.6139, 77.2090],
      ]),
    },
  });

  // Seed Sample Food Logs
  await prisma.foodLog.create({
    data: {
      userId: demoUser.id,
      productName: 'Greek Yogurt Bowl with Berries',
      calories: 240,
      protein: 18,
      carbs: 28,
      fat: 4,
      sugar: 12,
      servingSize: '1 bowl',
    },
  });

  // Seed Water Log
  await prisma.waterLog.create({
    data: {
      userId: demoUser.id,
      amountMl: 1500,
    },
  });

  // Seed Sleep Log
  await prisma.sleepLog.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      durationMinutes: 460,
      quality: 4,
    },
  });

  console.log('✅ NouRivo Demo Account successfully created!');
  console.log('📧 Email: demo@nourivo.app');
  console.log('🔑 Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Database seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

