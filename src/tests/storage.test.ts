import { describe, it, expect, beforeEach } from 'vitest';
import { storage, telemetry } from '../lib/storage';

describe('RwandaBus Storage and Telemetry Subsystem', () => {
  beforeEach(() => {
    storage.resetToDefaults();
  });

  it('loads default Kigali routes and stops', () => {
    const routes = storage.getRoutes();
    const stops = storage.getStops();
    const buses = storage.getBuses();

    expect(routes.length).toBeGreaterThanOrEqual(4);
    expect(stops.length).toBeGreaterThanOrEqual(10);
    expect(buses.length).toBeGreaterThanOrEqual(4);

    // Verify presence of Line 101 Nyabugogo - Remera
    const route101 = routes.find(r => r.route_code === '101');
    expect(route101).toBeDefined();
    expect(route101?.origin).toBe('Nyabugogo Terminal');
    expect(route101?.destination).toBe('Remera Bus Park');
  });

  it('updates driver live location and broadcasts update', () => {
    const busId = 'bus-rad-234b';
    telemetry.updateDriverLocation(busId, {
      trip_id: 'trip-live-test',
      latitude: -1.9441,
      longitude: 30.0592,
      accuracy: 4.5,
      speed: 32.0,
      heading: 110.0,
      recorded_at: new Date().toISOString()
    });

    const loc = telemetry.getLocation(busId);
    expect(loc).toBeDefined();
    expect(loc?.latitude).toBe(-1.9441);
    expect(loc?.longitude).toBe(30.0592);
    expect(loc?.is_simulated).toBe(false);
  });

  it('manages passenger favorites', () => {
    const userId = 'test-passenger-user';
    const favRoute = {
      id: 'fav-1',
      user_id: userId,
      entity_type: 'route' as const,
      entity_id: 'route-101',
      created_at: new Date().toISOString()
    };

    storage.saveFavorites(userId, [favRoute]);
    const retrieved = storage.getFavorites(userId);
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].entity_id).toBe('route-101');
  });
});
