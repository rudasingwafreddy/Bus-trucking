-- RwandaBus Demo & Seed Data
-- Realistic sample transport data for Kigali, Rwanda (clearly marked as Demonstration Data)

-- 1. Insert Transport Organisations
INSERT INTO public.organisations (id, name, code, contact_email, contact_phone, license_number, is_active)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Kigali Bus Services (KBS)', 'KBS', 'operations@kbs.rw', '+250788100100', 'RURA-LIC-2024-001', true),
  ('a2222222-2222-2222-2222-222222222222', 'Royal Express Rwanda', 'ROYAL', 'dispatch@royalexpress.rw', '+250788200200', 'RURA-LIC-2024-002', true),
  ('a3333333-3333-3333-3333-333333333333', 'RFTC Transport Cooperative', 'RFTC', 'info@rftc.org.rw', '+250788300300', 'RURA-LIC-2024-003', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Bus Stops in Kigali
-- Latitude ~ -1.94 to -1.97, Longitude ~ 30.04 to 30.13
INSERT INTO public.stops (id, name, name_rw, code, latitude, longitude, district, sector, description, has_shelter, is_accessible)
VALUES
  ('s0000001-0000-0000-0000-000000000001', 'Nyabugogo Bus Terminal', 'Icyapa cya Nyabugogo', 'NYA-01', -1.939200, 30.044200, 'Nyarugenge', 'Gatsata', 'Major intercity and urban transit hub', true, true),
  ('s0000002-0000-0000-0000-000000000002', 'Downtown Bus Park', 'Gare yo Mujyi (Downtown)', 'DT-01', -1.944100, 30.059200, 'Nyarugenge', 'Nyarugenge', 'Central business district main park', true, true),
  ('s0000003-0000-0000-0000-000000000003', 'Kacyiru Executive Stop', 'Icyapa cya Kacyiru', 'KAC-01', -1.941500, 30.088000, 'Gasabo', 'Kacyiru', 'Near Ministry and Library complex', true, true),
  ('s0000004-0000-0000-0000-000000000004', 'Kigali Heights / Convention Centre', 'Kigali Heights', 'KCC-01', -1.954200, 30.092400, 'Gasabo', 'Kimihurura', 'Convention and business node', true, true),
  ('s0000005-0000-0000-0000-000000000005', 'Gishushu Stop', 'Icyapa cya Gishushu', 'GIS-01', -1.956800, 30.103500, 'Gasabo', 'Remera', 'RDB & Parliament intersection', true, true),
  ('s0000006-0000-0000-0000-000000000006', 'Remera Bus Park (Gare)', 'Gare ya Remera', 'REM-01', -1.961200, 30.117800, 'Gasabo', 'Remera', 'Major eastern hub near Amahoro Stadium', true, true),
  ('s0000007-0000-0000-0000-000000000007', 'Kimironko Bus Park', 'Gare ya Kimironko', 'KIM-01', -1.939800, 30.126500, 'Gasabo', 'Kimironko', 'Busy transit and market junction', true, true),
  ('s0000008-0000-0000-0000-000000000008', 'Kanombe Airport Junction', 'Ku Kibuga cy''Indege Kanombe', 'KAN-01', -1.965500, 30.134000, 'Kicukiro', 'Kanombe', 'Kigali International Airport approach', true, true),
  ('s0000009-0000-0000-0000-000000000009', 'Sonatubes Junction', 'Sonatubes Kicukiro', 'SON-01', -1.968000, 30.089000, 'Kicukiro', 'Kicukiro', 'Southern axis transit interchange', true, true),
  ('s0000010-0000-0000-0000-000000000010', 'Kicukiro Centre', 'Kicukiro Centre', 'KIC-01', -1.986000, 30.102000, 'Kicukiro', 'Kicukiro', 'Kicukiro district center', true, true)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Bus Routes
INSERT INTO public.routes (id, organisation_id, route_code, name, name_rw, origin, destination, distance_km, estimated_duration_minutes, base_fare_rwf, is_active)
VALUES
  ('r0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', '101', 'Nyabugogo - Remera', 'Nyabugogo - Remera', 'Nyabugogo', 'Remera', 12.5, 35, 300.0, true),
  ('r0000002-0000-0000-0000-000000000002', 'a2222222-2222-2222-2222-222222222222', '102', 'Downtown - Kimironko', 'Downtown - Kimironko', 'Downtown', 'Kimironko', 11.0, 30, 280.0, true),
  ('r0000003-0000-0000-0000-000000000003', 'a1111111-1111-1111-1111-111111111111', '103', 'Remera - Kanombe', 'Remera - Kanombe', 'Remera', 'Kanombe', 6.8, 20, 220.0, true),
  ('r0000004-0000-0000-0000-000000000004', 'a3333333-3333-3333-3333-333333333333', '201', 'Downtown - Kicukiro Centre', 'Downtown - Kicukiro', 'Downtown', 'Kicukiro Centre', 9.5, 25, 250.0, true)
ON CONFLICT (route_code) DO NOTHING;

-- 4. Insert Route Stops
-- Route 101: Nyabugogo -> Kacyiru -> Kigali Heights -> Gishushu -> Remera
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, estimated_minutes_from_start)
VALUES
  ('r0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 1, 0.0, 0),
  ('r0000001-0000-0000-0000-000000000001', 's0000003-0000-0000-0000-000000000003', 2, 4.2, 12),
  ('r0000001-0000-0000-0000-000000000001', 's0000004-0000-0000-0000-000000000004', 3, 6.8, 18),
  ('r0000001-0000-0000-0000-000000000001', 's0000005-0000-0000-0000-000000000005', 4, 8.5, 24),
  ('r0000001-0000-0000-0000-000000000001', 's0000006-0000-0000-0000-000000000006', 5, 12.5, 35)
ON CONFLICT DO NOTHING;

-- Route 102: Downtown -> Kigali Heights -> Gishushu -> Kimironko
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, estimated_minutes_from_start)
VALUES
  ('r0000002-0000-0000-0000-000000000002', 's0000002-0000-0000-0000-000000000002', 1, 0.0, 0),
  ('r0000002-0000-0000-0000-000000000002', 's0000004-0000-0000-0000-000000000004', 2, 4.0, 10),
  ('r0000002-0000-0000-0000-000000000002', 's0000005-0000-0000-0000-000000000005', 3, 5.8, 16),
  ('r0000002-0000-0000-0000-000000000002', 's0000007-0000-0000-0000-000000000007', 4, 11.0, 30)
