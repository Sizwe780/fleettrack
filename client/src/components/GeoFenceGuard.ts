// geospatial/GeoFenceGuard.ts

export type LatLon = { lat: number; lon: number };
export type Zone = { id: string; center: LatLon; radius: number }; // radius in meters

/**
 * Haversine distance between two points in meters.
 */
export function haversineDistance(a: LatLon, b: LatLon): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const x = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

/**
 * Compute distance using either a provided getDistance function or the local haversine.
 * Accepts objects shaped like { lat, lon }.
 */
export function getDistance(a: LatLon, b: LatLon): number {
  return haversineDistance(a, b);
}

/**
 * Return true when `location` is inside the circular `zone`.
 * Location and zone.center must have numeric lat/lon; zone.radius is meters.
 */
export function isInsideZone(location: LatLon | null | undefined, zone: Zone | null | undefined): boolean {
  if (!location || !zone || !zone.center || typeof zone.radius !== 'number') return false;
  const distance = getDistance(location, zone.center);
  return distance <= zone.radius;
}

/**
 * Return a structured breach record when outside zone, otherwise a non-breach object.
 * This function never throws; it returns a consistent shape for downstream logging.
 */
export function logZoneBreach(vehicleId: string, location: LatLon | null | undefined, zone: Zone | null | undefined) {
  const inside = isInsideZone(location, zone);
  if (!inside) {
    return {
      vehicleId,
      breach: true,
      timestamp: new Date().toISOString(),
      zoneId: zone?.id ?? null,
      location,
    };
  }
  return { vehicleId, breach: false, timestamp: new Date().toISOString() };
}

export default { isInsideZone, logZoneBreach, getDistance, haversineDistance };