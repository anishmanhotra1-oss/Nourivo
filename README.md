# NouRivo 🏃⚡ — Full-Stack Fitness & Barcode Nutrition PWA

**NouRivo** is a production-ready, full-stack fitness, GPS workout, and barcode nutrition tracking Progressive Web Application (PWA). Designed with a sleek dark aesthetic (`#0A0A0A`), vibrant blue accents (`#2563EB`), smooth glassmorphic UI, real-time Leaflet route mapping, and offline-first IndexedDB background sync.

---

## 🌟 Key Features

1. **🔐 Authentication & User Profiles**
   - JWT-based authorization, bcrypt password hashing, persistent sessions.
   - Customized goals for daily steps, water intake, calories, and sleep.

2. **👟 Step Tracking & Motion Sensor Pedometer**
   - Real-time step counter supporting device motion sensor API (`devicemotion`) + manual logging.
   - 30-day visual step charts (Recharts) and daily streak counters.

3. **🏃 Live GPS Workout Tracking & Leaflet Route Maps**
   - Live location tracking with `navigator.geolocation.watchPosition`.
   - Real-time Leaflet & OpenStreetMap route drawing with custom glowing markers.
   - Calculates distance (km), duration (HH:MM:SS), pace (min/km), average speed, and MET-based calories burned.

4. **🥗 Camera Barcode Nutrition Scanner (Open Food Facts)**
   - Real-time mobile camera barcode scanner powered by `html5-qrcode` + manual input fallback.
   - Fetches calories, protein, carbs, fat, and sugar per serving from Open Food Facts API.
   - **Healthier Product Recommendation Engine:** Analyzes scanned item category and suggests 2-3 healthier options (higher protein, lower sugar, lower calories).

5. **📶 Offline-First PWA & IndexedDB Sync Engine**
   - Progressive Web App (PWA) with service worker offline app shell precaching (`vite-plugin-pwa`).
   - Steps, workouts, water, sleep, weight, and food logged offline are queued in `IndexedDB` (`Dexie.js`).
   - Automatically flushes queued offline records to `/api/sync` when network connection is restored.

6. **💧 Hydration, 😴 Sleep Quality & ⚖️ Weight Trends**
   - Water tracker with interactive quick add buttons (+250ml, +500ml).
   - Sleep duration & 1-5 star quality logging with weekly recovery trends.
   - Weight history logger with visual line chart.

7. **🏆 Achievement Milestones & Celebration**
   - Unlocked fitness badges (First Workout, 10K Step Crusher, Hydration Master, etc.) with `canvas-confetti` animations.

---

## 🏗️ Architecture & Tech Stack

```
                              ┌───────────────────────────────────┐
                              │            NouRivo PWA            │
                              │ React 18 + Vite + Tailwind + TS   │
                              └─────────────────┬─────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
          ┌───────────────────────────┐                     ┌───────────────────────────┐
          │  Offline Layer (Dexie.js) │                     │ Location, Map & Camera    │
          │ IndexedDB Sync Queue      │                     │ Leaflet + html5-qrcode    │
          └────────────┬──────────────┘                     └───────────────────────────┘
                       │ (Background Auto-Sync)
                       ▼
          ┌───────────────────────────┐
          │   REST API Backend        │
          │ Node.js + Express + TS    │
          └────────────┬──────────────┘
                       │ Prisma ORM
                       ▼
          ┌───────────────────────────┐
          │ PostgreSQL / SQLite DB    │
          └───────────────────────────┘
```

---

## ⚡ Quick Start & Development Setup

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **NPM**: v9.x or v10.x+
- *(Optional)* **Docker & Docker Compose** (for running PostgreSQL)

---

### Step 1: Backend Setup & Database Migration

```bash
# 1. Navigate to server directory
cd server

# 2. Install backend dependencies
npm install

# 3. Environment configuration (.env is preconfigured for SQLite zero-config local dev)
# For PostgreSQL docker, update DATABASE_URL in .env
cp .env.example .env

# 4. Push Prisma schema & generate client
npx prisma db push

# 5. Seed initial demo data (Alex Morgan demo account + activities)
npm run db:seed

# 6. Start the API development server
npm run dev
```

*Backend API will run on **http://localhost:5000***

> **Docker PostgreSQL Option:**
> If you prefer PostgreSQL, run `docker compose up -d` in the root folder, then set `DATABASE_URL="postgresql://nourivo:nourivo_pass@localhost:5432/nourivo_db?schema=public"` in `server/.env`. Change provider to `"postgresql"` in `server/prisma/schema.prisma` and run `npx prisma db push`.

---

### Step 2: Frontend Setup & Dev Server

```bash
# 1. Open a new terminal and navigate to client directory
cd client

# 2. Install frontend dependencies
npm install

# 3. Start Vite development server
npm run dev
```

*Frontend app will run on **http://localhost:3000***

---

## 👤 Default Seeded Login Credentials

- **Email:** `demo@nourivo.app`
- **Password:** `password123`

---

## 📱 PWA & Mobile Installation

1. Build the production app bundle:
   ```bash
   cd client
   npm run build
   ```
2. Preview production build locally:
   ```bash
   npm run preview
   ```
3. Open the URL on a mobile device or browser. Click **"Add to Home Screen"** or the Install PWA prompt to install **NouRivo** as a native app on iOS or Android.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | User signup |
| `POST` | `/api/auth/login` | User login (returns JWT token) |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `PUT` | `/api/auth/profile` | Update profile targets & weight |
| `GET` | `/api/dashboard/summary` | Today's aggregate dashboard metrics |
| `GET` | `/api/steps/daily` | Step history & streak statistics |
| `POST` | `/api/steps/log` | Log or update steps count |
| `GET` | `/api/workouts` | Past GPS workout sessions |
| `POST` | `/api/workouts/log` | Save workout with GeoJSON route & MET stats |
| `GET` | `/api/food` | Today's food log & macro totals |
| `POST` | `/api/food/log` | Log food item |
| `GET` | `/api/food/barcode/:code` | Open Food Facts lookup + healthier alternatives |
| `GET` | `/api/water` | Today's water intake total |
| `POST` | `/api/water/log` | Add water intake entry |
| `GET` | `/api/sleep` | Sleep logs history |
| `POST` | `/api/sleep/log` | Record sleep duration & quality |
| `GET` | `/api/weight` | Body weight trend logs |
| `POST` | `/api/weight/log` | Record weight entry |
| `GET` | `/api/achievements` | Unlocked badges & milestones |
| `POST` | `/api/sync` | Process bulk IndexedDB offline sync queue |
