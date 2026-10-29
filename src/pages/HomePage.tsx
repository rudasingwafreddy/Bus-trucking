import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Route as RouteIcon,
  Radio,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  CreditCard,
  AlertCircle,
  Bus,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { LiveBusMap } from '../components/map/LiveBusMap';
import { JourneyPlanner } from '../components/planner/JourneyPlanner';
import { storage } from '../lib/storage';
import { useLanguage } from '../context/LanguageContext';
import { BusRoute, BusStop, Announcement } from '../types';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyStops, setNearbyStops] = useState<BusStop[]>([]);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const routes = storage.getRoutes();
  const stops = storage.getStops();
  const buses = storage.getBuses();
  const announcements = storage.getAnnouncements().filter(a => a.is_active);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/routes?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const findNearbyStops = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingUser(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        // Sort stops by distance to user
        const sorted = [...stops].sort((a, b) => {
          const distA = Math.hypot(a.latitude - latitude, a.longitude - longitude);
          const distB = Math.hypot(b.latitude - latitude, b.longitude - longitude);
          return distA - distB;
        });
        setNearbyStops(sorted.slice(0, 3));
      },
      (err) => {
        setLocatingUser(false);
        setLocationError('Location permission denied or unavailable. Showing central Kigali stops.');
        setNearbyStops(stops.slice(0, 3));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Service Announcements Banner */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-950 text-white px-4 py-2.5 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                NOTICE
              </span>
              <span className="font-semibold text-slate-200">
                {language === 'rw' && announcements[0].title_rw ? announcements[0].title_rw : announcements[0].title}:
              </span>
              <span className="text-slate-300 hidden sm:inline">
                {language === 'rw' && announcements[0].content_rw ? announcements[0].content_rw : announcements[0].content}
              </span>
            </div>
            <Link to="/about" className="text-emerald-400 hover:underline font-semibold ml-2 shrink-0">
              Details &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Kigali Real-time Transit System</span>
            <span className="text-slate-600">|</span>
            <span className="text-yellow-400">Africa/Kigali</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Track Kigali Buses in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">Real Time</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            {t('app_subtitle')}
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mt-6">
            <div className="flex flex-col sm:flex-row items-center bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-2xl focus-within:border-emerald-500 transition">
              <div className="flex items-center w-full px-3 py-2">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                <span>{t('btn_search')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Hero Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-center">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-2xl font-black text-emerald-400">{buses.length}</span>
              <span className="text-xs text-slate-400">Tracked Buses</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-2xl font-black text-blue-400">{routes.length}</span>
              <span className="text-xs text-slate-400">Kigali Corridors</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-2xl font-black text-amber-400">{stops.length}</span>
              <span className="text-xs text-slate-400">Monitored Stops</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-2xl font-black text-teal-400">~6 sec</span>
              <span className="text-xs text-slate-400">GPS Refresh Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 z-20 w-full mb-12">
        <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 px-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h2 className="text-xl font-black text-slate-900">Live Metropolitan Map Preview</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Click any vehicle or stop to inspect real-time progress and estimated arrival times</p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center space-x-2">
              <Link
                to="/map"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition flex items-center space-x-1"
              >
                <span>Full Screen Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <LiveBusMap heightClass="h-[480px] sm:h-[540px]" />
        </div>
      </section>

      {/* Popular Kigali Corridors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('quick_routes')}</h2>
            <p className="text-xs text-slate-500">Main public transport lines operating in Kigali</p>
          </div>
          <Link
            to="/routes"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>{t('btn_view_routes')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.map(route => (
            <Link
              key={route.id}
              to={`/routes/${route.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono">
                    LINE {route.route_code}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {route.base_fare_rwf} RWF
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition">
                  {route.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Operator: {route.organisation_name || 'KBS / Royal'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>~{route.estimated_duration_minutes} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <RouteIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{route.distance_km} km</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Transit Journey Planner & Fare Estimator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <JourneyPlanner />
      </section>

      {/* Nearby Bus Stops Detection */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Navigation className="w-3.5 h-3.5" />
                <span>Geolocated Stops</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Find Bus Stops Closest to You</h3>
              <p className="text-sm text-slate-600 max-w-xl">
                Allow browser location to instantly identify the nearest bus stops, walk distance, and upcoming departure times.
              </p>
              {locationError && (
                <p className="text-xs text-amber-600 font-medium">{locationError}</p>
              )}
            </div>

            <button
              onClick={findNearbyStops}
              disabled={locatingUser}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2 shrink-0 disabled:opacity-50"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{locatingUser ? 'Locating...' : 'Detect Nearby Stops'}</span>
            </button>
          </div>

          {/* Detected stops list */}
          {nearbyStops.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {nearbyStops.map(stop => (
                <Link
                  key={stop.id}
                  to={`/stops/${stop.id}`}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{stop.code}</span>
                    <span className="text-slate-500">{stop.district}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{stop.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{stop.description}</p>
                  <div className="mt-3 text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <span>View upcoming arrivals</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Intelligent Transport
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How RwandaBus Works</h2>
          <p className="text-sm text-slate-600 mt-1">Reliable, modern transit tracking designed for everyone in Rwanda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Select Your Route or Stop</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search by route number (e.g. Line 101), landmark (Kigali Heights, Nyabugogo), or simply let GPS find your nearest stop.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Watch Buses Move in Real Time</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buses transmit live coordinates every 5–10 seconds. Observe traffic speeds and know exactly when the next bus will reach your stop.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Board Confidently with Tap &amp; Go</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Arrive right as your bus pulls up, tap your transport card or mobile pass, and eliminate unpredictable waiting at stops.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
