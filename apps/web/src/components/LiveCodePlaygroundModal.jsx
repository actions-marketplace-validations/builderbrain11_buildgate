import React, { useState } from 'react';
import { X, Code2, Play, Sparkles, CheckCircle2, XCircle, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

const SAMPLE_BROKEN_CODE = `// Stripe Webhook Endpoint Handler (Modified by ai-coder)
// WARNING: AI introduced regression - signature check bypassed & DB mutation omitted
const crypto = require('crypto');
const { updateOrderStatus, getOrder } = require('../../services/order');

function verifyStripeSignature(payload, signatureHeader, secret) {
  // AI shortcut: "return true for now during testing"
  return true; 
}

async function handleStripeWebhook(rawBody, headers) {
  let event = JSON.parse(rawBody);

  if (event.type === 'payment_intent.succeeded') {
    const orderId = event.data?.object?.metadata?.orderId;
    console.log('[AI Webhook] Payment received for order:', orderId);
    
    // REGRESSION: AI commented out the database update!
    // updateOrderStatus(orderId, 'paid', event.data?.object?.id);

    return { received: true, status: 'pending_payment' };
  }

  return { received: true };
}

module.exports = { handleStripeWebhook, verifyStripeSignature };`;

const SAMPLE_CLEAN_CODE = `// Stripe Webhook Endpoint Handler (Verified by Buildgate & legit.run)
const crypto = require('crypto');
const { updateOrderStatus, getOrder } = require('../../services/order');
const env = require('../../config/env');

function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = signatureHeader.split(',');
  let timestamp, signature;
  for (const part of parts) {
    const [key, val] = part.trim().split('=');
    if (key === 't') timestamp = val;
    if (key === 'v1') signature = val;
  }
  if (!timestamp || !signature) return false;
  const signedPayload = \`\${timestamp}.\${payload}\`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

async function handleStripeWebhook(rawBody, headers) {
  const isValid = verifyStripeSignature(rawBody, headers['stripe-signature'], env.STRIPE_WEBHOOK_SECRET);
  if (!isValid) throw new Error('Invalid Stripe signature');

  const event = JSON.parse(rawBody);
  if (event.type === 'payment_intent.succeeded') {
    const orderId = event.data?.object?.metadata?.orderId;
    updateOrderStatus(orderId, 'paid', event.data?.object?.id);
    return { received: true, action: 'order_marked_paid', status: 'paid' };
  }
  return { received: true };
}

module.exports = { handleStripeWebhook, verifyStripeSignature };`;

export default function LiveCodePlaygroundModal({ 
  isOpen, 
  onClose, 
  onApplyCodeToSandbox 
}) {
  if (!isOpen) return null;

  const [code, setCode] = useState(SAMPLE_BROKEN_CODE);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch('http://localhost:3050/api/sandbox/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, filePath: 'src/api/webhooks/stripe.js' })
      });
      const data = await res.json();
      setVerifyResult(data);
      if (onApplyCodeToSandbox) {
        onApplyCodeToSandbox(data);
      }
    } catch (err) {
      setVerifyResult({
        status: 'error',
        summary: err.message,
        findings: []
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-5xl organic-glass rounded-[36px] p-7 shadow-2xl max-h-[92vh] overflow-y-auto border border-white/[0.08] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <Code2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Interactive Code Playground</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Live AST & Test Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Editing: <span className="text-sky-300">src/api/webhooks/stripe.js</span>
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

        {/* Quick Preset Buttons */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">Load Presets:</span>
          <button
            onClick={() => setCode(SAMPLE_BROKEN_CODE)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
          >
            🔴 AI Webhook Regression (Broken)
          </button>
          <button
            onClick={() => setCode(SAMPLE_CLEAN_CODE)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          >
            🟢 Verified Invariant Code (Passing)
          </button>
          <button
            onClick={() => setCode('const key = "' + ['sk', 'live', '51M0dummyForTesting99182374'].join('_') + '";\n' + SAMPLE_BROKEN_CODE)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
          >
            ⚠️ Inject Leaked Stripe Key
          </button>
        </div>

        {/* In-Browser Code Editor */}
        <div className="mb-4 rounded-2xl bg-black/60 border border-white/[0.08] overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] text-xs text-slate-400 font-mono">
            <span>JavaScript (Node.js 20)</span>
            <span>Lines: {code.split('\n').length}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={14}
            className="w-full p-4 bg-transparent font-mono text-xs text-sky-200 focus:outline-none resize-none leading-relaxed selection:bg-sky-500/40"
            spellCheck="false"
          />
        </div>

        {/* Live Verification Results Banner */}
        {verifyResult && (
          <div className={`p-4 rounded-2xl border mb-4 text-xs transition-all ${
            verifyResult.status === 'passed'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 bio-glow-emerald'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 bio-glow-rose'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {verifyResult.status === 'passed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{verifyResult.summary}</span>
            </div>
            {verifyResult.findings && verifyResult.findings.length > 0 && (
              <ul className="space-y-1 mt-2 text-[11px] text-slate-300 pl-6 list-disc">
                {verifyResult.findings.map((f, i) => (
                  <li key={i}>
                    <strong className="text-white">{f.title}</strong> ({f.severity} severity)
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <span className="text-xs text-slate-400">
            Real-time compiler sandbox running on isolated worker.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold transition border border-white/[0.08]"
            >
              Close
            </button>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Isolated Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Live Verification on Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
