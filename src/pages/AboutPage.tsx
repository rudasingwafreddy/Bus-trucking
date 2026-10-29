import React from 'react';
import { Bus, MapPin, Shield, Radio, Database, Cpu, Globe, Info } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Transit Engineering</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">About RwandaBus</h1>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">
            A production-oriented real-time intelligent transit platform built for passengers, bus drivers, transport operators, and public regulators across Rwanda.
          </p>
        </div>

        {/* Disclaimer Card */}
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 flex items-start space-x-4">
          <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900">
            <strong className="block text-sm font-bold text-amber-950">Independent Platform &amp; Demonstration Data Notice</strong>
            <p className="leading-relaxed">
              RwandaBus is an independent transport technology system. It does not claim formal government affiliation or unauthorized representation of any licensed operator. Telemetry and routes currently use controlled demonstration datasets with authentic Kigali geographic coordinates, which can be configured or replaced with official verified GTFS data by authorized administrators.
            </p>
          </div>
        </div>

        {/* Rwanda-Specific Configurations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Rwanda National Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Default Country</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">Rwanda (🇷🇼)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Map Starting Center</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">Kigali (-1.9441, 30.0619)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Official Timezone</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">Africa/Kigali (UTC+2)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Transit Currency</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">Rwandan Franc (RWF)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Calling Code</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">+250 (MTN / Airtel-Tigo)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Localization</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">English &amp; Ikinyarwanda</span>
            </div>
          </div>
        </div>

        {/* Full-Stack Architecture */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Architecture &amp; Technology Stack</h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3">
              <Cpu className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-slate-900">Modern Frontend (React 19, TypeScript &amp; Vite)</strong>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Engineered with Tailwind CSS and responsive design principles. Highly optimized for mobile devices and low-bandwidth smartphones in Rwanda.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3">
              <Radio className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-slate-900">Real-Time Geolocation &amp; Maps (Leaflet &amp; React Leaflet)</strong>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Interactive OpenStreetMap rendering with zero full-page reloads. Custom vehicle markers rotate to direction heading and visually flag stale GPS signals (&gt;2 minutes).
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3">
              <Database className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-slate-900">PostgreSQL Schema &amp; Row Level Security (RLS)</strong>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  14 normalized tables covering users, operators, buses, drivers, routes, stops, route_stops, trips, bus_locations, schedules, favorites, announcements, and audit_logs. Strict RLS prevents unauthorized telemetry modification.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-slate-900">Explainable ETA Engine</strong>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Computes realistic arrival estimates using actual route polyline distance, current vehicle speed, intermediate stop dwell times, and Kigali urban traffic coefficients rather than misleading straight-line measurements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
