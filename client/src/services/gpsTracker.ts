// Enhanced Production GPS Run Tracker Service — Google Maps Edition
// Supports: altitude, heading, elevation gain, speed smoothing, unit conversion

import { haversineDistance, calculateBearing } from './distanceCalculator';

export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  speed: number | null;      // GPS-provided speed in m/s
  heading: number | null;    // GPS-provided heading in degrees
}

export interface GpsStats {
  distanceKm: number;
  durationSeconds: number;        // active duration (minus pauses)
  elapsedDurationSeconds: number;  // total elapsed since start
  currentSpeedKmh: number;
  averageSpeedKmh: number;
  peakSpeedKmh: number;
  currentPaceMinKm: number;       // decimal pace (5.4 = 5:24)
  averagePaceMinKm: number;       // decimal pace
  paceMinKm: string;              // formatted legacy "5.40"
  caloriesBurned: number;
  accuracyMeters: number | null;
  elevationGainMeters: number;
  pointCount: number;
  isAutoPaused?: boolean;
  isSimulating?: boolean;
  heading: number;
}

export interface GpsTrackerCallbacks {
  onPoint: (point: GpsPoint, stats: GpsStats, allPoints: GpsPoint[]) => void;
  onError: (error: GeolocationPositionError | { message: string }) => void;
  onWakeLockChange?: (isActive: boolean) => void;
  onAutoPauseChange?: (isPaused: boolean) => void;
}

// Activity MET Values
const ACTIVITY_MET: Record<string, number> = {
  running: 9.8,
  walking: 3.8,
  cycling: 7.5,
  hiking: 6.0,
};

// Max Speed Thresholds (km/h) per activity
const MAX_ALLOWED_SPEED_KMH: Record<string, number> = {
  running: 35.0,
  walking: 15.0,
  cycling: 65.0,
  hiking: 18.0,
};

class GpsTrackerService {
  private watchId: number | null = null;
  private wakeLockSentinel: any = null;
  private points: GpsPoint[] = [];
  private totalDistanceKm = 0;
  private peakSpeedKmh = 0;
  private startTime: number | null = null;
  private pausedDurationSeconds = 0;
  private pauseStartTime: number | null = null;
  private activityType = 'running';
  private userWeightKg = 70;
  private callbacks: GpsTrackerCallbacks | null = null;

  // Auto-pause and simulation
  private isAutoPaused = false;
  private lowSpeedStartTimestamp: number | null = null;
  private simulationInterval: any = null;
  private isSimulating = false;

  // Kalman Filter State
  private kalmanLat: number | null = null;
  private kalmanLng: number | null = null;
  private kalmanVariance: number = 0;
  private rawPointsBuffer: GpsPoint[] = [];
  private atRestConsecutiveCount = 0;

  // Elevation tracking
  private elevationGainMeters = 0;
  private lastValidAltitude: number | null = null;
  private altitudeBuffer: number[] = [];

  // Speed smoothing (EMA)
  private smoothedSpeedKmh = 0;
  private readonly SPEED_SMOOTH_ALPHA = 0.3;

