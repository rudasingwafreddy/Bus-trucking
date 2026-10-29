import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Bus as BusIcon,
  Users,
  Route as RouteIcon,
  Radio,
  FileDown,
  Plus,
  Bell,
  Trash2,
  CheckCircle2,
  Clock,
  Gauge,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { storage, telemetry } from '../lib/storage';
import { Bus, BusRoute, Driver, Trip, Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { LiveBusMap } from '../components/map/LiveBusMap';

export const OperatorDashboardPage: React.FC = () => {
  const { user, role, loginAsDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'buses' | 'drivers' | 'routes' | 'announcements'>('overview');
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Modal states
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCapacity, setNewCapacity] = useState(45);

  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeSeverity, setNoticeSeverity] = useState<'info' | 'warning' | 'critical'>('info');

  // Auto-switch role if opened
  useEffect(() => {
    if (role !== 'operator') {
      loginAsDemoRole('operator');
    }
  }, [role, loginAsDemoRole]);

  useEffect(() => {
    loadAll();
    const unsub = storage.subscribe(() => {
      loadAll();
    });
    return () => unsub();
  }, []);

  const loadAll = () => {
    setBuses(storage.getBuses());
    setDrivers(storage.getDrivers());
    setRoutes(storage.getRoutes());
    setTrips(storage.getTrips());
    setAnnouncements(storage.getAnnouncements());
  };

  const handleAddBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;

    const newBus: Bus = {
      id: 'bus-' + Date.now(),
      organisation_id: 'org-kbs',
      organisation_name: 'Kigali Bus Services (KBS)',
      plate_number: newPlate.toUpperCase(),
      bus_model: newModel || 'Yutong Citybus',
      capacity: Number(newCapacity) || 45,
      features: ['Tap & Go', '4G WiFi'],
      status: 'active',
      created_at: new Date().toISOString()
    };

    const updated = [newBus, ...buses];
    storage.saveBuses(updated);
    storage.addAuditLog({
      user_id: user?.id,
      user_email: user?.email,
      action: 'OPERATOR_ADD_BUS',
      resource_type: 'BUS',
      details: { plate: newBus.plate_number }
    });

    setNewPlate('');
    setNewModel('');
    setShowAddBusModal(false);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim()) return;

    const newNotice: Announcement = {
      id: 'ann-' + Date.now(),
      organisation_id: 'org-kbs',
      organisation_name: 'Kigali Bus Services (KBS)',
      title: noticeTitle,
      content: noticeContent,
      severity: noticeSeverity,
      is_active: true,
      starts_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const updated = [newNotice, ...announcements];
    storage.saveAnnouncements(updated);
    storage.addAuditLog({
      user_id: user?.id,
      user_email: user?.email,
      action: 'OPERATOR_ADD_ANNOUNCEMENT',
      resource_type: 'ANNOUNCEMENT',
      details: { title: newNotice.title }
    });

    setNoticeTitle('');
    setNoticeContent('');
    setShowAddAnnouncementModal(false);
  };

  const exportFleetReportCSV = () => {
    const headers = 'ID,Plate Number,Model,Capacity,Status,Created At\n';
    const rows = buses.map(b => `"${b.id}","${b.plate_number}","${b.bus_model}",${b.capacity},"${b.status}","${b.created_at}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kbs_fleet_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Operator Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">KBS Operator Hub</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  OPERATOR PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kigali Bus Services (KBS) Fleet Management • License RURA-LIC-2024-001
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportFleetReportCSV}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
            >
              <FileDown className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowAddBusModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Bus</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'overview' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Live Fleet Overview
          </button>
          <button
            onClick={() => setActiveTab('buses')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'buses' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bus Fleet ({buses.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'drivers' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Driver Roster ({drivers.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'announcements' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Service Notices ({announcements.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-400 block font-semibold">Active Vehicles</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{buses.length}</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">100% Operational</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-400 block font-semibold">Trips in Progress</span>
                <span className="text-2xl font-black text-blue-600 mt-1 block">
                  {trips.filter(t => t.status === 'in_progress').length}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Transmitting GPS</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-400 block font-semibold">Assigned Drivers</span>
                <span className="text-2xl font-black text-purple-600 mt-1 block">{drivers.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Licensed Drivers</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-400 block font-semibold">Avg Telemetry Rate</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">6.2s</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Healthy Freshness</span>
              </div>
            </div>

            {/* Operator Live Tracking Map */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Operator Live Telemetry Map</h3>
                  <p className="text-xs text-slate-500">Monitor all assigned vehicle positions across Kigali corridors</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live Dispatch Stream</span>
                </span>
              </div>
              <LiveBusMap heightClass="h-[460px]" />
            </div>
          </div>
        )}

        {/* Tab 2: Buses Table */}
        {activeTab === 'buses' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registered Fleet</h3>
                <p className="text-xs text-slate-500">Buses licensed to operate on Kigali transit lines</p>
              </div>
              <button
                onClick={() => setShowAddBusModal(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bus</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Plate Number</th>
                    <th className="pb-3">Model</th>
                    <th className="pb-3">Capacity</th>
                    <th className="pb-3">Features</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buses.map(bus => (
                    <tr key={bus.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-mono font-bold text-slate-900 text-sm">
                        {bus.plate_number}
                      </td>
                      <td className="py-3 font-semibold text-slate-700">{bus.bus_model}</td>
                      <td className="py-3 text-slate-600">{bus.capacity} Passengers</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {bus.features?.map((f, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {bus.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        <button
                          onClick={() => {
                            if (window.confirm(`Deactivate bus ${bus.plate_number}?`)) {
                              const updated = buses.filter(b => b.id !== bus.id);
                              storage.saveBuses(updated);
                            }
                          }}
                          className="hover:text-red-500 p-1"
                          title="Remove vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Drivers Roster */}
        {activeTab === 'drivers' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Assigned Drivers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.map(drv => (
                <div key={drv.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                      {drv.full_name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{drv.full_name}</h4>
                      <p className="text-xs text-slate-500">{drv.phone_number} • License {drv.license_number}</p>
                      <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
                        Assigned Vehicle: RAD 234 B
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    On Duty
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Announcements */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Service Notices &amp; Passenger Broadcasts</h3>
                <p className="text-xs text-slate-500">Publish detour alerts, weather, or peak hours notifications</p>
              </div>
              <button
                onClick={() => setShowAddAnnouncementModal(true)}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Notice</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map(notice => (
                <div key={notice.id} className="p-4 rounded-2xl border border-slate-200 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        notice.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {notice.severity}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{notice.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{notice.content}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      Posted {new Date(notice.starts_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const updated = announcements.filter(a => a.id !== notice.id);
                      storage.saveAnnouncements(updated);
                    }}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Add Bus */}
        {showAddBusModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
              <h3 className="font-black text-lg text-slate-900 mb-4">Register New Transit Bus</h3>
              <form onSubmit={handleAddBus} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rwandan Plate Number</label>
                  <input
                    type="text"
                    required
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="e.g. RAD 567 K"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Model &amp; Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Yutong E12 Electric / Scania City"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passenger Seating Capacity</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={100}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBusModal(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-md"
                  >
                    Save Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Post Announcement */}
        {showAddAnnouncementModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
              <h3 className="font-black text-lg text-slate-900 mb-4">Post Service Notice</h3>
              <form onSubmit={handleAddAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Headline</label>
                  <input
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Route 101 Evening Frequency Increase"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={noticeSeverity}
                    onChange={(e) => setNoticeSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="info">Information (Blue)</option>
                    <option value="warning">Warning / Advisory (Yellow)</option>
                    <option value="critical">Critical / Interruption (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Detailed Explanation</label>
                  <textarea
                    required
                    rows={3}
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Provide details about route detours, extra buses, or timing..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAnnouncementModal(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-md"
                  >
                    Publish Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
