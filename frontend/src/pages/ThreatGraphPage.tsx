import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import {
  Network,
  RefreshCw,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  ShieldAlert,
  Building2,
  Users,
  Smartphone,
  MessageSquareWarning,
  Globe,
  X
} from 'lucide-react';
import api from '../api/client';
import { CytoscapeGraphData } from '../types';

export default function ThreatGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [graphData, setGraphData] = useState<CytoscapeGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [layoutType, setLayoutType] = useState<string>('cose');

  const fetchGraph = async () => {
    setLoading(true);
    setSelectedNode(null);
    setSelectedEdge(null);
    try {
      const res = await api.get('/graph');
      setGraphData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Filter elements if required
    const nodes = graphData.nodes.filter(n =>
      filterType === 'all' || n.data.type === filterType || n.data.type === 'brand'
    );
    const validNodeIds = new Set(nodes.map(n => n.data.id));
    const edges = graphData.edges.filter(e =>
      validNodeIds.has(e.data.source) && validNodeIds.has(e.data.target)
    );

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#cbd5e1',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'background-color': '#22D3EE',
            'border-width': 2,
            'border-color': '#0891b2',
            'width': 36,
            'height': 36
          }
        },
        {
          selector: 'node[type = "brand"]',
          style: {
            'background-color': '#22D3EE',
            'border-color': '#67e8f9',
            'border-width': 3,
            'width': 50,
            'height': 50,
            'font-weight': 'bold',
            'color': '#67e8f9'
          }
        },
        {
          selector: 'node[type = "profile"]',
          style: {
            'background-color': '#F97316',
            'border-color': '#ea580c',
            'width': 38,
            'height': 38
          }
        },
        {
          selector: 'node[type = "scam_message"]',
          style: {
            'background-color': '#EAB308',
            'border-color': '#ca8a04',
            'width': 36,
            'height': 36
          }
        },
        {
          selector: 'node[type = "mobile_app"]',
          style: {
            'background-color': '#A855F7',
            'border-color': '#9333ea',
            'width': 38,
            'height': 38
          }
        },
        {
          selector: 'node[type = "url"]',
          style: {
            'background-color': '#EF4444',
            'border-color': '#dc2626',
            'width': 32,
            'height': 32
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(relationship)',
            'font-size': '9px',
            'color': '#94a3b8',
            'text-rotation': 'autorotate',
            'text-margin-y': -8
          }
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#ffffff',
            'border-width': 4,
            'line-color': '#22D3EE',
            'target-arrow-color': '#22D3EE'
          }
        }
      ],
      layout: {
        name: layoutType,
        animate: true,
        animationDuration: 500,
        padding: 50
      } as any
    });

    cy.on('tap', 'node', (evt) => {
      setSelectedEdge(null);
      setSelectedNode(evt.target.data());
    });

    cy.on('tap', 'edge', (evt) => {
      setSelectedNode(null);
      setSelectedEdge(evt.target.data());
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData, filterType, layoutType]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <span>Threat Relationship Graph</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Interactive topology mapping connections between brands, lookalike handles, scam copy, and infrastructure URLs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchGraph} className="btn-ghost flex items-center gap-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Graph</span>
          </button>
        </div>
      </div>

      {/* Stats Bar & Controls */}
      <div className="glass-card p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Entity Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-500 font-semibold uppercase mr-1">Filter:</span>
          {['all', 'profile', 'scam_message', 'mobile_app', 'url'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-cyan-500 text-gray-900 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Layout Switcher & Zoom */}
        <div className="flex items-center gap-2">
          <select
            value={layoutType}
            onChange={(e) => setLayoutType(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-lg px-2.5 py-1 text-gray-200 text-xs"
          >
            <option value="cose">Force-Directed (Cose)</option>
            <option value="circle">Circle Layout</option>
            <option value="grid">Grid Layout</option>
            <option value="concentric">Concentric Layout</option>
          </select>

          <button onClick={handleZoomIn} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleFit} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Canvas Container */}
      <div className="relative glass-card border border-white/10 rounded-2xl overflow-hidden h-[600px]">
        {loading && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-300 text-xs">Computing topological layout...</p>
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full bg-[#080D18]" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 glass-card p-3 text-[11px] space-y-1.5 pointer-events-none">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-gray-300">Registered Brand</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-gray-300">Suspicious Profile</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-gray-300">Scam Message</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-gray-300">Rogue Mobile App</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-gray-300">Dest. URL / Phish Link</span>
          </div>
        </div>

        {/* Selected Entity Inspector Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-10 w-80 glass-card p-4 border border-white/10 shadow-2xl text-xs space-y-3 max-h-[90%] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-white/5 text-cyan-400 border border-white/10">
                  {selectedNode.type}
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">{selectedNode.label}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Risk Assessment:</span>
                <span className="font-bold text-white font-mono">{selectedNode.risk_level} ({selectedNode.risk_score})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Node Identifier:</span>
                <span className="font-mono text-gray-300 truncate max-w-[150px]">{selectedNode.id}</span>
              </div>
            </div>

            {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <span className="text-gray-400 font-semibold block text-[11px]">Telemetry Metadata:</span>
                <pre className="p-2 rounded-lg bg-[#0b1120] text-[10px] text-gray-300 overflow-x-auto font-mono">
                  {JSON.stringify(selectedNode.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Selected Relationship Inspector */}
        {selectedEdge && (
          <div className="absolute top-4 right-4 z-10 w-80 glass-card p-4 border border-white/10 shadow-2xl text-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-white/5 text-cyan-400 border border-white/10">
                  Relationship Edge
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">{selectedEdge.relationship}</h3>
              </div>
              <button onClick={() => setSelectedEdge(null)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <div>
                <span className="text-gray-500 block text-[11px]">Evidence Rationale:</span>
                <p className="text-gray-300 mt-1 leading-relaxed bg-[#0b1120] p-2.5 rounded-lg border border-white/5">
                  {selectedEdge.rationale}
                </p>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Threat Weight:</span>
                <span className="font-mono text-white font-bold">{selectedEdge.weight}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
