import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, GitBranch, ArrowRight, ShieldCheck, GitPullRequest, Code2 } from 'lucide-react';

export default function RemediationFixModal({ isOpen, onClose, onConfirmFix }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(4); // Completed

  const steps = [
    { label: 'Synthesize minimal targeted AST patch', detail: 'Restores HMAC timingSafeEqual and DB status update', done: true },
    { label: 'Create isolated remediation branch', detail: 'Branch: buildgate/fix-order-webhook', done: true },
    { label: 'Re-execute 6-stage verification pipeline', detail: 'Unit tests + Payment Flow journey + Security audit', done: true },
    { label: 'Anti-patch-loop validation', detail: 'Zero secondary regressions detected. Invariants verified.', done: true }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-3xl organic-glass rounded-[36px] p-7 shadow-2xl max-h-[92vh] overflow-y-auto border border-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 bio-glow-cyan animate-breath">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Buildgate Autonomous Remediation</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Verified Clean
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Safe branch isolation & regression verification for <code className="text-sky-300 font-mono">buildgate/fix-order-webhook</code>
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

        {/* Remediation Pipeline Progress */}
        <div className="space-y-3 mb-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">{s.label}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{s.detail}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
          ))}
        </div>

        {/* Patch Preview */}
        <div className="p-5 rounded-3xl bg-black/50 border border-white/[0.08] mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Applied Remediation Patch in stripe.js</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              +14 insertions, -2 deletions
            </span>
          </div>
          <pre className="p-3.5 rounded-2xl bg-black/70 text-xs font-mono text-emerald-300 border border-white/[0.05] overflow-x-auto leading-relaxed">
{`+ const isValid = verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
+ if (!isValid) { throw new Error('Invalid Stripe signature'); }
  ...
+ // Critical Invariant: Update status to 'paid' with payment transaction ID
+ updateOrderStatus(orderId, 'paid', paymentId);
+ return { received: true, action: 'order_marked_paid', status: 'paid' };`}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <GitBranch className="w-3.5 h-3.5 text-sky-400" />
            <span>Ready for Pull Request #25</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold transition border border-white/[0.08]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirmFix();
                onClose();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95"
            >
              <GitPullRequest className="w-4 h-4" />
              <span>Promote Fix & Mark Clean</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
