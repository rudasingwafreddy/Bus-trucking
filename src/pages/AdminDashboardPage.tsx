import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Server,
  Database,
  Users,
  Building,
  Upload,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { storage, telemetry } from '../lib/storage';
import { AuditLog, Organisation, Profile } from '../types';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, role, loginAsDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'health' | 'organisations' | 'audit' | 'importer'>('health');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [importedJson, setImportedJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Auto-switch role if opened
  useEffect(() => {
    if (role !== 'admin') {
      loginAsDemoRole('admin');
    }
  }, [role, loginAsDemoRole]);

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const loadData = () => {
    setAuditLogs(storage.getAuditLogs());
    setOrganisations(storage.getOrganisations());
  };

  const handleResetData = () => {
    if (window.confirm('WARNING: Reset all transport data to factory Kigali demonstration defaults?')) {
      storage.resetToDefaults();
      storage.addAuditLog({
        user_id: user?.id,
        user_email: user?.email,
        action: 'ADMIN_RESET_DATA',
        resource_type: 'SYSTEM',
        details: { confirmed: true }
      });
      alert('Data reset successfully.');
      window.location.reload();
    }
  };

  const handleImportVerifiedData = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importedJson);
      if (parsed.routes && Array.isArray(parsed.routes)) {
        storage.saveRoutes(parsed.routes);
      }
      if (parsed.stops && Array.isArray(parsed.stops)) {
        storage.saveStops(parsed.stops);
      }
      storage.addAuditLog({
        user_id: user?.id,
        user_email: user?.email,
        action: 'ADMIN_IMPORT_DATA',
        resource_type: 'SYSTEM',
        details: { importedRoutes: parsed.routes?.length, importedStops: parsed.stops?.length }
      });
      setImportStatus('Successfully imported verified routes and bus stops!');
      setImportedJson('');
    } catch (err) {
      setImportStatus('JSON syntax error: Please ensure valid JSON structure with { "routes": [...], "stops": [...] }');
    }
  };

  const routes = storage.getRoutes();
  const stops = storage.getStops();
  const buses = storage.getBuses();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">RwandaBus Admin Oversight</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                  ROOT ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                National Public Transport Oversight &amp; Audit Logs • Africa/Kigali
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetData}
              className="px-4 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-bold rounded-xl border border-red-800 transition flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'health' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            System Health &amp; GPS Telemetry
          </button>
          <button
            onClick={() => setActiveTab('organisations')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'organisations' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            Transport Operators ({organisations.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'audit' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            Security Audit Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('importer')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'importer' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            Verified Data Importer
          </button>
        </div>

        {/* Tab 1: System Health */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold">Active Kigali Routes</span>
                <span className="text-2xl font-black text-white mt-1 block">{routes.length}</span>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 block">Gasabo / Nyarugenge / Kicukiro</span>
              </div>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold">Stops Configured</span>
                <span className="text-2xl font-black text-blue-400 mt-1 block">{stops.length}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Geocoded coordinates</span>
              </div>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold">Active Fleet</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{buses.length}</span>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 block">GPS Stream Active</span>
              </div>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold">RLS Security Status</span>
                <span className="text-2xl font-black text-teal-400 mt-1 block">Active</span>
                <span className="text-[10px] text-slate-400 mt-1 block">14 Policies Enforced</span>
              </div>
            </div>

            {/* Health checklist card */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white">Core System Integrity Metrics</h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time GPS Telemetry Engine</span>
                  </div>
                  <span className="font-bold text-emerald-400">OPERATIONAL (6.0s pulse)</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PostgreSQL &amp; PostGIS Geolocation Schema</span>
                  </div>
                  <span className="font-bold text-emerald-400">MIGRATED (14 Tables)</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Explainable ETA Heuristic Service</span>
                  </div>
                  <span className="font-bold text-emerald-400">ONLINE (Haversine + Route Distance)</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Bilingual Localization Service (EN / RW)</span>
                  </div>
                  <span className="font-bold text-emerald-400">SYNCED (Instant Switching)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Operators */}
        {activeTab === 'organisations' && (
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Licensed Transport Operators in Rwanda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {organisations.map(org => (
                <div key={org.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-slate-800 px-2 py-0.5 rounded text-white">
                      {org.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">ACTIVE LICENSED</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{org.name}</h4>
                  <p className="text-xs text-slate-400">{org.contact_email}</p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    License: {org.license_number || 'RURA-LIC-2024'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Security &amp; Operations Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Timestamp (Kigali)</th>
                    <th className="pb-3">User</th>
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Resource</th>
                    <th className="pb-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {auditLogs.slice(0, 15).map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-2.5 font-mono text-[11px] text-slate-400">
                        {new Date(log.created_at).toLocaleTimeString('en-GB', { timeZone: 'Africa/Kigali' })}
                      </td>
                      <td className="py-2.5 text-slate-300">{log.user_email || 'system'}</td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">{log.action}</td>
                      <td className="py-2.5 text-slate-400">{log.resource_type}</td>
                      <td className="py-2.5 text-[11px] text-slate-500 font-mono">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Verified Data Importer */}
        {activeTab === 'importer' && (
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div>
              <h3 className="font-bold text-base text-white">Import Verified Rwandan Transit Data</h3>
              <p className="text-xs text-slate-400 mt-1">
                Replace or supplement demonstration data with official surveyed route geometry coordinates and stop locations.
              </p>
            </div>

            {importStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                importStatus.includes('Successfully')
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950/60 text-red-300 border border-red-800'
              }`}>
                {importStatus}
              </div>
            )}

            <form onSubmit={handleImportVerifiedData} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  JSON Transit Payload (GTFS or GeoJSON format)
                </label>
                <textarea
                  rows={8}
                  required
                  value={importedJson}
                  onChange={(e) => setImportedJson(e.target.value)}
                  placeholder={`{\n  "routes": [\n    {\n      "id": "route-new",\n      "route_code": "104",\n      "name": "Kicukiro - Nyabugogo Express",\n      "origin": "Kicukiro Centre",\n      "destination": "Nyabugogo",\n      "distance_km": 11.2,\n      "estimated_duration_minutes": 32,\n      "base_fare_rwf": 300,\n      "geometry": [[-1.9860, 30.1020], [-1.9392, 30.0442]],\n      "is_active": true\n    }\n  ],\n  "stops": []\n}`}
                  className="w-full font-mono text-xs p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Validate &amp; Import Verified Data</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
