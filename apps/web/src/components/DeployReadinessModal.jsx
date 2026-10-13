import React, { useState } from 'react';
import { X, Rocket, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function DeployReadinessModal({ isOpen, onClose, isRegressed }) {
  if (!isOpen) return null;

  const [criteria, setCriteria] = useState([
    { id: 1, category: 'GitHub Integration', title: 'Webhook HMAC signature verification validated', status: 'pass' },
    { id: 2, category: 'GitHub Integration', title: 'Commit SHA deduplication enforced', status: 'pass' },
    { id: 3, category: 'Verification Engine', title: 'Build and TypeScript compilation exit code 0', status: 'pass' },
    { id: 4, category: 'Verification Engine', title: 'Unit test assertions 100% passing', status: isRegressed ? 'fail' : 'pass' },
    { id: 5, category: 'Regression Detection', title: 'User Login critical journey preserved', status: 'pass' },
    { id: 6, category: 'Regression Detection', title: 'Payment Flow Stripe webhook transition verified', status: isRegressed ? 'fail' : 'pass' },
    { id: 7, category: 'Security & Secrets', title: 'Zero high-entropy live secret tokens exposed', status: 'pass' },
    { id: 8, category: 'Security & Secrets', title: 'Strict HMAC signature checking on incoming webhooks', status: isRegressed ? 'fail' : 'pass' },
    { id: 9, category: 'Tenant Isolation', title: 'Cross-tenant customer record isolation verified', status: 'pass' }
  ]);

  const passedCount = criteria.filter(c => c.status === 'pass').length;
  const isReady = passedCount === criteria.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-3xl organic-glass rounded-[36px] p-7 shadow-2xl max-h-[92vh] overflow-y-auto border border-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isReady 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 bio-glow-emerald' 
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 bio-glow-rose'
            }`}>
              <Rocket className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-white tracking-tight">Deploy Readiness Gate</h2>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isReady 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {isReady ? 'Release Approved' : 'Deployment Blocked'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evidence-backed launch gate for target commit <code className="text-sky-300 font-mono">a3f9c2d</code>
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

        {/* Score Ribbon */}
        <div className="p-5 rounded-3xl bg-black/40 border border-white/[0.08] mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-mono font-black text-white">{passedCount}/{criteria.length}</div>
            <div className="text-xs text-slate-300">
              <div className="font-bold text-white text-sm">Mandatory Checks Verified</div>
              <div className="text-slate-400">{criteria.length - passedCount} blocking issue(s) remaining</div>
            </div>
          </div>

          <div className="w-48 h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_#10b981]' : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_8px_#f43f5e]'}`}
              style={{ width: `${(passedCount / criteria.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Criteria Checklist */}
        <div className="space-y-2 mb-6">
          {criteria.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-3">
                {c.status === 'pass' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 shadow-[0_0_6px_#f43f5e]" />
                )}
                <div>
                  <span className="text-slate-200 font-semibold">{c.title}</span>
                  <span className="text-[10px] text-slate-500 block font-mono">{c.category}</span>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                c.status === 'pass' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {c.status === 'pass' ? 'Passed' : 'Blocking'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold transition border border-white/[0.08]"
          >
            Close
          </button>
          <button
            disabled={!isReady}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg ${
              isReady 
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-white shadow-emerald-500/30' 
                : 'bg-white/[0.03] text-slate-500 border border-white/[0.05] cursor-not-allowed'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Authorize Release to Production</span>
          </button>
        </div>
      </div>
    </div>
  );
}
