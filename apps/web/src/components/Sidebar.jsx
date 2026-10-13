import React from 'react';
import { 
  Network, GitPullRequest, Layers, 
  Bot, CheckCircle2, ShieldAlert, Rocket, 
  History, Settings, Zap, ArrowUpRight, Laptop, FileCheck,
  Compass, Sparkles
} from 'lucide-react';
import { BuildgateLogo, LegitRunLogo, BuildvibeOrb } from './BrandLogos';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  openAppMap, 
  openDeployReadiness, 
  openLocalReview, 
  openEvidenceDrawer,
  onGoLanding,
  latestScan
}) {
  const navItems = [
    { id: 'systems', label: '01 Systems', icon: Network, badge: 'Live' },
    { id: 'horizon', label: '02 Horizon', icon: Compass, badge: 'Phase 4' },
    { id: 'buildvibe', label: '03 Buildvibe', icon: Sparkles, badge: 'Spatial' },
    { id: 'evidence', label: '04 Evidence', icon: FileCheck, action: openEvidenceDrawer },
    { id: 'local-guard', label: 'Local Vibe Guard', icon: Laptop, action: openLocalReview },
    { id: 'deploy-readiness', label: 'Launch Readiness', icon: Rocket, action: openDeployReadiness },
  ];

  return (
    <aside className="w-64 bg-[#080B0F]/95 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header: The Gate for Systems */}
        <div 
          onClick={onGoLanding}
          className="flex items-center gap-3 px-3 py-3 mb-6 cursor-pointer hover:bg-white/[0.04] rounded-2xl transition group"
          title="Click to view Public Landing Page"
        >
          <div className="relative group-hover:scale-105 transition">
            <BuildgateLogo className="w-9 h-9 drop-shadow-[0_0_16px_rgba(245,158,11,0.3)]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans lowercase group-hover:text-amber-200 transition">
                buildgate
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-amber-200/70 font-semibold flex items-center gap-1">
              <span>The Gate for Systems</span>
              <span className="text-[8px] text-amber-400 opacity-0 group-hover:opacity-100 transition">↗</span>
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setCurrentTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-300 font-bold border border-amber-400/30 shadow-lg shadow-amber-950/40 relative'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'text-slate-400'}`} />
                  <span className="font-mono tracking-tight">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-r-full shadow-[0_0_8px_#f59e0b]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        {/* Brand Ecosystem Trinity */}
        <div className="mb-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            <span>Ecosystem</span>
            <span className="text-amber-400">Connected</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-black/40 border border-white/[0.05]">
              <LegitRunLogo className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-slate-300 font-bold truncate">legit.run</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-black/40 border border-white/[0.05]">
              <BuildvibeOrb className="w-3.5 h-3.5 shrink-0" pulse={false} />
              <span className="font-mono text-slate-300 font-bold truncate">buildvibe</span>
            </div>
          </div>
        </div>

        {/* Worker Sandbox Operational Boundary Card */}
        <div className="p-4 rounded-3xl bg-black/40 border border-white/[0.06] relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">Isolation Status</span>
            </div>
            {latestScan?.executionMode === 'container' || latestScan?.revision?.isolated ? (
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Container
              </span>
            ) : latestScan?.executionMode === 'host-fallback' || latestScan?.revision?.workerMode === 'host-development-fallback' ? (
              <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Host Fallback
              </span>
            ) : (
              <span className="text-slate-400 font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                Not Executed
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight mb-3">
            {latestScan?.executionMode === 'container' || latestScan?.revision?.isolated
              ? 'Zero-egress container sandbox. Merge-eligible evidence.'
              : latestScan?.executionMode === 'host-fallback' || latestScan?.revision?.workerMode === 'host-development-fallback'
              ? 'Dev host-fallback mode. Docker required for merge-grade verification.'
              : 'Run verification to evaluate isolated container bounds.'}
          </p>
          
          <button 
            onClick={openDeployReadiness}
            className="w-full py-2 px-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/[0.08] hover:border-amber-400/40 shadow-sm"
          >
            <span>Launch Readiness</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
