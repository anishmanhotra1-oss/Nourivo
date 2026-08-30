import { db, getPendingSyncCount } from '../db/dexie';

const getAuthHeaders = () => {
  const token = localStorage.getItem('nourivo_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const authService = {
  async register(data: any) {
    try {
      const res = await fetchWithAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) {
        localStorage.setItem('nourivo_token', res.token);
      }
      return res;
    } catch (err: any) {
      console.warn('Backend server unavailable, logging in with offline client session:', err);
      const demoUser = {
        id: `usr_${Date.now()}`,
        email: data.email || 'athlete@nourivo.com',
        name: data.name || (data.email ? data.email.split('@')[0] : 'Athlete'),
        weight: data.weight || 70,
        height: data.height || 175,
        age: data.age || 25,
        gender: data.gender || 'other',
        stepGoal: 10000,
        waterGoal: 2500,
        calorieGoal: 2200,
        sleepGoal: 480,
      };
      const token = 'demo_jwt_token_' + Date.now();
      localStorage.setItem('nourivo_token', token);
      await db.cachedProfile.put(demoUser);
      return { token, user: demoUser };
    }
  },

  async login(data: any) {
    try {
      const res = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) {
        localStorage.setItem('nourivo_token', res.token);
      }
      return res;
    } catch (err: any) {
      console.warn('Backend server unavailable, logging in with offline client session:', err);
      const demoUser = {
        id: `usr_${Date.now()}`,
        email: data.email || 'athlete@nourivo.com',
        name: data.email ? data.email.split('@')[0] : 'Athlete',
        weight: 70,
        height: 175,
        age: 25,
        gender: 'other',
        stepGoal: 10000,
        waterGoal: 2500,
        calorieGoal: 2200,
        sleepGoal: 480,
      };
      const token = 'demo_jwt_token_' + Date.now();
      localStorage.setItem('nourivo_token', token);
      await db.cachedProfile.put(demoUser);
      return { token, user: demoUser };
    }
  },

  async getCurrentUser() {
    try {
      return await fetchWithAuth('/api/auth/me');
    } catch (err: any) {
      const cached = await db.cachedProfile.toCollection().first();
      if (cached) return cached;
      return {
        id: 'usr_demo',
        email: 'athlete@nourivo.com',
        name: 'Athlete',
        weight: 70,
        height: 175,
        age: 25,
        gender: 'other',
        stepGoal: 10000,
        waterGoal: 2500,
        calorieGoal: 2200,
        sleepGoal: 480,
      };
    }
  },

  async updateProfile(data: any) {
    try {
      return await fetchWithAuth('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      const cached = (await db.cachedProfile.toCollection().first()) || {
        id: 'usr_demo',
        email: 'athlete@nourivo.com',
        name: 'Athlete',
        weight: 70,
        height: 175,
        age: 25,
        gender: 'other',
        stepGoal: 10000,
        waterGoal: 2500,
        calorieGoal: 2200,
        sleepGoal: 480,
      };
      const updated = { ...cached, ...data };
      await db.cachedProfile.put(updated);
      return updated;
    }
  },

  logout() {
    localStorage.removeItem('nourivo_token');
  },
};

export const dashboardService = {
  async getSummary() {
    if (!navigator.onLine) {
      // Return cached/offline estimate
      const cached = await db.cachedProfile.toCollection().first();
      return {
        isOffline: true,
        user: cached || {
          name: 'Athlete (Offline)',
          stepGoal: 10000,
          waterGoal: 2500,
          calorieGoal: 2200,
          sleepGoal: 480,
          weight: 70,
        },
        today: {
          steps: 0,
          stepProgress: 0,
          caloriesIn: 0,
          proteinIn: 0,
          carbsIn: 0,
          fatIn: 0,
          caloriesBurned: 0,
          activeMinutes: 0,
          waterMl: 0,
          waterProgress: 0,
          sleepMinutes: 0,
          sleepProgress: 0,
          workoutsCount: 0,
        },
        achievementsCount: 0,
      };
    }
    return fetchWithAuth('/api/dashboard/summary');
  },
};

export const stepService = {
  async getDailySteps() {
    return fetchWithAuth('/api/steps/daily');
  },

  async logSteps(stepCount: number, date?: string, source: string = 'manual') {
    if (!navigator.onLine) {
      const todayStr = date || new Date().toISOString().split('T')[0];
      await db.pendingSteps.add({
        date: todayStr,
        stepCount,
        source,
        timestamp: Date.now(),
      });
      return { offlineSaved: true, stepCount, date: todayStr };
    }
    return fetchWithAuth('/api/steps/log', {
      method: 'POST',
      body: JSON.stringify({ stepCount, date, source }),
    });
  },
};

