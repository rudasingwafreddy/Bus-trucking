import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Route as RouteIcon,
  Heart,
  User,
  Shield,
  Briefcase,
  Car,
  LogOut,
  Globe,
  Menu,
  X,
  Radio,
  RefreshCw,
  HelpCircle,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { storage, telemetry } from '../../lib/storage';
import { HowToUseModal } from '../common/HowToUseModal';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout, loginAsDemoRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = (newRole: UserRole) => {
    loginAsDemoRole(newRole);
    setRoleMenuOpen(false);
    if (newRole === 'driver') navigate('/driver');
    else if (newRole === 'operator') navigate('/operator/dashboard');
    else if (newRole === 'admin') navigate('/admin');
    else navigate('/map');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top micro bar for quick demo role switcher & language */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-400">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" /> LIVE TELEMETRY
          </span>
          <span className="hidden sm:inline">Kigali Metropolitan Transit Network</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 hover:text-white transition"
              title="Quickly switch between passenger, driver, operator, or admin roles"
            >
              <span className="text-slate-400">Role:</span>
              <span className="font-semibold text-emerald-400 capitalize">{role}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 font-semibold text-slate-400 border-b border-slate-800">
                  Switch Active Role (Demo)
                </div>
                <button
                  onClick={() => handleRoleSwitch('passenger')}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-slate-800 ${
                    role === 'passenger' ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Passenger (Default)</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('driver')}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-slate-800 ${
                    role === 'driver' ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bus Driver Portal</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('operator')}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-slate-800 ${
                    role === 'operator' ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>Transport Operator (KBS)</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-slate-800 ${
                    role === 'admin' ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  <span>System Administrator</span>
                </button>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-slate-800/80 rounded px-1.5 py-0.5">
            <Globe className="w-3 h-3 text-slate-400" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-1 py-0.2 rounded font-medium ${
                language === 'en' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setLanguage('rw')}
              className={`px-1 py-0.2 rounded font-medium ${
                language === 'rw' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RW
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Rwanda<span className="text-emerald-400">Bus</span></span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  RW
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Smart Transit Kigali</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/map"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/map') ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>{t('nav_map')}</span>
            </Link>

            <Link
              to="/routes"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/routes') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <RouteIcon className="w-4 h-4 text-blue-400" />
              <span>{t('nav_routes')}</span>
            </Link>

            <Link
              to="/stops"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/stops') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{t('nav_stops')}</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/favorites"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                  isActive('/favorites') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>{t('nav_favorites')}</span>
              </Link>
            )}

            {/* Role specific links */}
            {role === 'driver' && (
              <Link
                to="/driver"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30`}
              >
                <Car className="w-4 h-4" />
                <span>{t('nav_driver')}</span>
              </Link>
            )}

            {role === 'operator' && (
              <Link
                to="/operator/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30`}
              >
                <Briefcase className="w-4 h-4" />
                <span>{t('nav_operator')}</span>
              </Link>
            )}

            {role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30`}
              >
                <Shield className="w-4 h-4" />
                <span>{t('nav_admin')}</span>
              </Link>
            )}
          </nav>

          {/* Account Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => setGuideModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition shadow-sm"
              title="Open RwandaBus User Guide and Workflows Walkthrough"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>How to Use</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 text-sm transition"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-slate-200 font-medium max-w-[120px] truncate">{user?.full_name}</span>
                </Link>
                <button
                  onClick={logout}
                  title={t('nav_logout')}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-md transition"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-emerald-400 bg-slate-800"
          >
            {t('nav_map')}
          </Link>
          <Link
            to="/routes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            {t('nav_routes')}
          </Link>
          <Link
            to="/stops"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            {t('nav_stops')}
          </Link>
          <Link
            to="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            {t('nav_favorites')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            {t('nav_about')}
          </Link>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400 mb-2">Switch System Workspace:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { handleRoleSwitch('passenger'); setMobileMenuOpen(false); }}
                className="px-2 py-1.5 bg-slate-800 rounded text-xs text-blue-400 text-left font-medium"
              >
                Passenger
              </button>
              <button
                onClick={() => { handleRoleSwitch('driver'); setMobileMenuOpen(false); }}
                className="px-2 py-1.5 bg-slate-800 rounded text-xs text-amber-400 text-left font-medium"
              >
                Driver Portal
              </button>
              <button
                onClick={() => { handleRoleSwitch('operator'); setMobileMenuOpen(false); }}
                className="px-2 py-1.5 bg-slate-800 rounded text-xs text-purple-400 text-left font-medium"
              >
                Operator (KBS)
              </button>
              <button
                onClick={() => { handleRoleSwitch('admin'); setMobileMenuOpen(false); }}
                className="px-2 py-1.5 bg-slate-800 rounded text-xs text-red-400 text-left font-medium"
              >
                Admin Oversight
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-slate-300">{user?.full_name}</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs text-red-400 bg-red-950/40 px-3 py-1.5 rounded border border-red-800"
                >
                  {t('nav_logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-sm text-slate-300 bg-slate-800 rounded-lg"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-sm text-white bg-emerald-500 rounded-lg font-medium"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Walkthrough / Guide Modal */}
      <HowToUseModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </header>
  );
};
