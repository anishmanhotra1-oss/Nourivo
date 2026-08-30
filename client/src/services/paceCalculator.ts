// Pace Calculator Service — Running Pace Formatting & Calculation

export type PaceUnit = 'min/km' | 'min/mile';

const KM_TO_MILES = 0.621371;

/**
 * Format a decimal pace value into MM:SS string.
 * E.g., 5.4 → "5:24"
 */
export function formatPace(decimalMinutes: number): string {
  if (!isFinite(decimalMinutes) || decimalMinutes <= 0 || decimalMinutes > 60) {
    return '--:--';
  }
  const mins = Math.floor(decimalMinutes);
  const secs = Math.round((decimalMinutes - mins) * 60);
  // Handle rounding that pushes secs to 60
  if (secs >= 60) {
    return `${mins + 1}:00`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate average pace from active duration and distance.
 * Returns pace in min/km (or min/mile if unit is specified).
 */
export function calculateAveragePace(
  activeDurationSeconds: number,
  distanceKm: number,
  unit: PaceUnit = 'min/km'
): number {
  if (distanceKm < 0.05) return 0; // Guard against meaningless pace at tiny distances
  const distanceInUnit = unit === 'min/mile' ? distanceKm * KM_TO_MILES : distanceKm;
  if (distanceInUnit <= 0) return 0;
  return (activeDurationSeconds / 60) / distanceInUnit;
}

/**
 * Calculate rolling pace from recent GPS points (30-second window).
 * Returns pace in min/km or min/mile.
 */
export function calculateRollingPace(
  points: { lat: number; lng: number; timestamp: number }[],
  haversineDistanceFn: (lat1: number, lon1: number, lat2: number, lon2: number) => number,
  windowMs: number = 30000,
  unit: PaceUnit = 'min/km'
): number {
  if (points.length < 2) return 0;

  const now = points[points.length - 1].timestamp;
  const recentPoints = points.filter((p) => p.timestamp >= now - windowMs);

  if (recentPoints.length >= 2) {
    const pFirst = recentPoints[0];
    const pLast = recentPoints[recentPoints.length - 1];
    const distKm = haversineDistanceFn(pFirst.lat, pFirst.lng, pLast.lat, pLast.lng);
    const timeHrs = (pLast.timestamp - pFirst.timestamp) / 3600000;

    if (distKm > 0.005 && timeHrs > 0) {
      const speedKmh = distKm / timeHrs;
      const paceMinKm = 60 / speedKmh;
      const pace = unit === 'min/mile' ? paceMinKm / KM_TO_MILES : paceMinKm;
      return Math.min(30, pace); // Cap at 30 min/km
    }
  }

  return 0;
}

/**
 * Format pace with unit label.
 * E.g., "5:24 /km" or "8:42 /mile"
 */
export function formatPaceWithUnit(decimalMinutes: number, unit: PaceUnit = 'min/km'): string {
  const formatted = formatPace(decimalMinutes);
  const unitLabel = unit === 'min/mile' ? '/mi' : '/km';
  return `${formatted} ${unitLabel}`;
}

/**
 * Convert pace between units.
 */
export function convertPace(paceMinKm: number, toUnit: PaceUnit): number {
  if (toUnit === 'min/mile') {
    return paceMinKm / KM_TO_MILES;
  }
  return paceMinKm;
}
