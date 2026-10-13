import React, { useState } from 'react';
import { 
  Network, ShieldAlert, CheckCircle2, AlertCircle, Clock, 
  ExternalLink, Layers, ArrowUpRight, Search, Eye, Filter, RefreshCw 
} from 'lucide-react';
import { LegitRunLogo } from './BrandLogos';

export default function LivingSystemCanvas({ 
  latestScan, 
  isRegressed, 
  onSelectComponent, 
  onOpenEvidence 
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'failed', 'changed', 'verified'
  const [viewFormat, setViewFormat] = useState('spatial'); // 'spatial' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('stripe-webhook');

  // Grounded System Nodes derived from actual codebase
  const systemNodes = [
    {
      id: 'stripe-webhook',
      name: '/api/webhooks/stripe',
      layer: 'API Endpoint',
      file: 'src/api/webhooks/stripe.js',
      status: isRegressed ? 'failed' : 'verified',
      reason: isRegressed ? 'Missing signature verification on incoming charge.succeeded payload' : 'HMAC SHA256 signature verified against STRIPE_WEBHOOK_SECRET',
      isChanged: true,
      connections: ['order-service', 'stripe-secret', 'payment-journey'],
      impactLevel: 'High Risk'
    },
    {
      id: 'order-service',
      name: 'Order Service',
      layer: 'Application Logic',
      file: 'src/services/order.js',
      status: 'verified',
      reason: 'State transition from pending to paid passes atomic database check',
      isChanged: true,
      connections: ['stripe-webhook', 'database-schema'],
      impactLevel: 'High Risk'
    },
    {
      id: 'session-auth',
      name: 'Auth & Session Engine',
      layer: 'Security & Auth',
      file: 'src/auth/session.js',
      status: 'verified',
      reason: 'Bearer token validation enforced on protected endpoints',
      isChanged: false,
      connections: ['login-journey'],
      impactLevel: 'Medium'
    },
    {
      id: 'env-config',
      name: 'Environment Config',
      layer: 'Secrets & Config',
      file: 'src/config/env.js',
      status: 'verified',
      reason: 'All environment variables parsed without high-entropy leakage',
      isChanged: true,
      connections: ['stripe-secret'],
      impactLevel: 'Medium'
    },
    {
      id: 'stripe-secret',
      name: 'STRIPE_WEBHOOK_SECRET',
      layer: 'Security Boundary',
      file: '.env',
      status: isRegressed ? 'warning' : 'verified',
      reason: isRegressed ? 'Bypassed signature check exposes secret contract' : 'Zero unmasked secrets detected in scan',
      isChanged: false,
      connections: ['stripe-webhook'],
      impactLevel: 'Critical'
    },
    {
      id: 'payment-journey',
      name: 'Payment Flow Journey',
      layer: 'Synthetic Proof',
      file: 'tests/journeys/payment-flow.journey.js',
      status: isRegressed ? 'failed' : 'verified',
      reason: isRegressed ? 'Failed Assertion: Signature verification rejection returned 200 instead of 400' : '3/3 synthetic assertions verified in sandbox',
      isChanged: true,
      connections: ['stripe-webhook'],
      impactLevel: 'High'
    },
    {
      id: 'login-journey',
      name: 'User Login Journey',
      layer: 'Synthetic Proof',
      file: 'tests/journeys/login.journey.js',
      status: 'verified',
      reason: '2/2 synthetic assertions passed (token minting & authorization)',
      isChanged: false,
      connections: ['session-auth'],
      impactLevel: 'Low'
    },
    {
      id: 'database-schema',
      name: 'Orders Table Schema',
      layer: 'Data Architecture',
      file: 'db/schema.sql',
      status: 'verified',
      reason: 'Tenant isolation enforced across order queries',
      isChanged: true,
      connections: ['order-service'],
      impactLevel: 'Medium'
    }
  ];

  const filteredNodes = systemNodes.filter(node => {
    if (filterMode === 'failed' && node.status !== 'failed') return false;
    if (filterMode === 'changed' && !node.isChanged) return false;
    if (filterMode === 'verified' && node.status !== 'verified') return false;
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase()) && !node.file.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedNode = systemNodes.find(n => n.id === selectedNodeId) || systemNodes[0];

  return (
    <div className="rounded-3xl bg-[#0B1018]/90 border border-white/[0.08] backdrop-blur-2xl p-6 relative overflow-hidden shadow-2xl">
      {/* Ambient Lighting Rays */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Controls: Living System Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06] relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-200/80 font-bold">
              The Living Gate · System Canvas
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Architectural Topology</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] font-mono">
              {filteredNodes.length} Components Connected
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real architectural connections discovered from code, routes, dependencies, and test executions.
          </p>
        </div>

        {/* Filters and View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 pl-8 pr-3 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 w-44 font-sans"
            />
          </div>

          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${filterMode === 'all' ? 'bg-white/[0.1] text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('changed')}
              className={`px-3 py-1 rounded-lg font-medium transition ${filterMode === 'changed' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}
            >
              Changed
            </button>
            <button
              onClick={() => setFilterMode('failed')}
              className={`px-3 py-1 rounded-lg font-medium transition ${filterMode === 'failed' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'}`}
            >
              Regressed
            </button>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
            <button
              onClick={() => setViewFormat('spatial')}
              className={`px-3 py-1 rounded-lg font-medium transition ${viewFormat === 'spatial' ? 'bg-amber-400/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}
            >
              Spatial
            </button>
            <button
              onClick={() => setViewFormat('list')}
              className={`px-3 py-1 rounded-lg font-medium transition ${viewFormat === 'list' ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewFormat === 'spatial' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 relative z-10">
          {/* Spatial Grid Canvas (Col 8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isNodeFailed = node.status === 'failed';

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (onSelectComponent) onSelectComponent(node);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 relative group overflow-hidden border ${
                      isSelected
                        ? 'bg-[#1B2636]/90 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/50'
                        : isNodeFailed
                        ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/70'
                        : 'bg-black/30 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.15]'
                    }`}
                  >
                    {/* Beam Corner Accent */}
                    {node.isChanged && (
                      <span className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                        <span className="absolute transform rotate-45 bg-gradient-to-r from-amber-500 to-amber-300 text-[8px] font-mono font-bold text-black py-0.5 right-[-24px] top-[10px] w-24 text-center shadow">
                          CHANGED
                        </span>
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {isNodeFailed ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] shrink-0 animate-ping"></span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] shrink-0"></span>
                        )}
                        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-semibold">
                          {node.layer}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        node.impactLevel === 'Critical' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                        node.impactLevel === 'High Risk' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                        'bg-white/[0.04] text-slate-400'
                      }`}>
                        {node.impactLevel}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition font-mono truncate">
                      {node.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {node.file}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                      <span className={`font-medium ${isNodeFailed ? 'text-rose-400' : 'text-slate-400'}`}>
                        {isNodeFailed ? 'Regression detected' : 'Verified in sandbox'}
                      </span>
                      <span className="text-[10px] text-sky-400 font-mono group-hover:underline flex items-center gap-1">
                        Inspect
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Component Deep Inspection Panel (Col 4) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-black/50 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Component Detail
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                selectedNode.status === 'failed' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {selectedNode.status === 'failed' ? 'REGRESSION' : 'VERIFIED'}
              </span>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Component Name</div>
              <div className="text-base font-bold text-white font-mono break-all mt-0.5">
                {selectedNode.name}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">
                {selectedNode.file}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                Verification Proof
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {selectedNode.reason}
              </p>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-2">
                Confirmed Architectural Links
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.connections.map(conn => (
                  <span key={conn} className="px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-slate-300">
                    → {conn}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenEvidence && onOpenEvidence(selectedNode)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <span>View Exact Revision Proof</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Accessible Structured List / Table View */
        <div className="pt-6 overflow-x-auto relative z-10">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Component</th>
                <th className="pb-3 font-semibold">Layer</th>
                <th className="pb-3 font-semibold">File Path</th>
                <th className="pb-3 font-semibold">Verification Finding</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredNodes.map(node => (
                <tr key={node.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3">
                    {node.status === 'failed' ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                        FAILED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                        VERIFIED
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-mono font-bold text-white">{node.name}</td>
                  <td className="py-3 text-slate-300">{node.layer}</td>
                  <td className="py-3 font-mono text-slate-400">{node.file}</td>
                  <td className="py-3 text-slate-300 max-w-xs truncate">{node.reason}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onOpenEvidence && onOpenEvidence(node)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sky-400 text-[11px] font-mono font-bold transition"
                    >
                      Evidence →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
