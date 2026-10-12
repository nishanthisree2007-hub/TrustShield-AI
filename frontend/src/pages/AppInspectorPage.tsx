import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Info,
  ShieldCheck,
  Package,
  Code2,
  Lock,
  Globe
} from 'lucide-react';
import api from '../api/client';
import { Brand, AppInspectionResult, riskColor } from '../types';

const COMMON_PERMISSIONS = [
  { id: 'android.permission.RECEIVE_SMS', label: 'RECEIVE_SMS', dangerous: true, desc: 'Intercept incoming SMS (OTP theft vector)' },
  { id: 'android.permission.READ_SMS', label: 'READ_SMS', dangerous: true, desc: 'Read stored device SMS verification messages' },
  { id: 'android.permission.BIND_ACCESSIBILITY_SERVICE', label: 'BIND_ACCESSIBILITY_SERVICE', dangerous: true, desc: 'Automated UI clicking & screen text harvesting' },
  { id: 'android.permission.SYSTEM_ALERT_WINDOW', label: 'SYSTEM_ALERT_WINDOW', dangerous: true, desc: 'Draw overlay windows over legitimate login apps' },
  { id: 'android.permission.REQUEST_INSTALL_PACKAGES', label: 'REQUEST_INSTALL_PACKAGES', dangerous: true, desc: 'Drop and execute secondary rogue payloads' },
  { id: 'android.permission.RECORD_AUDIO', label: 'RECORD_AUDIO', dangerous: false, desc: 'Microphone access' },
  { id: 'android.permission.ACCESS_FINE_LOCATION', label: 'ACCESS_FINE_LOCATION', dangerous: false, desc: 'Precise GPS geolocation' },
  { id: 'android.permission.INTERNET', label: 'INTERNET', dangerous: false, desc: 'Standard network access' }
];

