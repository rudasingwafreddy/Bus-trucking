// Local Storage and Simulated Realtime Service for RwandaBus
import {
  Bus,
  BusLocation,
  BusRoute,
  BusStop,
  Driver,
  Organisation,
  Trip,
  Announcement,
  Favorite,
  AuditLog
} from '../types';
import {
  ROUTE_101_COORDINATES,
  ROUTE_102_COORDINATES,
  ROUTE_103_COORDINATES,
  ROUTE_201_COORDINATES
} from './constants';

const STORAGE_KEY_PREFIX = 'rwandabus_';

// Initial Mock Seed Data
const INITIAL_ORGANISATIONS: Organisation[] = [
  {
    id: 'org-kbs',
    name: 'Kigali Bus Services (KBS)',
    code: 'KBS',
    contact_email: 'operations@kbs.rw',
    contact_phone: '+250 788 100 100',
    license_number: 'RURA-LIC-2024-001',
    is_active: true,
    logo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop&q=60',
    created_at: new Date().toISOString()
  },
  {
    id: 'org-royal',
    name: 'Royal Express Rwanda',
    code: 'ROYAL',
    contact_email: 'dispatch@royalexpress.rw',
    contact_phone: '+250 788 200 200',
    license_number: 'RURA-LIC-2024-002',
    is_active: true,
    logo_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&auto=format&fit=crop&q=60',
    created_at: new Date().toISOString()
  },
  {
    id: 'org-rftc',
    name: 'RFTC Transport Cooperative',
    code: 'RFTC',
    contact_email: 'info@rftc.org.rw',
    contact_phone: '+250 788 300 300',
    license_number: 'RURA-LIC-2024-003',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const INITIAL_STOPS: BusStop[] = [
  {
    id: 'stop-nya-01',
    name: 'Nyabugogo Bus Terminal',
    name_rw: 'Icyapa cya Nyabugogo',
    code: 'NYA-01',
    latitude: -1.9392,
    longitude: 30.0442,
    district: 'Nyarugenge',
    sector: 'Gatsata',
    description: 'Major intercity hub & commercial terminal',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-dt-01',
    name: 'Downtown Bus Park',
    name_rw: 'Gare yo Mujyi (Downtown)',
    code: 'DT-01',
    latitude: -1.9441,
    longitude: 30.0592,
    district: 'Nyarugenge',
    sector: 'Nyarugenge',
    description: 'Central Business District bus terminal',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-kac-01',
    name: 'Kacyiru Executive Stop',
    name_rw: 'Icyapa cya Kacyiru',
    code: 'KAC-01',
    latitude: -1.9415,
    longitude: 30.088,
    district: 'Gasabo',
    sector: 'Kacyiru',
    description: 'Near Ministries and National Library',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-kcc-01',
    name: 'Kigali Heights / Convention Centre',
    name_rw: 'Kigali Heights',
    code: 'KCC-01',
    latitude: -1.9542,
    longitude: 30.0924,
    district: 'Gasabo',
    sector: 'Kimihurura',
    description: 'Convention Centre and shopping roundabout',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-gis-01',
    name: 'Gishushu Stop',
    name_rw: 'Icyapa cya Gishushu',
    code: 'GIS-01',
    latitude: -1.9568,
    longitude: 30.1035,
    district: 'Gasabo',
    sector: 'Remera',
    description: 'RDB and Parliament main transit stop',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-rem-01',
    name: 'Remera Bus Park (Gare)',
    name_rw: 'Gare ya Remera',
    code: 'REM-01',
    latitude: -1.9612,
    longitude: 30.1178,
    district: 'Gasabo',
    sector: 'Remera',
    description: 'Eastern terminal near Amahoro National Stadium',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-kim-01',
    name: 'Kimironko Bus Park',
    name_rw: 'Gare ya Kimironko',
    code: 'KIM-01',
    latitude: -1.9398,
    longitude: 30.1265,
    district: 'Gasabo',
    sector: 'Kimironko',
    description: 'Kimironko market and transit junction',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-kan-01',
    name: 'Kanombe Airport Junction',
    name_rw: "Ku Kibuga cy'Indege Kanombe",
    code: 'KAN-01',
    latitude: -1.9655,
    longitude: 30.134,
    district: 'Kicukiro',
    sector: 'Kanombe',
    description: 'Airport approach and Military Hospital',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-son-01',
    name: 'Sonatubes Junction',
    name_rw: 'Sonatubes Kicukiro',
    code: 'SON-01',
    latitude: -1.968,
    longitude: 30.089,
    district: 'Kicukiro',
    sector: 'Kicukiro',
    description: 'Southern access interchange',
    has_shelter: true,
    is_accessible: true
  },
  {
    id: 'stop-kic-01',
    name: 'Kicukiro Centre',
    name_rw: 'Kicukiro Centre',
    code: 'KIC-01',
    latitude: -1.986,
    longitude: 30.102,
    district: 'Kicukiro',
    sector: 'Kicukiro',
    description: 'Kicukiro district hub and market',
    has_shelter: true,
    is_accessible: true
  }
];

const INITIAL_ROUTES: BusRoute[] = [
  {
    id: 'route-101',
    organisation_id: 'org-kbs',
    organisation_name: 'Kigali Bus Services (KBS)',
    route_code: '101',
    name: 'Nyabugogo - Remera',
    name_rw: 'Nyabugogo - Remera',
    origin: 'Nyabugogo Terminal',
    destination: 'Remera Bus Park',
    distance_km: 12.5,
    estimated_duration_minutes: 35,
    base_fare_rwf: 300,
    geometry: ROUTE_101_COORDINATES,
    is_active: true,
    stops: [
      { id: 'rs-1', route_id: 'route-101', stop_id: 'stop-nya-01', stop_sequence: 1, distance_from_start_km: 0, estimated_minutes_from_start: 0, stop: INITIAL_STOPS[0] },
      { id: 'rs-2', route_id: 'route-101', stop_id: 'stop-kac-01', stop_sequence: 2, distance_from_start_km: 4.2, estimated_minutes_from_start: 12, stop: INITIAL_STOPS[2] },
      { id: 'rs-3', route_id: 'route-101', stop_id: 'stop-kcc-01', stop_sequence: 3, distance_from_start_km: 6.8, estimated_minutes_from_start: 18, stop: INITIAL_STOPS[3] },
      { id: 'rs-4', route_id: 'route-101', stop_id: 'stop-gis-01', stop_sequence: 4, distance_from_start_km: 8.5, estimated_minutes_from_start: 24, stop: INITIAL_STOPS[4] },
      { id: 'rs-5', route_id: 'route-101', stop_id: 'stop-rem-01', stop_sequence: 5, distance_from_start_km: 12.5, estimated_minutes_from_start: 35, stop: INITIAL_STOPS[5] }
    ]
  },
  {
    id: 'route-102',
    organisation_id: 'org-royal',
    organisation_name: 'Royal Express Rwanda',
    route_code: '102',
    name: 'Downtown - Kimironko',
    name_rw: 'Downtown - Kimironko',
    origin: 'Downtown Bus Park',
    destination: 'Kimironko Bus Park',
    distance_km: 11.0,
    estimated_duration_minutes: 30,
    base_fare_rwf: 280,
    geometry: ROUTE_102_COORDINATES,
    is_active: true,
    stops: [
      { id: 'rs-6', route_id: 'route-102', stop_id: 'stop-dt-01', stop_sequence: 1, distance_from_start_km: 0, estimated_minutes_from_start: 0, stop: INITIAL_STOPS[1] },
      { id: 'rs-7', route_id: 'route-102', stop_id: 'stop-kcc-01', stop_sequence: 2, distance_from_start_km: 4.0, estimated_minutes_from_start: 10, stop: INITIAL_STOPS[3] },
      { id: 'rs-8', route_id: 'route-102', stop_id: 'stop-gis-01', stop_sequence: 3, distance_from_start_km: 5.8, estimated_minutes_from_start: 16, stop: INITIAL_STOPS[4] },
      { id: 'rs-9', route_id: 'route-102', stop_id: 'stop-kim-01', stop_sequence: 4, distance_from_start_km: 11.0, estimated_minutes_from_start: 30, stop: INITIAL_STOPS[6] }
    ]
  },
  {
    id: 'route-103',
    organisation_id: 'org-kbs',
    organisation_name: 'Kigali Bus Services (KBS)',
    route_code: '103',
    name: 'Remera - Kanombe',
    name_rw: 'Remera - Kanombe',
    origin: 'Remera Bus Park',
    destination: 'Kanombe Airport Junction',
    distance_km: 6.8,
    estimated_duration_minutes: 20,
    base_fare_rwf: 220,
    geometry: ROUTE_103_COORDINATES,
    is_active: true,
    stops: [
      { id: 'rs-10', route_id: 'route-103', stop_id: 'stop-rem-01', stop_sequence: 1, distance_from_start_km: 0, estimated_minutes_from_start: 0, stop: INITIAL_STOPS[5] },
      { id: 'rs-11', route_id: 'route-103', stop_id: 'stop-son-01', stop_sequence: 2, distance_from_start_km: 3.2, estimated_minutes_from_start: 10, stop: INITIAL_STOPS[8] },
      { id: 'rs-12', route_id: 'route-103', stop_id: 'stop-kan-01', stop_sequence: 3, distance_from_start_km: 6.8, estimated_minutes_from_start: 20, stop: INITIAL_STOPS[7] }
    ]
  },
  {
    id: 'route-201',
    organisation_id: 'org-rftc',
    organisation_name: 'RFTC Transport Cooperative',
    route_code: '201',
    name: 'Downtown - Kicukiro Centre',
    name_rw: 'Downtown - Kicukiro',
    origin: 'Downtown Bus Park',
    destination: 'Kicukiro Centre',
    distance_km: 9.5,
    estimated_duration_minutes: 25,
    base_fare_rwf: 250,
    geometry: ROUTE_201_COORDINATES,
    is_active: true,
    stops: [
      { id: 'rs-13', route_id: 'route-201', stop_id: 'stop-dt-01', stop_sequence: 1, distance_from_start_km: 0, estimated_minutes_from_start: 0, stop: INITIAL_STOPS[1] },
      { id: 'rs-14', route_id: 'route-201', stop_id: 'stop-son-01', stop_sequence: 2, distance_from_start_km: 5.5, estimated_minutes_from_start: 14, stop: INITIAL_STOPS[8] },
      { id: 'rs-15', route_id: 'route-201', stop_id: 'stop-kic-01', stop_sequence: 3, distance_from_start_km: 9.5, estimated_minutes_from_start: 25, stop: INITIAL_STOPS[9] }
    ]
  }
];

const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-rad-234b',
    organisation_id: 'org-kbs',
    organisation_name: 'Kigali Bus Services (KBS)',
    plate_number: 'RAD 234 B',
    bus_model: 'Yutong City Master (45 seats)',
    capacity: 45,
    features: ['Tap & Go', '4G WiFi', 'Air Conditioned'],
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'bus-rac-789c',
    organisation_id: 'org-kbs',
    organisation_name: 'Kigali Bus Services (KBS)',
    plate_number: 'RAC 789 C',
    bus_model: 'Hyundai County (29 seats)',
    capacity: 29,
    features: ['Tap & Go', 'USB Chargers'],
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'bus-rae-412d',
    organisation_id: 'org-royal',
    organisation_name: 'Royal Express Rwanda',
    plate_number: 'RAE 412 D',
    bus_model: 'Scania Highline Citybus (55 seats)',
    capacity: 55,
    features: ['Tap & Go', 'Wheelchair Ramp', '4G WiFi'],
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'bus-raf-108a',
    organisation_id: 'org-rftc',
    organisation_name: 'RFTC Transport Cooperative',
    plate_number: 'RAF 108 A',
    bus_model: 'Toyota Coaster (30 seats)',
    capacity: 30,
    features: ['Tap & Go'],
    status: 'active',
    created_at: new Date().toISOString()
  }
];

