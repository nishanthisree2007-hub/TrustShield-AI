import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  MessageSquareWarning,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import api from '../api/client';
import { DashboardStats, riskColor } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
      setError('');
    } catch (err: any) {
      setError('Unable to connect to TrustShield backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Aggregating digital risk telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-card p-6 text-center my-8">
        <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Connection Error</h3>
        <p className="text-gray-400 text-sm mt-1">{error || 'Data unavailable'}</p>
        <button onClick={fetchStats} className="btn-primary mt-4 inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Security Command Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">LIVE TELEMETRY</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Real-time threat detection across impersonation handles, scam copy, and rogue APKs</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="btn-ghost flex items-center gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
          <Link
            to="/radar"
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Scan Profile</span>
          </Link>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 border-l-4 border-l-cyan-400">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Dossiers</span>
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.total_investigations}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <span>{stats.brands_monitored} Brands Monitored</span>
          </div>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Impersonations</span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.impersonation_attempts}</div>
          <div className="text-xs text-orange-400/80 mt-1">Lookalike Handles</div>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400 font-mono">{stats.high_risk_findings}</div>
          <div className="text-xs text-red-400/80 mt-1">Requires Analyst Action</div>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Scam Messages</span>
            <MessageSquareWarning className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.scam_messages_count}</div>
          <div className="text-xs text-gray-500 mt-1">English & Tamil Vectors</div>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rogue APKs</span>
            <Smartphone className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.suspicious_apps_count}</div>
          <div className="text-xs text-gray-500 mt-1">Package Squatting</div>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-extrabold text-green-400 font-mono">{stats.resolved_investigations}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.false_positives_count} False Positives</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Risk Tier Distribution</span>
            </h3>
          </div>
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.risk_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-white font-mono">{stats.total_investigations}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Threats</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/5">
            {stats.risk_distribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 truncate">{item.name}</span>
                <span className="text-white font-bold ml-auto font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Activity Timeline */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Threat Discovery vs Resolution Velocity</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">Last 7 Days</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.threat_timeline}>
                <defs>
                  <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="resolveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="threats" name="Detected Threats" stroke="#EF4444" fillOpacity={1} fill="url(#threatGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Takedowns / Resolved" stroke="#22C55E" fillOpacity={1} fill="url(#resolveGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-end gap-6 text-xs text-gray-400 mt-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-red-500 rounded-full" />
              <span>New Ingested Threats</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-green-500 rounded-full" />
              <span>Resolved Dossiers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed & Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts List */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span>Prioritized Threat Stream</span>
            </h3>
            <Link to="/history" className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1">
              <span>View All Dossiers</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recent_alerts && stats.recent_alerts.length > 0 ? (
              stats.recent_alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: riskColor(alert.risk_category) }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors">
                          {alert.title}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{
                            backgroundColor: `${riskColor(alert.risk_category)}15`,
                            color: riskColor(alert.risk_category),
                            border: `1px solid ${riskColor(alert.risk_category)}30`
                          }}
                        >
                          {alert.risk_category} ({alert.risk_score})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="font-mono text-gray-400">{alert.entity_identifier}</span>
                        <span>•</span>
                        <span>Brand: {alert.brand_name}</span>
                        <span>•</span>
                        <span className="capitalize">{alert.status.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/history"
                    className="btn-ghost text-xs px-3 py-1.5 shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <span>Investigate</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">No recent alerts recorded.</div>
            )}
          </div>
        </div>

        {/* Threat Vectors & Quick Modules */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Threat Surface Modules</span>
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/radar"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Impersonation Radar</div>
                    <div className="text-[11px] text-gray-500">Social handle lexical/visual spoofing</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
              </Link>

              <Link
                to="/scam"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
                    <MessageSquareWarning className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Scam DNA Analyzer</div>
                    <div className="text-[11px] text-gray-500">English + Tamil scam phrase scanning</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-yellow-400" />
              </Link>

              <Link
                to="/apps"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Mobile App Trust Inspector</div>
                    <div className="text-[11px] text-gray-500">Package spoofing & risky permissions</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
              </Link>

              <Link
                to="/twin"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Brand Risk Digital Twin</div>
                    <div className="text-[11px] text-gray-500">Synthetic attack vector posture testing</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-green-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
