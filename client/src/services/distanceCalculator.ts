// Distance Calculator Service — Haversine Formula & Unit Conversion

const EARTH_RADIUS_KM = 6371;
const KM_TO_MILES = 0.621371;
const MILES_TO_KM = 1.60934;

/**
 * Calculate the great-circle distance between two lat/lng points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate the cumulative distance along a sequence of GPS points.
 * Returns total distance in kilometers.
 */
export function cumulativeRouteDistance(
  points: { lat: number; lng: number }[]
): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
  }
  return total;
}

/**
 * Calculate bearing angle (0° to 360°) between two coordinates.
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const rad = Math.PI / 180;
  const dLon = (lon2 - lon1) * rad;
  const y = Math.sin(dLon) * Math.cos(lat2 * rad);
  const x =
    Math.cos(lat1 * rad) * Math.sin(lat2 * rad) -
    Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((bearing + 360) % 360);
}

/**
 * Get compass cardinal label from bearing angle.
 */
export function getCompassLabel(bearing: number): string {
  const directions = ['N ⬆', 'NE ↗', 'E ➡', 'SE ↘', 'S ⬇', 'SW ↙', 'W ⬅', 'NW ↖'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

// Unit Conversion
export function kmToMiles(km: number): number {
  return km * KM_TO_MILES;
}

export function milesToKm(miles: number): number {
  return miles * MILES_TO_KM;
}

export function kmhToMph(kmh: number): number {
  return kmh * KM_TO_MILES;
}

export function mphToKmh(mph: number): number {
  return mph * MILES_TO_KM;
}
