// Motion Sensor Manager — Accelerometer, Gyroscope & Cadence Estimation

export interface MotionSample {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  timestamp: number;
}

export interface MotionState {
  accelerationMagnitude: number;
  cadenceSpm: number;           // steps per minute
  stepCount: number;            // total detected steps
  isRhythmicMovement: boolean;  // periodic gait detected
  movementIntensity: 'none' | 'low' | 'moderate' | 'high';
  timestamp: number;
}

export interface MotionCallbacks {
  onMotionUpdate: (state: MotionState) => void;
  onStepDetected: (totalSteps: number) => void;
}

class MotionSensorManagerService {
  private callbacks: MotionCallbacks | null = null;
  private isActive = false;
  private stepCount = 0;

  // Gravity estimation via low-pass filter
  private gravity = { x: 0, y: 0, z: 0 };
  private gravityInitialized = false;
  private gravityInitCount = 0;
  private gravityAccumulator = { x: 0, y: 0, z: 0 };

  // Step detection state
  private lastStepTime = 0;
  private isRising = false;
  private peakMag = 0;
  private rhythmicStrideBuffer = 0;
  private recentStepIntervals: number[] = [];

  // Cadence calculation
  private cadenceSpm = 0;
  private lastCadenceCalcTime = 0;

  // Movement intensity
  private recentMagnitudes: number[] = [];

  // Bound handler ref for cleanup
  private boundMotionHandler: ((e: DeviceMotionEvent) => void) | null = null;

  // Configuration
  private readonly GRAVITY_ALPHA = 0.88;
  private readonly PEAK_THRESHOLD = 1.5;
  private readonly MIN_AMPLITUDE = 0.8;
  private readonly NOISE_GATE = 0.4;
  private readonly MIN_STEP_INTERVAL_MS = 273;  // 220 steps/min max
  private readonly MAX_STEP_INTERVAL_MS = 1200; // 50 steps/min min

  /**
   * Request motion sensor permissions (iOS 13+).
   * Returns true if permission granted or not required.
   */
  public async requestPermission(): Promise<boolean> {
    // DeviceMotionEvent permission (iOS)
    if (
      typeof window.DeviceMotionEvent !== 'undefined' &&
      typeof (window.DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const state = await (window.DeviceMotionEvent as any).requestPermission();
        if (state !== 'granted') return false;
      } catch {
        return false;
      }
    }

    // DeviceOrientationEvent permission (iOS)
    if (
      typeof window.DeviceOrientationEvent !== 'undefined' &&
      typeof (window.DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        await (window.DeviceOrientationEvent as any).requestPermission();
      } catch {
        // Non-critical
      }
    }

    return true;
  }

