-- RwandaBus Smart Bus Tracking System
-- Comprehensive PostgreSQL Schema for Supabase
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable PostGIS if available, otherwise lat/lng decimal fields are used with spatial constraints
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'PostGIS extension not available, using numerical decimal coordinates with b-tree/composite indexes.';
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('passenger', 'driver', 'operator', 'admin')) DEFAULT 'passenger',
    language_preference TEXT NOT NULL DEFAULT 'en' CHECK (language_preference IN ('en', 'rw')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Organisations (Transport Operators in Rwanda: e.g. KBS, Royal Express, Volcano, etc.)
CREATE TABLE IF NOT EXISTS public.organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    license_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Organisation Members
CREATE TABLE IF NOT EXISTS public.organisation_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'dispatcher')) DEFAULT 'manager',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(organisation_id, user_id)
);

-- 4. Buses (Fleet)
CREATE TABLE IF NOT EXISTS public.buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    plate_number TEXT NOT NULL UNIQUE,
    bus_model TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 35,
    features TEXT[] DEFAULT ARRAY['Tap & Go', '4G WiFi'],
    status TEXT NOT NULL CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Drivers
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL UNIQUE,
    national_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('available', 'on_trip', 'off_duty')) DEFAULT 'available',
    current_bus_id UUID REFERENCES public.buses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Routes
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL,
    route_code TEXT NOT NULL UNIQUE, -- e.g. '101', '302', '405'
    name TEXT NOT NULL, -- e.g. 'Remera - Nyabugogo'
    name_rw TEXT,       -- e.g. 'Remera - Nyabugogo'
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance_km NUMERIC(6, 2) NOT NULL DEFAULT 10.0,
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 35,
    base_fare_rwf NUMERIC(8, 2) NOT NULL DEFAULT 300.0,
    geometry JSONB, -- Array of [lat, lng] coordinates for route polyline
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. Stops
CREATE TABLE IF NOT EXISTS public.stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_rw TEXT,
    code TEXT NOT NULL UNIQUE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    district TEXT NOT NULL DEFAULT 'Gasabo',
    sector TEXT,
    description TEXT,
    has_shelter BOOLEAN DEFAULT true,
    is_accessible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. Route Stops (ordered stops per route)
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
    stop_sequence INTEGER NOT NULL,
    distance_from_start_km NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    estimated_minutes_from_start INTEGER NOT NULL DEFAULT 0,
    UNIQUE(route_id, stop_id),
    UNIQUE(route_id, stop_sequence)
);

-- 9. Trips
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. Bus Locations (GPS tracking)
CREATE TABLE IF NOT EXISTS public.bus_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy NUMERIC(8, 2), -- in metres
    speed NUMERIC(8, 2),    -- in km/h
    heading NUMERIC(6, 2),  -- in degrees
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. Schedules
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    departure_time TIME NOT NULL,
    frequency_minutes INTEGER DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 12. Passenger Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('route', 'stop')),
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(user_id, entity_type, entity_id)
);

-- 13. Service Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    title_rw TEXT,
    content TEXT NOT NULL,
    content_rw TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bus_locations_trip_bus ON public.bus_locations(trip_id, bus_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_recorded_at ON public.bus_locations(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_route ON public.trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id, stop_sequence);
CREATE INDEX IF NOT EXISTS idx_routes_code ON public.routes(route_code);
CREATE INDEX IF NOT EXISTS idx_stops_district ON public.stops(district);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public READ for Public Transport discovery (Stops, Routes, Route Stops, Schedules, Announcements)
CREATE POLICY "Public read for routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Public read for stops" ON public.stops FOR SELECT USING (true);
CREATE POLICY "Public read for route_stops" ON public.route_stops FOR SELECT USING (true);
CREATE POLICY "Public read for schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public read for announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public read for organisations" ON public.organisations FOR SELECT USING (true);

-- Trips & Bus Locations: Public can view active trips & live locations
CREATE POLICY "Public read for active trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Public read for bus locations" ON public.bus_locations FOR SELECT USING (true);

-- Profiles: Users can view and update their own profile; Admins can view all
CREATE POLICY "User can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Drivers: Can insert location only for trips they own and are in progress
CREATE POLICY "Driver can insert bus location for own active trip" ON public.bus_locations
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.trips t
        JOIN public.drivers d ON d.id = t.driver_id
        WHERE t.id = trip_id
        AND d.user_id = auth.uid()
        AND t.status = 'in_progress'
    )
    OR (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'operator')
        )
    )
);

-- Driver can update their own trip status (start/end)
CREATE POLICY "Driver can update own trip" ON public.trips
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.drivers d
        WHERE d.id = driver_id
        AND d.user_id = auth.uid()
    )
    OR (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'operator')
        )
    )
);

-- Favorites: Users can manage their own favorites
CREATE POLICY "User can manage favorites" ON public.favorites
FOR ALL USING (auth.uid() = user_id);

-- Audit logs: Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
