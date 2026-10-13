import React, { useState } from 'react';
import { X, Plus, Sparkles, CheckCircle2, Globe, Shield, Activity, Layers } from 'lucide-react';

export default function AddJourneyModal({ isOpen, onClose, onJourneyAdded }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [route, setRoute] = useState('/api/');
  const [method, setMethod] = useState('POST');
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [criticality, setCriticality] = useState('high');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !route.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3050/api/journeys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          route,
          method,
          expectedStatus: Number(expectedStatus),
          criticality
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create journey');
      }

      if (onJourneyAdded) {
        onJourneyAdded(data);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-xl organic-glass rounded-[36px] p-7 shadow-2xl border border-white/[0.08] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 bio-glow-cyan animate-breath">
              <Layers className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">No-Code Journey Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Synthetic Spec
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Define a critical invariant without writing Playwright or test code.
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

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Journey Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Magic Link Authentication or Team Invitation"
              required
              className="w-full py-2.5 px-4 rounded-2xl bg-black/50 border border-white/[0.08] focus:border-sky-500/60 focus:outline-none text-xs text-white placeholder-slate-500 font-sans shadow-inner"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                Target Route
              </label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="/api/invites"
                required
                className="w-full py-2.5 px-4 rounded-2xl bg-black/50 border border-white/[0.08] focus:border-sky-500/60 focus:outline-none text-xs text-white placeholder-slate-500 font-mono shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-black/50 border border-white/[0.08] text-xs text-white focus:outline-none font-mono"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                Expected HTTP Status
              </label>
              <select
                value={expectedStatus}
                onChange={(e) => setExpectedStatus(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-black/50 border border-white/[0.08] text-xs text-white focus:outline-none font-mono"
              >
                <option value={200}>200 OK</option>
                <option value={201}>201 Created</option>
                <option value={204}>204 No Content</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                Criticality Tier
              </label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-black/50 border border-white/[0.08] text-xs text-white focus:outline-none font-mono"
              >
                <option value="critical">Critical (Blocks Release)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 mt-2">
            <span className="font-bold text-sky-300">Invariant Compiler:</span> Buildgate will synthesize an isolated synthetic test in <code className="text-white font-mono">tests/journeys/</code> and execute it on every commit.
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold transition border border-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>{isSubmitting ? 'Compiling Spec...' : 'Generate & Add Journey'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
