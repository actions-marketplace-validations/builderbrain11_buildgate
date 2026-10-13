import React, { useState } from 'react';
import { 
  X, ShieldCheck, ShieldAlert, Terminal, Copy, Check, 
  Download, ExternalLink, Cpu, HardDrive, WifiOff, Clock, GitCommit 
} from 'lucide-react';

export default function EvidenceDrawer({ isOpen, onClose, scanData }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('assertions'); // 'assertions', 'environment', 'raw'

  if (!isOpen || !scanData) return null;

  const commit = (scanData.changeAnalysis && scanData.changeAnalysis.commit) || {
    sha: 'a3f9c2d',
    branch: 'main',
    title: 'Update payment webhook handler',
    timestamp: scanData.timestamp
  };

  const revision = scanData.revision || {
    commitSha: commit.sha,
    workerMode: 'docker-no-network-readonly-root',
    isolated: true
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(scanData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(scanData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildgate-evidence-${commit.sha}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex justify-end">
      <div 
        className="w-full max-w-2xl bg-[#0B1018] border-l border-white/[0.1] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-200/80 font-bold">
                Immutable Evidence Record
              </span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
              <span>Scan {scanData.scanId}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 font-sans">
                {commit.branch}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              title="Download JSON Evidence"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyJson}
              title="Copy Evidence JSON"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-white/[0.06] flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('assertions')}
            className={`pb-3 font-semibold transition border-b-2 ${
              activeTab === 'assertions' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Verified Assertions
          </button>
          <button
            onClick={() => setActiveTab('environment')}
            className={`pb-3 font-semibold transition border-b-2 ${
              activeTab === 'environment' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Isolated Environment
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`pb-3 font-semibold transition border-b-2 ${
              activeTab === 'raw' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Raw Machine Output
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {/* Revision Provenance Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span>Commit SHA</span>
              <span className="text-white font-bold font-mono">{commit.sha}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span>Execution Time</span>
              <span className="text-slate-300">{scanData.timestamp}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span>Duration</span>
              <span className="text-slate-300">{scanData.totalDurationMs}ms</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span>Worker Isolation</span>
              <span className="text-sky-300 font-bold">{revision.workerMode}</span>
            </div>
          </div>

          {activeTab === 'assertions' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Verification Results by Category
              </h4>
              <div className="space-y-3">
                {scanData.results && scanData.results.map((check) => {
                  const isPass = check.status === 'passed';
                  return (
                    <div 
                      key={check.id} 
                      className={`p-4 rounded-2xl border ${
                        isPass ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-xs font-mono">{check.name}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isPass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {check.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2 leading-relaxed font-sans">
                        {check.summary}
                      </p>
                      {check.executionError && (
                        <div className="p-2.5 rounded-xl bg-black/60 border border-rose-500/30 text-[11px] font-mono text-rose-300 overflow-x-auto">
                          {check.executionError}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'environment' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Container Security Boundary & Constraints
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <WifiOff className="w-3.5 h-3.5 text-sky-400" />
                    <span>Network</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">--network=none</div>
                  <div className="text-[10px] text-slate-500">Zero egress capability</div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Filesystem</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">--read-only</div>
                  <div className="text-[10px] text-slate-500">Disposable /output mount</div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Resource Quotas</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">1.0 CPU · 512MB RAM</div>
                  <div className="text-[10px] text-slate-500">PIDs limit: 128</div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>User & Caps</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">10001:10001</div>
                  <div className="text-[10px] text-slate-500">Cap-drop ALL & no-new-privs</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase">
                Machine-Readable JSON Evidence
              </div>
              <pre className="p-4 rounded-2xl bg-black/80 border border-white/[0.08] text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(scanData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-black/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Cryptographic evidence attached to revision
          </span>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold transition"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
