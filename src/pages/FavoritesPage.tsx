import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Route as RouteIcon, MapPin, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { BusRoute, BusStop, Favorite } from '../types';

export const FavoritesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const routes = storage.getRoutes();
  const stops = storage.getStops();

  useEffect(() => {
    if (user) {
      setFavorites(storage.getFavorites(user.id));
    }
  }, [user]);

  const removeFavorite = (favId: string) => {
    if (!user) return;
    const updated = favorites.filter(f => f.id !== favId);
    storage.saveFavorites(user.id, updated);
    setFavorites(updated);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Save Your Daily Corridors</h2>
          <p className="text-xs text-slate-500">
            Sign in to bookmark your frequent Kigali bus routes and neighborhood stops for one-tap tracking.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
          >
            Sign In / Demo Login
          </Link>
        </div>
      </div>
    );
  }

  const favoriteRoutes = favorites
    .filter(f => f.entity_type === 'route')
    .map(f => ({
      fav: f,
      route: routes.find(r => r.id === f.entity_id)
    }))
    .filter(item => item.route !== undefined);

  const favoriteStops = favorites
    .filter(f => f.entity_type === 'stop')
    .map(f => ({
      fav: f,
      stop: stops.find(s => s.id === f.entity_id)
    }))
    .filter(item => item.stop !== undefined);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>Passenger Bookmarks</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Routes &amp; Bus Stops</h1>
          <p className="text-sm text-slate-500 mt-1">Quick access to your daily Kigali commute telemetry.</p>
        </div>

        {/* Favorite Routes */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <RouteIcon className="w-5 h-5 text-blue-500" />
            <span>Bookmarked Corridors ({favoriteRoutes.length})</span>
          </h2>

          {favoriteRoutes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No bookmarked routes yet. Explore the routes directory to bookmark your daily lines.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteRoutes.map(({ fav, route }) => (
                <div key={fav.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        LINE {route!.route_code}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{route!.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Fare: {route!.base_fare_rwf} RWF • ~{route!.estimated_duration_minutes} min
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/routes/${route!.id}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Stops */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <span>Bookmarked Stations &amp; Stops ({favoriteStops.length})</span>
          </h2>

          {favoriteStops.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No bookmarked bus stops yet. Check the stop directory or map to save your favorite boarding stop.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteStops.map(({ fav, stop }) => (
                <div key={fav.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {stop!.code}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{stop!.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {stop!.district} District • {stop!.has_shelter ? 'Sheltered' : 'Open stop'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/stops/${stop!.id}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
