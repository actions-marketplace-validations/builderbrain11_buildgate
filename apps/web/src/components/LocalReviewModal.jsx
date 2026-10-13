import React, { useState, useEffect } from 'react';
import { 
  X, Laptop, ShieldCheck, AlertTriangle, ShieldAlert, 
  FolderGit2, CheckCircle2, RefreshCw, BookmarkCheck, RotateCcw, 
  Play, FileCode, Lock, Terminal, Sparkles
} from 'lucide-react';

const API_BASE = 'http://localhost:3050';

export default function LocalReviewModal({ isOpen, onClose, onRunFullScan }) {
  const [workspacePath, setWorkspacePath] = useState('fixtures/my-saas-app');
  const [loading, setLoading] = useState(false);
  const [inspection, setInspection] = useState(null);
  const [checkpointStatus, setCheckpointStatus] = useState(null);
  const [rollbackStatus, setRollbackStatus] = useState(null);
  const [suggestedDirs, setSuggestedDirs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE}/api/local/recent-dirs`)
        .then(r => r.json())
        .then(data => {
          if (data.directories) setSuggestedDirs(data.directories);
        })
        .catch(() => {});

      runInspection('fixtures/my-saas-app');
    }
  }, [isOpen]);

  const runInspection = async (pathToCheck = workspacePath) => {
    setLoading(true);
    setCheckpointStatus(null);
    setRollbackStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/local/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath: pathToCheck })
      });
      const data = await res.json();
      setInspection(data);
    } catch (err) {
      console.error('Local inspect error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckpoint = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/local/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, message: 'Prior to AI Prompt' })
      });
      const data = await res.json();
      setCheckpointStatus(data.message || (data.success ? 'Checkpoint created!' : data.error));
      setTimeout(() => setCheckpointStatus(null), 5000);
    } catch (err) {
      setCheckpointStatus('Failed to create checkpoint');
    }
  };

  const handleRollback = async () => {
    if (!window.confirm('Are you sure you want to revert uncommitted local AI edits to last safe checkpoint?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/local/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      const data = await res.json();
      setRollbackStatus(data.message || (data.success ? 'Rollback complete' : data.error));
      runInspection();
      setTimeout(() => setRollbackStatus(null), 5000);
    } catch (err) {
      setRollbackStatus('Rollback failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[32px] organic-glass border border-white/10 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Bioluminescent Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-lg shadow-sky-950/40">
              <Laptop className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono">
                  BuildGate Local Guard · legit.run
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Vibe-Coding Sentinel Active
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Review Local Workspace Edits (Cursor / Claude Code)
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 relative z-10 text-xs">
          {/* Target Directory Selector */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-sky-400" />
                <span>Target Local Codebase Path:</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-500 font-mono">Quick Pick:</span>
                {suggestedDirs.map((dir, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setWorkspacePath(dir.path);
                      runInspection(dir.path);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] font-mono text-[10px] transition"
                  >
                    {dir.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workspacePath}
                onChange={(e) => setWorkspacePath(e.target.value)}
                placeholder="e.g. fixtures/my-saas-app or d:/projects/my-vibecoded-app"
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-sky-500/50"
              />
              <button
                onClick={() => runInspection()}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold transition shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Scan Local Edits</span>
              </button>
            </div>
          </div>

          {/* Inspection Results */}
          {inspection && (
            <div className="space-y-5">
              {/* Top Status Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Local Workspace</span>
                  <div className="text-sm font-black text-white mt-1 truncate">{inspection.folderName}</div>
                  <span className="text-[10px] text-slate-500">{inspection.framework}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Uncommitted Files</span>
                  <div className="text-sm font-black text-sky-400 mt-1">{inspection.filesCount} file(s)</div>
                  <span className="text-[10px] text-slate-500">Live AI Edits</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Syntax & AST</span>
                  <div className={`text-sm font-black mt-1 ${inspection.syntaxErrors.length === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {inspection.syntaxErrors.length === 0 ? 'Clean (0 Errors)' : `${inspection.syntaxErrors.length} Syntax Error(s)`}
                  </div>
                  <span className="text-[10px] text-slate-500">JavaScript / TS AST</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Secret Leaks</span>
                  <div className={`text-sm font-black mt-1 ${inspection.secretFindings.length === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {inspection.secretFindings.length === 0 ? 'Zero Exposed' : `${inspection.secretFindings.length} Leak(s)`}
                  </div>
                  <span className="text-[10px] text-slate-500">Stripe, OpenAI, Env</span>
                </div>
              </div>

              {/* Plain English Vibe-Coder Assessment Banner */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                inspection.riskLevel === 'High Risk'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}>
                {inspection.riskLevel === 'High Risk' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-extrabold text-sm mb-1 flex items-center gap-2">
                    <span>{inspection.riskLevel}: {inspection.readyToCommit ? 'Safe to Commit / Continue' : 'Issues Must Be Resolved'}</span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed font-sans">{inspection.plainSummary}</p>
                </div>
              </div>

              {/* Modified Files Detail Table */}
              <div className="rounded-2xl bg-black/40 border border-white/[0.08] overflow-hidden">
                <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                    Uncommitted AI Edits in Local Working Tree ({inspection.uncommittedFiles.length})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Status: [M]odified, [?]ntracked</span>
                </div>

                <div className="max-h-52 overflow-y-auto divide-y divide-white/[0.04]">
                  {inspection.uncommittedFiles.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 font-mono">
                      No uncommitted changes in this directory. Working directory is clean!
                    </div>
                  ) : (
                    inspection.uncommittedFiles.map((file, idx) => (
                      <div key={idx} className="px-4 py-2 flex items-center justify-between hover:bg-white/[0.02] font-mono text-[11px]">
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-bold text-[10px]">
                            {file.status}
                          </span>
                          <span className="text-slate-300 truncate">{file.filePath}</span>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">touched by AI</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Feedback Toasts */}
              {checkpointStatus && (
                <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center gap-2 font-mono text-[11px]">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>{checkpointStatus}</span>
                </div>
              )}
              {rollbackStatus && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-2 font-mono text-[11px]">
                  <RotateCcw className="w-4 h-4" />
                  <span>{rollbackStatus}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-white/[0.08] bg-black/40 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateCheckpoint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] font-bold text-xs transition"
              title="Tag working tree before your next Cursor/Claude prompt"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Take Safe Checkpoint</span>
            </button>

            <button
              onClick={handleRollback}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 font-bold text-xs transition"
              title="Undo AI hallucination and restore clean state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Revert AI Edits</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onRunFullScan();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs transition shadow-lg shadow-sky-500/25"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Full Deterministic Pipeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
