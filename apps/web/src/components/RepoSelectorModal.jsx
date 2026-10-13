import React, { useState } from 'react';
import { X, GitBranch, Github, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Key, Lock, RefreshCw } from 'lucide-react';

export default function RepoSelectorModal({ 
  isOpen, 
  onClose, 
  currentRepo, 
  onSelectRepo 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('connect'); // 'connect' or 'scenarios'
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const scenarios = [
    {
      id: 'my-saas-app',
      name: 'my-saas-app',
      stack: ['Next.js 14', 'TypeScript', 'Supabase', 'Stripe'],
      headline: 'Stripe Webhook Bug & Order Mutation Regression',
      risk: 'High Risk',
      status: 'Active Scenario',
      description: 'AI coding agent added webhook endpoint but commented out database status mutation and bypassed HMAC verification.'
    },
    {
      id: 'ai-copilot-crm',
      name: 'ai-copilot-crm',
      stack: ['Vite', 'React', 'OpenAI API', 'Supabase RLS'],
      headline: 'Live OpenAI Secret Leak & Broken Tenant Isolation',
      risk: 'Critical Risk',
      status: 'Available',
      description: 'AI hardcoded live API secret key into client bundle and disabled Row Level Security on customers table.'
    },
    {
      id: 'auth-flow-nextjs',
      name: 'auth-flow-nextjs',
      stack: ['Next.js App Router', 'TypeScript', 'NextAuth'],
      headline: 'Middleware Auth Bypass & Unprotected API Route',
      risk: 'High Risk',
      status: 'Available',
      description: 'AI refactored middleware matcher pattern, leaving /api/admin/users exposed without session token validation.'
    }
  ];

  const handleConnectRepo = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3050/api/repo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze repository');
      }

      onSelectRepo(data.repo);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-2xl organic-glass rounded-[36px] p-7 shadow-2xl border border-white/[0.08] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 bio-glow-cyan">
              <Github className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Repository Workspace</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Live Connect
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connect your actual GitHub repo or switch between interactive sandboxes.
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/[0.06] mb-6">
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'connect'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Connect Your GitHub Repository
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'scenarios'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Choose Preloaded AI Sandboxes (3)
          </button>
        </div>

        {/* Tab 1: Connect Custom Repo */}
        {activeTab === 'connect' && (
          <div className="space-y-4">
            <form onSubmit={handleConnectRepo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/your-username/your-app"
                    required
                    className="w-full py-3.5 pl-4 pr-12 rounded-2xl bg-black/50 border border-white/[0.08] focus:border-sky-500/60 focus:outline-none text-xs text-white placeholder-slate-500 font-mono shadow-inner"
                  />
                  <Github className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Paste any public GitHub repository created with Lovable, Cursor, Bolt, or Claude Code.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Repository Structure & AST...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    <span>Connect & Run Live Verification</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-400">
              <span className="font-bold text-slate-200">How It Works:</span> Buildgate queries the GitHub API to discover project framework, routes, package dependencies, and executes isolated baseline checks with legit.run.
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Sandbox Scenarios */}
        {activeTab === 'scenarios' && (
          <div className="space-y-3">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => {
                  onSelectRepo({
                    name: sc.name,
                    fullName: `founder/${sc.name}`,
                    framework: sc.stack.join(', '),
                    language: 'TypeScript'
                  });
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  currentRepo?.name === sc.name
                    ? 'bg-sky-500/10 border-sky-500/40 bio-glow-cyan'
                    : 'bg-black/30 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{sc.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300">
                      {sc.stack.join(' · ')}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    sc.risk === 'Critical Risk' ? 'bg-rose-500/20 text-rose-300' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {sc.risk}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 mb-1">{sc.headline}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{sc.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end pt-4 mt-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold transition border border-white/[0.08]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
