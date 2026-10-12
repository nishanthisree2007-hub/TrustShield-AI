import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  Building2,
  Info,
  Check,
  X
} from 'lucide-react';
import api from '../api/client';
import { Brand, TwinResult, riskColor } from '../types';

export default function DigitalTwinPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TwinResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/brands').then(res => {
      setBrands(res.data);
      if (res.data.length > 0) setSelectedBrandId(res.data[0].id);
    }).catch(console.error);
  }, []);

  const handleSimulate = async () => {
    if (!selectedBrandId) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/twin/simulate', {
        brand_id: selectedBrandId
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Digital Twin simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-green-400" />
            <span>Brand Risk Digital Twin</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Defensive threat modeling simulation — generate synthetic lookalikes and test platform detection resilience
          </p>
        </div>
      </div>

      {/* Simulator Launch Control */}
      <div className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="flex-1 max-w-sm">
            <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
              Select Target Brand for Simulation:
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(Number(e.target.value))}
              className="input-field text-xs py-2"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.official_website})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading || !selectedBrandId}
          className="btn-primary flex items-center justify-center gap-2 text-xs py-2.5 px-6 shrink-0 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Defensive Twin Simulation</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mandatory Safety Label Banner */}
      <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <span>
          <strong>Ethical Defensive Simulation Notice:</strong> All scenarios executed in this module are generated as synthetic vectors to probe detection resilience. No real social profiles, unauthorized domains, or deceptive public assets are created.
        </span>
      </div>

      {/* Simulation Results */}
      {result && (
        <div className="space-y-6">
          {/* Top Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="glass-card p-4 border-l-4 border-l-cyan-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Resilience Score</div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{result.brand_resilience_score}%</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Overall Posture</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-blue-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Vectors Tested</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{result.total_scenarios_tested}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Across 4 surfaces</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-green-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Threats Detected</div>
              <div className="text-2xl font-black text-green-400 font-mono mt-1">{result.scenarios_detected}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">True + False Positives</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-purple-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">F1 Score</div>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1">{result.f1_score}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Harmonic Mean</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-yellow-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Precision</div>
              <div className="text-2xl font-black text-yellow-400 font-mono mt-1">{result.precision}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">FP: {result.false_positives}</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-teal-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Recall</div>
              <div className="text-2xl font-black text-teal-400 font-mono mt-1">{result.recall}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">FN: {result.false_negatives}</div>
            </div>
          </div>

          {/* Detailed Synthetic Scenarios Table */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Defensive Attack Surface Vector Matrix
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                {result.scenario_results.filter(s => s.passed).length} / {result.scenario_results.length} Scenarios Correctly Handled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Vector ID</th>
                    <th className="py-2.5 px-3">Attack Surface Vector</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Expected</th>
                    <th className="py-2.5 px-3">Detected Risk</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Defense Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.scenario_results.map((sc) => (
                    <tr key={sc.scenario_id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono text-gray-400">{sc.scenario_id}</td>
                      <td className="py-3 px-3 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{sc.scenario_name}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase font-mono">
                            SYNTHETIC
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400 capitalize">{sc.scenario_type.replace('_', ' ')}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-gray-300">{sc.expected_risk}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px]"
                          style={{
                            backgroundColor: `${riskColor(sc.detected_category)}15`,
                            color: riskColor(sc.detected_category)
                          }}
                        >
                          {sc.detected_category} ({sc.detected_score})
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {sc.passed ? (
                          <span className="inline-flex items-center gap-1 text-green-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Handled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Mismatch
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-[11px]">
                        {sc.mitigation_recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
