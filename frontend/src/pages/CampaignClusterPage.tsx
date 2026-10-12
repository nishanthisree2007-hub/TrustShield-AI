import React, { useState, useEffect } from 'react';
import {
  Layers,
  RefreshCw,
  AlertTriangle,
  Info,
  ExternalLink,
  Tag,
  Globe,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Link as LinkIcon
} from 'lucide-react';
import api from '../api/client';
import { ClusteringResult, CampaignCluster, riskColor } from '../types';

export default function CampaignClusterPage() {
  const [data, setData] = useState<ClusteringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clustering');
      setData(res.data);
      if (res.data.clusters.length > 0) {
        setExpandedCluster(res.data.clusters[0].cluster_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const toggleExpand = (cid: string) => {
    setExpandedCluster(prev => (prev === cid ? null : cid));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Scam Campaign Clustering</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Identify shared linguistic fingerprints, recurring fraud hooks, and overlapping hosting infrastructure across disparate reports
          </p>
        </div>
        <button onClick={fetchClusters} className="btn-ghost flex items-center gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-cluster Telemetry</span>
        </button>
      </div>

      {/* Top Aggregates */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Messages Analyzed</div>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">{data.total_messages_analyzed}</div>
            <div className="text-[11px] text-gray-400 mt-1">Multi-vector corpus</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Identified Clusters</div>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{data.total_clusters_formed}</div>
            <div className="text-[11px] text-cyan-400/80 mt-1">Shared phrase & URL density</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Isolated Singletons</div>
            <div className="text-2xl font-extrabold text-gray-400 font-mono mt-1">{data.singleton_count}</div>
            <div className="text-[11px] text-gray-500 mt-1">Unique single-occurrence messages</div>
          </div>
        </div>
      )}

      {/* Mandatory Scientific Disclaimer */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong>Cluster Labeling Guardrail:</strong> Clusters indicate statistical linguistic and infrastructure resemblance. They are formally documented as <em>potential relationships</em> rather than confirmed coordinated attacks until corroborated by forensic IP/WHOIS attribution.
        </span>
      </div>

      {/* Clusters List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data || data.clusters.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Fingerprint className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Threat Clusters Formed</h3>
          <p className="text-xs text-gray-500 mt-1">Ingest additional messages via the Scam DNA Analyzer to build text shingle associations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.clusters.map((cluster) => {
            const isExpanded = expandedCluster === cluster.cluster_id;
            return (
              <div
                key={cluster.cluster_id}
                className="glass-card overflow-hidden border border-white/5 transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(cluster.cluster_id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{cluster.cluster_name}</h3>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                          style={{
                            backgroundColor: `${riskColor(cluster.risk_level)}15`,
                            color: riskColor(cluster.risk_level),
                            border: `1px solid ${riskColor(cluster.risk_level)}30`
                          }}
                        >
                          {cluster.risk_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>Cluster Size: <strong className="text-white font-mono">{cluster.size} Messages</strong></span>
                        <span>•</span>
                        <span>Centroid Similarity: <strong className="text-cyan-400 font-mono">{Math.round(cluster.average_similarity_score * 100)}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className="text-xs text-gray-500">
                      {isExpanded ? 'Hide Items' : 'Inspect Cluster'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-white/5 space-y-4 text-xs">
                    {/* Shared Indicators Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {/* Shared Phrases */}
                      <div className="p-3.5 rounded-xl bg-[#0b1120] border border-white/5">
                        <div className="flex items-center gap-1.5 text-gray-400 font-semibold mb-2 text-[11px] uppercase tracking-wider">
                          <Tag className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Dominant Shared Phrases</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cluster.shared_phrases.map((phrase, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 text-[11px]">
                              "{phrase}"
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Shared URLs */}
                      <div className="p-3.5 rounded-xl bg-[#0b1120] border border-white/5">
                        <div className="flex items-center gap-1.5 text-gray-400 font-semibold mb-2 text-[11px] uppercase tracking-wider">
                          <LinkIcon className="w-3.5 h-3.5 text-red-400" />
                          <span>Overlapping Threat Infrastructure (URLs)</span>
                        </div>
                        <div className="space-y-1">
                          {cluster.shared_urls.map((url, i) => (
                            <div key={i} className="font-mono text-red-400 truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                              <span>{url}</span>
                            </div>
                          ))}
                          {cluster.shared_urls.length === 0 && (
                            <span className="text-gray-500 italic">No external URLs recorded in messages</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Clustered Messages Stream */}
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
                        Clustered Telemetry Items ({cluster.items.length})
                      </h4>
                      <div className="space-y-2">
                        {cluster.items.map((item) => (
                          <div
                            key={item.message_id}
                            className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-cyan-400 font-mono font-bold">Sender: {item.sender || 'Unknown'}</span>
                              <span className="text-gray-500 font-mono">Similarity: {Math.round(item.similarity_to_centroid * 100)}%</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-xs">
                              "{item.message_text}"
                            </p>
                            {item.detected_urls && item.detected_urls.length > 0 && (
                              <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                <span>URL:</span>
                                <span className="text-red-400">{item.detected_urls.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
