// Sensor Fusion Engine — Combine GPS + Motion to Detect Activity State

export type ActivityState = 'running' | 'walking' | 'stationary';

export interface SensorFusionInput {
  gpsSpeedKmh: number;
  gpsAccuracyMeters: number | null;
  accelerationMagnitude: number;
  isRhythmicMovement: boolean;
  movementIntensity: 'none' | 'low' | 'moderate' | 'high';
  cadenceSpm: number;
}

export interface SensorFusionResult {
  activityState: ActivityState;
  confidence: number;  // 0 to 1
  description: string;
}

/**
 * Fuse GPS speed data with accelerometer/motion data to determine
 * the user's current activity state (running/walking/stationary).
 * 
 * Does NOT rely on a single hard-coded threshold.
 * Tolerates different phone holding positions.
 */
export function detectActivityState(input: SensorFusionInput): SensorFusionResult {
  const { gpsSpeedKmh, accelerationMagnitude, isRhythmicMovement, movementIntensity, cadenceSpm } = input;

  // Scoring system: each signal contributes to a likelihood score
  let runningScore = 0;
  let walkingScore = 0;
  let stationaryScore = 0;

  // ── GPS Speed Signals ──
  if (gpsSpeedKmh >= 8.0) {
    runningScore += 3;
  } else if (gpsSpeedKmh >= 5.5) {
    runningScore += 2;
    walkingScore += 1;
  } else if (gpsSpeedKmh >= 2.5) {
    walkingScore += 3;
    runningScore += 0.5;
  } else if (gpsSpeedKmh >= 0.8) {
    walkingScore += 2;
    stationaryScore += 1;
  } else {
    stationaryScore += 3;
  }

  // ── Motion Intensity Signals ──
  if (movementIntensity === 'high') {
    runningScore += 2;
  } else if (movementIntensity === 'moderate') {
    runningScore += 1;
    walkingScore += 1;
  } else if (movementIntensity === 'low') {
    walkingScore += 1.5;
  } else {
    stationaryScore += 2;
  }

  // ── Rhythmic Movement Signal ──
  if (isRhythmicMovement) {
    if (cadenceSpm >= 150) {
      runningScore += 2;
    } else if (cadenceSpm >= 100) {
      walkingScore += 1;
      runningScore += 1;
    } else if (cadenceSpm >= 60) {
      walkingScore += 2;
    }
  } else {
    stationaryScore += 1;
  }

  // ── Cadence-specific signals ──
  if (cadenceSpm >= 160) {
    runningScore += 1.5;
  } else if (cadenceSpm >= 120 && cadenceSpm < 160) {
    // Could be fast walking or slow jogging
    walkingScore += 0.5;
    runningScore += 0.5;
  }

  // ── Acceleration magnitude boost ──
  if (accelerationMagnitude > 4.0) {
    runningScore += 1;
  } else if (accelerationMagnitude < 0.5) {
    stationaryScore += 1;
  }

  // Determine winner
  const maxScore = Math.max(runningScore, walkingScore, stationaryScore);
  const totalScore = runningScore + walkingScore + stationaryScore;
  const confidence = totalScore > 0 ? Math.min(1, maxScore / totalScore) : 0;

  if (runningScore >= walkingScore && runningScore >= stationaryScore) {
    return {
      activityState: 'running',
      confidence,
      description: `Running (${gpsSpeedKmh.toFixed(1)} km/h, ${cadenceSpm} spm)`,
    };
  }

  if (walkingScore >= stationaryScore) {
    return {
      activityState: 'walking',
      confidence,
      description: `Walking (${gpsSpeedKmh.toFixed(1)} km/h, ${cadenceSpm} spm)`,
    };
  }

  return {
    activityState: 'stationary',
    confidence,
    description: 'Stationary',
  };
}
