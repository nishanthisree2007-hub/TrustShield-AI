import React from 'react';
import {
  Settings,
  Shield,
  Key,
  Sliders,
  Database,
  Download,
  Info,
  CheckCircle2,
  AlertCircle,
  User,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Platform Settings & System Diagnostics</span>
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Engine parameters, scoring weights, API environment status, and audit data export controls
        </p>
      </div>

      {/* User Info Card */}
      <div className="glass-card p-5">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Current Session Identity</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-gray-500 uppercase tracking-wider text-[10px] block">Username</span>
            <span className="font-mono font-bold text-white text-sm mt-0.5 block">{user?.username || 'demo_analyst'}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-gray-500 uppercase tracking-wider text-[10px] block">Email</span>
            <span className="font-mono text-gray-300 mt-0.5 block">{user?.email || 'analyst@trustshield.ai'}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-gray-500 uppercase tracking-wider text-[10px] block">Assigned Role</span>
            <span className="font-mono text-cyan-400 font-bold uppercase mt-0.5 block">{user?.role || 'admin'}</span>
          </div>
        </div>
      </div>

      {/* Explainable Risk Engine Scoring Weights */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Explainable Risk Engine Weights (Deterministic Calibration)</span>
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            NORMALIZED SUM = 100%
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          TrustShield AI calculates deterministic threat scores based on calibrated signal weights. When telemetry signals are missing, weights are re-normalized proportionally across present vectors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0b1120] border border-white/5">
            <div className="text-gray-400 font-semibold mb-1">Brand / Handle Match</div>
            <div className="text-2xl font-black text-cyan-400 font-mono">20%</div>
            <div className="text-[10px] text-gray-500 mt-1">Levenshtein & Jaro-Winkler</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b1120] border border-white/5">
            <div className="text-gray-400 font-semibold mb-1">Logo Perceptual Match</div>
            <div className="text-2xl font-black text-cyan-400 font-mono">20%</div>
            <div className="text-[10px] text-gray-500 mt-1">dHash 64-bit Image Vector</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b1120] border border-white/5">
            <div className="text-gray-400 font-semibold mb-1">Suspicious URL / Domain</div>
            <div className="text-2xl font-black text-red-400 font-mono">25%</div>
            <div className="text-[10px] text-gray-500 mt-1">Typosquats & Risky TLDs</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b1120] border border-white/5">
            <div className="text-gray-400 font-semibold mb-1">Scam Content Signals</div>
            <div className="text-2xl font-black text-yellow-400 font-mono">20%</div>
            <div className="text-[10px] text-gray-500 mt-1">English & Tamil Phrase Regex</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b1120] border border-white/5">
            <div className="text-gray-400 font-semibold mb-1">Account & Dev Metadata</div>
            <div className="text-2xl font-black text-purple-400 font-mono">15%</div>
            <div className="text-[10px] text-gray-500 mt-1">Permissions & Whitelists</div>
          </div>
        </div>
      </div>

      {/* AI Engine Status */}
      <div className="glass-card p-5">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>AI Inference & Engine Modes</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Deterministic Rule Engine (Primary)</div>
              <p className="text-gray-400 text-[11px] mt-0.5">
                Always active. Fast, repeatable, and independent of external API keys. Computes all risk scores and phrase spans offline.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <Key className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">LLM API Augmentation (Optional)</div>
              <p className="text-gray-400 text-[11px] mt-0.5">
                Configurable via backend environment variables (<code className="text-cyan-300">GEMINI_API_KEY</code>, <code className="text-cyan-300">OPENAI_API_KEY</code>). Used for natural language abuse report drafting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Data Export */}
      <div className="glass-card p-5">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Forensic Dossier Data Export</span>
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Export full database records containing investigation titles, risk scores, forensic evidence, and analyst notes.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/api/export/investigations/csv', '_blank')}
            className="btn-primary text-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Investigations (CSV)</span>
          </button>
          <button
            onClick={() => window.open('/api/export/investigations/json', '_blank')}
            className="btn-ghost text-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Investigations (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