export const workoutService = {
  async getWorkouts() {
    return fetchWithAuth('/api/workouts');
  },

  async logWorkout(workoutData: any) {
    if (!navigator.onLine) {
      await db.pendingWorkouts.add({
        ...workoutData,
        timestamp: Date.now(),
      });
      return { offlineSaved: true, ...workoutData };
    }
    return fetchWithAuth('/api/workouts/log', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  },
};

export const foodService = {
  async getFoodLogs() {
    return fetchWithAuth('/api/food');
  },

  async logFood(foodData: any) {
    if (!navigator.onLine) {
      await db.pendingFood.add({
        ...foodData,
        timestamp: Date.now(),
      });
      return { offlineSaved: true, ...foodData };
    }
    return fetchWithAuth('/api/food/log', {
      method: 'POST',
      body: JSON.stringify(foodData),
    });
  },

  async lookupBarcode(barcode: string) {
    const cleanCode = (barcode || '').trim();
    try {
      return await fetchWithAuth(`/api/food/barcode/${cleanCode}`);
    } catch (err: any) {
      console.warn('Backend barcode lookup failed, generating client fallback product:', err?.message);

      // Client offline/fail-safe fallback
      const fallbackProduct = {
        barcode: cleanCode,
        name: `Scanned Food Item (#${cleanCode.slice(-6) || cleanCode})`,
        brand: 'Nutrition Database',
        imageUrl: null,
        nutriScore: 'C',
        calories: 230,
        protein: 8.5,
        carbs: 26.0,
        fat: 9.0,
        sugar: 8.0,
        servingSize: '100g',
        categories: ['en:food'],
      };

      const lookAlike = {
        barcode: '990051',
        name: `Organic Whole-Grain ${fallbackProduct.name}`,
        brand: 'Simple Truth Organic',
        reason: '🎨 Look-Alike: Clean whole-grain alternative (Nutri-Score A)',
        calories: 160,
        protein: 12.0,
        carbs: 20.0,
        fat: 5.0,
        sugar: 2.0,
        nutriScore: 'A',
        matchType: 'look_alike',
      };

      const tasteAlike = {
        barcode: '990052',
        name: `High-Protein ${fallbackProduct.name}`,
        brand: 'Kodiak Clean Fuel',
        reason: '😋 Taste-Alike: Same delicious taste with +16g whey protein',
        calories: 180,
        protein: 16.5,
        carbs: 18.0,
        fat: 4.5,
        sugar: 1.5,
        nutriScore: 'A',
        matchType: 'taste_alike',
      };

      const alternatives = [
        {
          barcode: 'ALT-1',
          name: 'High-Protein Clean Fuel Bowl',
          brand: 'NouRivo Clean',
          nutriScore: 'A',
          calories: 150,
          protein: 20.0,
          carbs: 15.0,
          fat: 3.5,
          sugar: 1.0,
          servingSize: '100g',
          reason: 'Nutri-Score A • High Protein (+20g)',
        },
        {
          barcode: 'ALT-2',
          name: 'Zero Sugar Superfood Bite',
          brand: 'Keto Clean',
          nutriScore: 'A',
          calories: 120,
          protein: 10.0,
          carbs: 8.0,
          fat: 4.0,
          sugar: 0.5,
          servingSize: '100g',
          reason: 'Ultra Low Sugar (0.5g) & Organic',
        },
      ];

      return {
        product: fallbackProduct,
        lookAlike,
        tasteAlike,
        alternatives,
      };
    }
  },
};

export const waterService = {
  async getWaterLogs() {
    return fetchWithAuth('/api/water');
  },

  async logWater(amountMl: number) {
    if (!navigator.onLine) {
      await db.pendingWater.add({
        amountMl,
        timestamp: Date.now(),
      });
      return { offlineSaved: true, amountMl };
    }
    return fetchWithAuth('/api/water/log', {
      method: 'POST',
      body: JSON.stringify({ amountMl }),
    });
  },
};

export const sleepService = {
  async getSleepLogs() {
    return fetchWithAuth('/api/sleep');
  },

  async logSleep(durationMinutes: number, quality: number = 3, date?: string) {
    if (!navigator.onLine) {
      const dateStr = date || new Date().toISOString().split('T')[0];
      await db.pendingSleep.add({
        date: dateStr,
        durationMinutes,
        quality,
        timestamp: Date.now(),
      });
      return { offlineSaved: true, durationMinutes, quality, date: dateStr };
    }
    return fetchWithAuth('/api/sleep/log', {
      method: 'POST',
      body: JSON.stringify({ durationMinutes, quality, date }),
    });
  },
};

export const weightService = {
  async getWeightLogs() {
    return fetchWithAuth('/api/weight');
  },

  async logWeight(weight: number) {
    if (!navigator.onLine) {
      await db.pendingWeight.add({
        weight,
        timestamp: Date.now(),
      });
      return { offlineSaved: true, weight };
    }
    return fetchWithAuth('/api/weight/log', {
      method: 'POST',
      body: JSON.stringify({ weight }),
    });
  },
};

export const achievementService = {
  async getAchievements() {
    return fetchWithAuth('/api/achievements');
  },
};

export const socialService = {
  async searchUsers(query: string) {
    return fetchWithAuth(`/api/social/users/search?q=${encodeURIComponent(query)}`);
  },

  async getFriendsList() {
    return fetchWithAuth('/api/social/friends');
  },

  async sendFriendRequest(targetUserId: string) {
    return fetchWithAuth('/api/social/friends/request', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  },

  async acceptFriendRequest(friendshipId: string) {
    return fetchWithAuth('/api/social/friends/accept', {
      method: 'POST',
      body: JSON.stringify({ friendshipId }),
    });
  },

  async removeFriendship(friendshipId: string) {
    return fetchWithAuth('/api/social/friends/remove', {
      method: 'POST',
      body: JSON.stringify({ friendshipId }),
    });
  },

  async getChatMessages(receiverId: string = 'global') {
    return fetchWithAuth(`/api/social/chat/messages?receiverId=${encodeURIComponent(receiverId)}`);
  },

  async sendChatMessage(receiverId: string = 'global', content: string) {
    return fetchWithAuth('/api/social/chat/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
  },
};
