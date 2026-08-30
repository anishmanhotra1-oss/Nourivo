// MET values for standard activities
const MET_MAP: Record<string, number> = {
  running: 9.8,
  walking: 3.8,
  cycling: 7.5,
  hiking: 6.0,
  general: 5.0,
};

export function calculateCaloriesBurned(
  activityType: string,
  weightKg: number,
  durationSeconds: number
): number {
  const met = MET_MAP[activityType.toLowerCase()] || MET_MAP.general;
  const durationHours = durationSeconds / 3600;
  const calories = met * weightKg * durationHours;
  return Math.round(calories * 10) / 10;
}

// Calculate total Haversine distance in KM from GPS coordinates
export function calculateDistanceKm(coords: [number, number][]): number {
  if (coords.length < 2) return 0;

  let totalDistance = 0;
  const R = 6371; // Radius of Earth in KM

  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i];
    const [lat2, lon2] = coords[i + 1];

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }

  return Math.round(totalDistance * 100) / 100;
}
