import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Route as RouteIcon, MapPin, Clock, ArrowRight, Bus, Filter } from 'lucide-react';
import { storage } from '../lib/storage';
import { useLanguage } from '../context/LanguageContext';

export const RoutesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [search, setSearch] = useState(queryParam);
  const [selectedOrg, setSelectedOrg] = useState<string>('all');

  const routes = storage.getRoutes();
  const organisations = storage.getOrganisations();

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchesSearch =
        route.route_code.toLowerCase().includes(search.toLowerCase()) ||
        route.name.toLowerCase().includes(search.toLowerCase()) ||
        route.origin.toLowerCase().includes(search.toLowerCase()) ||
        route.destination.toLowerCase().includes(search.toLowerCase()) ||
        route.stops?.some(s => s.stop?.name.toLowerCase().includes(search.toLowerCase()));

      const matchesOrg = selectedOrg === 'all' || route.organisation_id === selectedOrg;

      return matchesSearch && matchesOrg;
    });
  }, [routes, search, selectedOrg]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <RouteIcon className="w-4 h-4" />
            <span>Kigali Transport Network</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kigali Bus Routes &amp; Corridors</h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore schedules, stops, fares, and active real-time buses for all public transport lines.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search route code (101), landmark (KCC), or origin/destination..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 w-full md:w-auto"
            >
              <option value="all">All Operators</option>
              {organisations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Cards Grid */}
        {filteredRoutes.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <RouteIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No matching transit routes found</h3>
            <p className="text-xs text-slate-400">Try searching for "101", "Nyabugogo", "Downtown", or "Remera".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRoutes.map(route => (
              <div
                key={route.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-slate-900 text-white">
                      LINE {route.route_code}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      {route.base_fare_rwf} RWF
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {language === 'rw' && route.name_rw ? route.name_rw : route.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center space-x-2">
                    <span>{route.origin}</span>
                    <span>&rarr;</span>
                    <span>{route.destination}</span>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Stops</span>
                      <span className="font-semibold">{route.stops?.length || 0} Stations</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Duration</span>
                      <span className="font-semibold">~{route.estimated_duration_minutes} mins</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Distance</span>
                      <span className="font-semibold">{route.distance_km} km</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Operator: <strong className="text-slate-700">{route.organisation_name || 'KBS'}</strong>
                  </span>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/map?route=${route.id}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Track on Map
                    </Link>
                    <Link
                      to={`/routes/${route.id}`}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 transition flex items-center space-x-1"
                    >
                      <span>View Route</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
