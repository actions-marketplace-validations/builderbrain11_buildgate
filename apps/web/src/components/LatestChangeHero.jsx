import React from 'react';
import { 
  GitCommit, ArrowUpRight, CheckCircle2, XCircle, 
  AlertCircle, Sparkles, ShieldAlert, Key, Package, ExternalLink,
  Cpu, Wrench, ShieldCheck, Code2
} from 'lucide-react';

export default function LatestChangeHero({ 
  isRegressed, 
  onAskBuildgateToFix,
  onAskVerityToFix, 
  onViewDetails,
  onOpenCodePlayground
}) {
  const handleFix = onAskBuildgateToFix || onAskVerityToFix;
  return (
    <div className="p-7 rounded-[32px] organic-glass relative overflow-hidden mb-6 shadow-2xl transition-all duration-300">
      {/* Bioluminescent Gradient Orbs in Background */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-5 border-b border-white/[0.08]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-indigo-950/40">
            <GitCommit className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Latest Change
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Add payment webhook handler
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-purple-500/15 text-purple-300 border border-purple-500/30 bio-glow-violet uppercase tracking-wider">
                High Risk
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-slate-300 font-mono">
                  ai
                </span>
                <span className="text-slate-300 font-medium">by ai-coder</span>
              </div>
              <span className="text-slate-600">·</span>
              <span>2 hours ago</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono bg-white/[0.04] px-2 py-0.5 rounded text-sky-300 text-[11px] border border-white/[0.08]">
                a3f9c2d
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">main</span>
            </div>

            <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
              Adds Stripe webhook endpoint and updates order status logic.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-slate-300 border border-white/[0.08] hover:border-slate-500 transition shadow-sm"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onOpenCodePlayground}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-bold text-sky-300 border border-sky-500/30 transition shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Live Code Editor</span>
          </button>

          <button
            onClick={onViewDetails}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-white border border-white/[0.1] hover:border-sky-500/40 transition shadow-md"
          >
            <span>Full Evidence</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
        {/* Col 1: What Changed? */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
            <span>What Changed?</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.02] transition">
              <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0 shadow-[0_0_6px_#38bdf8]"></span>
              <span>Added <code className="text-sky-300 font-mono text-[11px] bg-sky-950/40 px-1 py-0.5 rounded border border-sky-500/20">/api/webhooks/stripe</code> endpoint</span>
            </li>
            <li className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.02] transition">
              <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0 shadow-[0_0_6px_#38bdf8]"></span>
              <span>Updated order status logic</span>
            </li>
            <li className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.02] transition">
              <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0 shadow-[0_0_6px_#38bdf8]"></span>
              <span>Modified database schema (orders)</span>
            </li>
            <li className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.02] transition">
              <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0 shadow-[0_0_6px_#38bdf8]"></span>
              <span>Added Stripe dependency</span>
            </li>
            <li className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.02] transition">
              <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0 shadow-[0_0_6px_#38bdf8]"></span>
              <span>Changed environment variables</span>
            </li>
          </ul>
        </div>

        {/* Col 2: Verification Results */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
            Verification Results
          </h3>
          <div className="space-y-2">
            {/* Build & Type Check */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-black/30 border border-white/[0.05] hover:border-white/[0.1] transition">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200 font-medium">Build & Type Check</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Passed</span>
                <span className="text-[11px] text-slate-400 font-mono">42s</span>
              </div>
            </div>

            {/* Unit Tests */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-black/30 border border-white/[0.05] hover:border-white/[0.1] transition">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200 font-medium">Unit Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Passed</span>
                <span className="text-[11px] text-slate-400 font-mono">1m 12s</span>
              </div>
            </div>

            {/* Critical Journey Tests */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-black/30 border border-white/[0.05] hover:border-white/[0.1] transition">
              <div className="flex items-center gap-2">
                {isRegressed ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 shadow-[0_0_6px_#f43f5e]" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span className="text-slate-200 font-medium">Critical Journey Tests</span>
              </div>
              <div className="flex items-center gap-2">
                {isRegressed ? (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 bio-glow-rose">1 Failed</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Passed</span>
                )}
                <span className="text-[11px] text-slate-400 font-mono">3m 24s</span>
              </div>
            </div>

            {/* Security Scan */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-black/30 border border-white/[0.05] hover:border-white/[0.1] transition">
              <div className="flex items-center gap-2">
                {isRegressed ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span className="text-slate-200 font-medium">Security Scan</span>
              </div>
              <div className="flex items-center gap-2">
                {isRegressed ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">2 Medium</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Passed</span>
                )}
                <span className="text-[11px] text-slate-400 font-mono">28s</span>
              </div>
            </div>

            {/* Secret Detection */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-black/30 border border-white/[0.05] hover:border-white/[0.1] transition">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200 font-medium">Secret Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Passed</span>
                <span className="text-[11px] text-slate-400 font-mono">15s</span>
              </div>
            </div>

            {/* Dependency Audit */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-black/30 border border-white/[0.05] hover:border-white/[0.1] transition">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200 font-medium">Dependency Audit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Passed</span>
                <span className="text-[11px] text-slate-400 font-mono">20s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Overall Result Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/[0.08] flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Light Glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
            isRegressed ? 'bg-rose-500/15' : 'bg-emerald-500/15'
          }`}></div>

          <div>
            <div className="flex items-center gap-3.5 mb-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                isRegressed 
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 bio-glow-rose' 
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 bio-glow-emerald'
              }`}>
                {isRegressed ? (
                  <XCircle className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Overall Result</span>
                <h4 className="text-base font-black text-white">
                  {isRegressed ? 'Changes need attention' : 'Ready to merge'}
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {isRegressed 
                ? '1 critical journey test failed and 2 security findings must be resolved before merging to main.'
                : 'All deterministic verification checks passed. No behavioral regressions detected.'}
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onViewDetails}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold transition border border-white/[0.08] hover:border-slate-500 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {isRegressed && (
              <button
                onClick={handleFix}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold transition-all duration-300 shadow-xl shadow-sky-500/30 flex items-center justify-center gap-2 group active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-sky-200 group-hover:rotate-12 transition-transform" />
                <span>Ask BuildGate to Fix (legit.run)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
