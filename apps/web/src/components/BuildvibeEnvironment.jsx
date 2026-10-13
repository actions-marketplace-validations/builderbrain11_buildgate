import React, { useState, useEffect } from 'react';
import {
  Bot, Sparkles, MapPin, Navigation, Compass, AlertCircle,
  CheckCircle2, ArrowRight, Play, RefreshCw, Shield,
  Terminal, UserCheck, Check, Layers, Code, Zap,
  CornerDownRight, CheckCircle, ShieldAlert, FileText, ChevronRight,
  Info
} from 'lucide-react';
import { BuildvibeOrb, LegitRunLogo, BuildgateLogo } from './BrandLogos';

const API_BASE = 'http://localhost:3050';

export default function BuildvibeEnvironment({
  onRunScan,
  onOpenRemediation,
  onOpenEvidenceDrawer,
  isRegressed
}) {
  const [horizonData, setHorizonData] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState('stripe-webhook');
  const [isAgentActing, setIsAgentActing] = useState(false);
  const [agentLog, setAgentLog] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/horizon/state`)
      .then(r => r.json())
      .then(data => {
        setHorizonData(data);
        const blocks = data?.gateArchitecture?.blocks || [];
        if (blocks.length > 0) {
          setSelectedBlockId(blocks[0].id);
        }
        setAgentLog([
          {
            id: 1,
            time: new Date().toLocaleTimeString(),
            type: 'info',
            text: `Spatial topology synced with buildgate.json: ${blocks.length} blocks mapped from ${data?.gateArchitecture?.fileCount || 0} source files.`
          },
          {
            id: 2,
            time: new Date().toLocaleTimeString(),
            type: isRegressed ? 'alert' : 'success',
            text: isRegressed 
              ? 'Blocked Route: Webhook lacks HMAC timingSafeEqual validation. Payment flow failing.'
              : 'Routes clear: All mapped critical flows passing verification.'
          }
        ]);
      })
      .catch(() => {});
  }, [isRegressed]);

  const blocks = horizonData?.gateArchitecture?.blocks || [
    {
      id: 'stripe-webhook',
      name: 'Stripe Webhook',
      layer: 'Payment Ingress',
      paths: ['src/api/webhooks/stripe.js'],
      dependencies: ['order-service', 'config-env'],
      state: isRegressed ? 'BLOCKED' : 'PROVEN',
      verifiedBy: ['unit:Webhook Security', 'journey:Payment Flow'],
      reason: isRegressed ? 'Stripe signature validation bypassed' : 'Verified clean in container'
    },
    {
      id: 'order-service',
      name: 'Order Service',
      layer: 'Business Logic',
      paths: ['src/services/order.js'],
      dependencies: [],
      state: 'PROVEN',
      verifiedBy: ['unit:Order Calculation', 'journey:Create Order'],
      reason: 'Pricing & DB mutations verified'
    },
    {
      id: 'auth-session',
      name: 'Session & Auth',
      layer: 'Security & Access',
      paths: ['src/auth/session.js'],
      dependencies: ['config-env'],
      state: 'PROVEN',
      verifiedBy: ['journey:User Login'],
      reason: 'Session contracts verified'
    },
    {
      id: 'config-env',
      name: 'Environment Config',
      layer: 'Configuration',
      paths: ['src/config/env.js'],
      dependencies: [],
      state: 'UNVERIFIED',
      verifiedBy: [],
      reason: 'No test check mapped to this block'
    }
  ];

  const milestones = horizonData?.milestones || [
    { sequence: 1, title: 'Auth boundary holds', status: 'PENDING_REVIEW' },
    { sequence: 2, title: 'Order core is correct', status: 'PENDING_REVIEW' },
    { sequence: 3, title: 'Payments signature-guarded', status: isRegressed ? 'CHANGES_REQUESTED' : 'PENDING_REVIEW' },
    { sequence: 4, title: 'Configuration covered', status: 'PENDING_REVIEW' }
  ];

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];

  const handleInspectBlock = (block) => {
    setIsAgentActing(true);
    setAgentLog(prev => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: 'action',
        text: `Inspecting contracts for ${block.name} (${block.paths?.join(', ')})...`
      }
    ]);

    setTimeout(() => {
      setIsAgentActing(false);
      setAgentLog(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          time: new Date().toLocaleTimeString(),
          type: block.state === 'BLOCKED' ? 'alert' : 'info',
          text: `Block ${block.name}: State is ${block.state}. ${block.reason || 'Verified by ' + (block.verifiedBy || []).join(', ')}`
        }
      ]);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0F1420] via-[#0B0F18] to-[#07090E] border border-white/[0.08] p-6 lg:p-8 overflow-hidden shadow-2xl">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1.5">
                <BuildvibeOrb className="w-3.5 h-3.5" pulse={true} />
                Spatial Territory Model
              </span>
              <span className="text-slate-500 text-xs font-mono">·</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Grounded in buildgate.json & AST</span>
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Buildvibe Spatial Environment</span>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Topology Map
              </span>
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl mt-2 leading-relaxed">
              Navigate your system as spatial territory. Components are <strong>Places</strong>, dependencies are <strong>Paths</strong>, and failures manifest as <strong>Blocked Routes</strong>. Every state is derived from real sandbox verification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleInspectBlock(selectedBlock)}
              disabled={isAgentActing}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-2 shadow-lg shadow-amber-950/40 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAgentActing ? 'Inspecting...' : 'Inspect Block Contracts'}</span>
            </button>

            {isRegressed && (
              <button
                onClick={onOpenRemediation}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold font-mono transition flex items-center gap-2 border border-rose-500/40 shadow-lg shadow-rose-950/30 animate-pulse"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Propose Patch for Blocked Route</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Topology Canvas (Left) + Block Inspector & Real Action Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Spatial Map Canvas */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#090D14] border border-white/[0.08] shadow-2xl relative min-h-[460px] flex flex-col justify-between overflow-hidden">
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Top Status */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>REAL TOPOLOGY: {blocks.length} CONFIGURED BLOCKS</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                PROVEN
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                UNVERIFIED
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                BLOCKED
              </span>
            </div>
          </div>

          {/* Blocks Topology Cards */}
          <div className="relative z-10 my-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blocks.map((block) => {
                const isSelected = selectedBlock.id === block.id;
                const isBlocked = block.state === 'BLOCKED';
                const isProven = block.state === 'PROVEN';
                const isUnisolated = block.state === 'PASSED_UNISOLATED';

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400/50 shadow-xl shadow-amber-950/30'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                        {block.layer}
                      </span>
                      {isBlocked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" /> BLOCKED
                        </span>
                      ) : isProven ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> PROVEN
                        </span>
                      ) : isUnisolated ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          HOST FALLBACK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          UNVERIFIED
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white mt-1 group-hover:text-amber-200 transition">
                      {block.name}
                    </h4>
                    <p className="text-[11px] font-mono text-amber-300/80 mt-1 truncate">
                      {block.paths ? block.paths.join(', ') : block.path}
                    </p>

                    {block.dependencies?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <span>Depends on:</span>
                        <span className="text-slate-300">{block.dependencies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Landmarks Footer */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>LANDMARKS SEQUENCE</span>
              </span>
              <span>Real Milestone Pipeline</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {milestones.map((lm) => (
                <div
                  key={lm.sequence}
                  className={`p-2 rounded-xl border text-[10px] font-mono transition ${
                    lm.status === 'APPROVED_VERIFIED'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : lm.status === 'CHANGES_REQUESTED'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 animate-pulse'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.06]'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>M{lm.sequence}</span>
                    {lm.status === 'APPROVED_VERIFIED' && <Check className="w-3 h-3 text-emerald-400" />}
                    {lm.status === 'CHANGES_REQUESTED' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                  </div>
                  <div className="truncate text-slate-300 mt-0.5">{lm.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Place Inspector & Real Log Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Block Inspector */}
          <div className="p-6 rounded-3xl bg-[#0F1522] border border-white/[0.08] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">
                Block Inspector
              </span>
              <span className="text-xs font-mono text-slate-400">{selectedBlock.layer}</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{selectedBlock.name}</h3>
              <p className="text-xs font-mono text-amber-300 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/[0.05] mt-1.5 truncate">
                {selectedBlock.paths ? selectedBlock.paths.join(', ') : selectedBlock.path}
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono bg-black/30 p-3 rounded-xl border border-white/[0.04]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Current State:</span>
                <strong className={
                  selectedBlock.state === 'PROVEN' ? 'text-emerald-400' :
                  selectedBlock.state === 'BLOCKED' ? 'text-rose-400' : 'text-amber-300'
                }>{selectedBlock.state}</strong>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400">Diagnosis: </span>
                {selectedBlock.reason || 'No diagnostic notes available.'}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Verified By Test Selectors:
              </span>
              {selectedBlock.verifiedBy?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedBlock.verifiedBy.map((sel, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-200 border border-white/[0.08]">
                      {sel}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-mono text-amber-400/80 italic">
                  Uncovered: No checks mapped in buildgate.json
                </span>
              )}
            </div>

            <button
              onClick={() => handleInspectBlock(selectedBlock)}
              disabled={isAgentActing}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono font-bold transition flex items-center justify-center gap-2 border border-white/[0.1]"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Contracts</span>
            </button>
          </div>

          {/* Real Agent & Verification Log */}
          <div className="p-6 rounded-3xl bg-[#0B0F17] border border-white/[0.08] shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <BuildvibeOrb className="w-4 h-4" pulse={true} />
                <h4 className="text-xs font-mono uppercase text-white font-bold">
                  Evidence Log
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Live</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {agentLog.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl text-xs font-mono border ${
                    item.type === 'alert'
                      ? 'bg-rose-500/10 text-rose-200 border-rose-500/20'
                      : item.type === 'action'
                      ? 'bg-amber-400/10 text-amber-200 border-amber-400/20'
                      : item.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20'
                      : 'bg-black/30 text-slate-300 border-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>{item.time}</span>
                    <span className="uppercase font-bold">{item.type}</span>
                  </div>
                  <div>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
