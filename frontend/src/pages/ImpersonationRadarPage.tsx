import React, { useState, useEffect } from 'react';
import {
  UserSearch,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Info,
  RefreshCw,
  Building2,
  FileText,
  Activity
} from 'lucide-react';
import api from '../api/client';
import { Brand, ProfileAnalysisResult, riskColor, riskBg } from '../types';

export default function ImpersonationRadarPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | ''>('');
  const [username, setUsername] = useState('apexpay_support_24x7');
  const [displayName, setDisplayName] = useState('ApexPay Official Support Desk');
  const [profileDescription, setProfileDescription] = useState('24/7 Official Customer Support for ApexPay users. DM us with your account number to unlock frozen funds.');
  const [profileUrl, setProfileUrl] = useState('https://apexpay-desk.top');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfileAnalysisResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/brands').then(res => {
      setBrands(res.data);
      if (res.data.length > 0) setSelectedBrandId(res.data[0].id);
    }).catch(console.error);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/profiles/analyze', {
        username: username.trim(),
        display_name: displayName.trim(),
        profile_description: profileDescription.trim(),
        profile_url: profileUrl.trim(),
        brand_id: selectedBrandId || undefined
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Analysis request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreset = (preset: string) => {
    if (preset === 'apex_fake') {
      setUsername('apexpay_support_24x7');
      setDisplayName('ApexPay Official Support Desk');
      setProfileDescription('24/7 Official Customer Support for ApexPay users. DM us with your account number to unlock frozen funds.');
      setProfileUrl('https://apexpay-desk.top');
    } else if (preset === 'kampus_partner') {
      setUsername('kampus_student_club');
      setDisplayName('Kampus Student Hub');
      setProfileDescription('Student engineering community discussing tech and venture building with Kampus Digital.');
      setProfileUrl('https://kampus.vc');
    } else if (preset === 'cloudsafe_homoglyph') {
      setUsername('c1oudsafe_verify');
      setDisplayName('CloudSafe Security Team');
      setProfileDescription('Mandatory security verification desk. Update your credentials to maintain compliance.');
      setProfileUrl('https://c1oudsafe-auth.xyz');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserSearch className="w-6 h-6 text-cyan-400" />
          <span>Impersonation Radar</span>
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Scan social handles and profiles for lookalike nomenclature, visual deception, and deceptive customer support claims
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-gray-400 font-semibold uppercase tracking-wider">Test Scenarios:</span>
        <button
          type="button"
          onClick={() => handleLoadPreset('apex_fake')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/5 cursor-pointer transition-all"
        >
          ApexPay Support Impersonator
        </button>
        <button
          type="button"
          onClick={() => handleLoadPreset('cloudsafe_homoglyph')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-orange-400 border border-white/5 cursor-pointer transition-all"
        >
          CloudSafe Homoglyph (c1oudsafe)
        </button>
        <button
          type="button"
          onClick={() => handleLoadPreset('kampus_partner')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-green-400 border border-white/5 cursor-pointer transition-all"
        >
          Kampus Benign Student Hub
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column */}
        <div className="lg:col-span-5 glass-card p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Profile Telemetry Input</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Target Registered Brand *</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(Number(e.target.value))}
                className="input-field"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.official_website})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Candidate Username / Handle *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@handle"
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Candidate Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Profile Name"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Profile Bio / Description</label>
              <textarea
                rows={3}
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                placeholder="Self-proclaimed bio, helpdesk claims, support links..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Profile Link / Destination URL</label>
              <input
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://..."
                className="input-field font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Execute Impersonation Scan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Score Header Card */}
              <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: riskColor(result.risk_category) }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Assessed Threat Level</div>
                    <div className="text-2xl font-black text-white mt-1 flex items-center gap-3">
                      <span style={{ color: riskColor(result.risk_category) }}>{result.risk_category} RISK</span>
                      <span className="text-sm px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-300">
                        {result.risk_score} / 100
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Matched against: <span className="text-cyan-400 font-bold">{result.brand_matched}</span>
                      <span className="ml-2 text-gray-500 font-mono">({Math.round(result.similarity_score * 100)}% Similarity)</span>
                    </div>
                  </div>

                  {result.investigation_id && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">Dossier #{result.investigation_id} Created</span>
                    </div>
                  )}
                </div>

                {/* Risk Progress Bar */}
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, result.risk_score))}%`,
                      backgroundColor: riskColor(result.risk_category)
                    }}
                  />
                </div>
              </div>

              {/* Warning Signals */}
              {result.detected_warning_signals && result.detected_warning_signals.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span>Detected Threat Signals ({result.detected_warning_signals.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {result.detected_warning_signals.map((sig, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forensic Evidence Breakdown */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Evidence & Indicators</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {result.evidence && result.evidence.map((ev, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="text-gray-300">{ev.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributing Factors & Normalized Weights */}
              {result.contributing_factors && Object.keys(result.contributing_factors).length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Explainable Factor Contribution</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {Object.entries(result.contributing_factors).map(([factor, score]) => (
                      <div key={factor} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider truncate">
                          {factor.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">
                          +{score.toFixed(1)} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Protective Actions */}
              {result.recommended_actions && result.recommended_actions.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-green-400" />
                    <span>Actionable Protective Directives</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    {result.recommended_actions.map((act, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 flex items-start gap-2.5">
                        <span className="font-bold font-mono text-[11px] text-green-400 mt-0.5">0{i+1}.</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mandatory Guardrail Disclaimer */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Legal & Analytical Guardrail:</strong> TrustShield AI evaluates lexical resemblance and heuristic indicators. Similarity alone does not constitute legal proof of fraud. Human analyst verification is mandatory prior to external enforcement.
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <UserSearch className="w-12 h-12 text-gray-700 mb-3" />
              <h3 className="text-sm font-bold text-white">Awaiting Input Telemetry</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Enter target handle details on the left or select a preset scenario to launch deterministic brand resemblance analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
