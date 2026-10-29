import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Bus as BusIcon,
  ArrowLeft,
  Heart,
  ShieldCheck,
  Radio,
  ArrowRight,
  Accessibility
} from 'lucide-react';
import { storage, telemetry } from '../lib/storage';
import { BusStop, Bus, BusLocation, BusRoute, ArrivalEstimate } from '../types';
import { calculateETA } from '../lib/eta';
import { LiveBusMap } from '../components/map/LiveBusMap';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const StopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const [stop, setStop] = useState<BusStop | null>(null);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [locations, setLocations] = useState<BusLocation[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const allStops = storage.getStops();
    const found = allStops.find(s => s.id === id);
    if (found) {
      setStop(found);
    }
    setRoutes(storage.getRoutes());
    setBuses(storage.getBuses());
    setLocations(telemetry.getAllLocations());

    if (user && found) {
      const favs = storage.getFavorites(user.id);
      setIsFavorited(favs.some(f => f.entity_type === 'stop' && f.entity_id === found.id));
    }

    const unsub = storage.subscribe((event) => {
      if (event === 'bus_location_update') {
        setLocations(telemetry.getAllLocations());
      }
    });

    return () => unsub();
  }, [id, user]);

  const toggleFavorite = () => {
    if (!user || !stop) return;
    const favs = storage.getFavorites(user.id);
    if (isFavorited) {
      const next = favs.filter(f => !(f.entity_type === 'stop' && f.entity_id === stop.id));
      storage.saveFavorites(user.id, next);
      setIsFavorited(false);
    } else {
      const next = [...favs, {
        id: 'fav-' + Date.now(),
        user_id: user.id,
        entity_type: 'stop' as const,
        entity_id: stop.id,
        created_at: new Date().toISOString()
      }];
      storage.saveFavorites(user.id, next);
      setIsFavorited(true);
    }
  };

  if (!stop) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Bus stop not found</h2>
        <Link to="/stops" className="text-emerald-600 hover:underline text-sm mt-3 inline-block">
          &larr; Back to Stops directory
        </Link>
      </div>
    );
  }

  // Passing routes that serve this stop
  const passingRoutes = routes.filter(r => r.stops?.some(s => s.stop_id === stop.id));

  // Compute live ETAs for buses approaching this stop
  const etas: ArrivalEstimate[] = [];
  buses.forEach(bus => {
    const loc = locations.find(l => l.bus_id === bus.id);
    if (!loc) return;
    passingRoutes.forEach(r => {
      const est = calculateETA(loc, bus.plate_number, bus.id, r, stop);
      if (est) {
        etas.push(est);
      }
    });
  });

  etas.sort((a, b) => a.estimated_minutes - b.estimated_minutes);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Favorite */}
        <div className="flex items-center justify-between">
          <Link
            to="/stops"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stops</span>
          </Link>

          {isAuthenticated && (
            <button
              onClick={toggleFavorite}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isFavorited ? 'Favorited Stop' : 'Save Stop'}</span>
            </button>
          )}
        </div>

        {/* Stop Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-blue-600 text-white">
                  STOP {stop.code}
                </span>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {stop.district} District • {stop.sector || 'Urban Area'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {stop.name}
              </h1>
              {stop.name_rw && (
                <p className="text-sm text-slate-500 italic mt-0.5">{stop.name_rw}</p>
              )}
              <p className="text-xs text-slate-600 mt-2 max-w-xl">{stop.description}</p>
            </div>

            <Link
              to="/map"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 shrink-0"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Track approaching buses</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Amenities:</span>
            {stop.has_shelter ? (
              <span className="flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Weather-Protected Passenger Shelter</span>
              </span>
            ) : (
              <span className="text-slate-500">Unsheltered flag stop</span>
            )}

            {stop.is_accessible && (
              <span className="flex items-center space-x-1 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                <Accessibility className="w-4 h-4" />
                <span>Ramp &amp; Wheelchair Accessible</span>
              </span>
            )}
          </div>
        </div>

        {/* Live Incoming Buses & Explainable ETAs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                <span>Live Bus Arrivals &amp; Estimated Times</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Arrival times are calculated from vehicle GPS telemetry and average route speeds
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live updates every ~6s
            </span>
          </div>

          {etas.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
              <BusIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No buses currently tracking towards this stop.</p>
              <p className="text-xs text-slate-400 mt-1">Check scheduled routes or return to the live map.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Vehicle Plate</th>
                    <th className="pb-3">Route Line</th>
                    <th className="pb-3">Route Name</th>
                    <th className="pb-3">Distance Away</th>
                    <th className="pb-3 text-right">Estimated Arrival</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {etas.map((eta, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 font-mono font-bold text-sm text-slate-900">
                        {eta.plate_number}
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                          {eta.route_code}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-700">
                        {eta.route_name}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {eta.distance_km} km
                      </td>
                      <td className="py-3.5 text-right font-black text-sm text-emerald-600">
                        {eta.is_approaching ? 'Approaching Now' : `~${eta.estimated_minutes} min`}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          eta.is_stale ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {eta.is_stale ? 'Stale GPS' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Connected Routes that Serve this Stop */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Routes Serving This Station ({passingRoutes.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {passingRoutes.map(route => (
              <Link
                key={route.id}
                to={`/routes/${route.id}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                      LINE {route.route_code}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{route.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Fare: {route.base_fare_rwf} RWF • Est: ~{route.estimated_duration_minutes} min
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
