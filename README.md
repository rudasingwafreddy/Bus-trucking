# RwandaBus — Rwanda Smart Bus Tracking System

An end-to-end, production-ready real-time public transit tracking platform engineered for Kigali and adaptable across all 30 districts of Rwanda.

RwandaBus enables passengers to track buses in real time, view live arrival estimates (ETA) for nearby stops, explore transport corridors, and view service notices. It provides dedicated workspaces for **Passengers**, **Bus Drivers** (GPS transmission), **Transport Operators** (fleet and route management for KBS, Royal Express, RFTC), and **System Administrators** (root oversight and security audit logs).

---

## 🌟 Key Features

1. **Live GPS Telemetry & Interactive Map**
   - Centred on Kigali (`-1.9441, 30.0619`) with full pan, zoom, and mobile responsiveness.
   - Live bus markers with direction headings, speed dials, and automatic staleness flagging (&gt;2 minutes).
   - High-contrast route polyline geometry with ordered stop timelines.
   - Controlled demonstration simulation engine that can be toggled on/off without confusion.

2. **Explainable Estimated Arrival Times (ETA)**
   - Calculates path distance along actual road corridors rather than misleading straight lines.
   - Integrates current speed, intermediate stop dwell times, and Kigali urban traffic heuristics.
   - Transparently alerts passengers when GPS signal is stale.

3. **Dedicated Mobile Driver Dashboard (`/driver`)**
   - Vehicle and route assignment inspection.
   - Starts trips and shares browser GPS coordinates every 5–10 seconds.
   - Pause / resume controls with connection status and sync counter.
   - Graceful offline recovery if cellular connection fluctuates.

4. **Transport Operator Portal (`/operator/dashboard`)**
   - Fleet registration (Yutong, Scania, Toyota Coaster with Rwandan plates `RAD ...`).
   - Driver assignment roster.
   - Service notices and peak-hour disruption broadcasts.
   - Performance metrics and CSV fleet report exports.

5. **System Administrator Console (`/admin`)**
   - System health and real-time telemetry freshness monitoring.
   - Audit logs tracking user actions, logins, and fleet modifications.
   - Verified Rwandan transit data importer (GeoJSON / GTFS JSON payload).
   - One-click factory reset for testing data.

6. **Rwanda-Centric Configuration**
   - Default Timezone: `Africa/Kigali` (UTC+2).
   - Currency: Rwandan Franc (`RWF`).
   - Country Code: `+250`.
   - Bilingual: Instant switching between **English** and **Ikinyarwanda**.
   - Coverage across Gasabo, Nyarugenge, and Kicukiro districts.

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Mapping**: Leaflet, React Leaflet, OpenStreetMap
- **State Management**: TanStack React Query, Context API
- **Backend & Database**: Supabase, PostgreSQL, Row Level Security (RLS)
- **Telemetry**: Browser Geolocation API + Real-time simulation engine
- **Testing**: Vitest, React Testing Library

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js `18.0.0` or higher (`v24.x` recommended)
- npm `9.x` or higher

### 2. Installation
```bash
git clone <repo-url>
cd "Bus tracking"
npm install
```

### 3. Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```
*(The application automatically runs in a high-fidelity local demonstration mode if Supabase credentials are not provided.)*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Evaluating the 4 User Roles

Use the **Role Dropdown** at the top right of the application or the **Sign In** page to test any role in one click:

| Role | Demo Account | Dedicated Workspace | Capabilities |
| :--- | :--- | :--- | :--- |
| **Passenger** | Aline Uwase | `/` & `/map` | Search routes, discover nearby stops, calculate ETAs, bookmark favorites |
| **Bus Driver** | Jean Claude Mugisha (KBS) | `/driver` | Start trip, share GPS location every 6s, view speed & sync counter |
| **Transport Operator** | Patrick Ndayisaba (KBS Fleet) | `/operator/dashboard` | Manage buses, assign drivers, post service alerts, export CSV reports |
| **Administrator** | Root Transit Oversight | `/admin` | System health, telemetry diagnostics, audit trail, import verified data |

---

## 🗄 Database Setup & Supabase Migrations

The database schema and sample data are located in `supabase/`:

1. **Schema Migration**: `supabase/migrations/20261026000001_initial_schema.sql`
   - Defines 14 tables: `profiles`, `organisations`, `organisation_members`, `buses`, `drivers`, `routes`, `stops`, `route_stops`, `trips`, `bus_locations`, `schedules`, `favorites`, `announcements`, `audit_logs`.
   - Comprehensive Row Level Security (RLS) policies protecting GPS write operations and private fleet records.
2. **Seed Data**: `supabase/seed.sql`
   - Authentic Kigali transit data: Line 101 (Nyabugogo – Remera), Line 102 (Downtown – Kimironko), Line 103 (Remera – Kanombe), Line 201 (Downtown – Kicukiro).
   - Bus terminals: Nyabugogo, Downtown, Kigali Heights, Remera, Kimironko, Kanombe Airport.

To apply directly to your Supabase project:
```bash
supabase db push
# or run the SQL in your Supabase SQL Editor
```

---

## 🗺 Importing Verified Rwandan Routes & Stops

Administrators can navigate to `/admin` &rarr; **Verified Data Importer** to upload surveyed GPS routes:

```json
{
  "routes": [
    {
      "id": "route-new",
      "route_code": "104",
      "name": "Kicukiro - Nyabugogo Express",
      "origin": "Kicukiro Centre",
      "destination": "Nyabugogo",
      "distance_km": 11.2,
      "estimated_duration_minutes": 32,
      "base_fare_rwf": 300,
      "geometry": [[-1.9860, 30.1020], [-1.9392, 30.0442]],
      "is_active": true
    }
  ],
  "stops": []
}
```

---

## 🧪 Testing & Production Build

### Run Unit Tests
```bash
npm run test
```

### Production Build
```bash
npm run build
```

---

## 📜 Compliance & Attribution

RwandaBus is an independent transport platform developed for demonstration and operational deployment. It is not affiliated with any official government agency. All trademarks, cooperative names, and transport licenses belong to their respective registered entities in Rwanda.
