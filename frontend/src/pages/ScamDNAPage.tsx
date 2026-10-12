import React, { useState } from 'react';
import {
  MessageSquareWarning,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Globe,
  Languages,
  Zap,
  Tag,
  ShieldCheck,
  Bot
} from 'lucide-react';
import api from '../api/client';
import { ScamAnalysisResult, riskColor } from '../types';

export default function ScamDNAPage() {
  const [messageText, setMessageText] = useState(
    'URGENT: Your ApexPay wallet is locked due to unusual access. Click here to verify your identity immediately: https://apexpay-login.xyz or account will be permanently closed within 24 hours.'
  );
  const [sender, setSender] = useState('+1-800-555-0199');
  const [associatedUrl, setAssociatedUrl] = useState('https://apexpay-login.xyz');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/scams/analyze', {
        message_text: messageText.trim(),
        sender_handle_or_number: sender.trim(),
        associated_url: associatedUrl.trim()
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Analysis request failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (type: string) => {
    if (type === 'tamil_lottery') {
      setMessageText('வாழ்த்துகள்! நீங்கள் ரூபாய் 50,000 பரிசு வென்றீர்கள். உடனே உங்கள் பரிசை பெற கீழே உள்ள லிங்க் கிளிக் செய்து OTP பகிருங்கள்.');
      setSender('+91-94440-12345');
      setAssociatedUrl('https://kampus-prizes.cfd');
    } else if (type === 'tamil_suspension') {
      setMessageText('உங்கள் வங்கி கணக்கு 24 மணி நேரத்தில் முடக்கப்படும். உடனே கீழே உள்ள லிங்க் கிளிக் செய்து உங்கள் கணக்கை சரிபார்க்கவும்.');
      setSender('+91-98840-54321');
      setAssociatedUrl('https://secure-bank-verify.top');
    } else if (type === 'phishing_urgent') {
      setMessageText('URGENT: Your ApexPay wallet is locked due to unusual access. Click here to verify your identity immediately: https://apexpay-login.xyz or account will be permanently closed within 24 hours.');
      setSender('+1-800-555-0199');
      setAssociatedUrl('https://apexpay-login.xyz');
    } else if (type === 'crypto_multiplier') {
      setMessageText('Guaranteed 300% return in 2 days! Double your money with our VIP trading signal. Send payments via UPI or Bitcoin now.');
      setSender('t.me/crypto_double_vip');
      setAssociatedUrl('https://crypto-doubler.vip');
    } else if (type === 'job_scam') {
      setMessageText('Part-time job opportunity: Earn $500 daily working from home! Like youtube videos and get instant cash transfer.');
      setSender('+1-202-555-0143');
      setAssociatedUrl('https://t.me/task_jobs_daily');
    } else if (type === 'benign') {
      setMessageText('Hi team, thank you for resolving my billing question earlier today. Really appreciate the fast assistance!');
      setSender('customer@example.com');
      setAssociatedUrl('');
    }
  };

  // Helper to render text with highlighted spans
  const renderHighlightedText = () => {
    if (!result || !result.highlighted_phrases || result.highlighted_phrases.length === 0) {
      return <p className="text-gray-300 whitespace-pre-wrap">{messageText}</p>;
    }

    // Sort phrases by start char
    const sorted = [...result.highlighted_phrases].sort((a, b) => a.start_char - b.start_char);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((phrase, idx) => {
      // Add text before highlight
      if (phrase.start_char > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{messageText.slice(lastIndex, phrase.start_char)}</span>
        );
      }
      // Add highlighted span
      elements.push(
        <mark
          key={`mark-${idx}`}
          className="bg-red-500/25 text-red-200 border-b-2 border-red-500 px-1 py-0.5 rounded font-medium inline-block mx-0.5"
          title={`${phrase.category} (${phrase.severity}) [${phrase.language}]`}
        >
          {messageText.slice(phrase.start_char, phrase.end_char)}
        </mark>
      );
      lastIndex = Math.max(lastIndex, phrase.end_char);
    });

    if (lastIndex < messageText.length) {
      elements.push(<span key="text-end">{messageText.slice(lastIndex)}</span>);
    }

    return <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{elements}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquareWarning className="w-6 h-6 text-yellow-400" />
          <span>Scam DNA Analyzer</span>
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Scan text copy across English and Tamil dialect phrase structures for psychological deception and phishing triggers
        </p>
      </div>

      {/* Preset Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-gray-400 font-semibold uppercase tracking-wider">Dialect & Pattern Presets:</span>
        <button
          type="button"
          onClick={() => loadPreset('tamil_lottery')}
          className="px-2.5 py-1 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 cursor-pointer transition-all font-medium"
        >
          Tamil Giveaway (பரிசு வென்றீர்கள்)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('tamil_suspension')}
          className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 cursor-pointer transition-all font-medium"
        >
          Tamil Bank Block (வங்கி கணக்கு)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('phishing_urgent')}
          className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 cursor-pointer transition-all font-medium"
        >
          Urgent Suspension Phishing
        </button>
        <button
          type="button"
          onClick={() => loadPreset('crypto_multiplier')}
          className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 cursor-pointer transition-all font-medium"
        >
          Crypto Doubler Scheme
        </button>
        <button
          type="button"
          onClick={() => loadPreset('job_scam')}
          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 cursor-pointer transition-all font-medium"
        >
          Fake Freelance Job
        </button>
        <button
          type="button"
          onClick={() => loadPreset('benign')}
          className="px-2.5 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/20 cursor-pointer transition-all font-medium"
        >
          Benign Customer Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 glass-card p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>Message Copy Ingestion</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Suspicious Message Text (English or Tamil) *</label>
              <textarea
                rows={6}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Paste SMS text, email hook, WhatsApp message, or direct message..."
                className="input-field leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Sender Handle / Phone Number</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. +91 94440 12345 or support_hotline"
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1.5">Embedded Link / Destination URL</label>
              <input
                type="url"
                value={associatedUrl}
                onChange={(e) => setAssociatedUrl(e.target.value)}
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
                  <span>Scan Message DNA</span>
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
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Classification Result</div>
                    <div className="text-2xl font-black text-white mt-1 flex items-center gap-3">
                      <span>{result.scam_category}</span>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${riskColor(result.risk_category)}20`,
                          color: riskColor(result.risk_category),
                          border: `1px solid ${riskColor(result.risk_category)}40`
                        }}
                      >
                        {result.risk_category} ({result.risk_score})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Language: <strong className="text-white">{result.detected_language}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Urgency Pressure: <strong className="text-white">{result.urgency_level}</strong></span>
                      </div>
                    </div>
                  </div>

                  {result.investigation_id && (
                    <div className="text-xs text-gray-500 font-mono">
                      Dossier #{result.investigation_id}
                    </div>
                  )}
                </div>
              </div>

              {/* Highlighted Text Analysis Box */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-cyan-400" />
                    <span>Linguistic Anomaly Highlighting</span>
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {result.highlighted_phrases.length} Deceptive Vectors Flagged
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#0b1120] border border-white/5 text-xs">
                  {renderHighlightedText()}
                </div>
              </div>

              {/* Detected Phrases Breakdown */}
              {result.highlighted_phrases && result.highlighted_phrases.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                    Flagged Phrasing Triggers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.highlighted_phrases.map((p, i) => (
                      <div key={i} className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs flex items-center gap-2">
                        <span className="font-semibold text-red-300">"{p.phrase}"</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 uppercase font-mono">{p.category}</span>
                        <span className="text-[10px] text-gray-500">[{p.language}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forensic Evidence Points */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span>Evidence Points</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {result.evidence_explanation.map((ev, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protective Recommendations */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Protective Guidance</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {result.protective_recommendations.map((rec, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 flex items-start gap-2.5">
                      <span className="font-bold font-mono text-[11px] text-green-400 mt-0.5">0{i+1}.</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LLM Explanation if available */}
              {result.llm_explanation && (
                <div className="glass-card p-5 border-l-4 border-l-cyan-400">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span>AI Reasoning Summary</span>
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    "{result.llm_explanation}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <MessageSquareWarning className="w-12 h-12 text-gray-700 mb-3" />
              <h3 className="text-sm font-bold text-white">No Message Analyzed Yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Paste message copy or choose a preset test vector above to analyze deception vectors, extracted URLs, and highlighted phrases.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
