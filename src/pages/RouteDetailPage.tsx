import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Route as RouteIcon,
  MapPin,
  Clock,
  Bus as BusIcon,
  ArrowLeft,
  Heart,
  Share2,
  DollarSign,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { storage, telemetry } from '../lib/storage';
import { BusRoute, Bus, BusLocation } from '../types';
import { LiveBusMap } from '../components/map/LiveBusMap';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const RouteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const [route, setRoute] = useState<BusRoute | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [locations, setLocations] = useState<BusLocation[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const allRoutes = storage.getRoutes();
    const found = allRoutes.find(r => r.id === id);
    if (found) {
      setRoute(found);
    }
    setBuses(storage.getBuses());
    setLocations(telemetry.getAllLocations());

    if (user && found) {
      const favs = storage.getFavorites(user.id);
      setIsFavorited(favs.some(f => f.entity_type === 'route' && f.entity_id === found.id));
    }

    const unsub = storage.subscribe((event) => {
      if (event === 'bus_location_update') {
        setLocations(telemetry.getAllLocations());
      }
    });

    return () => unsub();
  }, [id, user]);

  const toggleFavorite = () => {
    if (!user || !route) return;
    const favs = storage.getFavorites(user.id);
    if (isFavorited) {
      const next = favs.filter(f => !(f.entity_type === 'route' && f.entity_id === route.id));
      storage.saveFavorites(user.id, next);
      setIsFavorited(false);
    } else {
      const next = [...favs, {
        id: 'fav-' + Date.now(),
        user_id: user.id,
        entity_type: 'route' as const,
        entity_id: route.id,
        created_at: new Date().toISOString()
      }];
      storage.saveFavorites(user.id, next);
      setIsFavorited(true);
    }
  };

  if (!route) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Route not found</h2>
        <Link to="/routes" className="text-emerald-600 hover:underline text-sm mt-3 inline-block">
          &larr; Back to Routes directory
        </Link>
      </div>
    );
  }

  // Active buses
  const routeBuses = buses.filter(b => {
    // For demo simplicity, match buses
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/routes"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Routes</span>
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
              <span>{isFavorited ? 'Favorited' : 'Save Route'}</span>
            </button>
          )}
        </div>

        {/* Route Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-slate-900 text-white">
                  LINE {route.route_code}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {route.base_fare_rwf} RWF Base Fare
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {language === 'rw' && route.name_rw ? route.name_rw : route.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                From <strong className="text-slate-800">{route.origin}</strong> to <strong className="text-slate-800">{route.destination}</strong>
              </p>
            </div>

            <Link
              to={`/map?route=${route.id}`}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 shrink-0"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Track Live on Map</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Total Distance</span>
              <span className="text-base font-bold text-slate-800">{route.distance_km} km</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Travel Time</span>
              <span className="text-base font-bold text-slate-800">~{route.estimated_duration_minutes} mins</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Stations</span>
              <span className="text-base font-bold text-slate-800">{route.stops?.length || 0} Bus Stops</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Operating Operator</span>
              <span className="text-base font-bold text-slate-800">{route.organisation_name || 'KBS'}</span>
            </div>
          </div>
        </div>

        {/* Map Preview of Route */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="font-bold text-slate-900 text-sm">Interactive Corridor View</h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Buses Transmitting</span>
            </span>
          </div>
          <LiveBusMap selectedRouteId={route.id} heightClass="h-96" />
        </div>

        {/* Ordered Stops Sequence Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <span>Ordered Stations &amp; Stop Timeline</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {route.stops?.map((rs, idx) => (
              <div key={rs.id} className="relative flex items-start justify-between group">
                {/* Timeline node */}
                <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 text-emerald-400 text-[10px] font-bold flex items-center justify-center border-2 border-white shadow">
                  {idx + 1}
                </span>

                <div className="pl-3">
                  <Link
                    to={`/stops/${rs.stop_id}`}
                    className="font-bold text-slate-900 hover:text-emerald-600 text-sm transition"
                  >
                    {rs.stop?.name || rs.stop_id}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {rs.stop?.district} • {rs.stop?.description || 'Public transit shelter'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-xs text-blue-600">
                    +{rs.estimated_minutes_from_start} min
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {rs.distance_from_start_km} km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
