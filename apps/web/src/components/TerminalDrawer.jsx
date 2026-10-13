import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2, CheckCircle2, ShieldCheck, Copy } from 'lucide-react';

export default function TerminalDrawer({ isScanning, isRegressed }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([
    { time: '06:05:12', msg: '🔒 [SANDBOX ISOLATION] Spawning ephemeral worker: worker_c91a0 (UID: 10001)', type: 'info' },
    { time: '06:05:12', msg: '📦 [DEPS] Lockfile validated. Detected Next.js 14.2, TypeScript 5.4, Stripe 14.0', type: 'info' },
    { time: '06:05:13', msg: '⚙️  [BUILD] tsc --noEmit: Syntax verified across 15 project files. Exit Code: 0', type: 'success' },
    { time: '06:05:14', msg: '🧪 [UNIT] order.test.js: 3/3 passed · webhook.test.js: 2/2 passed', type: 'success' },
    { time: '06:05:15', msg: '🚀 [JOURNEYS] Executing synthetic Playwright user flows...', type: 'info' },
    { time: '06:05:15', msg: '   - Journey 1: User Login -> PASSED (2 assertions)', type: 'success' },
    { time: '06:05:16', msg: '   - Journey 2: Create Order -> PASSED (2 assertions)', type: 'success' },
    { time: '06:05:17', msg: '   - Journey 3: Payment Flow -> FAILED at Step 3 (AssertionError: expected order status "paid")', type: 'error' },
    { time: '06:05:17', msg: '🔒 [SECURITY] AST Analysis: verifyStripeSignature returns true unconditionally at line 9', type: 'warn' },
    { time: '06:05:18', msg: '📊 [EVIDENCE] Saved immutable audit report to reports/buildgate-report.json', type: 'info' },
    { time: '06:05:18', msg: '📡 [GITHUB CHECK RUN] Published status to GitHub Check Runs: ACTION_REQUIRED', type: 'warn' }
  ]);

  return (
    <div className="fixed bottom-0 left-64 right-0 z-40 transition-all duration-300">
      {/* Tab Button */}
      <div className="flex items-center justify-between px-6 py-2 bg-[#060a17]/95 border-t border-white/[0.08] backdrop-blur-xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-300 hover:text-white transition"
        >
          <div className="w-5 h-5 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span>Live Worker Terminal (legit.run)</span>
          <span className="text-[10px] text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
            {isScanning ? 'Executing...' : 'Listening'}
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 ml-1" /> : <ChevronUp className="w-3.5 h-3.5 ml-1" />}
        </button>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span>Worker: ephemeral-container-10001</span>
          <span>·</span>
          <span>Exit Code: {isRegressed ? '1 (Attention)' : '0 (Passed)'}</span>
        </div>
      </div>

      {/* Expanded Console Window */}
      {isOpen && (
        <div className="h-64 bg-black/90 border-t border-white/[0.06] p-4 overflow-y-auto font-mono text-xs leading-relaxed shadow-2xl">
          <div className="space-y-1">
            {logs.map((l, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-slate-500 select-none">{l.time}</span>
                <span className={
                  l.type === 'error' ? 'text-rose-400 font-bold' :
                  l.type === 'warn' ? 'text-amber-300' :
                  l.type === 'success' ? 'text-emerald-400' :
                  'text-slate-300'
                }>
                  {l.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
