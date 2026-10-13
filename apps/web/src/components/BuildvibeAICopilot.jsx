import React, { useState } from 'react';
import { 
  CheckCircle2, Sparkles, Send, ArrowRight, 
  ShieldCheck, AlertTriangle, Terminal, ChevronRight
} from 'lucide-react';
import { BuildvibeOrb, VoiceWaveform } from './BrandLogos';

export default function BuildvibeAICopilot({ 
  isRegressed, 
  onProposeFix,
  latestScan
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      isHeroFinding: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPills = [
    { label: 'Explain the failing test', prompt: 'Explain why the Payment Flow critical journey test failed.' },
    { label: 'Propose a fix (in a new branch)', prompt: 'Show me the proposed fix for stripe.js in an isolated branch.', action: onProposeFix },
    { label: 'Check for related issues', prompt: 'Are there any secondary issues in database schema or environment variables?' },
    { label: 'Run additional tests', prompt: 'Run deep synthetic Playwright check on checkout journey.' }
  ];

  const handleSend = (text) => {
    const query = text || inputText;
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (query.includes('Explain why') || query.includes('failing test')) {
        reply = "Payment Flow failed at Step 3: Expected order status to be 'paid' upon webhook confirmation, but found 'pending_payment'. In stripe.js line 31, the call `updateOrderStatus(orderId, 'paid', paymentId)` was commented out by the AI coder.";
      } else if (query.includes('fix') || query.includes('branch')) {
        reply = "Created isolated remediation branch `buildgate/fix-order-webhook` via legit.run. We restored HMAC verification with crypto.timingSafeEqual and re-enabled `updateOrderStatus(orderId, 'paid', paymentId)`. Ready to verify!";
        if (onProposeFix) onProposeFix();
      } else if (query.includes('related')) {
        reply = "Found 2 medium-severity security findings: 1) verifyStripeSignature unconditionally returns true, allowing attacker-forged webhooks. 2) Missing STRIPE_WEBHOOK_SECRET environment fallback.";
      } else {
        reply = `Buildvibe: Analyzed query against AST diff of commit a3f9c2d. The database invariants and critical journeys are prioritized. Run 'npx legit.run' to re-verify.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="w-full xl:w-[410px] rounded-[32px] organic-glass p-6 flex flex-col justify-between shadow-2xl shrink-0 h-full transition-all duration-300 relative overflow-hidden bg-[#0A0D14]/90 border border-white/[0.08]">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div>
        {/* Buildvibe Agent Header */}
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <BuildvibeOrb className="w-11 h-11" pulse={true} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Buildvibe
                </h3>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  AI Agent
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
                Your AI verification partner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-[10px] font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>

        {/* Tone of Voice Banner with Voice Waveform */}
        <div className="mb-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-300 font-medium italic">
            “Your AI-built app deserves real testing.”
          </div>
          <VoiceWaveform className="w-16 h-3 text-sky-400 shrink-0 opacity-80" />
        </div>

        {/* Chat Stream & Key Findings Checklist */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 mb-4">
          {messages.map((m, idx) => (
            <div key={idx}>
              {m.isHeroFinding ? (
                /* Primary Buildvibe Card (From Brand Board) */
                <div className="p-4 rounded-2xl bg-black/50 text-slate-200 border border-white/[0.08] shadow-md space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>I've analysed your latest build. Here are the key findings:</span>
                  </div>

                  {/* Real Findings Checklist */}
                  <div className="space-y-1.5 pl-1 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span>Verified {latestScan?.results?.find(r => r.id === 'check_critical_journeys')?.journeys?.length || 4} critical user journeys</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span>Ran {latestScan?.results?.find(r => r.id === 'check_unit_tests')?.totalTests || 5} automated tests</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span>Execution: {latestScan?.executionMode || (isRegressed ? 'dev-fallback' : 'container')}</span>
                    </div>
                    <div className={`flex items-center gap-2 font-semibold ${isRegressed ? 'text-rose-400' : 'text-emerald-400'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isRegressed ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {isRegressed ? '!' : '✓'}
                      </span>
                      <span>{isRegressed ? `${latestScan?.explanation?.failingCount || 2} failing assertions detected` : 'Zero regressions detected'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-400 font-semibold">
                      <span className="w-3.5 h-3.5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span>Ready to suggest isolated patch</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                    m.role === 'assistant'
                      ? 'bg-black/40 text-slate-200 border border-white/[0.08] shadow-sm'
                      : 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-200 border border-indigo-500/40 ml-4 font-medium'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-sky-400 mb-1 font-mono">
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>Buildvibe Intelligence</span>
                    </div>
                  )}
                  {m.content}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="p-3 rounded-2xl bg-black/40 text-xs text-sky-300 border border-white/[0.08] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">Buildvibe reasoning...</span>
            </div>
          )}
        </div>

        {/* Quick Action Pills */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
            Suggested Actions:
          </div>
          {quickPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (pill.action) pill.action();
                handleSend(pill.prompt);
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-indigo-500/40 text-xs text-slate-300 font-medium transition flex items-center justify-between group"
            >
              <span className="group-hover:text-sky-300 transition-colors">{pill.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box (Matching Brand Board) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative mt-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Buildvibe to test, explain, fix, or improve..."
          className="w-full py-3.5 pl-4 pr-11 rounded-2xl bg-black/60 border border-white/[0.1] focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 text-xs text-white placeholder-slate-400 transition shadow-inner font-sans"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white flex items-center justify-center transition shadow-md shadow-indigo-500/20 active:scale-95"
          title="Send query to Buildvibe"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
