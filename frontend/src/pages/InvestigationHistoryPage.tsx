import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Trash2,
  Edit3,
  ExternalLink,
  RefreshCw,
  Building2,
  X,
  Bot
} from 'lucide-react';
import api from '../api/client';
import { Investigation, Brand, riskColor } from '../types';

export default function InvestigationHistoryPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterBrandId, setFilterBrandId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected for Details / Notes modal
  const [selectedInv, setSelectedInv] = useState<Investigation | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, brandRes] = await Promise.all([
        api.get('/investigations'),
        api.get('/brands')
      ]);
      setInvestigations(invRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDetails = (inv: Investigation) => {
    setSelectedInv(inv);
    setEditNotes(inv.analyst_notes || '');
  };

  const handleResolve = async (id: number) => {
    try {
      await api.post(`/investigations/${id}/resolve`, null, {
        params: { notes: 'Resolved by analyst review.' }
      });
      fetchData();
      if (selectedInv?.id === id) setSelectedInv(null);
    } catch (err) {
      alert('Failed to resolve investigation.');
    }
  };

  const handleMarkFalsePositive = async (id: number) => {
    try {
      await api.post(`/investigations/${id}/false-positive`, null, {
        params: { reason: 'Analyst verified legitimate brand affiliate.' }
      });
      fetchData();
      if (selectedInv?.id === id) setSelectedInv(null);
    } catch (err) {
      alert('Failed to mark false positive.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Delete investigation dossier #${id}?`)) return;
    try {
      await api.delete(`/investigations/${id}`);
      fetchData();
      if (selectedInv?.id === id) setSelectedInv(null);
    } catch (err) {
      alert('Failed to delete investigation.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInv) return;
    setSavingNotes(true);
    try {
      const res = await api.put(`/investigations/${selectedInv.id}`, {
        analyst_notes: editNotes
      });
      setSelectedInv(res.data);
      fetchData();
    } catch (err) {
      alert('Failed to save analyst notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleExportJson = () => {
    window.open('/api/export/investigations/json', '_blank');
  };

  const handleExportCsv = () => {
    window.open('/api/export/investigations/csv', '_blank');
  };

  const filtered = investigations.filter((inv) => {
    if (filterBrandId !== 'all' && inv.brand_id !== Number(filterBrandId)) return false;
    if (filterType !== 'all' && inv.entity_type !== filterType) return false;
    if (filterRisk !== 'all' && inv.risk_category !== filterRisk) return false;
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        inv.title.toLowerCase().includes(s) ||
        inv.entity_identifier.toLowerCase().includes(s) ||
        (inv.analyst_notes && inv.analyst_notes.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Investigation Dossiers & History</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Audit trail of ingested digital risk investigations, analyst notes, and enforcement resolutions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchData} className="btn-ghost flex items-center gap-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button onClick={handleExportJson} className="btn-ghost flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button onClick={handleExportCsv} className="btn-primary flex items-center gap-2 text-xs cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dossiers..."
              className="input-field pl-9 py-1.5 text-xs"
            />
          </div>

          {/* Brand Filter */}
          <select
            value={filterBrandId}
            onChange={(e) => setFilterBrandId(e.target.value)}
            className="input-field py-1.5 text-xs"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field py-1.5 text-xs"
          >
            <option value="all">All Threat Types</option>
            <option value="profile">Profiles (Impersonation)</option>
            <option value="scam_message">Scam Messages</option>
            <option value="mobile_app">Mobile Apps</option>
            <option value="domain">Lookalike Domains</option>
          </select>

          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="input-field py-1.5 text-xs"
          >
            <option value="all">All Risk Tiers</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field py-1.5 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-white/5 font-mono">
          <span>Showing {filtered.length} of {investigations.length} Investigation Records</span>
          <span>SQLite Persistent Audit Trail</span>
        </div>
      </div>

      {/* Investigations Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No investigation dossiers matched the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">Dossier #</th>
                  <th className="py-3 px-4">Threat Summary</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Risk Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-gray-400 font-bold">#{inv.id}</td>
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      <button
                        onClick={() => openDetails(inv)}
                        className="hover:text-cyan-400 text-left cursor-pointer transition-colors"
                      >
                        {inv.title}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-300">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                        {inv.entity_identifier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-medium">
                      {inv.brand?.name || 'Unspecified'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px]"
                        style={{
                          backgroundColor: `${riskColor(inv.risk_category)}15`,
                          color: riskColor(inv.risk_category),
                          border: `1px solid ${riskColor(inv.risk_category)}30`
                        }}
                      >
                        {inv.risk_category} ({inv.risk_score})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        inv.status === 'RESOLVED' ? 'bg-green-500/20 text-green-300' :
                        inv.status === 'FALSE_POSITIVE' ? 'bg-blue-500/20 text-blue-300' :
                        inv.status === 'UNDER_REVIEW' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetails(inv)}
                          className="p-1 rounded text-gray-400 hover:text-cyan-400"
                          title="View Details"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {inv.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleResolve(inv.id)}
                            className="p-1 rounded text-gray-400 hover:text-green-400"
                            title="Resolve Investigation"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-400"
                          title="Delete Dossier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Notes Drawer / Modal */}
      {selectedInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl p-6 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <button
              onClick={() => setSelectedInv(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-cyan-400">Dossier #{selectedInv.id}</span>
                <span
                  className="px-2 py-0.5 rounded font-mono font-bold text-[10px]"
                  style={{
                    backgroundColor: `${riskColor(selectedInv.risk_category)}20`,
                    color: riskColor(selectedInv.risk_category)
                  }}
                >
                  {selectedInv.risk_category} ({selectedInv.risk_score}/100)
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 uppercase text-gray-400 text-[10px]">
                  {selectedInv.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{selectedInv.title}</h2>
              <div className="text-gray-400 mt-0.5">Target: <strong className="text-white font-mono">{selectedInv.entity_identifier}</strong></div>
            </div>

            {/* Warning Signals */}
            {selectedInv.warning_signals && selectedInv.warning_signals.length > 0 && (
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-1">
                <div className="font-bold text-orange-300 uppercase tracking-wider text-[10px]">Detected Warning Signals:</div>
                {selectedInv.warning_signals.map((sig, i) => (
                  <div key={i} className="text-orange-200 text-xs">• {sig}</div>
                ))}
              </div>
            )}

            {/* Recommended Actions */}
            {selectedInv.recommended_actions && selectedInv.recommended_actions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#0b1120] border border-white/5 space-y-1">
                <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Actionable Directives:</div>
                {selectedInv.recommended_actions.map((act, i) => (
                  <div key={i} className="text-gray-300 text-xs">0{i+1}. {act}</div>
                ))}
              </div>
            )}

            {/* Analyst Notes Editor */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                Analyst Incident Notes & Audit Observations:
              </label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Document takedown requests, registrar contact details, or false positive rationale..."
                className="input-field"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="btn-primary text-xs"
                >
                  {savingNotes ? 'Saving...' : 'Update Analyst Notes'}
                </button>
              </div>
            </div>

            {/* Resolution Actions */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedInv.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolve(selectedInv.id)}
                    className="px-3 py-1.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 text-xs font-semibold cursor-pointer"
                  >
                    Resolve Dossier
                  </button>
                )}
                {selectedInv.status !== 'FALSE_POSITIVE' && (
                  <button
                    onClick={() => handleMarkFalsePositive(selectedInv.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold cursor-pointer"
                  >
                    Mark False Positive
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedInv(null)}
                className="btn-ghost text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
