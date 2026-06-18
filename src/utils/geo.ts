const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two coordinates, in kilometers. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/** Returns the branch nearest to the given coordinates, or undefined if there are no branches. */
export function findNearestBranch<T extends { lat: number; lng: number }>(
  lat: number,
  lng: number,
  branches: T[],
): T | undefined {
  let nearest: T | undefined;
  let nearestDistance = Infinity;
  for (const branch of branches) {
    const distance = haversineKm(lat, lng, branch.lat, branch.lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = branch;
    }
  }
  return nearest;
}

/** Distance (km) within which a user is considered to be physically at a branch. */
export const STORE_PROXIMITY_RADIUS_KM = 0.5;

/** Returns the nearest branch, but only if the user is within STORE_PROXIMITY_RADIUS_KM of it. */
export function findBranchNearby<T extends { lat: number; lng: number }>(
  lat: number,
  lng: number,
  branches: T[],
): T | undefined {
  const nearest = findNearestBranch(lat, lng, branches);
  if (!nearest) return undefined;
  return haversineKm(lat, lng, nearest.lat, nearest.lng) <= STORE_PROXIMITY_RADIUS_KM ? nearest : undefined;
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Returns today's opening hours from a branch's hours list, matching ranges like "Mo–Fr". */
export function getTodayHours(hours: { day: string; time: string }[]): string | undefined {
  const today = WEEKDAYS[new Date().getDay()];

  for (const entry of hours) {
    if (entry.day === today) return entry.time;

    if (entry.day.includes('–')) {
      const [start, end] = entry.day.split('–');
      const order = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
      const startIdx = order.indexOf(start);
      const endIdx = order.indexOf(end);
      const todayIdx = order.indexOf(today);
      if (startIdx !== -1 && endIdx !== -1 && todayIdx !== -1 && startIdx <= todayIdx && todayIdx <= endIdx) {
        return entry.time;
      }
    }
  }
  return undefined;
}