  // Haversine wrapper
  public calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return haversineDistance(lat1, lon1, lat2, lon2);
  }

  private async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        if (this.callbacks?.onWakeLockChange) {
          this.callbacks.onWakeLockChange(true);
        }
        this.wakeLockSentinel.addEventListener('release', () => {
          if (this.callbacks?.onWakeLockChange) {
            this.callbacks.onWakeLockChange(false);
          }
        });
        return true;
      } catch (err) {
        console.warn('Screen WakeLock request failed:', err);
      }
    }
    return false;
  }

  private async releaseWakeLock() {
    if (this.wakeLockSentinel) {
      try {
        await this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
      } catch (err) {
        console.warn('WakeLock release error:', err);
      }
    }
  }

  public calculateCaloriesBurned(durationSeconds: number): number {
    const met = ACTIVITY_MET[this.activityType] || 8.0;
    const durationHours = durationSeconds / 3600;
    return Math.round(met * this.userWeightKg * durationHours);
  }

  // ── Start Live GPS Tracking ──
  public async startTracking(
    activityType: string,
    userWeightKg: number,
    callbacks: GpsTrackerCallbacks
  ): Promise<boolean> {
    this.stopTracking();
    this.initializeState(activityType, userWeightKg, callbacks, false);
    await this.requestWakeLock();

    if (!('geolocation' in navigator)) {
      callbacks.onError({ message: 'Geolocation API is not supported by your browser.' } as any);
      return false;
    }

    // Initial fix
    navigator.geolocation.getCurrentPosition(
      (pos) => this.handlePositionUpdate(pos),
      (err) => console.warn('Initial GPS fix note:', err.message),
      { enableHighAccuracy: true, timeout: 5000 }
    );

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePositionUpdate(pos),
      (err) => callbacks.onError(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return true;
  }

  // ── Start Simulated Tracking ──
  public async startSimulatedTracking(
    activityType: string,
    userWeightKg: number,
    callbacks: GpsTrackerCallbacks
  ): Promise<boolean> {
    this.stopTracking();
    this.initializeState(activityType, userWeightKg, callbacks, true);
    await this.requestWakeLock();

    const baseLat = 28.6139;
    const baseLng = 77.2090;
    let stepIndex = 0;
    const totalSimSteps = 120;

    const emitSimStep = () => {
      if (this.pauseStartTime) return;

      const angle = (stepIndex / totalSimSteps) * Math.PI * 2;
      const radiusKm = 0.4 + Math.sin(angle * 2) * 0.1;
      const currentLat = baseLat + (radiusKm / 111) * Math.sin(angle);
      const currentLng = baseLng + (radiusKm / (111 * Math.cos(baseLat * Math.PI / 180))) * Math.cos(angle);

      const simSpeedMs = activityType === 'walking' ? 1.4 : activityType === 'cycling' ? 5.5 : 3.1;
      const simAltitude = 220 + Math.sin(angle * 3) * 15;

      const positionObj = {
        coords: {
          latitude: currentLat,
          longitude: currentLng,
          accuracy: 5,
          speed: simSpeedMs,
          altitude: simAltitude,
          altitudeAccuracy: 10,
          heading: (angle * 180 / Math.PI + 90) % 360,
        },
        timestamp: Date.now(),
      } as unknown as GeolocationPosition;

      this.handlePositionUpdate(positionObj);
      stepIndex = (stepIndex + 1) % totalSimSteps;
    };

    emitSimStep();
    this.simulationInterval = setInterval(emitSimStep, 1000);
    return true;
  }

  private initializeState(activityType: string, userWeightKg: number, callbacks: GpsTrackerCallbacks, simulating: boolean) {
    this.activityType = activityType;
    this.userWeightKg = userWeightKg || 70;
    this.callbacks = callbacks;
    this.points = [];
    this.totalDistanceKm = 0;
    this.peakSpeedKmh = 0;
    this.startTime = Date.now();
    this.pausedDurationSeconds = 0;
    this.pauseStartTime = null;
    this.isAutoPaused = false;
    this.lowSpeedStartTimestamp = null;
    this.isSimulating = simulating;
    this.rawPointsBuffer = [];
    this.atRestConsecutiveCount = 0;
    this.kalmanLat = null;
    this.kalmanLng = null;
    this.kalmanVariance = 0;
    this.elevationGainMeters = 0;
    this.lastValidAltitude = null;
    this.altitudeBuffer = [];
    this.smoothedSpeedKmh = 0;
  }

  // Rolling window speed
  private getRollingSpeedKmh(candidatePoint?: GpsPoint): number {
    const pts = candidatePoint ? [...this.points, candidatePoint] : this.points;
    if (pts.length < 2) return 0;
    const windowPoints = pts.slice(-4);
    const pFirst = windowPoints[0];
    const pLast = windowPoints[windowPoints.length - 1];
    const distKm = haversineDistance(pFirst.lat, pFirst.lng, pLast.lat, pLast.lng);
    const timeHrs = (pLast.timestamp - pFirst.timestamp) / 3600000;
    if (timeHrs <= 0) return 0;
    return Math.round((distKm / timeHrs) * 10) / 10;
  }

  // Stationary detection
  private checkIsAtRest(candidatePoint?: GpsPoint): boolean {
    const pts = candidatePoint ? [...this.points, candidatePoint] : this.points;
    if (pts.length < 3) return false;
    const windowPoints = pts.slice(-4);
    const pFirst = windowPoints[0];
    const pLast = windowPoints[windowPoints.length - 1];
    const totalDisplacementM = haversineDistance(pFirst.lat, pFirst.lng, pLast.lat, pLast.lng) * 1000;
    const avgAccuracy = windowPoints.reduce((sum, p) => sum + (p.accuracy || 10), 0) / windowPoints.length;
    let maxPairDistanceM = 0;
    for (let i = 0; i < windowPoints.length; i++) {
      for (let j = i + 1; j < windowPoints.length; j++) {
        const d = haversineDistance(windowPoints[i].lat, windowPoints[i].lng, windowPoints[j].lat, windowPoints[j].lng) * 1000;
        if (d > maxPairDistanceM) maxPairDistanceM = d;
      }
    }
    return maxPairDistanceM < Math.max(7.0, avgAccuracy * 0.75) || totalDisplacementM < 3.5;
  }

  // Rolling pace
  private getRollingPaceMinKm(durationSeconds: number): number {
    if (this.points.length < 2 || this.totalDistanceKm <= 0) return 0;
    const recentPoints = this.points.filter((p) => p.timestamp >= Date.now() - 30000);
    if (recentPoints.length >= 2) {
      const pFirst = recentPoints[0];
      const pLast = recentPoints[recentPoints.length - 1];
      const dist = haversineDistance(pFirst.lat, pFirst.lng, pLast.lat, pLast.lng);
      const timeHrs = (pLast.timestamp - pFirst.timestamp) / 3600000;
      if (dist > 0.005 && timeHrs > 0) {
        const rollingSpeed = dist / timeHrs;
        return Math.min(30, 60 / rollingSpeed);
      }
    }
    const overallPace = (durationSeconds / 60) / this.totalDistanceKm;
    return Math.min(30, overallPace);
  }

  // Track elevation gain
  private trackElevation(altitude: number | null, altitudeAccuracy: number | null) {
    if (altitude === null || altitude === undefined) return;
    if (altitudeAccuracy !== null && altitudeAccuracy > 30) return; // Reject inaccurate altitude

    // Smooth altitude with a small buffer
    this.altitudeBuffer.push(altitude);
    if (this.altitudeBuffer.length > 5) this.altitudeBuffer.shift();

    const smoothedAltitude = this.altitudeBuffer.reduce((a, b) => a + b, 0) / this.altitudeBuffer.length;

    if (this.lastValidAltitude !== null) {
      const gain = smoothedAltitude - this.lastValidAltitude;
      if (gain > 0.5) { // Only count positive gain > 0.5m to filter noise
        this.elevationGainMeters += gain;
      }
    }
    this.lastValidAltitude = smoothedAltitude;
  }

  // Process raw GPS position
  private handlePositionUpdate(position: GeolocationPosition) {
    const { latitude, longitude, accuracy, speed: rawSpeed, altitude, altitudeAccuracy, heading: rawHeading } = position.coords;
    const timestamp = position.timestamp || Date.now();

    // 1. Accuracy gate
    const MAX_ACCURACY_THRESHOLD_M = this.points.length === 0 ? 65 : 35;
    if (accuracy > MAX_ACCURACY_THRESHOLD_M && !this.isSimulating) {
      return;
    }

    // 2. Time-delta gate
    if (this.points.length > 0 && !this.isSimulating) {
      const lastPoint = this.points[this.points.length - 1];
      if (timestamp - lastPoint.timestamp < 800) return;
    }

    // Track raw buffer for stationary detection
    const rawPoint: GpsPoint = {
      lat: latitude, lng: longitude, timestamp, accuracy: Math.round(accuracy),
      altitude: altitude, altitudeAccuracy: altitudeAccuracy, speed: rawSpeed, heading: rawHeading
    };
    this.rawPointsBuffer.push(rawPoint);
    if (this.rawPointsBuffer.length > 4) this.rawPointsBuffer.shift();

    // Check raw stationary
    let isRawStationary = false;
    if (this.rawPointsBuffer.length >= 3 && !this.isSimulating) {
      const recentRaw = this.rawPointsBuffer.slice(-3);
      const avgAcc = recentRaw.reduce((sum, p) => sum + p.accuracy, 0) / recentRaw.length;
      let maxRawPairDisplacementM = 0;
      for (let i = 0; i < recentRaw.length; i++) {
        for (let j = i + 1; j < recentRaw.length; j++) {
          const dM = haversineDistance(recentRaw[i].lat, recentRaw[i].lng, recentRaw[j].lat, recentRaw[j].lng) * 1000;
          if (dM > maxRawPairDisplacementM) maxRawPairDisplacementM = dM;
        }
      }
      if (maxRawPairDisplacementM < Math.max(3.5, avgAcc * 1.2)) isRawStationary = true;
    }

    // 3. Kalman Filter
    let targetLat = latitude;
    let targetLng = longitude;

    if (this.isSimulating) {
      targetLat = latitude;
      targetLng = longitude;
    } else if (this.kalmanLat === null || this.kalmanLng === null) {
      this.kalmanLat = latitude;
      this.kalmanLng = longitude;
      this.kalmanVariance = accuracy * accuracy;
    } else {
      const lastTs = this.points.length > 0 ? this.points[this.points.length - 1].timestamp : timestamp;
      const timeDeltaSec = Math.max(0.8, (timestamp - lastTs) / 1000);
      const processNoiseQ = isRawStationary ? 0.05 : 1.5 * timeDeltaSec;
      const pPrior = this.kalmanVariance + processNoiseQ;
      const measurementNoiseR = Math.max(1, accuracy * accuracy);
      const kalmanGain = pPrior / (pPrior + measurementNoiseR);
      this.kalmanLat = this.kalmanLat + kalmanGain * (latitude - this.kalmanLat);
      this.kalmanLng = this.kalmanLng + kalmanGain * (longitude - this.kalmanLng);
      this.kalmanVariance = (1 - kalmanGain) * pPrior;
      targetLat = this.kalmanLat;
      targetLng = this.kalmanLng;
    }

    const candidatePoint: GpsPoint = {
      lat: targetLat,
      lng: targetLng,
      timestamp,
      accuracy: Math.round(accuracy),
      altitude: altitude,
      altitudeAccuracy: altitudeAccuracy,
      speed: rawSpeed,
      heading: rawHeading,
    };

    // 4. Bearing reversal guard
    if (this.points.length >= 2 && !this.isSimulating) {
      const pPrev2 = this.points[this.points.length - 2];
      const pPrev1 = this.points[this.points.length - 1];
      const bearing1 = calculateBearing(pPrev2.lat, pPrev2.lng, pPrev1.lat, pPrev1.lng);
      const bearing2 = calculateBearing(pPrev1.lat, pPrev1.lng, targetLat, targetLng);
      let angleDiff = Math.abs(bearing2 - bearing1);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;
      const distToCandKm = haversineDistance(pPrev1.lat, pPrev1.lng, targetLat, targetLng);
      const timeToCandHrs = (timestamp - pPrev1.timestamp) / 3600000;
      const candSpeedKmh = timeToCandHrs > 0 ? distToCandKm / timeToCandHrs : 0;
      const REVERSAL_SPEED_THRESHOLD = this.activityType === 'walking' || this.activityType === 'hiking' ? 6.0 : 15.0;
      if (angleDiff > 140 && candSpeedKmh > REVERSAL_SPEED_THRESHOLD) return;
    }

    // 5. At-rest hysteresis
    const isStationaryNow = !this.isSimulating && (this.checkIsAtRest(candidatePoint) || isRawStationary);
    if (isStationaryNow) {
      this.atRestConsecutiveCount++;
    } else {
      this.atRestConsecutiveCount = 0;
    }

    const isAtRestConfirmed = this.atRestConsecutiveCount >= 2;
    let deltaDistKm = 0;

    if (this.points.length > 0) {
      const lastPoint = this.points[this.points.length - 1];
      const rawDeltaKm = haversineDistance(lastPoint.lat, lastPoint.lng, targetLat, targetLng);
      const maxAllowedSpeed = MAX_ALLOWED_SPEED_KMH[this.activityType] || 35.0;
      const rollingSpeedKmh = this.getRollingSpeedKmh(candidatePoint);
      if (rollingSpeedKmh > maxAllowedSpeed && !this.isSimulating) return;

      if (isAtRestConfirmed) {
        deltaDistKm = 0;
        if (this.lowSpeedStartTimestamp === null) {
          this.lowSpeedStartTimestamp = timestamp;
        } else if (timestamp - this.lowSpeedStartTimestamp >= 4000 && !this.isAutoPaused) {
          this.isAutoPaused = true;
          this.callbacks?.onAutoPauseChange?.(true);
        }
      } else {
        deltaDistKm = (rawDeltaKm * 1000) < 1.2 ? 0 : rawDeltaKm;
        this.lowSpeedStartTimestamp = null;
        if (this.isAutoPaused) {
          this.isAutoPaused = false;
          this.callbacks?.onAutoPauseChange?.(false);
        }
        this.totalDistanceKm += deltaDistKm;
      }
    }

    this.points.push(candidatePoint);

    // Track elevation
    this.trackElevation(altitude, altitudeAccuracy);

    // Speed calculation with EMA smoothing
    let currentSpeedKmh = 0;
    if (this.isSimulating) {
      currentSpeedKmh = rawSpeed && rawSpeed > 0 ? Math.round(rawSpeed * 3.6 * 10) / 10 : this.getRollingSpeedKmh();
    } else if (isAtRestConfirmed) {
      currentSpeedKmh = 0;
    } else if (rawSpeed !== null && rawSpeed > 0) {
      const nativeSpeedKmh = Math.round(rawSpeed * 3.6 * 10) / 10;
      const computedRolling = this.getRollingSpeedKmh();
      currentSpeedKmh = Math.round((nativeSpeedKmh * 0.7 + computedRolling * 0.3) * 10) / 10;
    } else {
      currentSpeedKmh = this.getRollingSpeedKmh();
    }

    // Apply EMA smoothing
    this.smoothedSpeedKmh = this.SPEED_SMOOTH_ALPHA * currentSpeedKmh + (1 - this.SPEED_SMOOTH_ALPHA) * this.smoothedSpeedKmh;
    currentSpeedKmh = Math.round(this.smoothedSpeedKmh * 10) / 10;

    if (currentSpeedKmh > this.peakSpeedKmh) this.peakSpeedKmh = currentSpeedKmh;

    const activeDurationSeconds = this.getActiveDurationSeconds();
    const elapsedDurationSeconds = this.getElapsedDurationSeconds();
    const currentPace = this.getRollingPaceMinKm(activeDurationSeconds);
    const averagePace = this.totalDistanceKm > 0.05 ? (activeDurationSeconds / 60) / this.totalDistanceKm : 0;
    const averageSpeed = activeDurationSeconds > 0 ? (this.totalDistanceKm / (activeDurationSeconds / 3600)) : 0;
    const caloriesBurned = this.calculateCaloriesBurned(activeDurationSeconds);

    // Heading
    let headingAngle = 0;
    if (this.points.length >= 2) {
      const pPrev = this.points[this.points.length - 2];
      const pCurr = this.points[this.points.length - 1];
      headingAngle = calculateBearing(pPrev.lat, pPrev.lng, pCurr.lat, pCurr.lng);
    }

    const stats: GpsStats = {
      distanceKm: Math.round(this.totalDistanceKm * 100) / 100,
      durationSeconds: activeDurationSeconds,
      elapsedDurationSeconds,
      currentSpeedKmh,
      averageSpeedKmh: Math.round(averageSpeed * 10) / 10,
      peakSpeedKmh: this.peakSpeedKmh,
      currentPaceMinKm: currentPace,
      averagePaceMinKm: averagePace,
      paceMinKm: currentPace > 0 ? currentPace.toFixed(2) : '0.00',
      caloriesBurned,
      accuracyMeters: Math.round(accuracy),
      elevationGainMeters: Math.round(this.elevationGainMeters),
      pointCount: this.points.length,
      isAutoPaused: this.isAutoPaused,
      isSimulating: this.isSimulating,
      heading: headingAngle,
    };

    this.callbacks?.onPoint(candidatePoint, stats, [...this.points]);
  }

  // Active duration (minus pauses)
  public getActiveDurationSeconds(): number {
    if (!this.startTime) return 0;
    const now = this.pauseStartTime ? this.pauseStartTime : Date.now();
    const totalSecs = Math.floor((now - this.startTime) / 1000) - this.pausedDurationSeconds;
    return Math.max(0, totalSecs);
  }

  // Total elapsed since start (including pauses)
  public getElapsedDurationSeconds(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  // Backwards compat alias
  public getElapsedDuration = this.getActiveDurationSeconds;

  public pauseTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.pauseStartTime = Date.now();
    this.releaseWakeLock();
  }

  public async resumeTracking(): Promise<boolean> {
    if (this.pauseStartTime) {
      this.pausedDurationSeconds += Math.floor((Date.now() - this.pauseStartTime) / 1000);
      this.pauseStartTime = null;
    }
    await this.requestWakeLock();

    if (this.isSimulating) return true;

    if ('geolocation' in navigator && this.callbacks) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => this.handlePositionUpdate(pos),
        (err) => this.callbacks?.onError(err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      return true;
    }
    return false;
  }

  public stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.releaseWakeLock();

    const durationSeconds = this.getActiveDurationSeconds();
    const distanceKm = Math.round(this.totalDistanceKm * 100) / 100;
    const averageSpeed = durationSeconds > 0 ? Math.round((distanceKm / (durationSeconds / 3600)) * 10) / 10 : 0;
    const paceMinKm = distanceKm > 0 ? (durationSeconds / 60 / distanceKm).toFixed(2) : '0.00';
    const caloriesBurned = this.calculateCaloriesBurned(durationSeconds);
    const routeCoords: [number, number][] = this.points.map((p) => [p.lat, p.lng]);
    const routeGeoJson = JSON.stringify(routeCoords);

    const summary = {
      points: [...this.points],
      routeCoords,
      routeGeoJson,
      distanceKm,
      durationSeconds,
      elapsedDurationSeconds: this.getElapsedDurationSeconds(),
      averageSpeedKmh: averageSpeed,
      peakSpeedKmh: this.peakSpeedKmh,
      paceMinKm,
      caloriesBurned,
      elevationGainMeters: Math.round(this.elevationGainMeters),
    };

    // Reset state
    this.points = [];
    this.totalDistanceKm = 0;
    this.startTime = null;
    this.callbacks = null;
    this.isSimulating = false;
    this.isAutoPaused = false;
    this.lowSpeedStartTimestamp = null;
    this.kalmanLat = null;
    this.kalmanLng = null;
    this.kalmanVariance = 0;
    this.rawPointsBuffer = [];
    this.atRestConsecutiveCount = 0;
    this.elevationGainMeters = 0;
    this.lastValidAltitude = null;
    this.altitudeBuffer = [];
    this.smoothedSpeedKmh = 0;

    return summary;
  }
}

export const gpsTracker = new GpsTrackerService();
