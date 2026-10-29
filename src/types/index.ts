// RwandaBus System Types

export type UserRole = 'passenger' | 'driver' | 'operator' | 'admin';
export type Language = 'en' | 'rw';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  language_preference: Language;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Organisation {
  id: string;
  name: string;
  code: string;
  contact_email?: string;
  contact_phone?: string;
  license_number?: string;
  is_active: boolean;
  logo_url?: string;
  created_at: string;
}

export interface Bus {
  id: string;
  organisation_id: string;
  organisation_name?: string;
  plate_number: string;
  bus_model: string;
  capacity: number;
  features: string[];
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
}

export interface Driver {
  id: string;
  user_id: string;
  organisation_id: string;
  organisation_name?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  license_number: string;
  national_id?: string;
  status: 'available' | 'on_trip' | 'off_duty';
  current_bus_id?: string;
  created_at: string;
}

export interface BusStop {
  id: string;
  name: string;
  name_rw?: string;
  code: string;
  latitude: number;
  longitude: number;
  district: string;
  sector?: string;
  description?: string;
  has_shelter: boolean;
  is_accessible: boolean;
  created_at?: string;
}

export interface RouteStop {
  id: string;
  route_id: string;
  stop_id: string;
  stop_sequence: number;
  distance_from_start_km: number;
  estimated_minutes_from_start: number;
  stop?: BusStop;
}

export interface BusRoute {
  id: string;
  organisation_id?: string;
  organisation_name?: string;
  route_code: string;
  name: string;
  name_rw?: string;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_duration_minutes: number;
  base_fare_rwf: number;
  geometry: [number, number][]; // Lat, Lng polyline
  is_active: boolean;
  stops?: RouteStop[];
  created_at?: string;
}

export interface Trip {
  id: string;
  route_id: string;
  bus_id: string;
  driver_id: string;
  organisation_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  direction: 'outbound' | 'inbound';
  notes?: string;
  route?: BusRoute;
  bus?: Bus;
  driver?: Driver;
  last_location?: BusLocation;
  created_at: string;
}

export interface BusLocation {
  id?: string;
  trip_id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number; // in meters
  speed?: number; // in km/h
  heading?: number; // in degrees
  recorded_at: string;
  is_simulated?: boolean;
}

export interface Schedule {
  id: string;
  route_id: string;
  day_of_week: number; // 0 = Sun, 1 = Mon ...
  departure_time: string;
  frequency_minutes: number;
  is_active: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  entity_type: 'route' | 'stop';
  entity_id: string;
  created_at: string;
  details?: BusRoute | BusStop;
}

export interface Announcement {
  id: string;
  organisation_id?: string;
  organisation_name?: string;
  title: string;
  title_rw?: string;
  content: string;
  content_rw?: string;
  severity: 'info' | 'warning' | 'critical';
  route_id?: string;
  route_name?: string;
  is_active: boolean;
  starts_at: string;
  expires_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface ArrivalEstimate {
  stop_id: string;
  stop_name: string;
  bus_id: string;
  plate_number: string;
  route_id: string;
  route_code: string;
  route_name: string;
  distance_km: number;
  estimated_minutes: number;
  is_approaching: boolean;
  is_stale: boolean;
  status: 'on_time' | 'delayed' | 'approaching' | 'stale';
  last_updated: string;
}
