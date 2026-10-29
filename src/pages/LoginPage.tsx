import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  Lock,
  Mail,
  User,
  Car,
  Briefcase,
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await login(email);
    setLoading(false);
    navigate('/map');
  };

  const handleDemoLogin = (targetRole: UserRole) => {
    loginAsDemoRole(targetRole);
    if (targetRole === 'driver') navigate('/driver');
    else if (targetRole === 'operator') navigate('/operator/dashboard');
    else if (targetRole === 'admin') navigate('/admin');
    else navigate('/map');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-xl">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to RwandaBus</h1>
          <p className="text-xs text-slate-500">Kigali Smart Public Transit Tracking &amp; Fleet Operations</p>
        </div>

        {/* Quick Demo Access Switcher */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Role Evaluation (One-Click)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Select a verified stakeholder role below to inspect dedicated workflows instantly:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('passenger')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center space-x-2 transition"
            >
              <User className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <strong className="block text-white text-[11px]">Passenger</strong>
                <span className="text-[10px] text-slate-400">Aline Uwase</span>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('driver')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center space-x-2 transition"
            >
              <Car className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-white text-[11px]">Bus Driver</strong>
                <span className="text-[10px] text-slate-400">Jean Claude</span>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('operator')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center space-x-2 transition"
            >
              <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <strong className="block text-white text-[11px]">Operator (KBS)</strong>
                <span className="text-[10px] text-slate-400">Fleet Dispatch</span>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('admin')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center space-x-2 transition"
            >
              <Shield className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <strong className="block text-white text-[11px]">Administrator</strong>
                <span className="text-[10px] text-slate-400">Root Oversight</span>
              </div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aline@passenger.rw"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline">
              Create Passenger Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
