import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin, ShieldCheck, Heart, Info, RefreshCw } from 'lucide-react';
import { storage, telemetry } from '../../lib/storage';

export const Footer: React.FC = () => {
  const handleResetData = () => {
    if (window.confirm('Reset all demonstration data to default Kigali routes, stops, and buses?')) {
      storage.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      {/* Disclaimer Notice Banner */}
      <div className="bg-slate-950/70 border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs space-y-2 sm:space-y-0 text-slate-400">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Demonstration System:</strong> RwandaBus is a modern transit technology platform. Real-time telemetry currently features controlled simulations for Kigali transit corridors.
            </span>
          </div>
          <button
            onClick={handleResetData}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition border border-slate-700 shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Bus className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">Rwanda<span className="text-emerald-400">Bus</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart real-time public transit tracking platform engineered for Kigali and adaptable across all 30 districts of Rwanda.
            </p>
            <div className="text-xs text-slate-500 pt-1">
              Timezone: Africa/Kigali (UTC+2) • Currency: RWF
            </div>
          </div>

          {/* Quick Transit Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Transit Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/map" className="hover:text-emerald-400 transition">Live Interactive Map</Link></li>
              <li><Link to="/routes" className="hover:text-emerald-400 transition">Search Kigali Routes</Link></li>
              <li><Link to="/stops" className="hover:text-emerald-400 transition">Bus Stops Directory</Link></li>
              <li><Link to="/favorites" className="hover:text-emerald-400 transition">Saved Corridors & Stops</Link></li>
            </ul>
          </div>

          {/* Stakeholder Portals */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Operations & Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/driver" className="hover:text-amber-400 transition">Driver Active Trip Portal</Link></li>
              <li><Link to="/operator/dashboard" className="hover:text-purple-400 transition">Operator Fleet Hub (KBS/Royal)</Link></li>
              <li><Link to="/admin" className="hover:text-red-400 transition">System Oversight & Audit Logs</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition">Architecture & Methodology</Link></li>
            </ul>
          </div>

          {/* Districts & Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Coverage & Districts</h4>
            <p className="text-xs text-slate-400 mb-2">
              Active primary coverage: Nyarugenge, Gasabo, and Kicukiro. Extensible to Musanze, Rubavu, Huye, and all provinces.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
              Not affiliated with any official government agency. All transit trademarks belong to respective licensed operators.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} RwandaBus Intelligent Transit System. All rights reserved.
          </div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link to="/about" className="hover:text-slate-300">Privacy & GPS Policy</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-slate-300">Terms of Transport Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