const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'driver-01',
    user_id: 'user-driver-jean',
    organisation_id: 'org-kbs',
    organisation_name: 'Kigali Bus Services (KBS)',
    full_name: 'Jean Claude Mugisha',
    email: 'driver.kbs@rwandabus.rw',
    phone_number: '+250 788 555 101',
    license_number: 'RW-DL-88392-D',
    national_id: '1198580029348102',
    status: 'on_trip',
    current_bus_id: 'bus-rad-234b',
    created_at: new Date().toISOString()
  },
  {
    id: 'driver-02',
    user_id: 'user-driver-eric',
    organisation_id: 'org-royal',
    organisation_name: 'Royal Express Rwanda',
    full_name: 'Eric Habimana',
    email: 'driver.royal@rwandabus.rw',
    phone_number: '+250 788 555 102',
    license_number: 'RW-DL-99120-D',
    national_id: '1199080018273940',
    status: 'on_trip',
    current_bus_id: 'bus-rae-412d',
    created_at: new Date().toISOString()
  }
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-01',
    route_id: 'route-101',
    bus_id: 'bus-rad-234b',
    driver_id: 'driver-01',
    organisation_id: 'org-kbs',
    status: 'in_progress',
    direction: 'outbound',
    start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'trip-02',
    route_id: 'route-102',
    bus_id: 'bus-rae-412d',
    driver_id: 'driver-02',
    organisation_id: 'org-royal',
    status: 'in_progress',
    direction: 'outbound',
    start_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    organisation_id: 'org-kbs',
    organisation_name: 'Kigali Bus Services (KBS)',
    title: 'Peak Hours Fleet Expansion on Route 101',
    title_rw: "Kongera imodoka ku muhanda 101 mu masaha y'akazi",
    content: "Extra modern Yutong buses are operating between Nyabugogo and Remera between 17:00 and 20:30 to eliminate passenger queues.",
    content_rw: "Bisi nshya za Yutong zongerewe mu muhanda wa Nyabugogo - Remera hagati ya saa kumi n'imwe n'igice n'isaha ya kabiri n'igice z'ijoro.",
    severity: 'info',
    route_id: 'route-101',
    route_name: 'Nyabugogo - Remera',
    is_active: true,
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'ann-02',
    title: 'Amahoro Stadium Construction Traffic Advisory',
    title_rw: 'Itegeko ryo kwirinda umuvundo ku kibuga cya Amahoro',
    content: 'Expect minor route delays near Giporoso and Remera roundabout due to scheduled road line markings. Buses are moving steadily.',
    content_rw: "Mwirinde gutinda cyane hafi ya Giporoso no kuri Rond Point ya Remera kubera isanwa ry'imihanda.",
    severity: 'warning',
    is_active: true,
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

