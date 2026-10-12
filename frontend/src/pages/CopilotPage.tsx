import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Lock,
  Info,
  HelpCircle
} from 'lucide-react';
import api from '../api/client';
import { Investigation, CopilotResponse } from '../types';

export default function CopilotPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<number | ''>('');
  const [queryType, setQueryType] = useState<string>('general');
  const [prompt, setPrompt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [copiedAbuse, setCopiedAbuse] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/investigations').then(res => {
      setInvestigations(res.data);
      if (res.data.length > 0) setSelectedInvId(res.data[0].id);
    }).catch(console.error);
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await api.post('/copilot/query', {
        investigation_id: selectedInvId || undefined,
        query_type: queryType,
        prompt: prompt.trim()
      });
      setResponse(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Copilot query failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyAbuseReport = () => {
    if (!response?.abuse_report) return;
    navigator.clipboard.writeText(
      `SUBJECT: ${response.abuse_report.subject_line}\n\n${response.abuse_report.report_body}`
    );
    setCopiedAbuse(true);
    setTimeout(() => setCopiedAbuse(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-400" />
          <span>AI Investigation Copilot</span>
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Specialized digital risk assistant — evidence synthesis, formal abuse report drafting, and customer advisory generation
        </p>
      </div>

      {/* Mandatory Human Guardrail Banner */}
      <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <span>
          <strong>HUMAN-IN-THE-LOOP MANDATE:</strong> AI Copilot drafts and recommendations require explicit manual human review and approval prior to issuing external registrar notices, legal takedowns, or public advisories.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt Input Column */}
        <div className="lg:col-span-5 glass-card p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Investigation Context</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleQuery} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Attach Investigation Dossier</label>
              <select
                value={selectedInvId}
                onChange={(e) => setSelectedInvId(Number(e.target.value))}
                className="input-field"
              >
                <option value="">-- Ad-Hoc / General Inquiry --</option>
                {investigations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    #{inv.id} - {inv.title.slice(0, 40)} ({inv.risk_category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Action / Query Objective *</label>
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                className="input-field"
              >
                <option value="general">Comprehensive Threat Briefing</option>
                <option value="summarize">Executive Evidence Summary</option>
                <option value="draft_abuse_report">Draft Formal Registrar/Host Abuse Notice</option>
                <option value="customer_warning">Draft Public Customer Advisory Notice</option>
                <option value="recommend_steps">Formulate Incident Response Next Steps</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Custom Analyst Inquiry (Optional)</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask specific questions about threat vectors, domain infrastructure, or brand confusion..."
                className="input-field leading-relaxed"
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
                  <span>Consult AI Copilot</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {response ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="glass-card p-6 border-l-4 border-l-cyan-400">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Executive Threat Summary</div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {response.is_rule_based_fallback ? 'DETERMINISTIC FALLBACK ENGINE' : 'LLM ENHANCED'}
                  </span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed font-medium">
                  {response.summary}
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-400">
                  {response.detailed_explanation}
                </div>
              </div>

              {/* Key Risk Drivers */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                  <span>Primary Risk Drivers</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {response.key_risk_drivers.map((drv, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">
                      • {drv}
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Telemetry Vectors */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-yellow-400" />
                  <span>Missing Evidence Vectors for Full Attribution</span>
                </h3>
                <div className="space-y-1.5 text-xs">
                  {response.identified_missing_evidence.map((miss, i) => (
                    <div key={i} className="text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <span>{miss}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Steps */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Recommended Investigation Steps</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {response.recommended_next_steps.map((step, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300">
                      0{i+1}. {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Draft Abuse Report */}
              {response.abuse_report && (
                <div className="glass-card p-5 border border-red-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-400" />
                      <span>Formal Abuse Takedown Notice Draft</span>
                    </h3>
                    <button
                      onClick={copyAbuseReport}
                      className="btn-ghost text-xs py-1 px-3 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedAbuse ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAbuse ? 'Copied' : 'Copy Notice'}</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">Target Infrastructure:</span>
                      <span className="font-mono text-cyan-400 font-bold">{response.abuse_report.target_type} ({response.abuse_report.target_entity})</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Subject Line:</span>
                      <span className="text-white font-medium">{response.abuse_report.subject_line}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Body Text:</span>
                      <pre className="p-3.5 rounded-xl bg-[#0b1120] text-gray-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-white/5">
                        {response.abuse_report.report_body}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Warning Draft */}
              {response.customer_warning && (
                <div className="glass-card p-5 border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-yellow-400" />
                      <span>Customer Public Advisory Notice Draft</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold uppercase">
                      {response.customer_warning.urgency_tier}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="text-sm font-bold text-white">{response.customer_warning.title}</div>
                    <p className="text-gray-300 italic">"{response.customer_warning.short_advisory}"</p>
                    <div>
                      <span className="text-gray-400 font-semibold block mb-1">Customer Defense Rules:</span>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {response.customer_warning.detailed_guidelines.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <Bot className="w-12 h-12 text-gray-700 mb-3" />
              <h3 className="text-sm font-bold text-white">Copilot Idle</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Attach an existing investigation dossier or select a query action on the left to generate synthesized cyber threat reports.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
