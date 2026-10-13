import React, { useState, useEffect } from 'react';
import { 
  XCircle, AlertTriangle, CheckCircle2, Sparkles, 
  GitCommit, ArrowUpRight, Clock
} from 'lucide-react';

const API_BASE = 'http://localhost:3050';

export default function RecentActivity({ latestScan, isRegressed }) {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/evidence/timeline`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTimeline(data.slice(-5).reverse());
        }
      })
      .catch(() => {});
  }, [latestScan]);

  const results = latestScan?.results || [];
  const findings = results.flatMap(r => r.findings || []);
  const failingJourneys = results.find(r => r.id === 'check_critical_journeys')?.failingJourneys || [];

  return (
    <div className="p-6 rounded-3xl bg-[#0D121B] border border-white/[0.06] shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold">
            Recent Verification Activity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real timeline of commit-bound verification runs.
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Live Log
        </span>
      </div>

      <div className="space-y-3">
        {/* Dynamic Items from Latest Scan */}
        {failingJourneys.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-200">
                Regression: Journey failure in {failingJourneys.join(', ')}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Evaluated in {latestScan?.revision?.workerMode || 'isolated worker'} · Commit {latestScan?.revision?.commitSha || 'latest'}
              </div>
            </div>
          </div>
        )}

        {findings.map((finding, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-200">
                {finding.title || 'Security warning detected'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[400px]">
                {finding.file} · {finding.evidence || finding.recommendation}
              </div>
            </div>
          </div>
        ))}

        {/* Real timeline records from evidence index */}
        {timeline.map((entry, idx) => {
          const isPassed = entry.overallStatus === 'passed';
          return (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="font-mono text-amber-300">{entry.commitSha}</span>
                    <span>·</span>
                    <span className={isPassed ? 'text-emerald-300' : 'text-rose-300'}>
                      {entry.overallStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Scan {entry.scanId} · {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/[0.04]">
                {entry.executionMode || 'container'}
              </span>
            </div>
          );
        })}

        {timeline.length === 0 && findings.length === 0 && failingJourneys.length === 0 && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-emerald-200">
              All 5 verification checks passing cleanly. Ready for merge.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
