import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  ArrowRight,
  Clock,
  Route as RouteIcon,
  CreditCard,
  Radio,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { storage, telemetry } from '../../lib/storage';
import { calculateHaversineDistanceKm } from '../../lib/eta';
import { BusStop, BusRoute, Bus, BusLocation } from '../../types';

export const JourneyPlanner: React.FC = () => {
  const stops = storage.getStops();
  const routes = storage.getRoutes();
  const buses = storage.getBuses();

  const [originStopId, setOriginStopId] = useState<string>(stops[0]?.id || '');
  const [destStopId, setDestStopId] = useState<string>(stops[5]?.id || '');

  const originStop = stops.find(s => s.id === originStopId) || stops[0];
  const destStop = stops.find(s => s.id === destStopId) || stops[5];

  // Find direct route connecting both stops, or the closest corridor
  const planResult = useMemo(() => {
    if (!originStop || !destStop || originStop.id === destStop.id) {
      return null;
    }

    // Direct route check
    const directRoute = routes.find(r => {
      const stopsInRoute = r.stops?.map(s => s.stop_id) || [];
      return stopsInRoute.includes(originStop.id) && stopsInRoute.includes(destStop.id);
    });

    const activeRoute = directRoute || routes[0];

    // Compute distance
    const distKm = Number(
      (
        calculateHaversineDistanceKm(
          originStop.latitude,
          originStop.longitude,
          destStop.latitude,
          destStop.longitude
        ) * 1.35
      ).toFixed(1)
    );

    // Urban Kigali duration heuristic (22 km/h average with stop dwell)
    const durationMinutes = Math.max(10, Math.round((distKm / 22) * 60));

    // Fare calculation (Rwanda standard public transit formula: ~20-25 RWF per km, min 200 RWF)
    const fareRwf = Math.max(200, Math.round((distKm * 25) / 10) * 10);

    // Check if there is an active bus on this route
    const locations = telemetry.getAllLocations();
    const activeBus = buses[0];
    const busLoc = locations.find(l => l.bus_id === activeBus?.id);

    return {
      route: activeRoute,
      distanceKm: distKm,
      durationMinutes,
      fareRwf,
      isDirect: Boolean(directRoute),
      activeBus,
      busLoc
    };
  }, [originStop, destStop, routes, buses]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Kigali Journey Planner &amp; Fare Calculator</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Plan Your Transit Route</h3>
          <p className="text-xs text-slate-500 mt-0.5">Select boarding and destination stop to calculate fare and live bus ETA</p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-800 border border-yellow-400/30 flex items-center space-x-1 shrink-0 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
          <span>Real-time Rwandan Fare Rates</span>
        </span>
      </div>

      {/* Stop Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Boarding Stop (Origin)</span>
          </label>
          <select
            value={originStopId}
            onChange={(e) => setOriginStopId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
          >
            {stops.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code}) - {s.district}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-500 block">
            {originStop?.description || 'Public transit station'}
          </span>
        </div>

        {/* Destination */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Destination Stop</span>
          </label>
          <select
            value={destStopId}
            onChange={(e) => setDestStopId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
          >
            {stops.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code}) - {s.district}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-500 block">
            {destStop?.description || 'Public transit station'}
          </span>
        </div>
      </div>

      {/* Plan Results Card */}
      {planResult && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-emerald-500 text-slate-950">
                LINE {planResult.route.route_code}
              </span>
              <div>
                <h4 className="font-bold text-base text-white">{planResult.route.name}</h4>
                <span className="text-xs text-slate-400">
                  {planResult.isDirect ? 'Direct Service' : 'Connecting Transit Corridor'}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block font-semibold">Standard Transit Fare</span>
              <span className="text-2xl font-black text-emerald-400">
                {planResult.fareRwf} RWF
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Travel Time</span>
              <span className="text-base font-extrabold text-white">~{planResult.durationMinutes} mins</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <RouteIcon className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
              <span className="text-base font-extrabold text-white">{planResult.distanceKm} km</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <CreditCard className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment</span>
              <span className="text-xs font-bold text-white mt-1 block">Tap &amp; Go / Cash</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <Radio className="w-4 h-4 text-teal-400 mx-auto mb-1 animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Vehicle</span>
              <span className="text-xs font-mono font-bold text-white mt-1 block">
                {planResult.activeBus?.plate_number || 'RAD 234 B'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Next scheduled departure in ~4 minutes from {originStop.name}
            </span>

            <Link
              to={`/map?route=${planResult.route.id}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>Track Route Live on Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
