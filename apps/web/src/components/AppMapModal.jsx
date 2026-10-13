import React from 'react';
import { X, Network, Database, Shield, Globe, Cpu, ArrowRight, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AppMapModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const tiers = [
    {
      title: '01. Client Experience Layer',
      icon: Globe,
      color: 'sky',
      nodes: [
        { name: '/checkout', desc: 'Cart state & token dispatch', status: 'verified', provenance: 'Confirmed by test' },
        { name: '/login', desc: 'Magic link authentication', status: 'verified', provenance: 'Confirmed by test' },
        { name: '/orders', desc: 'Customer dashboard view', status: 'verified', provenance: 'Confirmed by test' }
      ]
    },
    {
      title: '02. Edge Gateway & Webhooks',
      icon: Cpu,
      color: 'purple',
      nodes: [
        { name: '/api/webhooks/stripe', desc: 'Stripe signature & event ingestion', status: 'needs_attention', provenance: 'High Risk Change' },
        { name: '/api/orders', desc: 'Order CRUD endpoint', status: 'verified', provenance: 'Detected from source' }
      ]
    },
    {
      title: '03. Application Logic & Rules',
      icon: Zap,
      color: 'emerald',
      nodes: [
        { name: 'order.service.ts', desc: 'Tax calculations & inventory assertions', status: 'verified', provenance: 'Confirmed by test' },
        { name: 'auth/session.ts', desc: 'Cryptographic session validation', status: 'verified', provenance: 'Confirmed by test' }
      ]
    },
    {
      title: '04. Immutable State & DB',
      icon: Database,
      color: 'amber',
      nodes: [
        { name: 'orders (Supabase)', desc: 'Foreign key to users, payment transaction IDs', status: 'verified', provenance: 'Detected from schema' },
        { name: 'users (Supabase Auth)', desc: 'Row Level Security (RLS) active', status: 'verified', provenance: 'Detected from schema' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-5xl organic-glass rounded-[36px] p-7 shadow-2xl max-h-[92vh] overflow-y-auto border border-white/[0.08] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 bio-glow-cyan">
              <Network className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Living Application Topology</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Continuous Evidence Map
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Discovered relationships and real test evidence for <span className="text-sky-300 font-mono font-bold">my-saas-app</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Topology Pipeline */}
        <div className="space-y-6 mb-6">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <div key={idx} className="relative">
                <div className="p-5 rounded-3xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-white/[0.05] flex items-center justify-center text-sky-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                        {tier.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {tier.nodes.length} components
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tier.nodes.map((node, nIdx) => (
                      <div
                        key={nIdx}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          node.status === 'needs_attention'
                            ? 'bg-rose-500/10 border-rose-500/40 bio-glow-rose'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-sky-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-white">
                            {node.name}
                          </span>
                          {node.status === 'needs_attention' ? (
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2.5">
                          {node.desc}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                            {node.provenance}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            node.status === 'needs_attention'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            {node.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated Synaptic Flow Connector to next tier */}
                {idx < tiers.length - 1 && (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-px h-6 bg-gradient-to-b from-sky-400/60 to-purple-400/60"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Banner */}
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span><strong className="text-sky-300">Ground Truth Rule:</strong> Every node and relationship is backed by reproducible runtime test runs. No AI hallucination.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:brightness-110 text-white text-xs font-bold transition shadow-md shadow-sky-500/20"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
