import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Compass,
  Bus,
  Car,
  Briefcase,
  Shield,
  MapPin,
  Play,
  FileDown,
  Upload,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'passenger' | 'driver' | 'operator' | 'admin'>('passenger');
  const { loginAsDemoRole } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLaunchRole = (role: 'passenger' | 'driver' | 'operator' | 'admin', path: string) => {
    loginAsDemoRole(role);
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <span>How to Use RwandaBus</span>
                <span className="text-[10px] font-bold bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  User Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete walkthrough for passengers, drivers, transport operators, and administrators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 flex space-x-1 shrink-0 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('passenger')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'passenger' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>1. Passenger Workflow</span>
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'driver' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>2. Driver GPS Portal</span>
          </button>
          <button
            onClick={() => setActiveTab('operator')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'operator' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Operator Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>4. Admin Oversight</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {activeTab === 'passenger' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900">
                <strong className="block text-sm font-bold text-emerald-950 mb-1">
                  Primary Objective: Discover Routes &amp; Track Buses in Real Time
                </strong>
                As a passenger in Kigali, you can track approaching buses without even registering an account.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Search or Detect</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Type a route code (e.g. <strong>101</strong>, <strong>102</strong>), destination (<strong>Nyabugogo</strong>, <strong>Remera</strong>, <strong>Downtown</strong>), or click <em>Detect Nearby Stops</em> on the homepage.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Inspect the Live Map</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Open <strong>/map</strong>. Green pulsing markers show active buses with plate numbers (e.g. <em>RAD 234 B</em>) updating coordinates every 6 seconds.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Check Stop ETA</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Click any bus stop to view incoming buses, road distance (km), and estimated arrival time in minutes calculated from real traffic speed.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleLaunchRole('passenger', '/map')}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <span>Launch Live Map as Passenger</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'driver' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900">
                <strong className="block text-sm font-bold text-amber-950 mb-1">
                  Primary Objective: Start Authorized Trip &amp; Share GPS Telemetry
                </strong>
                Drivers use the mobile portal to transmit live bus position, speed, and heading to passengers.
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900">Step 1: Check Assigned Vehicle &amp; Route</strong>
                    <p className="text-slate-600 mt-0.5">
                      The portal displays your assigned bus (e.g. <em>RAD 234 B</em>) and licensed route (<em>Line 101 Nyabugogo – Remera</em>).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900">Step 2: Grant GPS Location Permission &amp; Start Trip</strong>
                    <p className="text-slate-600 mt-0.5">
                      Click <strong>Start Trip &amp; Share GPS</strong>. Allow browser location when prompted. Real-time dials will show current speed, heading, and accuracy.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900">Step 3: Pause or End Trip Gracefully</strong>
                    <p className="text-slate-600 mt-0.5">
                      You can pause GPS at terminal layovers or click <strong>End Trip</strong> upon completing the corridor journey.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleLaunchRole('driver', '/driver')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <span>Open Driver Portal as Jean Claude</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'operator' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-purple-900">
                <strong className="block text-sm font-bold text-purple-950 mb-1">
                  Primary Objective: Fleet Registration &amp; Dispatch Monitoring
                </strong>
                Designed for transport operators like Kigali Bus Services (KBS) and Royal Express to manage their vehicles and drivers.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="font-bold text-slate-900">Register New Transit Buses</strong>
                  <p className="text-slate-600">
                    Click <strong>Register Bus</strong> to add Rwandan plate numbers, models (Yutong, Scania), and passenger seating capacity.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="font-bold text-slate-900">Broadcast Service Notices</strong>
                  <p className="text-slate-600">
                    Post passenger disruption notices or peak-hour fleet increases. They immediately appear in the top banner on passenger screens.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="font-bold text-slate-900">Monitor Active Trips</strong>
                  <p className="text-slate-600">
                    View full dispatch map tracking each driver's real-time progress along the route.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="font-bold text-slate-900">Export CSV Reports</strong>
                  <p className="text-slate-600">
                    Download full fleet and trip records in CSV format with one click for performance reviews.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleLaunchRole('operator', '/operator/dashboard')}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <span>Open Operator Hub (KBS)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-900">
                <strong className="block text-sm font-bold text-red-950 mb-1">
                  Primary Objective: System Oversight, Security Audits &amp; Verified GTFS Data Import
                </strong>
                Root regulators oversee multi-operator transport networks, inspect security audit logs, and update official routes.
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <Shield className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900">Security Audit Logs</strong>
                    <p className="text-slate-600 mt-0.5">
                      Review all security events, logins, role transitions, and vehicle data modifications timestamped in Africa/Kigali time.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <Upload className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900">Verified Rwandan Data Importer</strong>
                    <p className="text-slate-600 mt-0.5">
                      Paste surveyed GTFS or GeoJSON coordinates to import official bus corridors across all districts in Rwanda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleLaunchRole('admin', '/admin')}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <span>Open Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