  /**
   * Start listening to motion sensors.
   */
  public start(callbacks: MotionCallbacks): void {
    this.stop();
    this.callbacks = callbacks;
    this.isActive = true;
    this.stepCount = 0;
    this.cadenceSpm = 0;
    this.rhythmicStrideBuffer = 0;
    this.recentStepIntervals = [];
    this.recentMagnitudes = [];
    this.gravityInitialized = false;
    this.gravityInitCount = 0;
    this.gravityAccumulator = { x: 0, y: 0, z: 0 };
    this.gravity = { x: 0, y: 0, z: 0 };
    this.lastStepTime = 0;
    this.isRising = false;
    this.peakMag = 0;
    this.lastCadenceCalcTime = Date.now();

    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      this.boundMotionHandler = (e: DeviceMotionEvent) => this.handleMotion(e);
      window.addEventListener('devicemotion', this.boundMotionHandler, true);
    }
  }

  /**
   * Stop listening to motion sensors.
   */
  public stop(): void {
    this.isActive = false;
    if (this.boundMotionHandler && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.boundMotionHandler, true);
      this.boundMotionHandler = null;
    }
    this.callbacks = null;
  }

  /**
   * Get current state snapshot.
   */
  public getState(): MotionState {
    return {
      accelerationMagnitude: 0,
      cadenceSpm: this.cadenceSpm,
      stepCount: this.stepCount,
      isRhythmicMovement: this.rhythmicStrideBuffer >= 3,
      movementIntensity: this.getMovementIntensity(),
      timestamp: Date.now(),
    };
  }

  /**
   * Reset step count (e.g., when starting a new workout).
   */
  public resetSteps(): void {
    this.stepCount = 0;
    this.cadenceSpm = 0;
    this.rhythmicStrideBuffer = 0;
    this.recentStepIntervals = [];
  }

  private handleMotion(event: DeviceMotionEvent): void {
    if (!this.isActive) return;

    // Skip if page not visible (background)
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

    let rawX = 0, rawY = 0, rawZ = 0;
    let gyroX = 0, gyroY = 0, gyroZ = 0;

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

    if (event.rotationRate) {
      gyroX = event.rotationRate.alpha || 0;
      gyroY = event.rotationRate.beta || 0;
      gyroZ = event.rotationRate.gamma || 0;
    }

    // Initialize gravity estimate with first 40 samples
    if (!this.gravityInitialized) {
      this.gravityAccumulator.x += rawX;
      this.gravityAccumulator.y += rawY;
      this.gravityAccumulator.z += rawZ;
      this.gravityInitCount++;

      if (this.gravityInitCount >= 40) {
        this.gravity = {
          x: this.gravityAccumulator.x / 40,
          y: this.gravityAccumulator.y / 40,
          z: this.gravityAccumulator.z / 40,
        };
        this.gravityInitialized = true;
      }
      return;
    }

    // Low-pass filter to estimate gravity
    this.gravity.x = this.GRAVITY_ALPHA * this.gravity.x + (1 - this.GRAVITY_ALPHA) * rawX;
    this.gravity.y = this.GRAVITY_ALPHA * this.gravity.y + (1 - this.GRAVITY_ALPHA) * rawY;
    this.gravity.z = this.GRAVITY_ALPHA * this.gravity.z + (1 - this.GRAVITY_ALPHA) * rawZ;

    // Extract linear acceleration (remove gravity)
    const linX = rawX - this.gravity.x;
    const linY = rawY - this.gravity.y;
    const linZ = rawZ - this.gravity.z;

    const dynamicMag = Math.sqrt(linX * linX + linY * linY + linZ * linZ);

    // Track recent magnitudes for intensity calculation
    this.recentMagnitudes.push(dynamicMag);
    if (this.recentMagnitudes.length > 60) this.recentMagnitudes.shift();

    const now = Date.now();
    const timeDelta = now - this.lastStepTime;

    // Noise gate: ignore very small accelerations
    if (dynamicMag < this.NOISE_GATE) {
      this.isRising = false;
      if (now - this.lastStepTime > 1600) {
        this.rhythmicStrideBuffer = 0;
      }
      this.emitState(dynamicMag);
      return;
    }

    // Peak-valley step detection
    if (dynamicMag > this.PEAK_THRESHOLD) {
      if (!this.isRising) {
        this.isRising = true;
        this.peakMag = dynamicMag;
      } else if (dynamicMag > this.peakMag) {
        this.peakMag = dynamicMag;
      }
    } else if (dynamicMag < this.PEAK_THRESHOLD * 0.7 && this.isRising) {
      this.isRising = false;
      const amplitude = this.peakMag - dynamicMag;

      if (
        amplitude >= this.MIN_AMPLITUDE &&
        timeDelta >= this.MIN_STEP_INTERVAL_MS &&
        timeDelta <= this.MAX_STEP_INTERVAL_MS
      ) {
        // Record step interval for cadence
        this.recentStepIntervals.push(timeDelta);
        if (this.recentStepIntervals.length > 20) this.recentStepIntervals.shift();

        this.lastStepTime = now;
        this.rhythmicStrideBuffer++;

        if (this.rhythmicStrideBuffer >= 3) {
          // Credit 3 initial steps on reaching threshold, then 1 per detection
          const stepsToAdd = this.rhythmicStrideBuffer === 3 ? 3 : 1;
          this.stepCount += stepsToAdd;

          if (this.callbacks) {
            this.callbacks.onStepDetected(this.stepCount);
          }
        }

        // Update cadence every 2 seconds
        if (now - this.lastCadenceCalcTime > 2000) {
          this.updateCadence();
          this.lastCadenceCalcTime = now;
        }
      } else if (timeDelta > this.MAX_STEP_INTERVAL_MS) {
        this.rhythmicStrideBuffer = 0;
      }
    }

    this.emitState(dynamicMag);
  }

  private updateCadence(): void {
    if (this.recentStepIntervals.length < 3) {
      this.cadenceSpm = 0;
      return;
    }

    // Use the most recent intervals for cadence
    const recent = this.recentStepIntervals.slice(-10);
    const avgIntervalMs = recent.reduce((a, b) => a + b, 0) / recent.length;
    this.cadenceSpm = Math.round(60000 / avgIntervalMs);

    // Clamp to realistic range
    if (this.cadenceSpm < 50 || this.cadenceSpm > 220) {
      this.cadenceSpm = 0;
    }
  }

  private getMovementIntensity(): 'none' | 'low' | 'moderate' | 'high' {
    if (this.recentMagnitudes.length < 5) return 'none';
    const avg = this.recentMagnitudes.reduce((a, b) => a + b, 0) / this.recentMagnitudes.length;
    if (avg < 0.5) return 'none';
    if (avg < 1.5) return 'low';
    if (avg < 3.5) return 'moderate';
    return 'high';
  }

  private emitState(currentMag: number): void {
    if (!this.callbacks) return;
    this.callbacks.onMotionUpdate({
      accelerationMagnitude: Math.round(currentMag * 100) / 100,
      cadenceSpm: this.cadenceSpm,
      stepCount: this.stepCount,
      isRhythmicMovement: this.rhythmicStrideBuffer >= 3,
      movementIntensity: this.getMovementIntensity(),
      timestamp: Date.now(),
    });
  }
}

export const motionSensorManager = new MotionSensorManagerService();
