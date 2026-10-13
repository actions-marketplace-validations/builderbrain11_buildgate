import React, { useState } from 'react';
import { 
  ArrowRight, Play, ExternalLink, Sparkles, Check, 
  XCircle, CheckCircle2, ChevronRight, Laptop, Layers, 
  Terminal, ShieldCheck, RefreshCw, Send, ArrowUpRight
} from 'lucide-react';
import { BuildgateLogo, LegitRunLogo, BuildvibeOrb, VoiceWaveform, StackBadge } from './BrandLogos';

export default function LandingPage({ onLaunchDemo }) {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [toolUsed, setToolUsed] = useState('Cursor');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('failed');

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsWaitlistOpen(false);
      setEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#080B0F] text-slate-100 font-sans relative overflow-x-hidden selection:bg-indigo-500/30">
      {/* Film Grain & Ambient Celestial Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-indigo-900/20 via-purple-900/15 to-transparent blur-[140px]"></div>
        <div className="absolute top-1/4 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-sky-600/15 via-indigo-900/10 to-transparent blur-[150px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* 1. TOP NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-20 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <LegitRunLogo className="w-9 h-9 drop-shadow-[0_0_16px_rgba(56,189,248,0.4)]" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white font-mono lowercase">legit.run</span>
            <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-amber-200/80 font-semibold -mt-0.5">
              by buildgate
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#systems" className="hover:text-amber-300 transition font-mono">01 Systems</a>
          <a href="#workflows" className="hover:text-amber-300 transition font-mono">02 Workflows</a>
          <a href="#agents" className="hover:text-amber-300 transition font-mono">03 Agents</a>
          <a href="#evidence" className="hover:text-amber-300 transition font-mono">04 Evidence</a>
          <a href="#applications" className="hover:text-amber-300 transition font-mono">05 Applications</a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsWaitlistOpen(true)}
            className="text-xs font-bold text-slate-300 hover:text-white transition hidden sm:inline font-mono"
          >
            Sign in
          </button>
          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black transition-all shadow-lg active:scale-95"
          >
            <span>Enter the Gate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION — Architectural Threshold & Light */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-7">
            <div className="text-[11px] font-mono tracking-[0.25em] text-amber-200/80 uppercase font-semibold flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">npx legit.run</span>
              <span>DETERMINISTIC VERIFICATION · CONTAINER SANDBOX · PR MERGE GATE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05]">
              Prove your AI code is <span className="text-amber-300">legit</span><br />
              <span className="text-amber-200/95 italic font-serif font-normal">before you merge.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
              <strong>legit.run</strong> runs your critical user flows in an isolated container sandbox on every AI change. Produces commit-bound, tamper-proof proof for Buildgate PR merge gates.
            </p>

            {/* Trinity Cards Row (buildgate / buildvibe / legit.run) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                <BuildgateLogo className="w-8 h-8 shrink-0 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                <div>
                  <div className="text-xs font-black text-white font-mono lowercase">buildgate</div>
                  <div className="text-[10px] text-slate-400 leading-tight">The Gate for Systems.</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                <BuildvibeOrb className="w-8 h-8 shrink-0" pulse={false} />
                <div>
                  <div className="text-xs font-black text-white font-mono lowercase">buildvibe</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Agentic Build Partner.</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                <LegitRunLogo className="w-8 h-8 shrink-0" />
                <div>
                  <div className="text-xs font-black text-white font-mono lowercase">legit.run</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Verification for the AI Era.</div>
                </div>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-3">
              <button
                onClick={onLaunchDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Enter the Gate</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLaunchDemo}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Explore Systems Demo</span>
              </button>
            </div>
          </div>

          {/* Right Column: Towering Gate with Solitary Builder Silhouette */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Luminous Core Backdrop */}
            <div className="absolute w-80 h-96 bg-gradient-to-t from-sky-500/25 via-indigo-500/20 to-transparent rounded-full blur-[110px] pointer-events-none"></div>

            {/* Monolithic Gate Visual Simulation */}
            <div className="w-full max-w-md h-[460px] rounded-[36px] bg-gradient-to-b from-[#101422] to-[#080B0F] border border-white/[0.12] p-6 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center">
              {/* Starry Nebula Overhead */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/25 via-transparent to-transparent pointer-events-none"></div>

              {/* The Gate Portal Monolith */}
              <div className="relative flex flex-col items-center justify-center z-10">
                <BuildgateLogo className="w-44 h-44 drop-shadow-[0_0_40px_rgba(99,134,241,0.7)]" />

                {/* Vertical Luminous Portal Opening */}
                <div className="absolute w-20 h-36 bg-gradient-to-t from-sky-400/90 via-indigo-200/80 to-transparent blur-md opacity-80 pointer-events-none -mt-4"></div>

                {/* Solitary Human Builder Silhouette */}
                <div className="relative z-20 mt-6 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-900 border border-sky-400/80 shadow-[0_0_8px_#38bdf8]"></div>
                  <div className="w-2.5 h-7 bg-slate-900 rounded-b"></div>
                  <div className="w-16 h-2 bg-sky-400/30 rounded-full blur-sm mt-1"></div>
                </div>
              </div>

              {/* Atmospheric Ground Fog */}
              <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#080B0F] via-[#080B0F]/80 to-transparent z-10 pointer-events-none"></div>

              <div className="absolute bottom-6 inset-x-6 z-20 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                  Active Release Gate
                </span>
                <span>From Idea to Impact</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. "FROM IDEA TO A VERIFIED RELEASE" (3D Layer Stack Section) */}
      <section id="product" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              TRUST FOR THE AI SOFTWARE ERA
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              From idea to a verified release, with AI agents by your side.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Buildgate combines AI agents, real execution, and clear evidence to help you ship reliable software — whether you're using Cursor, Lovable, v0, Replit, or your own stack.
            </p>

            {/* Stack Badges Row */}
            <div className="pt-4 flex items-center gap-5 flex-wrap">
              <StackBadge name="Cursor" />
              <StackBadge name="Lovable" />
              <StackBadge name="v0" />
              <StackBadge name="Replit" />
              <StackBadge name="Bolt" />
              <StackBadge name="Next.js" />
              <StackBadge name="Supabase" />
            </div>
          </div>

          {/* Right Side: 3D Floating Isometric Stack */}
          <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-8 justify-end">
            {/* 3D Stacked Layers */}
            <div className="w-full max-w-sm space-y-4">
              {/* Layer 1: Buildvibe (AI Testing Agent) */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/60 border border-purple-500/30 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BuildvibeOrb className="w-9 h-9" pulse={false} />
                  <div>
                    <div className="text-xs font-black text-white">Buildvibe</div>
                    <div className="text-[10px] text-slate-400 font-mono">AI Testing Agent</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Agent Layer</span>
              </div>

              {/* Layer 2: legit.run (Verification Workflow) */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-black/60 border border-sky-500/40 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LegitRunLogo className="w-9 h-9" />
                  <div>
                    <div className="text-xs font-black text-white">legit.run</div>
                    <div className="text-[10px] text-slate-400 font-mono">Verification Workflow</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">Execution</span>
              </div>

              {/* Layer 3: Buildgate (Trust Infrastructure) */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900/60 to-black/80 border border-white/[0.1] shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BuildgateLogo className="w-9 h-9" />
                  <div>
                    <div className="text-xs font-black text-white">Buildgate</div>
                    <div className="text-[10px] text-slate-400 font-mono">Trust Infrastructure</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.08]">Foundation</span>
              </div>
            </div>

            {/* Bullets Breakdown */}
            <div className="space-y-6 text-xs text-slate-300 font-sans max-w-xs">
              <div>
                <div className="font-mono text-[11px] font-black uppercase text-white mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>UNDERSTAND</span>
                </div>
                <p className="text-slate-400">Generate tests and run them across real user journeys.</p>
              </div>

              <div>
                <div className="font-mono text-[11px] font-black uppercase text-white mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>VERIFY</span>
                </div>
                <p className="text-slate-400">Evidence, logs, and clear deterministic reports.</p>
              </div>

              <div>
                <div className="font-mono text-[11px] font-black uppercase text-white mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>IMPROVE</span>
                </div>
                <p className="text-slate-400">Catch regressions and ship confidently.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LEGIT.RUN DEEP-DIVE (Dark Control Room Preview) */}
      <section id="workflow" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-[11px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              LEGIT.RUN
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Turn any build into a verified release.
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Connect your project, let our agents test the critical workflows, and get a clear, visual report of what's working, what's broken, and what to fix.
            </p>

            <ul className="space-y-3.5 text-xs text-slate-200">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Automated end-to-end tests</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Real browser execution</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Evidence with screenshots and logs</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Human-readable explanations</span>
              </li>
            </ul>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={onLaunchDemo}
                className="px-6 py-3 rounded-full bg-white hover:bg-slate-200 text-black text-xs font-black transition-all shadow-lg flex items-center gap-2"
              >
                <span>Try legit.run</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onLaunchDemo}
                className="px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-bold transition"
              >
                See example report
              </button>
            </div>
          </div>

          {/* Right Product UI Preview (Matches Image) */}
          <div className="lg:col-span-7">
            <div className="rounded-[32px] bg-[#0E121B] border border-white/[0.1] shadow-2xl p-6 relative overflow-hidden">
              {/* App Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <LegitRunLogo className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold text-white">Acme App</span>
                  <span className="font-mono text-[11px] text-slate-500">/ main</span>
                </div>
                <button
                  onClick={onLaunchDemo}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold font-mono transition shadow-sm"
                >
                  Run verification
                </button>
              </div>

              {/* Floating Buildvibe Speech Pill */}
              <div className="mb-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
                <BuildvibeOrb className="w-7 h-7" pulse={false} />
                <div className="text-xs text-slate-200">
                  <span className="font-bold text-white">Buildvibe:</span> I found 2 issues that need attention. Want me to suggest fixes?
                </div>
              </div>

              {/* Title & 4 Metric Pills */}
              <div className="mb-4">
                <h3 className="text-lg font-black text-white">Your application, verified.</h3>
                <p className="text-[11px] font-mono text-slate-400">Latest build analysed 2 minutes ago</p>
              </div>

              <div className="grid grid-cols-4 gap-2.5 mb-5 font-mono text-xs">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-black text-sm text-white">18</div>
                    <div className="text-[9px] uppercase font-bold text-emerald-400">Passed</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-black text-sm text-white">2</div>
                    <div className="text-[9px] uppercase font-bold text-rose-400">Failed</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[9px]">-</div>
                  <div>
                    <div className="font-black text-sm text-white">4</div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Untested</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-indigo-400 flex items-center justify-center text-[9px] font-bold">%</div>
                  <div>
                    <div className="font-black text-sm text-white">78%</div>
                    <div className="text-[9px] uppercase font-bold text-indigo-400">Coverage</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-4 text-xs font-mono border-b border-white/[0.06] pb-2 mb-3">
                <button 
                  onClick={() => setActiveTab('failed')}
                  className={`font-bold pb-1 transition border-b-2 ${activeTab === 'failed' ? 'text-white border-rose-400' : 'text-slate-500 border-transparent'}`}
                >
                  Failed checks (2)
                </button>
                <button 
                  onClick={() => setActiveTab('passed')}
                  className={`font-bold pb-1 transition border-b-2 ${activeTab === 'passed' ? 'text-white border-emerald-400' : 'text-slate-500 border-transparent'}`}
                >
                  Passed (18)
                </button>
                <button 
                  onClick={() => setActiveTab('untested')}
                  className={`font-bold pb-1 transition border-b-2 ${activeTab === 'untested' ? 'text-white border-slate-400' : 'text-slate-500 border-transparent'}`}
                >
                  Untested (4)
                </button>
              </div>

              {/* Failures List */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Password reset flow</div>
                      <div className="text-[11px] text-slate-400 truncate">Expected confirmation, received an error response.</div>
                    </div>
                  </div>
                  <button onClick={onLaunchDemo} className="text-[11px] font-mono text-sky-400 hover:underline shrink-0">
                    View evidence →
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Settings save</div>
                      <div className="text-[11px] text-slate-400 truncate">Saved values did not persist after reload.</div>
                    </div>
                  </div>
                  <button onClick={onLaunchDemo} className="text-[11px] font-mono text-sky-400 hover:underline shrink-0">
                    View evidence →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEET BUILDVIBE (Interactive Agent Showcase) */}
      <section id="agents" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              MEET BUILDVIBE
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              An AI agent that tests like a co-founder.
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Buildvibe understands your app, explores user journeys, writes and runs tests, investigates failures, and helps you fix and verify again.
            </p>

            <button
              onClick={onLaunchDemo}
              className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-200 text-black text-xs font-black transition-all shadow-xl flex items-center gap-2"
            >
              <span>Chat with Buildvibe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: Glowing 3D Agent Orb Mascot */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
              <BuildvibeOrb className="w-40 h-40" pulse={true} />
            </div>
          </div>

          {/* Right Column: Live Chat Widget Mockup */}
          <div className="lg:col-span-4">
            <div className="p-5 rounded-[28px] bg-[#111422] border border-white/[0.08] shadow-2xl space-y-4">
              {/* User Prompt */}
              <div className="flex items-start gap-3 justify-end">
                <div className="p-3 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 text-xs text-white">
                  Test the signup flow on my app.
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-300 shrink-0">
                  You
                </div>
              </div>

              {/* Buildvibe Agent Response */}
              <div className="flex items-start gap-3">
                <BuildvibeOrb className="w-7 h-7 shrink-0" pulse={false} />
                <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] text-xs space-y-2 w-full">
                  <div className="font-bold text-white">Buildvibe</div>
                  <div className="space-y-1.5 font-mono text-[11px] text-emerald-400">
                    <div className="flex items-center gap-2">✓ Analyzing your app structure...</div>
                    <div className="flex items-center gap-2">✓ Mapping user journeys...</div>
                    <div className="flex items-center gap-2">✓ Generating test scenarios...</div>
                    <div className="flex items-center gap-2">✓ Running tests in real browser...</div>
                    <div className="flex items-center gap-2 text-rose-400">✕ Found 1 issue in email verification.</div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
                    <span className="text-[11px] text-slate-300 font-medium">Should I suggest a fix?</span>
                    <button 
                      onClick={onLaunchDemo}
                      className="w-7 h-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REAL OUTCOMES ("Ship faster. Break less.") */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/[0.06]">
        <div className="text-left mb-10 space-y-2">
          <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            REAL OUTCOMES
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ship faster. Break less.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-[28px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-4xl font-black text-white tracking-tight mb-2">90%</div>
            <p className="text-xs text-slate-400 font-mono">Bugs caught before users</p>
          </div>

          <div className="p-6 rounded-[28px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-4xl font-black text-white tracking-tight mb-2">3×</div>
            <p className="text-xs text-slate-400 font-mono">Faster release cycles</p>
          </div>

          <div className="p-6 rounded-[28px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-4xl font-black text-white tracking-tight mb-2">70%</div>
            <p className="text-xs text-slate-400 font-mono">Less time on manual QA</p>
          </div>

          <div className="p-6 rounded-[28px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-4xl font-black text-white tracking-tight mb-2">10,000+</div>
            <p className="text-xs text-slate-400 font-mono">Builds verified (and counting)</p>
          </div>
        </div>
      </section>

      {/* 7. "WORKS WITH YOUR STACK" + TESTIMONIAL */}
      <section id="use-cases" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Stack */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold mb-1">
                BUILT FOR AI BUILDERS
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Works with your stack.
              </h2>
            </div>

            <div className="flex items-center gap-4 flex-wrap pt-2">
              <StackBadge name="Next.js" />
              <StackBadge name="Supabase" />
              <StackBadge name="Vercel" />
              <StackBadge name="Stripe" />
              <StackBadge name="OpenAI" />
              <StackBadge name="Anthropic" />
              <StackBadge name="Firebase" />
              <StackBadge name="MongoDB" />
            </div>
          </div>

          {/* Right: Testimonial Card */}
          <div className="lg:col-span-5">
            <div className="p-7 rounded-[32px] bg-white/[0.03] border border-white/[0.08] shadow-xl relative">
              <div className="text-amber-400 text-3xl font-serif leading-none mb-2">“</div>
              <p className="text-sm text-slate-200 leading-relaxed italic mb-6">
                Buildgate caught critical issues in our system before launch. It feels like having a senior systems architect, but always observing and verifying.
              </p>
              <div>
                <div className="text-xs font-black text-white">Rohan Mehta</div>
                <div className="text-[11px] text-slate-400 font-mono">Founder, ShipFast Systems</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. REAL APPLICATIONS — The Architect of Progress */}
      <section id="applications" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/[0.05]">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-[11px] font-mono tracking-[0.2em] text-amber-200/80 uppercase font-semibold">
            REAL APPLICATIONS
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Enduring systems across every discipline.
          </h2>
          <p className="text-sm text-slate-400">
            From local manufacturers in Surat to global software agencies and frontier AI labs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/30 transition group space-y-3">
            <div className="text-xs font-mono font-bold text-amber-300">01 Startups</div>
            <h4 className="text-sm font-bold text-white">From Idea to Scale</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Move forward with continuity. Never start from zero when switching AI tools.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/30 transition group space-y-3">
            <div className="text-xs font-mono font-bold text-sky-300">02 Agencies</div>
            <h4 className="text-sm font-bold text-white">Deliver Transparency</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hand over systems with immutable verification evidence clients can trust.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/30 transition group space-y-3">
            <div className="text-xs font-mono font-bold text-emerald-300">03 Companies</div>
            <h4 className="text-sm font-bold text-white">Modernize & Compound</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Safeguard mission-critical business logic as agentic workflows evolve.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/30 transition group space-y-3">
            <div className="text-xs font-mono font-bold text-purple-300">04 Manufacturers</div>
            <h4 className="text-sm font-bold text-white">Intelligent Operations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ground AI in actual inventory, production orders, and hardware workflows.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/30 transition group space-y-3">
            <div className="text-xs font-mono font-bold text-rose-300">05 Research</div>
            <h4 className="text-sm font-bold text-white">Explore & Prove</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experiment with autonomous multi-agent systems with deterministic guardrails.
            </p>
          </div>
        </div>
      </section>

      {/* 9. GET STARTED CTA BANNER */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="p-8 sm:p-14 rounded-[36px] bg-gradient-to-r from-amber-950/30 via-[#101426] to-black border border-white/[0.12] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-5 max-w-lg">
            <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              GET STARTED
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Start verifying today.
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Join early and be part of the next generation of AI software infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={onLaunchDemo}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-200 text-black text-xs font-black transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <span>Get early access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onLaunchDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>Watch 2 min demo</span>
              </button>
            </div>
          </div>

          {/* Checklist on Right */}
          <div className="space-y-3 font-mono text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Early access to legit.run</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Buildvibe agent</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Priority feature requests</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Founders community</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER — Matches Image */}
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-white/[0.06] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <BuildgateLogo className="w-7 h-7 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]" />
              <span className="text-lg font-bold text-white font-sans lowercase">buildgate</span>
            </div>
            <p className="text-xs text-amber-200/70 max-w-xs font-mono uppercase tracking-wider text-[10px]">
              The Gate for Systems. Build forward.
            </p>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-2 space-y-3 text-xs">
            <div className="font-bold text-white font-mono uppercase tracking-wider text-[11px]">Product</div>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={onLaunchDemo} className="hover:text-white transition">legit.run</button></li>
              <li><button onClick={onLaunchDemo} className="hover:text-white transition">Buildvibe</button></li>
              <li><a href="#use-cases" className="hover:text-white transition">Integrations</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-2 space-y-3 text-xs">
            <div className="font-bold text-white font-mono uppercase tracking-wider text-[11px]">Company</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#about" className="hover:text-white transition">About</a></li>
              <li><a href="#careers" className="hover:text-white transition">Careers</a></li>
              <li><a href="#blog" className="hover:text-white transition">Blog</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="md:col-span-2 space-y-3 text-xs">
            <div className="font-bold text-white font-mono uppercase tracking-wider text-[11px]">Resources</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#docs" className="hover:text-white transition">Docs</a></li>
              <li><a href="#case-studies" className="hover:text-white transition">Case studies</a></li>
              <li><a href="#templates" className="hover:text-white transition">Templates</a></li>
              <li><a href="#community" className="hover:text-white transition">Community</a></li>
            </ul>
          </div>

          {/* Right Slogan */}
          <div className="md:col-span-2 space-y-2 text-xs">
            <div className="text-slate-400">Build the future.</div>
            <div className="font-black text-white text-sm">Ship with confidence.</div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <div>© {new Date().getFullYear()} Buildgate Inc. All rights reserved.</div>
          <div className="flex items-center gap-6 mt-4 sm:mt-0 text-slate-400">
            <span className="hover:text-white cursor-pointer transition">𝕏</span>
            <span className="hover:text-white cursor-pointer transition">in</span>
            <span className="hover:text-white cursor-pointer transition">▶</span>
            <span className="hover:text-white cursor-pointer transition">👾</span>
          </div>
        </div>
      </footer>

      {/* WAITLIST MODAL */}
      {isWaitlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-md organic-glass rounded-[36px] p-7 shadow-2xl border border-white/[0.08] relative">
            <button
              onClick={() => setIsWaitlistOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-2xl bg-white/[0.04] text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <BuildgateLogo className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-xl font-black text-white">Join Buildgate Early Access</h3>
              <p className="text-xs text-slate-400 mt-1">
                We're onboarding founders this week with white-glove setup.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center text-xs">
                🎉 You're on the priority list! Check your inbox shortly.
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 font-mono uppercase">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@yoursaas.com"
                    required
                    className="w-full py-3 px-4 rounded-2xl bg-black/50 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 font-mono uppercase">
                    Primary AI Coding Tool
                  </label>
                  <select
                    value={toolUsed}
                    onChange={(e) => setToolUsed(e.target.value)}
                    className="w-full py-3 px-4 rounded-2xl bg-black/50 border border-white/[0.08] text-xs text-white focus:outline-none font-sans"
                  >
                    <option value="Cursor">Cursor</option>
                    <option value="Lovable">Lovable</option>
                    <option value="Claude Code">Claude Code</option>
                    <option value="Windsurf">Windsurf</option>
                    <option value="Bolt">Bolt.new</option>
                    <option value="v0">v0 / Next.js</option>
                    <option value="Other">Other AI Agent</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-white hover:bg-slate-200 text-black text-xs font-black transition shadow-lg active:scale-95"
                >
                  Request Early Access
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
