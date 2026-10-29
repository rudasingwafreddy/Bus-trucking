// Explainable Estimated Time of Arrival (ETA) Engine for RwandaBus

import { BusLocation, BusRoute, BusStop, ArrivalEstimate } from '../types';

/**
 * Calculates distance in kilometres between two coordinates using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates path distance along ordered route polyline segments from bus location to target stop
 */
export function calculateDistanceAlongRoute(
  busLoc: { lat: number; lng: number },
  targetStop: { lat: number; lng: number },
  routeGeometry: [number, number][]
): number {
  if (!routeGeometry || routeGeometry.length < 2) {
    // Fallback with 1.3x road circuitous factor if polyline not configured
    return calculateHaversineDistanceKm(busLoc.lat, busLoc.lng, targetStop.lat, targetStop.lng) * 1.3;
  }

  // Find nearest segment index on route to bus
  let nearestBusIndex = 0;
  let minBusDist = Infinity;
  for (let i = 0; i < routeGeometry.length; i++) {
    const dist = calculateHaversineDistanceKm(busLoc.lat, busLoc.lng, routeGeometry[i][0], routeGeometry[i][1]);
    if (dist < minBusDist) {
      minBusDist = dist;
      nearestBusIndex = i;
    }
  }

  // Find nearest segment index to target stop
  let nearestStopIndex = 0;
  let minStopDist = Infinity;
  for (let i = 0; i < routeGeometry.length; i++) {
    const dist = calculateHaversineDistanceKm(targetStop.lat, targetStop.lng, routeGeometry[i][0], routeGeometry[i][1]);
    if (dist < minStopDist) {
      minStopDist = dist;
      nearestStopIndex = i;
    }
  }

  // If bus is ahead of the stop along the outbound trip
  if (nearestBusIndex > nearestStopIndex) {
    return -1; // Bus has already passed this stop on this outbound journey
  }

  // Sum distance along the polyline segments
  let cumulativeDist = 0;
  for (let i = nearestBusIndex; i < nearestStopIndex; i++) {
    cumulativeDist += calculateHaversineDistanceKm(
      routeGeometry[i][0],
      routeGeometry[i][1],
      routeGeometry[i + 1][0],
      routeGeometry[i + 1][1]
    );
  }

  return Math.max(0.1, cumulativeDist);
}

/**
 * Computes explainable ETA for a bus approaching a specific stop
 */
export function calculateETA(
  busLocation: BusLocation,
  busPlate: string,
  busId: string,
  route: BusRoute,
  stop: BusStop
): ArrivalEstimate | null {
  // Check GPS staleness (threshold: 2 minutes / 120 seconds)
  const now = Date.now();
  const recordedTime = new Date(busLocation.recorded_at).getTime();
  const ageSeconds = Math.max(0, (now - recordedTime) / 1000);
  const isStale = ageSeconds > 120;

  // Calculate route distance
  const distanceKm = calculateDistanceAlongRoute(
    { lat: busLocation.latitude, lng: busLocation.longitude },
    { lat: stop.latitude, lng: stop.longitude },
    route.geometry
  );

  // If bus already passed stop
  if (distanceKm < 0) {
    return null;
  }

  // Urban Kigali speed heuristics:
  // Use current speed if >= 15 km/h, otherwise fallback to configured average speed (22 km/h in Kigali urban corridors)
  let effectiveSpeedKmh = 22.0;
  if (busLocation.speed && busLocation.speed >= 10 && busLocation.speed <= 80) {
    // Weighted blend: 60% average, 40% current instantaneous speed to smooth stoplights
    effectiveSpeedKmh = 0.6 * 22.0 + 0.4 * busLocation.speed;
  }

  // Dwell time allowance: ~1.5 minutes per intermediate stop
  const estimatedHours = distanceKm / effectiveSpeedKmh;
  const estimatedMins = Math.max(1, Math.round(estimatedHours * 60));

  const isApproaching = estimatedMins <= 2 || distanceKm <= 0.5;

  let status: 'on_time' | 'delayed' | 'approaching' | 'stale' = 'on_time';
  if (isStale) {
    status = 'stale';
  } else if (isApproaching) {
    status = 'approaching';
  } else if (estimatedMins > 25) {
    status = 'delayed';
  }

  return {
    stop_id: stop.id,
    stop_name: stop.name,
    bus_id: busId,
    plate_number: busPlate,
    route_id: route.id,
    route_code: route.route_code,
    route_name: route.name,
    distance_km: Number(distanceKm.toFixed(1)),
    estimated_minutes: estimatedMins,
    is_approaching: isApproaching,
    is_stale: isStale,
    status,
    last_updated: busLocation.recorded_at
  };
}
