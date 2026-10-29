import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Bus as BusIcon,
  MapPin,
  Clock,
  Gauge,
  Navigation,
  Compass,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Bus, BusLocation, BusRoute, BusStop, ArrivalEstimate } from '../../types';
import { storage, telemetry } from '../../lib/storage';
import { calculateETA } from '../../lib/eta';
import { KIGALI_CENTER, DEFAULT_MAP_ZOOM } from '../../lib/constants';
import { useLanguage } from '../../context/LanguageContext';

interface LiveBusMapProps {
  selectedRouteId?: string;
  selectedStopId?: string;
  selectedBusId?: string;
  onSelectRoute?: (routeId: string) => void;
  onSelectStop?: (stop: BusStop) => void;
  onSelectBus?: (bus: Bus) => void;
  heightClass?: string;
}

// Controller component to smoothly pan/zoom map programmatically
const MapViewController: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
};

// Create custom SVG Leaflet div icons
const createBusIcon = (plate: string, isLive: boolean, heading: number = 0) => {
  const pulseClass = isLive ? 'pulse-active-bus' : '';
  const bgColor = isLive ? '#10B981' : '#F59E0B'; // Green for live, amber for stale

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div class="${pulseClass}" style="
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background-color: ${bgColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        border: 2px solid #FFFFFF;
        transform: rotate(${heading}deg);
        transition: transform 0.5s ease;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path>
          <path d="M15 6v6"></path>
          <path d="M2 12h19.6"></path>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C18.1 6.8 17.2 6 16.2 6H4.8C3.8 6 2.9 6.8 2.6 7.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
          <circle cx="7" cy="18" r="2"></circle>
          <circle cx="17" cy="18" r="2"></circle>
        </svg>
      </div>
      <div style="
        margin-top: 3px;
        background: #0F172A;
        color: #F8FAFC;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.2);
      ">
        ${plate}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-bus-marker',
    iconSize: [44, 52],
    iconAnchor: [22, 26],
    popupAnchor: [0, -26]
  });
};

const createStopIcon = (code: string, isSelected: boolean) => {
  const bgColor = isSelected ? '#3B82F6' : '#1E293B';
  const borderColor = isSelected ? '#93C5FD' : '#64748B';

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div style="
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background-color: ${bgColor};
        border: 2px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <span style="
        font-size: 9px;
        font-weight: 600;
        color: #1E293B;
        background: rgba(255,255,255,0.9);
        padding: 0 3px;
        border-radius: 2px;
        border: 1px solid #CBD5E1;
        margin-top: 1px;
      ">${code}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-stop-marker',
    iconSize: [30, 38],
    iconAnchor: [15, 19],
    popupAnchor: [0, -19]
  });
};