ON CONFLICT DO NOTHING;

-- 5. Insert Buses
INSERT INTO public.buses (id, organisation_id, plate_number, bus_model, capacity, features, status)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'RAD 234 B', 'Yutong City Master (45 seats)', 45, ARRAY['Tap & Go', '4G WiFi', 'Air Conditioned'], 'active'),
  ('b0000002-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 'RAC 789 C', 'Hyundai County (29 seats)', 29, ARRAY['Tap & Go', 'USB Chargers'], 'active'),
  ('b0000003-0000-0000-0000-000000000003', 'a2222222-2222-2222-2222-222222222222', 'RAE 412 D', 'Scania Highline Citybus', 55, ARRAY['Tap & Go', 'Wheelchair Ramp', '4G WiFi'], 'active'),
  ('b0000004-0000-0000-0000-000000000004', 'a3333333-3333-3333-3333-333333333333', 'RAF 108 A', 'Toyota Coaster (30 seats)', 30, ARRAY['Tap & Go'], 'active')
ON CONFLICT (plate_number) DO NOTHING;

-- 6. Insert Announcements
INSERT INTO public.announcements (id, organisation_id, title, title_rw, content, content_rw, severity, is_active)
VALUES
  ('m0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'Peak Hours Service Enhancement', 'Kongera imodoka mu masaha y''akazi kenshi', 'Additional buses have been deployed on Route 101 (Nyabugogo - Remera) to reduce wait times during evening peak.', 'Imodoka zongerewe mu muhanda wa 101 Nyabugogo - Remera kugira ngo abagenzi batinda bibe bike mu masaha y''umugoroba.', 'info', true),
  ('m0000002-0000-0000-0000-000000000002', NULL, 'Kigali Marathon Road Closures This Weekend', 'Imihanda izafungwa kubera Kigali Marathon muri iyi wikendi', 'Please anticipate rerouting around Amahoro Stadium and KG 1 Roundabout on Sunday morning.', 'Mwitegure impinduka z''imihanda ikikije Stade Amahoro no kuri Rond Point ya KG 1 ku cyumweru mu gitondo.', 'warning', true)
ON CONFLICT DO NOTHING;