export default function AppInspectorPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | ''>('');

  const [appName, setAppName] = useState('ApexPay QuickWallet Pro');
  const [developer, setDeveloper] = useState('quickpay_mods@gmail.com');
  const [packageId, setPackageId] = useState('com.apexpay.quickwallet.mod');
  const [description, setDescription] = useState('Exclusive bonus wallet APK for ApexPay users. Install direct APK to claim $50 wallet credit.');
  const [website, setWebsite] = useState('https://apexpay-mods.xyz');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'android.permission.RECEIVE_SMS',
    'android.permission.READ_SMS',
    'android.permission.BIND_ACCESSIBILITY_SERVICE',
    'android.permission.SYSTEM_ALERT_WINDOW'
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AppInspectionResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/brands').then(res => {
      setBrands(res.data);
      if (res.data.length > 0) setSelectedBrandId(res.data[0].id);
    }).catch(console.error);
  }, []);

  const handleTogglePerm = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/apps/inspect', {
        app_name: appName.trim(),
        developer: developer.trim(),
        package_identifier: packageId.trim(),
        description: description.trim(),
        website: website.trim(),
        requested_permissions: selectedPermissions,
        brand_id: selectedBrandId || undefined
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'App inspection failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (type: string) => {
    if (type === 'trojan') {
      setAppName('ApexPay QuickWallet Pro');
      setDeveloper('quickpay_mods@gmail.com');
      setPackageId('com.apexpay.quickwallet.mod');
      setDescription('Exclusive bonus wallet APK for ApexPay users. Install direct APK to bypass Play Store limits.');
      setWebsite('https://apexpay-mods.xyz');
      setSelectedPermissions([
        'android.permission.RECEIVE_SMS',
        'android.permission.READ_SMS',
        'android.permission.BIND_ACCESSIBILITY_SERVICE',
        'android.permission.SYSTEM_ALERT_WINDOW'
      ]);
    } else if (type === 'official') {
      setAppName('ApexPay Official Mobile');
      setDeveloper('ApexPay Technologies Inc.');
      setPackageId('com.apexpay.app');
      setDescription('Official secure mobile banking client for ApexPay.');
      setWebsite('https://apexpay.com');
      setSelectedPermissions([
        'android.permission.INTERNET',
        'android.permission.ACCESS_FINE_LOCATION'
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-purple-400" />
          <span>Mobile App Trust Inspector</span>
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Metadata-only inspection of package namespaces, unverified developers, and high-risk Android permission vectors
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-400 font-semibold uppercase tracking-wider">Presets:</span>
        <button
          type="button"
          onClick={() => loadPreset('trojan')}
          className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 cursor-pointer font-medium"
        >
          Rogue Banking Trojan APK
        </button>
        <button
          type="button"
          onClick={() => loadPreset('official')}
          className="px-2.5 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/20 cursor-pointer font-medium"
        >
          Official Verified Enterprise App
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 glass-card p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Application Metadata</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleInspect} className="space-y-4 text-xs">
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
              <label className="block text-gray-300 font-medium mb-1.5">Application Title *</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="App Name"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Package Identifier (Reverse DNS) *</label>
              <input
                type="text"
                required
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                placeholder="com.brand.app"
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Developer Name / Contact Email *</label>
              <input
                type="text"
                required
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                placeholder="Developer name or email"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Developer Website / Support URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Promotional Store Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="App description from store listing..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">Requested Manifest Permissions</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 rounded-xl bg-[#0b1120] border border-white/5">
                {COMMON_PERMISSIONS.map(p => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedPermissions.includes(p.id) ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(p.id)}
                      onChange={() => handleTogglePerm(p.id)}
                      className="mt-0.5 rounded border-gray-700 text-cyan-500 focus:ring-0"
                    />
                    <div>
                      <div className={`font-mono font-medium ${p.dangerous ? 'text-red-400' : 'text-gray-300'}`}>
                        {p.label}
                      </div>
                      <div className="text-[10px] text-gray-500">{p.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
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
                  <span>Inspect Mobile Metadata</span>
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
              {/* Header Score Card */}
              <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: riskColor(result.risk_category) }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Metadata Risk Evaluation</div>
                    <div className="text-2xl font-black text-white mt-1 flex items-center gap-3">
                      <span style={{ color: riskColor(result.risk_category) }}>{result.risk_category} RISK</span>
                      <span className="text-sm px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-300">
                        {result.risk_score} / 100
                      </span>
                    </div>
                    {result.brand_impersonation_candidate && (
                      <div className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs">
                        ⚠️ High Probability Brand Squatting Candidate
                      </div>
                    )}
                  </div>
                  {result.investigation_id && (
                    <div className="text-xs text-gray-500 font-mono">
                      Dossier #{result.investigation_id}
                    </div>
                  )}
                </div>
              </div>

              {/* Dangerous Permissions Box */}
              {result.dangerous_permissions_detected && result.dangerous_permissions_detected.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Dangerous Permission Combinations ({result.dangerous_permissions_detected.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {result.dangerous_permissions_detected.map((p, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                        <div className="flex items-center justify-between font-mono font-bold text-red-400">
                          <span>{p.permission}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">{p.risk_level}</span>
                        </div>
                        <div className="text-gray-300 text-[11px] mt-1">{p.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Package & Developer Findings */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span>Developer & Namespace Anomalies</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {result.package_identifier_findings.map((f, i) => (
                    <div key={`pkg-${i}`} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-orange-300">
                      • {f}
                    </div>
                  ))}
                  {result.developer_reputation_flags.map((f, i) => (
                    <div key={`dev-${i}`} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-yellow-300">
                      • {f}
                    </div>
                  ))}
                  {result.package_identifier_findings.length === 0 && result.developer_reputation_flags.length === 0 && (
                    <div className="text-gray-500 italic">No package naming or developer anomalies noted.</div>
                  )}
                </div>
              </div>

              {/* Protective Recommendations */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Recommended Directives</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {result.recommended_actions.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 flex items-start gap-2.5">
                      <span className="font-bold font-mono text-green-400">0{i+1}.</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explicit Legal/Technical Disclaimer */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Inspection Boundary:</strong> {result.disclaimer}
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <Smartphone className="w-12 h-12 text-gray-700 mb-3" />
              <h3 className="text-sm font-bold text-white">Awaiting App Package Data</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Enter package reverse DNS, requested permissions, and developer info to evaluate digital trademark risks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
