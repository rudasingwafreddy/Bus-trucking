import { describe, it, expect } from 'vitest';
import { calculateHaversineDistanceKm, calculateETA } from '../lib/eta';
import { BusLocation, BusRoute, BusStop } from '../types';
import { ROUTE_101_COORDINATES } from '../lib/constants';

describe('RwandaBus ETA and Geolocation Calculations', () => {
  it('calculates realistic Kigali distance using Haversine formula', () => {
    // Nyabugogo: -1.9392, 30.0442; Remera: -1.9612, 30.1178
    const distance = calculateHaversineDistanceKm(-1.9392, 30.0442, -1.9612, 30.1178);
    // Straight-line distance across Kigali is ~8.5 km
    expect(distance).toBeGreaterThan(7.0);
    expect(distance).toBeLessThan(10.0);
  });

  it('computes explainable ETA for an approaching bus', () => {
    const route: BusRoute = {
      id: 'route-101',
      route_code: '101',
      name: 'Nyabugogo - Remera',
      origin: 'Nyabugogo',
      destination: 'Remera',
      distance_km: 12.5,
      estimated_duration_minutes: 35,
      base_fare_rwf: 300,
      geometry: ROUTE_101_COORDINATES,
      is_active: true
    };

    const targetStop: BusStop = {
      id: 'stop-rem-01',
      name: 'Remera Bus Park',
      code: 'REM-01',
      latitude: -1.9612,
      longitude: 30.1178,
      district: 'Gasabo',
      has_shelter: true,
      is_accessible: true
    };

    const liveBusLocation: BusLocation = {
      trip_id: 'trip-01',
      bus_id: 'bus-rad-234b',
      latitude: ROUTE_101_COORDINATES[6][0], // near Kigali Heights
      longitude: ROUTE_101_COORDINATES[6][1],
      speed: 30.0,
      accuracy: 5.0,
      recorded_at: new Date().toISOString() // Fresh GPS
    };

    const eta = calculateETA(liveBusLocation, 'RAD 234 B', 'bus-rad-234b', route, targetStop);

    expect(eta).not.toBeNull();
    if (eta) {
      expect(eta.plate_number).toBe('RAD 234 B');
      expect(eta.route_code).toBe('101');
      expect(eta.is_stale).toBe(false);
      expect(eta.estimated_minutes).toBeGreaterThan(0);
      expect(eta.estimated_minutes).toBeLessThan(60);
    }
  });

  it('detects stale GPS updates when older than 2 minutes', () => {
    const route: BusRoute = {
      id: 'route-101',
      route_code: '101',
      name: 'Nyabugogo - Remera',
      origin: 'Nyabugogo',
      destination: 'Remera',
      distance_km: 12.5,
      estimated_duration_minutes: 35,
      base_fare_rwf: 300,
      geometry: ROUTE_101_COORDINATES,
      is_active: true
    };

    const targetStop: BusStop = {
      id: 'stop-rem-01',
      name: 'Remera Bus Park',
      code: 'REM-01',
      latitude: -1.9612,
      longitude: 30.1178,
      district: 'Gasabo',
      has_shelter: true,
      is_accessible: true
    };

    // Stale location from 10 minutes ago
    const staleLocation: BusLocation = {
      trip_id: 'trip-01',
      bus_id: 'bus-rad-234b',
      latitude: ROUTE_101_COORDINATES[4][0],
      longitude: ROUTE_101_COORDINATES[4][1],
      speed: 25.0,
      accuracy: 8.0,
      recorded_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    };

    const eta = calculateETA(staleLocation, 'RAD 234 B', 'bus-rad-234b', route, targetStop);
    expect(eta).not.toBeNull();
    if (eta) {
      expect(eta.is_stale).toBe(true);
      expect(eta.status).toBe('stale');
    }
  });
});
