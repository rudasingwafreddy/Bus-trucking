import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LiveBusMap } from '../components/map/LiveBusMap';
import { storage, telemetry } from '../lib/storage';
import { Bus, BusLocation, BusRoute, BusStop } from '../types';
import { calculateETA } from '../lib/eta';
import {
  Bus as BusIcon,
  MapPin,
  Route as RouteIcon,
  Sliders,
  Radio,
  Clock,
  Gauge,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LiveMapPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialRouteId = searchParams.get('route') || 'all';

  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [locations, setLocations] = useState<BusLocation[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialRouteId);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [panelTab, setPanelTab] = useState<'buses' | 'stops' | 'route'>('buses');

  useEffect(() => {
    setRoutes(storage.getRoutes());
    setStops(storage.getStops());
    setBuses(storage.getBuses());
    setLocations(telemetry.getAllLocations());

    const unsubscribe = storage.subscribe((event) => {
      if (event === 'bus_location_update') {
        setLocations(telemetry.getAllLocations());
      } else if (event === 'routes') {
        setRoutes(storage.getRoutes());
      } else if (event === 'stops') {
        setStops(storage.getStops());
      } else if (event === 'buses') {
        setBuses(storage.getBuses());
      }
    });

    return () => unsubscribe();
  }, []);

  const activeRoute = routes.find(r => r.id === selectedRouteId) || null;

  // Buses active on the selected route (or all)
  const activeBuses = buses.map(bus => {
    const loc = locations.find(l => l.bus_id === bus.id);
    const ageSeconds = loc ? Math.max(0, (Date.now() - new Date(loc.recorded_at).getTime()) / 1000) : 999;
    const isLive = ageSeconds <= 120;
    return { ...bus, location: loc, ageSeconds, isLive };
  }).filter(b => b.location !== undefined);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-900 text-slate-100">
      {/* Top filter bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h1 className="text-sm font-extrabold text-white uppercase tracking-wider">Live Kigali Fleet Tracking</h1>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">|</span>
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Route:</span>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="bg-slate-800 text-white font-semibold rounded px-2 py-1 text-xs border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Corridors ({routes.length})</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  Line {r.route_code}: {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{activeBuses.filter(b => b.isLive).length} Buses Transmitting</span>
          </span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Telemetry refresh ~6s
          </span>
        </div>
      </div>

      {/* Main View Area: Sidebar + Map */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Telemetry & Inspection Panel */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shrink-0 h-48 md:h-full overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-semibold shrink-0">
            <button
              onClick={() => setPanelTab('buses')}
              className={`flex-1 py-2.5 text-center transition flex items-center justify-center space-x-1.5 ${
                panelTab === 'buses'
                  ? 'border-b-2 border-emerald-400 text-emerald-400 bg-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BusIcon className="w-3.5 h-3.5" />
              <span>Buses ({activeBuses.length})</span>
            </button>
            <button
              onClick={() => setPanelTab('stops')}
              className={`flex-1 py-2.5 text-center transition flex items-center justify-center space-x-1.5 ${
                panelTab === 'stops'
                  ? 'border-b-2 border-emerald-400 text-emerald-400 bg-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Stops ({stops.length})</span>
            </button>
            {activeRoute && (
              <button
                onClick={() => setPanelTab('route')}
                className={`flex-1 py-2.5 text-center transition flex items-center justify-center space-x-1.5 ${
                  panelTab === 'route'
                    ? 'border-b-2 border-emerald-400 text-emerald-400 bg-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <RouteIcon className="w-3.5 h-3.5" />
                <span>Line {activeRoute.route_code}</span>
              </button>
            )}
          </div>

          {/* Tab Content List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
            {panelTab === 'buses' && (
              <>
                {activeBuses.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    No active buses transmitting GPS at this moment.
                  </div>
                ) : (
                  activeBuses.map(bus => (
                    <div
                      key={bus.id}
                      onClick={() => { setSelectedBus(bus); setSelectedStop(null); }}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        selectedBus?.id === bus.id
                          ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm bg-slate-950 text-white px-2 py-0.5 rounded border border-slate-700">
                            {bus.plate_number}
                          </span>
                          <span className="text-[10px] text-slate-400">{bus.bus_model}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          bus.isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {bus.isLive ? 'LIVE' : 'STALE GPS'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300">
                        Operator: <span className="font-semibold text-white">{bus.organisation_name || 'KBS'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/60 text-[11px]">
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Gauge className="w-3 h-3 text-slate-500" />
                          <span>Speed: <strong className="text-white">{bus.location?.speed || 24} km/h</strong></span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Age: <strong className="text-white">{Math.round(bus.ageSeconds)}s</strong></span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-emerald-400/80">
                        Click to center bus and show next stops
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {panelTab === 'stops' && (
              <>
                {stops.map(stop => (
                  <div
                    key={stop.id}
                    onClick={() => { setSelectedStop(stop); setSelectedBus(null); }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedStop?.id === stop.id
                        ? 'bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-blue-400 font-mono">{stop.code}</span>
                      <span className="text-slate-500">{stop.district}</span>
                    </div>
                    <div className="font-bold text-white text-sm">{stop.name}</div>
                    {stop.name_rw && (
                      <div className="text-slate-400 italic text-[11px]">{stop.name_rw}</div>
                    )}
                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{stop.has_shelter ? '✓ Shelter' : 'Open stop'}</span>
                      <span className="text-blue-400 font-medium">Click to calculate ETA &rarr;</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {panelTab === 'route' && activeRoute && (
              <div className="space-y-3">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <div className="font-bold text-white text-sm mb-1">Line {activeRoute.route_code}: {activeRoute.name}</div>
                  <div className="text-slate-400 text-xs">
                    Distance: {activeRoute.distance_km} km • Fare: {activeRoute.base_fare_rwf} RWF
                  </div>
                </div>

                <div className="font-bold text-slate-400 text-xs uppercase tracking-wider px-1">
                  Ordered Route Stops ({activeRoute.stops?.length || 0})
                </div>

                <div className="space-y-1.5">
                  {activeRoute.stops?.map((rs, idx) => (
                    <div
                      key={rs.id}
                      onClick={() => {
                        const targetStop = stops.find(s => s.id === rs.stop_id);
                        if (targetStop) {
                          setSelectedStop(targetStop);
                        }
                      }}
                      className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{rs.stop?.name || rs.stop_id}</div>
                          <div className="text-[10px] text-slate-400">{rs.distance_from_start_km} km from origin</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400">+{rs.estimated_minutes_from_start} min</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Container Viewport */}
        <div className="flex-1 relative h-full">
          <LiveBusMap
            selectedRouteId={selectedRouteId}
            selectedStopId={selectedStop?.id}
            selectedBusId={selectedBus?.id}
            onSelectStop={(s) => setSelectedStop(s)}
            onSelectBus={(b) => setSelectedBus(b)}
            heightClass="h-full rounded-none border-none"
          />
        </div>
      </div>
    </div>
  );
};
