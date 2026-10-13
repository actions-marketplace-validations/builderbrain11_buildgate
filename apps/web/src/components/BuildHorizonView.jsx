import React, { useState, useEffect } from 'react';
import {
  Compass, CheckCircle2, Clock, AlertTriangle, ShieldCheck,
  UserCheck, RefreshCw, Layers, FileCode, Check, X,
  ArrowRight, ShieldAlert, Cpu, Database, Network, GitCommit,
  ExternalLink, Sparkles, Lock, Unlock, Play, ChevronRight,
  Info, Award, Zap
} from 'lucide-react';
import { BuildgateLogo, LegitRunLogo, BuildvibeOrb } from './BrandLogos';

const API_BASE = 'http://localhost:3050';

export default function BuildHorizonView({ onOpenEvidenceDrawer }) {
  const [horizonData, setHorizonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSourcing, setIsSourcing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones'); // 'milestones' | 'blocks' | 'truth'
  
  // Author review modal / input state
  const [authorName, setAuthorName] = useState('Founder / Lead Engineer');
  const [reviewDecision, setReviewDecision] = useState('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('Architecture confirmed. HMAC cryptographic webhook guard is strictly enforced before database mutation.');
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch Build Horizon State
  const fetchHorizon = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/horizon/state`);
      if (res.ok) {
        const data = await res.json();
        setHorizonData(data);
        if (!selectedMilestoneId && data.activeMilestoneId) {
          setSelectedMilestoneId(data.activeMilestoneId);
        }
      }
    } catch (err) {
      console.error('Failed to load build horizon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHorizon();
  }, []);

  // Source Midway Build
  const handleSourceMidway = async () => {
    try {
      setIsSourcing(true);
      setActionMessage({ type: 'info', text: 'Sourcing midway build & resolving Git provenance...' });
      const res = await fetch(`${API_BASE}/api/build/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initEvent1BasePoint: true })
      });
      if (res.ok) {
        await fetchHorizon();
        setActionMessage({ type: 'success', text: 'Midway build sourced successfully. Gate Architecture & Event 1 Base Point sealed.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: `Failed to source build: ${err.message}` });
    } finally {
      setIsSourcing(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // Submit Author Review Sign-Off
  const handleSubmitReview = async (milestoneId) => {
    try {
      setIsReviewing(true);
      setActionMessage({ type: 'info', text: 'Recording author review sign-off to immutable record...' });
      const res = await fetch(`${API_BASE}/api/horizon/milestone/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          author: authorName,
          decision: reviewDecision,
          notes: reviewNotes
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setHorizonData(updated);
        setActionMessage({ type: 'success', text: `Author review recorded for ${milestoneId}. Ready for verification finish.` });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: `Review sign-off error: ${err.message}` });
    } finally {
      setIsReviewing(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // Run Isolated Verification Finish
  const handleVerifyFinish = async (milestoneId) => {
    try {
      setIsVerifying(true);
      setActionMessage({ type: 'info', text: 'Running legit.run isolated verification check on milestone...' });
      const res = await fetch(`${API_BASE}/api/horizon/milestone/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId })
      });
      if (res.ok) {
        const result = await res.json();
        setHorizonData(result.horizon);
        setActionMessage({
          type: result.verificationResult.explanation.overallStatus === 'passed' ? 'success' : 'warning',
          text: `Verification completed: ${result.verificationResult.explanation.overallHeadline}`
        });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: `Verification finish error: ${err.message}` });
    } finally {
      setIsVerifying(false);
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  const activeMilestone = horizonData?.milestones?.find(m => m.id === (selectedMilestoneId || horizonData.activeMilestoneId)) 
    || horizonData?.milestones?.[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C6F2E1]/15 text-[#10B981] border border-[#10B981]/30">
            <CheckCircle2 className="w-3 h-3" />
            Approved & Verified
          </span>
        );
      case 'IN_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            In Verification
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-400/15 text-sky-300 border border-sky-400/30">
            <UserCheck className="w-3 h-3" />
            Pending Author Review
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            Changes Requested
          </span>
        );
      case 'PASSED_UNISOLATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
            <AlertTriangle className="w-3 h-3" />
            Passed (Host Fallback)
          </span>
        );
      case 'HORIZON':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <Compass className="w-3 h-3" />
            Horizon Future
          </span>
        );
    }
  };

  const getBlockStateBadge = (state) => {
    switch (state) {
      case 'PROVEN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="w-3 h-3" /> PROVEN
          </span>
        );
      case 'IN_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
            <RefreshCw className="w-3 h-3 animate-spin" /> VERIFYING
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <X className="w-3 h-3" /> BLOCKED
          </span>
        );
      case 'PASSED_UNISOLATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            HOST DEV
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            UNVERIFIED
          </span>
        );
      case 'HORIZON':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            HORIZON
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Build Horizon Header & Sourcing Action */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0D1522] via-[#0B1018] to-[#070A0F] border border-white/[0.08] p-6 lg:p-8 overflow-hidden shadow-2xl">
        {/* Subtle light beam decorative element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-amber-400/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-amber-400" />
                Build Horizon Framework
              </span>
              <span className="text-slate-500 text-xs font-mono">·</span>
              <span className="text-xs font-mono text-slate-400">
                Phase: <strong className="text-white">{horizonData?.currentHorizonPhase || 'Phase 4 · Webhook Guard Verification'}</strong>
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>System Evolution & Author Review</span>
              <span className="text-amber-400 text-sm font-mono font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                Zero Slop · Maintained Truth
              </span>
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl mt-2 leading-relaxed">
              Step midway builds milestone-by-milestone. Each landmark requires explicit author review sign-off, indexed block state verification, and sealing via isolated <strong className="text-white font-mono">legit.run</strong> evidence checkpoints.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSourceMidway}
              disabled={isSourcing}
              className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold font-mono transition flex items-center gap-2 border border-white/[0.12] hover:border-amber-400/40 shadow-sm disabled:opacity-50"
              title="Rescan repository AST, dependencies, routes, and uncommitted git modifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSourcing ? 'animate-spin' : ''}`} />
              <span>{isSourcing ? 'Sourcing Build...' : 'Source Midway Build'}</span>
            </button>

            <button
              onClick={onOpenEvidenceDrawer}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-200 text-xs font-bold font-mono transition flex items-center gap-2 border border-amber-400/30 shadow-lg shadow-amber-950/30"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Event 1 Base Point</span>
            </button>
          </div>
        </div>

        {/* Action / Notification Banner */}
        {actionMessage && (
          <div className={`mt-5 p-3 rounded-2xl text-xs font-mono flex items-center gap-2.5 transition-all ${
            actionMessage.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
            actionMessage.type === 'error' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
            'bg-amber-400/15 text-amber-300 border border-amber-400/30'
          }`}>
            <Info className="w-4 h-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            activeTab === 'milestones'
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Milestone Progression ({horizonData?.milestones?.length || 5})</span>
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            activeTab === 'blocks'
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Indexed Blocks ({horizonData?.gateArchitecture?.indexedCount || 6})</span>
        </button>

        <button
          onClick={() => setActiveTab('truth')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            activeTab === 'truth'
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Grounded Truth vs. Horizon</span>
        </button>
      </div>

      {/* TAB 1: MILESTONE PROGRESSION */}
      {activeTab === 'milestones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Milestone Landmark Ribbon (5 Columns/Cards) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>MILESTONES (1–{horizonData?.milestones?.length || 4})</span>
              <span>LANDMARKS</span>
            </div>

            {horizonData?.milestones?.map((m) => {
              const isSelected = m.id === activeMilestone?.id;
              const isPassed = m.status === 'APPROVED_VERIFIED';
              const isCurrent = m.id === horizonData.activeMilestoneId;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMilestoneId(m.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-400/[0.08] to-transparent border-amber-400/40 shadow-lg shadow-amber-950/20'
                      : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_8px_#f59e0b]"></div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
                        isPassed ? 'bg-[#C6F2E1]/20 text-[#10B981] border border-[#10B981]/30' :
                        isCurrent ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' :
                        'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                      }`}>
                        {m.sequence}
                      </div>

                      <div>
                        <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                          <span>{m.layer}</span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition">
                          {m.title}
                        </h4>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(m.status)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>

                  {/* Quick checks preview */}
                  {m.verificationCheck && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <LegitRunLogo className="w-3 h-3" />
                        <span>Checks: {m.verificationCheck.checksPassed}</span>
                      </span>
                      <span className={m.verificationCheck.status === 'passed' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {m.verificationCheck.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Milestone Detail & Action Surface */}
          <div className="lg:col-span-7 space-y-6">
            {activeMilestone && (
              <div className="p-6 rounded-3xl bg-[#0F1622]/90 border border-white/[0.08] shadow-2xl space-y-6">
                {/* Milestone Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono uppercase text-amber-400/80 font-bold">
                        Milestone {activeMilestone.sequence} of 5 · {activeMilestone.layer}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {activeMilestone.title}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    {getStatusBadge(activeMilestone.status)}
                  </div>
                </div>

                {/* Milestone Scope & Requirements */}
                <div>
                  <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Scope & Boundary
                  </h5>
                  <p className="text-sm text-slate-200 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-white/[0.05]">
                    {activeMilestone.description}
                  </p>
                </div>

                {/* Author Review Section */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <h5 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                        Author Review Gate
                      </h5>
                    </div>
                    {activeMilestone.authorReview ? (
                      <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Signed off by {activeMilestone.authorReview.author}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-sky-400 font-bold">
                        Awaiting Author Sign-off
                      </span>
                    )}
                  </div>

                  {activeMilestone.authorReview ? (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Reviewer: <strong className="text-white">{activeMilestone.authorReview.author}</strong></span>
                        <span className="text-slate-400">Signed At: <span className="text-slate-300">{new Date(activeMilestone.authorReview.signedAt).toLocaleString()}</span></span>
                      </div>
                      <p className="text-xs text-slate-300 italic">
                        "{activeMilestone.authorReview.notes}"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                            Author / Reviewer Name
                          </label>
                          <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                            placeholder="e.g. Lead Engineer / Founder"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                            Review Decision
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setReviewDecision('APPROVED')}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold transition border ${
                                reviewDecision === 'APPROVED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-black/30 text-slate-400 border-white/[0.08]'
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setReviewDecision('CHANGES_REQUESTED')}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold transition border ${
                                reviewDecision === 'CHANGES_REQUESTED'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-black/30 text-slate-400 border-white/[0.08]'
                              }`}
                            >
                              Request Fix
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                          Review Notes & Architectural Rationale
                        </label>
                        <textarea
                          rows={2}
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-amber-400"
                          placeholder="Provide architectural justification for proceeding..."
                        />
                      </div>

                      <button
                        onClick={() => handleSubmitReview(activeMilestone.id)}
                        disabled={isReviewing}
                        className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold font-mono transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isReviewing ? 'Signing...' : 'Sign Off Author Review'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Verification Sealing Section */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LegitRunLogo className="w-4 h-4" />
                      <h5 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                        legit.run Isolated Verification Check
                      </h5>
                    </div>
                    {activeMilestone.verificationCheck?.status === 'passed' ? (
                      <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Sealed Checkpoint
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-amber-300 font-bold">
                        Isolated Execution Required
                      </span>
                    )}
                  </div>

                  {activeMilestone.verificationCheck && (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Passed Tests: <strong className="text-white">{activeMilestone.verificationCheck.checksPassed}</strong></span>
                        {activeMilestone.verificationCheck.evidenceId && (
                          <span className="text-amber-400/80 font-bold">{activeMilestone.verificationCheck.evidenceId}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        {activeMilestone.verificationCheck.summary}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleVerifyFinish(activeMilestone.id)}
                    disabled={isVerifying}
                    className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2 border border-white/[0.12] hover:border-amber-400/50 shadow-sm disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 text-amber-400 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>{isVerifying ? 'Running legit.run Pipeline...' : 'Run legit.run Verification Finish'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INDEXED BLOCKS */}
      {activeTab === 'blocks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <h4 className="text-sm font-bold text-white">
                Indexed Architectural Blocks
              </h4>
              <p className="text-xs text-slate-400">
                Every place in the codebase indexed with dependencies, boundary inputs, outputs, and proven truth state.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {horizonData?.gateArchitecture?.provenCount || 6} PROVEN
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
                {horizonData?.gateArchitecture?.verifyingCount || 0} VERIFYING
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {horizonData?.gateArchitecture?.blockedCount || 0} BLOCKED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {horizonData?.gateArchitecture?.blocks?.map((block) => (
              <div
                key={block.id}
                className="p-5 rounded-2xl bg-[#0D131C] border border-white/[0.07] hover:border-amber-400/30 transition shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      {block.layer}
                    </span>
                    <h5 className="text-sm font-bold text-white mt-0.5">
                      {block.name}
                    </h5>
                  </div>
                  {getBlockStateBadge(block.state)}
                </div>

                <div className="text-[11px] font-mono text-amber-200/80 bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.04] truncate">
                  {block.path}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {block.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/[0.05] text-[11px] font-mono">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400">Inputs:</span>
                    <span className="text-slate-300 text-right truncate max-w-[180px]">{block.inputs?.join(', ') || 'N/A'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400">Outputs:</span>
                    <span className="text-slate-300 text-right truncate max-w-[180px]">{block.outputs?.join(', ') || 'N/A'}</span>
                  </div>
                  {block.dependencies?.length > 0 && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-400">Depends on:</span>
                      <span className="text-amber-400/90 text-right truncate max-w-[180px]">{block.dependencies.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GROUNDED TRUTH VS. FUTURE HORIZON */}
      {activeTab === 'truth' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Grounded Truth (Proven Capabilities) */}
          <div className="p-6 rounded-3xl bg-[#0D1522] border border-emerald-500/20 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider">
                Grounded Truth (Proven)
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              Behaviors and contracts mathematically proven by isolated test executions. Zero slop.
            </p>
            <ul className="space-y-2.5">
              {horizonData?.groundedTruth?.provenCapabilities?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-black/30 p-2.5 rounded-xl border border-white/[0.04]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current Gaps (In Verification) */}
          <div className="p-6 rounded-3xl bg-[#14121A] border border-amber-400/20 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider">
                Active Verification Gaps
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              Components undergoing remediation or awaiting isolated sandbox verification.
            </p>
            <ul className="space-y-2.5">
              {horizonData?.groundedTruth?.currentGaps?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-200 bg-black/30 p-2.5 rounded-xl border border-amber-400/10">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Future Horizon */}
          <div className="p-6 rounded-3xl bg-[#0E1118] border border-sky-400/20 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sky-400">
              <Compass className="w-5 h-5" />
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider">
                Future Build Horizon
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              Planned architectural milestones beyond the active baseline.
            </p>
            <ul className="space-y-2.5">
              {horizonData?.groundedTruth?.futureHorizon?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/[0.04]">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
