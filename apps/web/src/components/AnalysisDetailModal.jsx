import React from 'react';
import { X, Code2, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Terminal, ArrowUpRight } from 'lucide-react';

export default function AnalysisDetailModal({ isOpen, onClose, isRegressed, onApplyFix }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-4xl organic-glass rounded-[36px] p-7 shadow-2xl max-h-[92vh] overflow-y-auto border border-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center bio-glow-violet">
              <Terminal className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-white tracking-tight">Full Verification Evidence</h2>
                <span className="font-mono text-xs text-sky-300 bg-sky-500/15 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                  Commit a3f9c2d
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detailed test execution traces, AST diff analysis, and security telemetry.
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

        {/* Regression Details */}
        {isRegressed ? (
          <div className="space-y-4 mb-6">
            <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 bio-glow-rose">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm mb-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Regression Failure in Critical Journey: Payment Flow</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed mb-3">
                Assertion failed at Step 3: Expected order status to be <code className="bg-rose-950/80 px-1.5 py-0.5 rounded font-mono text-white">paid</code>, but database retained <code className="bg-rose-950/80 px-1.5 py-0.5 rounded font-mono text-white">pending_payment</code>.
              </p>
              <div className="p-4 rounded-2xl bg-black/60 font-mono text-[11px] text-rose-300 border border-rose-500/20 overflow-x-auto leading-relaxed">
                AssertionError [ERR_ASSERTION]: Expected order status to be 'paid' upon webhook confirmation, but found 'pending_payment'<br/>
                &nbsp;&nbsp;at runPaymentFlowJourney (tests/journeys/payment-flow.journey.js:76:12)<br/>
                &nbsp;&nbsp;at async runJourneyCheck (packages/engine/src/checks/journey-check.js:23:22)
              </div>
            </div>

            {/* Code Diff Box */}
            <div className="p-5 rounded-3xl bg-black/40 border border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  Git Diff Excerpt: <code className="text-sky-300">src/api/webhooks/stripe.js</code>
                </span>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  AST Analysis Confirmed
                </span>
              </div>
              <pre className="p-4 rounded-2xl bg-black/70 text-xs font-mono border border-white/[0.06] text-slate-300 overflow-x-auto leading-relaxed">
{`@@ -26,5 +26,6 @@
- function verifyStripeSignature(payload, signatureHeader, secret) {
-   return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
+ function verifyStripeSignature(payload, signatureHeader, secret) {
+   return true; // <-- AI shortcut bypassed cryptographic check!

@@ -45,3 +46,2 @@
- updateOrderStatus(orderId, 'paid', paymentId);
+ // updateOrderStatus(orderId, 'paid'); // <-- AI commented out database commit!`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-6 flex items-center gap-3.5 bio-glow-emerald">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-extrabold text-white text-sm">All Checks Verified Clean</div>
              <div className="text-emerald-300/80 mt-0.5">Cryptographic HMAC signatures and order status transitions confirmed by deterministic test runs.</div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div className="text-xs text-slate-400 font-mono">
            Audit ID: <code className="text-slate-300">chk_8829f01b_audit</code>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold transition border border-white/[0.08]"
            >
              Close
            </button>
            {isRegressed && (
              <button
                onClick={() => {
                  onApplyFix();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                <span>Apply Fix & Re-verify</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
