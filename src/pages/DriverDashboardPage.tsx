import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Play,
  Square,
  Pause,
  RotateCw,
  Radio,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Gauge,
  Compass,
  Clock,
  Shield,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { storage, telemetry } from '../lib/storage';
import { ROUTE_101_COORDINATES } from '../lib/constants';
import { Bus, BusRoute, Driver, Trip, BusLocation } from '../types';

export const DriverDashboardPage: React.FC = () => {
  const { user, role, loginAsDemoRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [assignedBus, setAssignedBus] = useState<Bus | null>(null);
  const [assignedRoute, setAssignedRoute] = useState<BusRoute | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  // Tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  } | null>(null);
  const [updatesCount, setUpdatesCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const watchIdRef = useRef<number | null>(null);
  const intervalTimerRef = useRef<number | null>(null);

  // Auto-switch role if opened while role is passenger
  useEffect(() => {
    if (role !== 'driver') {
      loginAsDemoRole('driver');
    }
  }, [role, loginAsDemoRole]);

  // Load driver and assignment data
  useEffect(() => {
    const drivers = storage.getDrivers();
    const current = drivers[0]; // Primary KBS driver: Jean Claude Mugisha
    setDriver(current);

    const buses = storage.getBuses();
    const bus = buses.find(b => b.id === current.current_bus_id) || buses[0];
    setAssignedBus(bus);

    const routes = storage.getRoutes();
    const route = routes[0]; // Route 101: Nyabugogo - Remera
    setAssignedRoute(route);

    const trips = storage.getTrips();
    const existingTrip = trips.find(t => t.driver_id === current.id && t.status === 'in_progress');
    if (existingTrip) {
      setActiveTrip(existingTrip);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopTracking();
    };
  }, []);

  // Transmit location to storage / telemetry engine
  const transmitLocation = (coords: GeolocationCoordinates) => {
    if (!assignedBus || !activeTrip) return;

    const loc: Omit<BusLocation, 'bus_id'> = {
      trip_id: activeTrip.id,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      speed: coords.speed ? Number((coords.speed * 3.6).toFixed(1)) : 28.0, // convert m/s to km/h or default Kigali average
      heading: coords.heading || 90.0,
      recorded_at: new Date().toISOString(),
      is_simulated: false
    };

    telemetry.updateDriverLocation(assignedBus.id, loc);
    setUpdatesCount(prev => prev + 1);
    setLastSyncTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Kigali' }));
    setCurrentCoords({
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy,
      speed: loc.speed || null,
      heading: loc.heading || null
    });
  };

  const startTrip = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your mobile browser.');
      return;
    }

    if (!assignedBus || !assignedRoute || !driver) return;

    // Check if active trip already exists
    let trip = activeTrip;
    if (!trip) {
      trip = {
        id: 'trip-live-' + Date.now(),
        route_id: assignedRoute.id,
        bus_id: assignedBus.id,
        driver_id: driver.id,
        organisation_id: driver.organisation_id,
        status: 'in_progress',
        direction: 'outbound',
        start_time: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      const trips = storage.getTrips();
      storage.saveTrips([trip, ...trips]);
      setActiveTrip(trip);
    }

    setGpsError(null);
    setIsTracking(true);
    setIsPaused(false);

    // Request GPS permission and begin watching
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setGpsError(null);
          transmitLocation(position.coords);
        },
        (error) => {
          let msg = 'GPS connection interrupted.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'GPS Permission denied. Please enable location services in your browser settings to transmit bus coordinates.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'GPS position is temporarily unavailable. Attempting to reconnect...';
          }
          setGpsError(msg);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );
    } catch (e) {
      setGpsError('Unable to start GPS watcher on this device.');
    }
  };

  const pauseTracking = () => {
    setIsPaused(true);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const resumeTracking = () => {
    setIsPaused(false);
    startTrip();
  };

  const startSimulatedDrive = () => {
    if (!assignedBus || !assignedRoute || !driver) return;

    let trip = activeTrip;
    if (!trip) {
      trip = {
        id: 'trip-live-' + Date.now(),
        route_id: assignedRoute.id,
        bus_id: assignedBus.id,
        driver_id: driver.id,
        organisation_id: driver.organisation_id,
        status: 'in_progress',
        direction: 'outbound',
        start_time: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      const trips = storage.getTrips();
      storage.saveTrips([trip, ...trips]);
      setActiveTrip(trip);
    }

    setGpsError(null);
    setIsTracking(true);
    setIsPaused(false);

    let stepIndex = 0;
    if (intervalTimerRef.current !== null) {
      clearInterval(intervalTimerRef.current);
    }

    intervalTimerRef.current = window.setInterval(() => {
      const coord = ROUTE_101_COORDINATES[stepIndex % ROUTE_101_COORDINATES.length];
      stepIndex++;

      const speed = 25 + Math.round(Math.random() * 15);
      const heading = 90 + Math.round(Math.random() * 20);

      const loc: Omit<BusLocation, 'bus_id'> = {
        trip_id: trip!.id,
        latitude: coord[0],
        longitude: coord[1],
        accuracy: 4.5,
        speed,
        heading,
        recorded_at: new Date().toISOString(),
        is_simulated: false
      };

      telemetry.updateDriverLocation(assignedBus.id, loc);
      setUpdatesCount(prev => prev + 1);
      setLastSyncTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Kigali' }));
      setCurrentCoords({
        lat: coord[0],
        lng: coord[1],
        accuracy: 4.5,
        speed,
        heading
      });
    }, 4000);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalTimerRef.current !== null) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    setIsTracking(false);
    setIsPaused(false);
  };

  const endTrip = () => {
    if (!window.confirm('Are you sure you want to end this active trip and stop live GPS sharing?')) {
      return;
    }

    stopTracking();

    if (activeTrip) {
      const trips = storage.getTrips().map(t => {
        if (t.id === activeTrip.id) {
          return { ...t, status: 'completed' as const, end_time: new Date().toISOString() };
        }
        return t;
      });
      storage.saveTrips(trips);
      setActiveTrip(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Driver Top Header */}
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base">{driver?.full_name || 'Driver Jean Claude'}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DRIVER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {driver?.organisation_name || 'Kigali Bus Services (KBS)'} • License {driver?.license_number}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1.5 justify-end">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-500'} inline-block`}></span>
              <span className="text-xs font-semibold text-slate-300">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Kigali UTC+2</span>
          </div>
        </div>

        {/* Assigned Vehicle & Route Card */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-lg space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Current Assignment</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 block font-semibold">Assigned Bus</span>
              <span className="font-mono font-extrabold text-base text-white block mt-1">
                {assignedBus?.plate_number || 'RAD 234 B'}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {assignedBus?.bus_model || 'Yutong City Master'}
              </span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 block font-semibold">Operating Route</span>
              <span className="font-extrabold text-base text-white block mt-1">
                Line {assignedRoute?.route_code || '101'}
              </span>
              <span className="text-[10px] text-blue-400 font-medium">
                {assignedRoute?.name || 'Nyabugogo - Remera'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Trip Status and Controls */}
        <div className="bg-slate-800/90 p-6 rounded-3xl border border-slate-700 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-xl text-white">Trip &amp; Telemetry Status</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTracking
                  ? isPaused
                    ? 'Tracking is paused. Passengers see last transmitted position.'
                    : 'Transmitting live coordinates to Kigali transit map every 5–10s.'
                  : 'Start an authorised trip to begin broadcasting real-time location.'}
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isTracking && !isPaused
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                : isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-700 text-slate-300 border-slate-600'
            }`}>
              {isTracking && !isPaused ? 'TRANSMITTING' : isPaused ? 'PAUSED' : 'STANDBY'}
            </span>
          </div>

          {/* GPS telemetry telemetry dials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <Gauge className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-xs text-slate-400 block">Speed</span>
              <span className="text-base font-black text-white">
                {currentCoords?.speed !== null && currentCoords?.speed !== undefined ? `${currentCoords.speed} km/h` : '0 km/h'}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <Navigation className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-xs text-slate-400 block">Accuracy</span>
              <span className="text-base font-black text-white">
                {currentCoords?.accuracy ? `±${Math.round(currentCoords.accuracy)}m` : '±6m'}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <RotateCw className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-xs text-slate-400 block">Updates</span>
              <span className="text-base font-black text-white">{updatesCount}</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <Clock className="w-4 h-4 text-teal-400 mx-auto mb-1" />
              <span className="text-xs text-slate-400 block">Last Sync</span>
              <span className="text-xs font-bold text-white mt-1 block">
                {lastSyncTime || '--:--'}
              </span>
            </div>
          </div>

          {/* Error / Warning Notice */}
          {gpsError && (
            <div className="bg-red-950/50 border border-red-800 p-4 rounded-2xl flex items-start space-x-3 text-xs text-red-300">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-200 font-bold mb-0.5">Location Access Warning</strong>
                {gpsError}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isTracking ? (
              <div className="space-y-2">
                <button
                  onClick={startTrip}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/20 transition flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Start Trip &amp; Share Real Device GPS</span>
                </button>

                <button
                  onClick={startSimulatedDrive}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-750 text-emerald-400 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Simulate Driving Route 101 (Nyabugogo &rarr; Remera)</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {isPaused ? (
                  <button
                    onClick={resumeTracking}
                    className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume GPS</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseTracking}
                    className="py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause GPS</span>
                  </button>
                )}

                <button
                  onClick={endTrip}
                  className="py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center space-x-2 shadow-md"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>End Trip</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Operating & Browser Background Guidelines */}
        <div className="bg-slate-950/70 p-5 rounded-3xl border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <div className="flex items-center space-x-2 text-slate-300 font-bold">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Driver Browser &amp; Battery Guidelines</span>
          </div>
          <p className="leading-relaxed">
            • <strong>Keep Screen Active:</strong> Mobile browsers may pause GPS background execution when the screen is locked or browser minimized. Keep your phone mounted and screen awake.
          </p>
          <p className="leading-relaxed">
            • <strong>Network Stability:</strong> If 3G/4G connectivity drops, coordinates are temporarily queued and will sync automatically once signal returns.
          </p>
          <p className="leading-relaxed">
            • <strong>Android Native Extension:</strong> This browser portal can be packaged via Android WebView / Capacitor for native background service execution in a fleet setup.
          </p>
        </div>
      </div>
    </div>
  );
};
