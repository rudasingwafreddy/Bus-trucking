import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Radio, Route as RouteIcon, MapPin, User, Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 py-1.5 px-3 flex items-center justify-around text-[10px]">
      <Link
        to="/"
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
          isActive('/') ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>{t('nav_home')}</span>
      </Link>

      <Link
        to="/map"
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
          isActive('/map') ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Radio className="w-5 h-5 mb-0.5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <span>{t('nav_map')}</span>
      </Link>

      <Link
        to="/routes"
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
          isActive('/routes') ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <RouteIcon className="w-5 h-5 mb-0.5" />
        <span>{t('nav_routes')}</span>
      </Link>

      <Link
        to="/stops"
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
          isActive('/stops') ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <MapPin className="w-5 h-5 mb-0.5" />
        <span>{t('nav_stops')}</span>
      </Link>

      {role === 'driver' ? (
        <Link
          to="/driver"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            isActive('/driver') ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Car className="w-5 h-5 mb-0.5" />
          <span>Driver</span>
        </Link>
      ) : (
        <Link
          to="/profile"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            isActive('/profile') ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </Link>
      )}
    </div>
  );
};
