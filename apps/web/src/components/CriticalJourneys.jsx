import React from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, Plus, 
  Layers, ArrowUpRight, Activity, Clock
} from 'lucide-react';

const JOURNEY_METADATA = {
  'User Login': {
    type: 'Auth & Session Token',
    previewGradient: 'from-sky-900/30 to-indigo-950/40'
  },
  'Create Order': {
    type: 'Pricing & DB Invariant',
    previewGradient: 'from-blue-900/30 to-slate-900/40'
  },
  'Payment Flow': {
    type: 'Stripe Webhook Handler',
    previewGradient: 'from-purple-900/30 to-indigo-950/40'
  },
  'View Orders': {
    type: 'Tenant Data Isolation',
    previewGradient: 'from-emerald-900/20 to-slate-900/40'
  }
};

export default function CriticalJourneys({ 
  latestScan,
  isRegressed, 
  onAddJourney, 
  onManageJourneys 
}) {
  const journeyCheck = latestScan?.results?.find(r => r.id === 'check_critical_journeys');
  const rawJourneys = journeyCheck?.journeys;

  // Real journeys from the isolated runner
  let journeys = [];
  if (Array.isArray(rawJourneys) && rawJourneys.length > 0) {
    journeys = rawJourneys.map((j) => {
      const meta = JOURNEY_METADATA[j.journey] || {
        type: 'Synthetic Flow',
        previewGradient: 'from-slate-900/30 to-slate-950/40'
      };
      const isFailed = j.status === 'failed';
      return {
        id: (j.journey || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: j.journey,
        status: isFailed ? 'failed' : 'passed',
        passingText: isFailed ? (j.error ? j.error.slice(0, 45) : 'Failed assertion') : 'Verified clean',
        type: meta.type,
        previewGradient: meta.previewGradient,
        waveform: isFailed
          ? 'M0,15 L30,15 L40,0 L50,29 L60,15 L120,15 L130,3 L140,27 L150,15 L200,15'
          : 'M0,15 Q25,5 50,15 T100,8 T150,18 T200,15',
        color: isFailed ? 'rose' : 'emerald',
        durationMs: j.durationMs
      };
    });
  } else {
    // Fallback if not yet run
    const defaultNames = ['User Login', 'Create Order', 'Payment Flow', 'View Orders'];
    journeys = defaultNames.map(name => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      status: isRegressed && name === 'Payment Flow' ? 'failed' : 'passed',
      passingText: isRegressed && name === 'Payment Flow' ? 'Webhook signature bypass' : 'Awaiting isolated run',
      type: JOURNEY_METADATA[name]?.type || 'Journey',
      previewGradient: JOURNEY_METADATA[name]?.previewGradient || 'from-slate-900/30 to-slate-950/40',
      waveform: 'M0,15 Q25,5 50,15 T100,8 T150,18 T200,15',
      color: isRegressed && name === 'Payment Flow' ? 'rose' : 'emerald'
    }));
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <span>Critical User Journeys</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-normal">
              {journeys.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real end-to-end user flows evaluated during each verification cycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddJourney}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-white transition shadow-sm font-mono"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Journey</span>
          </button>
        </div>
      </div>

      {/* Grid of Journeys */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {journeys.map((journey) => {
          const isFailed = journey.status === 'failed';
          return (
            <div
              key={journey.id}
              className={`p-4 rounded-3xl bg-[#0D121B] border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-lg ${
                isFailed
                  ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/20 to-[#0D121B]'
                  : 'border-white/[0.06] hover:border-amber-400/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold truncate">
                    {journey.type}
                  </span>
                  {isFailed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      <XCircle className="w-3 h-3" /> FAILED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> PASSED
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-tight group-hover:text-amber-200 transition">
                  {journey.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-mono">
                  {journey.passingText}
                </p>
              </div>

              {/* Mini Waveform visualization */}
              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <svg className="w-24 h-6 opacity-70" viewBox="0 0 200 30" fill="none">
                  <path
                    d={journey.waveform}
                    stroke={isFailed ? '#f43f5e' : '#10b981'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                {journey.durationMs && (
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    <span>{journey.durationMs}ms</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
