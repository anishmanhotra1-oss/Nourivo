import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { stepService, sleepService } from '../services/api';
import { db } from '../db/dexie';
import { useAuth } from './AuthContext';

interface AutoTrackerContextType {
  autoStepCount: number;
  isPedometerActive: boolean;
  isAutoMovementActive: boolean;
  lastSleepDurationMinutes: number;
  autoTrackerStatus: 'active' | 'standby' | 'syncing';
  liveAccelerationMagnitude: number;
  isSimulatingWalking: boolean;
  pedometerSensitivity: 'high' | 'medium' | 'low';
  setPedometerSensitivity: (sensitivity: 'high' | 'medium' | 'low') => void;
  setIsPedometerActive: (active: boolean) => void;
  toggleStepSimulator: () => void;
  triggerAutoStepIncrement: (stepDelta: number) => void;
  syncStepCountToBackend: (totalSteps: number) => Promise<void>;
  requestDeviceMotionPermission: () => Promise<void>;
}

const AutoTrackerContext = createContext<AutoTrackerContextType | undefined>(undefined);

export const AutoTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [autoStepCount, setAutoStepCount] = useState(0);
  const [isPedometerActive, setIsPedometerActive] = useState(true);
  const [isAutoMovementActive, setIsAutoMovementActive] = useState(false);
  const [lastSleepDurationMinutes, setLastSleepDurationMinutes] = useState(480);
  const [autoTrackerStatus, setAutoTrackerStatus] = useState<'active' | 'standby' | 'syncing'>('active');
  const [liveAccelerationMagnitude, setLiveAccelerationMagnitude] = useState<number>(0);
  const [isSimulatingWalking, setIsSimulatingWalking] = useState(false);
  const [pedometerSensitivity, setPedometerSensitivity] = useState<'high' | 'medium' | 'low'>('medium');

  const gravityRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const slowGravityRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const gravityAccumulatorRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const gravityInitCountRef = useRef<number>(0);
  const isGravityInitializedRef = useRef<boolean>(false);
  const lastStepTimeRef = useRef<number>(0);
  const isRisingRef = useRef<boolean>(false);
  const peakMagRef = useRef<number>(0);
  const stepBufferRef = useRef<number>(0);

  // Dual Signal Refs: Heavy Slow-Gravity Unit Vector Tilt & DeviceOrientation Angle tracking
  const peakGravityUnitRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const latestOrientationRef = useRef<{ beta: number; gamma: number } | null>(null);
  const peakOrientationRef = useRef<{ beta: number; gamma: number } | null>(null);
  const isOrientationListenerAttachedRef = useRef<boolean>(false);

  const lastSleepCheckTimeRef = useRef<number>(Date.now());
  const geolocationWatchIdRef = useRef<number | null>(null);
  const syncDebounceTimerRef = useRef<any>(null);
  const simulatorTimerRef = useRef<any>(null);

  // Register DeviceOrientation Listener
  const attachOrientationListener = () => {
    if (isOrientationListenerAttachedRef.current) return;
    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.beta !== null && event.gamma !== null) {
          latestOrientationRef.current = { beta: event.beta, gamma: event.gamma };
        }
      };
      window.addEventListener('deviceorientation', handleOrientation, true);
      isOrientationListenerAttachedRef.current = true;
    }
  };

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.DeviceOrientationEvent &&
      typeof (window.DeviceOrientationEvent as any).requestPermission !== 'function'
    ) {
      attachOrientationListener();
    }
  }, []);

  // 1. Initial Load: Fetch today's step count from DB
  useEffect(() => {
    if (!user) return;

    async function initializeAutoTracker() {
      try {
        const response = await stepService.getDailySteps();
        const todayDateString = new Date().toISOString().split('T')[0];
        const todayRecord = response.stepLogs?.find((log: any) => log.date === todayDateString);
        if (todayRecord) {
          setAutoStepCount(todayRecord.stepCount);
        }
      } catch (error) {
        console.error('Auto-tracker telemetry init note:', error);
      }
    }

    initializeAutoTracker();
  }, [user]);

  // Request iOS / Android Motion Sensor Permission (Handles DeviceMotionEvent + separate iOS DeviceOrientationEvent permission)
  const requestDeviceMotionPermission = async () => {
    // 1. Request DeviceMotionEvent permission (iOS 13+)
    if (
      typeof window.DeviceMotionEvent !== 'undefined' &&
      typeof (window.DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permissionState = await (window.DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setIsPedometerActive(true);
          console.log('DeviceMotion permission granted');
        }
      } catch (error) {
        console.warn('DeviceMotion permission request error:', error);
      }
    }

    // 2. Request separate DeviceOrientationEvent permission (iOS 13+)
    if (
      typeof window.DeviceOrientationEvent !== 'undefined' &&
      typeof (window.DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const orientationPermission = await (window.DeviceOrientationEvent as any).requestPermission();
        if (orientationPermission === 'granted') {
          attachOrientationListener();
          console.log('DeviceOrientation permission granted');
        }
      } catch (error) {
        console.warn('DeviceOrientation permission request error:', error);
      }
    } else {
      attachOrientationListener();
    }
  };

  // 2. High-Precision Biomechanically Calibrated Pedometer Engine
  useEffect(() => {
    if (!user || !isPedometerActive) return;

    const SENSITIVITY_CONFIGS = {
      high: { peakThreshold: 1.2, minAmplitude: 0.6, stationaryNoiseGate: 0.35 },
      medium: { peakThreshold: 1.7, minAmplitude: 0.9, stationaryNoiseGate: 0.50 },
      low: { peakThreshold: 2.3, minAmplitude: 1.3, stationaryNoiseGate: 0.75 },
    };

    const config = SENSITIVITY_CONFIGS[pedometerSensitivity] || SENSITIVITY_CONFIGS.medium;
    const alpha = 0.88; // Fast alpha for dynamic acceleration magnitude extraction
    const slowAlpha = 0.975; // Heavy low-pass filter (alpha = 0.975) used EXCLUSIVELY for tilt-angle comparison
    let rhythmicStrideBuffer = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }

      let rawX = 0, rawY = 0, rawZ = 0;

      if (event.accelerationIncludingGravity) {
        rawX = event.accelerationIncludingGravity.x || 0;
        rawY = event.accelerationIncludingGravity.y || 0;
        rawZ = event.accelerationIncludingGravity.z || 0;
      } else if (event.acceleration) {
        rawX = event.acceleration.x || 0;
        rawY = event.acceleration.y || 0;
        rawZ = event.acceleration.z || 0;
      } else {
        return;
      }

      if (!isGravityInitializedRef.current) {
        gravityAccumulatorRef.current.x += rawX;
        gravityAccumulatorRef.current.y += rawY;
        gravityAccumulatorRef.current.z += rawZ;
        gravityInitCountRef.current += 1;

        if (gravityInitCountRef.current >= 40) {
          const initG = {
            x: gravityAccumulatorRef.current.x / 40,
            y: gravityAccumulatorRef.current.y / 40,
            z: gravityAccumulatorRef.current.z / 40,
          };
          gravityRef.current = { ...initG };
          slowGravityRef.current = { ...initG };
          isGravityInitializedRef.current = true;
        }
        return;
      }

      // Fast low-pass filter for dynamic acceleration magnitude
      gravityRef.current.x = alpha * gravityRef.current.x + (1 - alpha) * rawX;
      gravityRef.current.y = alpha * gravityRef.current.y + (1 - alpha) * rawY;
      gravityRef.current.z = alpha * gravityRef.current.z + (1 - alpha) * rawZ;

      // Heavy low-pass filter (alpha = 0.975) used EXCLUSIVELY for tilt-angle comparison
      slowGravityRef.current.x = slowAlpha * slowGravityRef.current.x + (1 - slowAlpha) * rawX;
      slowGravityRef.current.y = slowAlpha * slowGravityRef.current.y + (1 - slowAlpha) * rawY;
      slowGravityRef.current.z = slowAlpha * slowGravityRef.current.z + (1 - slowAlpha) * rawZ;

      const linX = rawX - gravityRef.current.x;
      const linY = rawY - gravityRef.current.y;
      const linZ = rawZ - gravityRef.current.z;

      const dynamicMag = Math.sqrt(linX * linX + linY * linY + linZ * linZ);
      setLiveAccelerationMagnitude(Math.round(dynamicMag * 100) / 100);

      const now = Date.now();
      const timeDelta = now - lastStepTimeRef.current;

      if (dynamicMag < config.stationaryNoiseGate) {
        isRisingRef.current = false;
        if (now - lastStepTimeRef.current > 1600) {
          rhythmicStrideBuffer = 0;
        }
        return;
      }

      // 4. DUAL INDEPENDENT GATE: Peak-Valley Magnitude + Heavy Slow-Gravity Vector Tilt Angle Oscillation
      if (dynamicMag > config.peakThreshold) {
        if (!isRisingRef.current) {
          isRisingRef.current = true;
          peakMagRef.current = dynamicMag;

          // Record unit vector from heavy slow-gravity estimate at peak
          const sGNorm = Math.sqrt(
            slowGravityRef.current.x * slowGravityRef.current.x +
            slowGravityRef.current.y * slowGravityRef.current.y +
            slowGravityRef.current.z * slowGravityRef.current.z
          );
          if (sGNorm > 0) {
            peakGravityUnitRef.current = {
              x: slowGravityRef.current.x / sGNorm,
              y: slowGravityRef.current.y / sGNorm,
              z: slowGravityRef.current.z / sGNorm,
            };
          }

          if (latestOrientationRef.current) {
            peakOrientationRef.current = { ...latestOrientationRef.current };
          }
        } else if (dynamicMag > peakMagRef.current) {
          peakMagRef.current = dynamicMag;
        }
      } else if (dynamicMag < config.peakThreshold * 0.7 && isRisingRef.current) {
        isRisingRef.current = false;
        const amplitude = peakMagRef.current - dynamicMag;

        /**
         * HEAVY SLOW-GRAVITY VECTOR TILT ANGLE OSCILLATION GATE:
         * Calculates angular deflection between the heavy slow-gravity vector (alpha=0.975) at peak vs valley.
         * Taps and vibration do not move this slow reference, producing ~0° tilt deflection (< 1.0°).
         * Real human strides produce 2.0° to 8.0° periodic tilt rotation.
         */
        let gravityTiltAngleDeg = 0;
        const sGValleyNorm = Math.sqrt(
          slowGravityRef.current.x * slowGravityRef.current.x +
          slowGravityRef.current.y * slowGravityRef.current.y +
          slowGravityRef.current.z * slowGravityRef.current.z
        );

        if (peakGravityUnitRef.current && sGValleyNorm > 0) {
          const valleyUnitX = slowGravityRef.current.x / sGValleyNorm;
          const valleyUnitY = slowGravityRef.current.y / sGValleyNorm;
          const valleyUnitZ = slowGravityRef.current.z / sGValleyNorm;

          const dot =
            peakGravityUnitRef.current.x * valleyUnitX +
            peakGravityUnitRef.current.y * valleyUnitY +
            peakGravityUnitRef.current.z * valleyUnitZ;
          const clampedDot = Math.max(-1.0, Math.min(1.0, dot));
          gravityTiltAngleDeg = (Math.acos(clampedDot) * 180) / Math.PI;
        }

        // Third Signal: DeviceOrientation pitch/roll delta (if available)
        let orientationTiltDeg = 0;
        if (peakOrientationRef.current && latestOrientationRef.current) {
          orientationTiltDeg =
            Math.abs(latestOrientationRef.current.beta - peakOrientationRef.current.beta) +
            Math.abs(latestOrientationRef.current.gamma - peakOrientationRef.current.gamma);
        }

        // Effective combined tilt angle change
        const effectiveTiltAngleDeg = Math.max(gravityTiltAngleDeg, orientationTiltDeg);

        /**
         * CADENCE & DUAL TILT ANGLE GAITS:
         * - Min Step Interval: 273ms (220 steps/min max human cadence)
         * - Min Amplitude: Configured per sensitivity preset
         * - Min Tilt Angle Oscillation: 1.8° (rejects stationary desk/table vibrations)
         */
        const MIN_STEP_INTERVAL_MS = 273; // 220 steps/min maximum human cadence floor
        const MAX_STEP_INTERVAL_MS = 1200; // 50 steps/min minimum human cadence ceiling
        const MIN_TILT_ANGLE_DEG = 1.8; // Minimum tilt oscillation required for human stride

        if (
          amplitude >= config.minAmplitude &&
          effectiveTiltAngleDeg >= MIN_TILT_ANGLE_DEG &&
          timeDelta >= MIN_STEP_INTERVAL_MS &&
          timeDelta <= MAX_STEP_INTERVAL_MS
        ) {
          lastStepTimeRef.current = now;
          rhythmicStrideBuffer++;

          if (rhythmicStrideBuffer >= 3) {
            // When reaching 3 consecutive rhythmic strides, credit the initial 3 steps, then 1 step per stride
            const stepsToAdd = rhythmicStrideBuffer === 3 ? 3 : 1;
            triggerAutoStepIncrement(stepsToAdd);
          }
        } else if (timeDelta > MAX_STEP_INTERVAL_MS || effectiveTiltAngleDeg < MIN_TILT_ANGLE_DEG) {
          // Reset buffer if tilt oscillation condition is broken
          if (timeDelta > MAX_STEP_INTERVAL_MS) {
            rhythmicStrideBuffer = 0;
          }
        }
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion, true);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleDeviceMotion, true);
      }
    };
  }, [user, isPedometerActive, pedometerSensitivity]);



  // 3. Step Simulator Engine for Desktop / Indoor Testing
  const toggleStepSimulator = () => {
    if (isSimulatingWalking) {
      if (simulatorTimerRef.current) {
        clearInterval(simulatorTimerRef.current);
        simulatorTimerRef.current = null;
      }
      setIsSimulatingWalking(false);
    } else {
      setIsSimulatingWalking(true);
      if (simulatorTimerRef.current) clearInterval(simulatorTimerRef.current);
      simulatorTimerRef.current = setInterval(() => {
        const simulatedMag = Math.round((1.7 + Math.random() * 0.9) * 100) / 100;
        setLiveAccelerationMagnitude(simulatedMag);
        triggerAutoStepIncrement(1);
      }, 420);
    }
  };


  useEffect(() => {
    return () => {
      if (simulatorTimerRef.current) clearInterval(simulatorTimerRef.current);
    };
  }, []);

  // 4. Background GPS Movement Detection
  useEffect(() => {
    if (!user || !('geolocation' in navigator)) return;

    geolocationWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const speedKmh = position.coords.speed ? position.coords.speed * 3.6 : 0;
        if (speedKmh > 2.0) {
          setIsAutoMovementActive(true);
        } else {
          setIsAutoMovementActive(false);
        }
      },
      (error) => {},
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 }
    );

    return () => {
      if (geolocationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geolocationWatchIdRef.current);
      }
    };
  }, [user]);

  // 5. Automatic Sleep Duration Detection on Morning Unlock
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const currentTime = Date.now();
        const durationHours = (currentTime - lastSleepCheckTimeRef.current) / (1000 * 60 * 60);
        const currentHour = new Date().getHours();

        if (durationHours >= 5 && (currentHour >= 5 && currentHour <= 10)) {
          const autoSleepMinutes = Math.min(600, Math.round(durationHours * 60));
          setLastSleepDurationMinutes(autoSleepMinutes);
          try {
            await sleepService.logSleep(autoSleepMinutes, 4);
          } catch (error) {
            console.error('Auto sleep detection log note:', error);
          }
        }
        lastSleepCheckTimeRef.current = currentTime;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const syncStepCountToBackend = async (totalSteps: number) => {
    setAutoTrackerStatus('syncing');
    try {
      if (navigator.onLine) {
        await stepService.logSteps(totalSteps, undefined, 'auto_pedometer');
      } else {
        await db.pendingSteps.add({
          date: new Date().toISOString().split('T')[0],
          stepCount: totalSteps,
          source: 'auto_pedometer',
          timestamp: Date.now(),
        });
      }
      setAutoTrackerStatus('active');
    } catch (error) {
      console.error('Failed to sync auto-tracker step count:', error);
      setAutoTrackerStatus('standby');
    }
  };

  // Auto Step Increment & Debounced Background Sync
  const triggerAutoStepIncrement = (stepDelta: number) => {
    setAutoStepCount((prevSteps) => {
      const newTotal = prevSteps + stepDelta;

      if (syncDebounceTimerRef.current) {
        clearTimeout(syncDebounceTimerRef.current);
      }

      syncDebounceTimerRef.current = setTimeout(() => {
        syncStepCountToBackend(newTotal);
      }, 1200);

      return newTotal;
    });
  };

  return (
    <AutoTrackerContext.Provider
      value={{
        autoStepCount,
        isPedometerActive,
        isAutoMovementActive,
        lastSleepDurationMinutes,
        autoTrackerStatus,
        liveAccelerationMagnitude,
        isSimulatingWalking,
        pedometerSensitivity,
        setPedometerSensitivity,
        setIsPedometerActive,
        toggleStepSimulator,
        triggerAutoStepIncrement,
        syncStepCountToBackend,
        requestDeviceMotionPermission,
      }}
    >
      {children}
    </AutoTrackerContext.Provider>
  );


};

export const useAutoTracker = () => {
  const context = useContext(AutoTrackerContext);
  if (!context) {
    throw new Error('useAutoTracker must be used within an AutoTrackerProvider');
  }
  return context;
};