// Helper to access LocalStorage safely with memory fallback
class StorageManager {
  private memoryStore: Record<string, string> = {};

  private getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY_PREFIX + key);
      }
    } catch {
      // Fallback
    }
    return this.memoryStore[key] || null;
  }

  private setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_PREFIX + key, value);
      }
    } catch {
      // Fallback
    }
    this.memoryStore[key] = value;
  }

  // Loaders
  getOrganisations(): Organisation[] {
    const data = this.getItem('organisations');
    return data ? JSON.parse(data) : INITIAL_ORGANISATIONS;
  }

  saveOrganisations(orgs: Organisation[]): void {
    this.setItem('organisations', JSON.stringify(orgs));
  }

  getStops(): BusStop[] {
    const data = this.getItem('stops');
    return data ? JSON.parse(data) : INITIAL_STOPS;
  }

  saveStops(stops: BusStop[]): void {
    this.setItem('stops', JSON.stringify(stops));
    this.notifyListeners('stops');
  }

  getRoutes(): BusRoute[] {
    const data = this.getItem('routes');
    return data ? JSON.parse(data) : INITIAL_ROUTES;
  }

  saveRoutes(routes: BusRoute[]): void {
    this.setItem('routes', JSON.stringify(routes));
    this.notifyListeners('routes');
  }

  getBuses(): Bus[] {
    const data = this.getItem('buses');
    return data ? JSON.parse(data) : INITIAL_BUSES;
  }

  saveBuses(buses: Bus[]): void {
    this.setItem('buses', JSON.stringify(buses));
    this.notifyListeners('buses');
  }

  getDrivers(): Driver[] {
    const data = this.getItem('drivers');
    return data ? JSON.parse(data) : INITIAL_DRIVERS;
  }

  saveDrivers(drivers: Driver[]): void {
    this.setItem('drivers', JSON.stringify(drivers));
    this.notifyListeners('drivers');
  }

  getTrips(): Trip[] {
    const data = this.getItem('trips');
    return data ? JSON.parse(data) : INITIAL_TRIPS;
  }

  saveTrips(trips: Trip[]): void {
    this.setItem('trips', JSON.stringify(trips));
    this.notifyListeners('trips');
  }

  getAnnouncements(): Announcement[] {
    const data = this.getItem('announcements');
    return data ? JSON.parse(data) : INITIAL_ANNOUNCEMENTS;
  }

  saveAnnouncements(items: Announcement[]): void {
    this.setItem('announcements', JSON.stringify(items));
    this.notifyListeners('announcements');
  }

  getFavorites(userId: string): Favorite[] {
    const data = this.getItem(`favorites_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  saveFavorites(userId: string, favorites: Favorite[]): void {
    this.setItem(`favorites_${userId}`, JSON.stringify(favorites));
    this.notifyListeners('favorites');
  }

  getAuditLogs(): AuditLog[] {
    const data = this.getItem('audit_logs');
    return data ? JSON.parse(data) : [];
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...log,
      id: 'log-' + Date.now(),
      created_at: new Date().toISOString()
    };
    logs.unshift(newEntry);
    this.setItem('audit_logs', JSON.stringify(logs.slice(0, 100)));
  }

  resetToDefaults(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => window.localStorage.removeItem(k));
    }
    this.memoryStore = {};
    this.notifyListeners('all');
  }

  // Real-time Event Subscription Hub
  private listeners: Set<(event: string, payload?: unknown) => void> = new Set();

  subscribe(listener: (event: string, payload?: unknown) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(event: string, payload?: unknown): void {
    this.listeners.forEach(cb => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Error notifying storage listener', err);
      }
    });
  }
}

export const storage = new StorageManager();

/**
 * Real-time Bus Telemetry Simulator & State Manager
 */
class TelemetryManager {
  private activeLocations: Map<string, BusLocation> = new Map();
  private simulationInterval: number | null = null;
  private isSimulationEnabled: boolean = true;
  private progressSteps: Map<string, number> = new Map();

  constructor() {
    this.initDefaultLocations();
    this.startSimulation();
  }

  private initDefaultLocations() {
    // Bus 1 (Route 101) near Kacyiru
    this.activeLocations.set('bus-rad-234b', {
      trip_id: 'trip-01',
      bus_id: 'bus-rad-234b',
      latitude: ROUTE_101_COORDINATES[3][0],
      longitude: ROUTE_101_COORDINATES[3][1],
      accuracy: 6.5,
      speed: 28.5,
      heading: 95.0,
      recorded_at: new Date().toISOString(),
      is_simulated: true
    });

    // Bus 2 (Route 102) near Kigali Heights
    this.activeLocations.set('bus-rae-412d', {
      trip_id: 'trip-02',
      bus_id: 'bus-rae-412d',
      latitude: ROUTE_102_COORDINATES[2][0],
      longitude: ROUTE_102_COORDINATES[2][1],
      accuracy: 5.0,
      speed: 31.0,
      heading: 105.0,
      recorded_at: new Date().toISOString(),
      is_simulated: true
    });

    this.progressSteps.set('bus-rad-234b', 3);
    this.progressSteps.set('bus-rae-412d', 2);
  }

  getLocation(busId: string): BusLocation | undefined {
    return this.activeLocations.get(busId);
  }

  getAllLocations(): BusLocation[] {
    return Array.from(this.activeLocations.values());
  }

  // Update from Real Driver GPS
  updateDriverLocation(busId: string, location: Omit<BusLocation, 'bus_id'>): void {
    const record: BusLocation = {
      ...location,
      bus_id: busId,
      is_simulated: false
    };
    this.activeLocations.set(busId, record);
    storage.notifyListeners('bus_location_update', record);
  }

  toggleSimulation(enabled: boolean): void {
    this.isSimulationEnabled = enabled;
    if (enabled && !this.simulationInterval) {
      this.startSimulation();
    } else if (!enabled && this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    storage.notifyListeners('simulation_toggled', enabled);
  }

  getSimulationStatus(): boolean {
    return this.isSimulationEnabled;
  }

  private startSimulation(): void {
    if (typeof window === 'undefined') return;

    this.simulationInterval = window.setInterval(() => {
      if (!this.isSimulationEnabled) return;

      // Animate Bus 1 along Route 101
      const step1 = (this.progressSteps.get('bus-rad-234b') || 0) + 1;
      const targetStep1 = step1 % ROUTE_101_COORDINATES.length;
      this.progressSteps.set('bus-rad-234b', targetStep1);
      const coord1 = ROUTE_101_COORDINATES[targetStep1];

      const loc1: BusLocation = {
        trip_id: 'trip-01',
        bus_id: 'bus-rad-234b',
        latitude: coord1[0] + (Math.random() - 0.5) * 0.0003,
        longitude: coord1[1] + (Math.random() - 0.5) * 0.0003,
        accuracy: 4.8 + Math.random() * 2,
        speed: 25 + Math.round(Math.random() * 15),
        heading: 90 + Math.round(Math.random() * 20),
        recorded_at: new Date().toISOString(),
        is_simulated: true
      };
      this.activeLocations.set('bus-rad-234b', loc1);

      // Animate Bus 2 along Route 102
      const step2 = (this.progressSteps.get('bus-rae-412d') || 0) + 1;
      const targetStep2 = step2 % ROUTE_102_COORDINATES.length;
      this.progressSteps.set('bus-rae-412d', targetStep2);
      const coord2 = ROUTE_102_COORDINATES[targetStep2];

      const loc2: BusLocation = {
        trip_id: 'trip-02',
        bus_id: 'bus-rae-412d',
        latitude: coord2[0] + (Math.random() - 0.5) * 0.0003,
        longitude: coord2[1] + (Math.random() - 0.5) * 0.0003,
        accuracy: 5.2 + Math.random() * 2,
        speed: 28 + Math.round(Math.random() * 12),
        heading: 100 + Math.round(Math.random() * 15),
        recorded_at: new Date().toISOString(),
        is_simulated: true
      };
      this.activeLocations.set('bus-rae-412d', loc2);

      // Notify real-time listeners
      storage.notifyListeners('bus_location_update', [loc1, loc2]);
    }, 6000); // Realistic 6s live interval
  }
}

export const telemetry = new TelemetryManager();