export const LiveBusMap: React.FC<LiveBusMapProps> = ({
  selectedRouteId: propRouteId,
  selectedStopId: propStopId,
  selectedBusId: propBusId,
  onSelectRoute,
  onSelectStop,
  onSelectBus,
  heightClass = 'h-[550px] md:h-[650px]'
}) => {
  const { t } = useLanguage();
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [locations, setLocations] = useState<BusLocation[]>([]);
  const [activeRouteFilter, setActiveRouteFilter] = useState<string>(propRouteId || 'all');
  const [isSimulating, setIsSimulating] = useState<boolean>(telemetry.getSimulationStatus());
  const [activeBusModal, setActiveBusModal] = useState<Bus | null>(null);
  const [activeStopModal, setActiveStopModal] = useState<BusStop | null>(null);

  // Load initial datasets
  useEffect(() => {
    setRoutes(storage.getRoutes());
    setStops(storage.getStops());
    setBuses(storage.getBuses());
    setLocations(telemetry.getAllLocations());

    // Subscribe to live telemetry and storage events
    const unsubscribe = storage.subscribe((event, payload) => {
      if (event === 'bus_location_update') {
        setLocations(telemetry.getAllLocations());
      } else if (event === 'routes') {
        setRoutes(storage.getRoutes());
      } else if (event === 'stops') {
        setStops(storage.getStops());
      } else if (event === 'buses') {
        setBuses(storage.getBuses());
      } else if (event === 'simulation_toggled') {
        setIsSimulating(payload as boolean);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync prop changes
  useEffect(() => {
    if (propRouteId) setActiveRouteFilter(propRouteId);
  }, [propRouteId]);

  // Selected route geometry
  const selectedRoute = useMemo(() => {
    if (activeRouteFilter === 'all') return null;
    return routes.find(r => r.id === activeRouteFilter) || null;
  }, [routes, activeRouteFilter]);

  // Filtered stops
  const displayedStops = useMemo(() => {
    if (!selectedRoute) return stops;
    const stopIds = new Set(selectedRoute.stops?.map(s => s.stop_id) || []);
    return stops.filter(s => stopIds.has(s.id));
  }, [stops, selectedRoute]);

  // Active buses with current location
  const busesWithLocation = useMemo(() => {
    return buses.map(bus => {
      const loc = locations.find(l => l.bus_id === bus.id);
      let isLive = false;
      let ageSeconds = 999;
      if (loc) {
        ageSeconds = Math.max(0, (Date.now() - new Date(loc.recorded_at).getTime()) / 1000);
        isLive = ageSeconds <= 120; // Up to 2 minutes considered live
      }
      return {
        ...bus,
        location: loc,
        isLive,
        ageSeconds
      };
    }).filter(b => b.location !== undefined);
  }, [buses, locations]);

  // Map center calculation
  const mapCenter: [number, number] = useMemo(() => {
    if (activeStopModal) {
      return [activeStopModal.latitude, activeStopModal.longitude];
    }
    if (activeBusModal && activeBusModal.id) {
      const loc = locations.find(l => l.bus_id === activeBusModal.id);
      if (loc) return [loc.latitude, loc.longitude];
    }
    return KIGALI_CENTER;
  }, [activeStopModal, activeBusModal, locations]);

  const toggleSimulation = () => {
    const nextState = !isSimulating;
    telemetry.toggleSimulation(nextState);
    setIsSimulating(nextState);
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900`}>
      {/* Floating Header Controls */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Route Filter Dropdown */}
        <div className="pointer-events-auto glass-panel px-3 py-1.5 rounded-xl shadow-lg border border-slate-200/80 flex items-center space-x-2 text-xs">
          <Sliders className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-slate-700 hidden sm:inline">Corridor:</span>
          <select
            value={activeRouteFilter}
            onChange={(e) => {
              setActiveRouteFilter(e.target.value);
              if (onSelectRoute) onSelectRoute(e.target.value);
            }}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Kigali Corridors ({routes.length})</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                Line {r.route_code}: {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Telemetry Status & Simulator Toggle */}
        <div className="pointer-events-auto flex items-center space-x-2">
          <div className="glass-panel px-3 py-1.5 rounded-xl shadow-lg border border-slate-200/80 flex items-center space-x-2 text-xs">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-800 hidden sm:inline">
              {busesWithLocation.filter(b => b.isLive).length} Buses Transmitting
            </span>
            <button
              onClick={toggleSimulation}
              title={isSimulating ? 'Pause simulated GPS telemetry' : 'Resume simulated GPS telemetry'}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center space-x-1 ${
                isSimulating
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              <span>{isSimulating ? 'SIM: ON' : 'SIM: PAUSED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <MapContainer
        center={KIGALI_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapViewController center={mapCenter} />

        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Render Route Polyline */}
        {selectedRoute && selectedRoute.geometry && (
          <Polyline
            positions={selectedRoute.geometry}
            pathOptions={{
              color: '#0077C8',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '8, 4'
            }}
          />
        )}

        {/* Render Bus Stops */}
        {displayedStops.map(stop => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={createStopIcon(stop.code, activeStopModal?.id === stop.id)}
            eventHandlers={{
              click: () => {
                setActiveStopModal(stop);
                setActiveBusModal(null);
                if (onSelectStop) onSelectStop(stop);
              }
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    {stop.code}
                  </span>
                  <span className="text-[10px] text-slate-500">{stop.district}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{stop.name}</h4>
                {stop.name_rw && (
                  <p className="text-xs text-slate-600 italic">{stop.name_rw}</p>
                )}
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <p>{stop.description || 'Public transit station'}</p>
                  <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-emerald-700">
                    {stop.has_shelter && <span>✓ Shelter</span>}
                    {stop.is_accessible && <span>✓ Accessible</span>}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Buses */}
        {busesWithLocation.map(bus => {
          const loc = bus.location!;
          return (
            <Marker
              key={bus.id}
              position={[loc.latitude, loc.longitude]}
              icon={createBusIcon(bus.plate_number, bus.isLive, loc.heading || 0)}
              eventHandlers={{
                click: () => {
                  setActiveBusModal(bus);
                  setActiveStopModal(null);
                  if (onSelectBus) onSelectBus(bus);
                }
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded">
                      {bus.plate_number}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      bus.isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {bus.isLive ? 'LIVE' : 'DELAYED / STALE'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-1">
                    {bus.bus_model}
                  </div>
                  <div className="text-xs text-slate-600">
                    Operator: {bus.organisation_name || 'Kigali Transit'}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Speed</span>
                      <span className="font-semibold text-slate-800">{loc.speed || 0} km/h</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">GPS Accuracy</span>
                      <span className="font-semibold text-slate-800">&plusmn;{Math.round(loc.accuracy || 5)} m</span>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400">
                    Updated {Math.round(bus.ageSeconds)}s ago ({loc.is_simulated ? 'Simulated Telemetry' : 'Driver GPS'})
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Bottom Stop/Bus ETA Card Preview */}
      {activeStopModal && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:w-96 z-30 glass-panel-dark text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                STOP: {activeStopModal.code}
              </span>
              <h3 className="font-bold text-base mt-1 text-white">{activeStopModal.name}</h3>
              <p className="text-xs text-slate-400">{activeStopModal.district} District • {activeStopModal.sector || 'Urban Area'}</p>
            </div>
            <button
              onClick={() => setActiveStopModal(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/60">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" /> Incoming Buses &amp; ETA
            </h4>

            {busesWithLocation.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No buses currently tracking towards this stop.</p>
            ) : (
              <div className="space-y-2">
                {busesWithLocation.map(bus => {
                  const matchingRoute = routes.find(r => r.stops?.some(s => s.stop_id === activeStopModal.id)) || routes[0];
                  const eta = calculateETA(bus.location!, bus.plate_number, bus.id, matchingRoute, activeStopModal);

                  if (!eta) return null;

                  return (
                    <div key={bus.id} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold font-mono text-white">{bus.plate_number}</span>
                          <span className="text-[10px] px-1.5 bg-slate-700 text-slate-300 rounded font-semibold">
                            Line {eta.route_code}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {eta.distance_km} km away • {bus.location?.speed || 25} km/h
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-emerald-400">
                          {eta.is_approaching ? 'Approaching' : `~${eta.estimated_minutes} min`}
                        </div>
                        <span className={`text-[9px] font-semibold uppercase ${
                          eta.is_stale ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {eta.is_stale ? 'Stale GPS' : 'On Track'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Map Legend Indicator */}
      <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center space-x-3 glass-panel px-3 py-1.5 rounded-xl text-[11px] text-slate-700 shadow-md">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Live Bus (&lt;2 min)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Stale/Delayed</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
          <span>Bus Stop</span>
        </div>
      </div>
    </div>
  );
};
