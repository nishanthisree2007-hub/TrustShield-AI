import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  Activity
} from 'lucide-react';
import api from '../api/client';
import { QualityReport } from '../types';

export default function DetectionLabPage() {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBenchmark = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lab/evaluate');
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Detection Quality Lab</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Empirical statistical evaluation executed against a labeled ground-truth benchmark suite with zero fabricated results
          </p>
        </div>
        <button onClick={fetchBenchmark} className="btn-primary flex items-center gap-2 text-xs cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Execute Benchmark Suite</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-xs font-mono">Running live benchmark suite across 20 labeled test vectors...</p>
          </div>
        </div>
      ) : !report ? (
        <div className="glass-card p-12 text-center text-gray-500 text-xs">
          Unable to generate benchmark report.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Level Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-card p-4 border-l-4 border-l-cyan-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Precision</div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{(report.precision * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-gray-400 mt-0.5">TP / (TP + FP)</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-teal-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Recall</div>
              <div className="text-2xl font-black text-teal-400 font-mono mt-1">{(report.recall * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-gray-400 mt-0.5">TP / (TP + FN)</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-purple-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">F1 Score</div>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1">{report.f1_score.toFixed(3)}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Harmonic Balance</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-green-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Accuracy</div>
              <div className="text-2xl font-black text-green-400 font-mono mt-1">{(report.accuracy * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Overall Correctness</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-yellow-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">False Positive Rate</div>
              <div className="text-2xl font-black text-yellow-400 font-mono mt-1">{(report.false_positive_rate * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-gray-400 mt-0.5">FP / (FP + TN)</div>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-orange-400">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">False Negative Rate</div>
              <div className="text-2xl font-black text-orange-400 font-mono mt-1">{(report.false_negative_rate * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-gray-400 mt-0.5">FN / (FN + TP)</div>
            </div>
          </div>

          {/* Confusion Matrix and Dataset Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 2x2 Confusion Matrix */}
            <div className="lg:col-span-6 glass-card p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Empirical Confusion Matrix</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                {/* True Positive */}
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="text-[10px] text-green-400 uppercase tracking-wider font-bold">True Positive (TP)</div>
                  <div className="text-3xl font-black text-green-300 font-mono my-1">{report.confusion_matrix.true_positive}</div>
                  <div className="text-[11px] text-gray-400">Threats Correctly Flagged</div>
                </div>

                {/* False Positive */}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="text-[10px] text-red-400 uppercase tracking-wider font-bold">False Positive (FP)</div>
                  <div className="text-3xl font-black text-red-300 font-mono my-1">{report.confusion_matrix.false_positive}</div>
                  <div className="text-[11px] text-gray-400">Benign Incorrectly Flagged</div>
                </div>

                {/* False Negative */}
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                  <div className="text-[10px] text-orange-400 uppercase tracking-wider font-bold">False Negative (FN)</div>
                  <div className="text-3xl font-black text-orange-300 font-mono my-1">{report.confusion_matrix.false_negative}</div>
                  <div className="text-[11px] text-gray-400">Threats Missed</div>
                </div>

                {/* True Negative */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <div className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">True Negative (TN)</div>
                  <div className="text-3xl font-black text-blue-300 font-mono my-1">{report.confusion_matrix.true_negative}</div>
                  <div className="text-[11px] text-gray-400">Benign Correctly Cleared</div>
                </div>
              </div>
            </div>

            {/* Benchmark Suite Composition */}
            <div className="lg:col-span-6 glass-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Benchmark Dataset Breakdown</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-gray-300">Total Labeled Corpus Vectors</span>
                    <span className="font-mono font-bold text-white">{report.dataset_breakdown.total_samples} Items</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-gray-300">Scam Text Samples (English & Tamil)</span>
                    <span className="font-mono font-bold text-yellow-400">{report.dataset_breakdown.scam_text_samples} Items</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-gray-300">Social Impersonator Profiles</span>
                    <span className="font-mono font-bold text-orange-400">{report.dataset_breakdown.impersonation_profile_samples} Items</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-gray-300">Benign Control Samples (Non-Threats)</span>
                    <span className="font-mono font-bold text-blue-400">{report.dataset_breakdown.benign_control_samples} Items</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-[#0b1120] border border-white/5 text-[11px] text-gray-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{report.evaluation_notes}</span>
              </div>
            </div>
          </div>

          {/* Detailed Benchmark Vectors Table */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Ground Truth Verification Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Sample ID</th>
                    <th className="py-2.5 px-3">Test Case Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Ground Truth</th>
                    <th className="py-2.5 px-3">Model Output</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {report.detailed_benchmarks.map((item) => (
                    <tr key={item.sample_id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-gray-400">{item.sample_id}</td>
                      <td className="py-2.5 px-3 font-medium text-white">{item.sample_name}</td>
                      <td className="py-2.5 px-3 text-gray-400 capitalize">{item.sample_type.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-300">{item.ground_truth}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{item.predicted_result}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-300">{item.predicted_score}</td>
                      <td className="py-2.5 px-3">
                        {item.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-green-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Fail
                          </span>
                        )}
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
