import React from 'react';
import { 
  ChevronDown, Search, Bell, RefreshCw, Radio, 
  Sparkles, CheckCircle2, ShieldCheck, Zap, Code2, Laptop
} from 'lucide-react';
import { BuildgateLogo, LegitRunLogo, BuildvibeOrb } from './BrandLogos';

export default function Header({ 
  isScanning, 
  activeStageIndex, 
  onRunScan, 
  isRegressed, 
  onToggleRegression,
  currentRepo,
  onOpenRepoSelector,
  onOpenCodePlayground,
  onOpenLocalReview
}) {
  const stages = [
    { name: 'Checkout', icon: '01' },
    { name: 'Build', icon: '02' },
    { name: 'Test', icon: '03' },
    { name: 'Security', icon: '04' },
    { name: 'Analyze', icon: '05' },
    { name: 'Report', icon: '06' }
  ];

  const repoName = currentRepo?.name || 'my-saas-app';

  return (
    <header className="px-8 py-4 border-b border-white/[0.06] bg-[#080B0F]/90 backdrop-blur-2xl sticky top-0 z-40 flex items-center justify-between gap-6 transition-all">
      {/* Left: Project Selector with Organic Refraction */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenRepoSelector}
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-sky-500/40 cursor-pointer transition-all duration-300 shadow-lg shadow-black/20"
        >
          <BuildgateLogo className="w-5 h-5 drop-shadow-[0_0_8px_rgba(99,134,241,0.5)]" />
          <span className="font-bold text-sm text-white tracking-tight">{repoName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-0.5" />
        </button>

        {/* Living Synaptic Connection Pulse */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] font-mono tracking-wide">Connected</span>
        </div>
      </div>

      {/* Center: Dynamic Organic Tech Mascot & Synaptic Pipeline */}
      <div className="hidden lg:flex items-center gap-5 px-6 py-2.5 rounded-3xl organic-glass relative overflow-hidden group">
        {/* Subtle Ambient Laser Beam Sweep on Scan */}
        {isScanning && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/10 to-transparent scan-beam pointer-events-none"></div>
        )}

        {/* 3D Organic Sentinel Mascot: Buildvibe Orb */}
        <div className="relative shrink-0 flex items-center justify-center">
          <BuildvibeOrb className="w-10 h-10" pulse={isScanning} />
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080B0F] ${
            isScanning ? 'bg-amber-400 animate-pulse' : (isRegressed ? 'bg-rose-400' : 'bg-emerald-400')
          }`}></span>
        </div>

        {/* Text & Synaptic Pipeline Pipeline */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-200 tracking-tight flex items-center gap-1.5">
              <span>{isScanning ? 'Synthesizing evidence across isolated workers...' : 'Buildgate & legit.run verification active'}</span>
            </span>
            <span className="text-[10px] text-sky-400/80 font-mono px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
              v0.9.4
            </span>
          </div>

          {/* Living Synaptic Stepper */}
          <div className="flex items-center gap-2">
            {stages.map((stage, idx) => {
              const isPast = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;
              return (
                <div key={stage.name} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        isCurrent
                          ? 'bg-sky-400 shadow-[0_0_10px_#38bdf8] ring-2 ring-sky-400/40 scale-125'
                          : isPast
                          ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                          : 'bg-slate-700/80'
                      }`}
                    ></span>
                    <span
                      className={`text-[10px] font-medium tracking-wide transition-all ${
                        isCurrent
                          ? 'text-sky-300 font-bold'
                          : isPast
                          ? 'text-emerald-400/90'
                          : 'text-slate-500'
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className="w-3.5 h-[1.5px] bg-white/[0.08] relative overflow-hidden rounded-full">
                      {(isPast || isCurrent) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-sky-400"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Controls: Interactive Scan, Code Playground, Local Vibe Review, and Switchers */}
      <div className="flex items-center gap-3">
        {/* Local Vibe Review CTA */}
        <button
          onClick={onOpenLocalReview}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-bold text-sky-300 border border-sky-500/30 transition shadow-sm"
          title="Review local uncommitted code from Cursor / Claude Code"
        >
          <Laptop className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Local Vibe Guard</span>
        </button>

        {/* Code Playground CTA */}
        <button
          onClick={onOpenCodePlayground}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-slate-200 border border-white/[0.08] hover:border-sky-500/40 transition shadow-sm"
        >
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Code Playground</span>
        </button>

        {/* Re-verify Button */}
        <button
          onClick={onRunScan}
          disabled={isScanning}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 shadow-lg ${
            isScanning 
              ? 'bg-slate-800/80 text-slate-400 cursor-not-allowed border border-white/[0.05]' 
              : 'bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 text-white hover:brightness-110 shadow-sky-500/25 active:scale-95'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Verifying...' : 'Re-verify'}</span>
        </button>

        {/* Mode Switcher */}
        <button
          onClick={onToggleRegression}
          className={`px-3 py-2 rounded-2xl text-[11px] font-bold border transition-all duration-300 shadow-sm ${
            isRegressed
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
        >
          {isRegressed ? '⚡ Mode: AI Bug' : '✨ Mode: Clean'}
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-500/30">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
