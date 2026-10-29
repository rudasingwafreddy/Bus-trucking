import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, ArrowRight, ShieldCheck, Accessibility } from 'lucide-react';
import { storage } from '../lib/storage';
import { useLanguage } from '../context/LanguageContext';

export const StopsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const stops = storage.getStops();

  const districts = useMemo(() => {
    return Array.from(new Set(stops.map(s => s.district)));
  }, [stops]);

  const filteredStops = useMemo(() => {
    return stops.filter(stop => {
      const matchesSearch =
        stop.name.toLowerCase().includes(search.toLowerCase()) ||
        stop.code.toLowerCase().includes(search.toLowerCase()) ||
        (stop.name_rw && stop.name_rw.toLowerCase().includes(search.toLowerCase())) ||
        (stop.sector && stop.sector.toLowerCase().includes(search.toLowerCase()));

      const matchesDistrict = selectedDistrict === 'all' || stop.district === selectedDistrict;

      return matchesSearch && matchesDistrict;
    });
  }, [stops, search, selectedDistrict]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Kigali Bus Stop Directory</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kigali Transit Stops &amp; Terminals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Find bus stops, shelters, accessibility facilities, and upcoming bus arrivals across Kigali districts.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stop name (Nyabugogo), code (REM-01), or sector..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 w-full md:w-auto"
            >
              <option value="all">All Districts ({districts.length})</option>
              {districts.map(d => (
                <option key={d} value={d}>{d} District</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStops.map(stop => (
            <div
              key={stop.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                    {stop.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {stop.district}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2">{stop.name}</h3>
                {stop.name_rw && (
                  <p className="text-xs text-slate-500 italic">{stop.name_rw}</p>
                )}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{stop.description}</p>

                <div className="flex items-center space-x-3 mt-4 text-[11px] text-slate-500">
                  {stop.has_shelter && (
                    <span className="flex items-center space-x-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Sheltered</span>
                    </span>
                  )}
                  {stop.is_accessible && (
                    <span className="flex items-center space-x-1 text-blue-700 font-medium">
                      <Accessibility className="w-3.5 h-3.5" />
                      <span>Accessible</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                </span>
                <Link
                  to={`/stops/${stop.id}`}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition flex items-center space-x-1"
                >
                  <span>Upcoming ETAs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
