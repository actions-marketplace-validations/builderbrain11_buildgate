import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import LatestChangeHero from './components/LatestChangeHero';
import BuildvibeAICopilot from './components/BuildvibeAICopilot';
import CriticalJourneys from './components/CriticalJourneys';
import RecentActivity from './components/RecentActivity';
import AppMapModal from './components/AppMapModal';
import DeployReadinessModal from './components/DeployReadinessModal';
import AnalysisDetailModal from './components/AnalysisDetailModal';
import RemediationFixModal from './components/RemediationFixModal';
import AddJourneyModal from './components/AddJourneyModal';
import LandingPage from './components/LandingPage';
import RepoSelectorModal from './components/RepoSelectorModal';
import LiveCodePlaygroundModal from './components/LiveCodePlaygroundModal';
import LocalReviewModal from './components/LocalReviewModal';
import TerminalDrawer from './components/TerminalDrawer';
import LivingSystemCanvas from './components/LivingSystemCanvas';
import EvidenceDrawer from './components/EvidenceDrawer';
import BuildHorizonView from './components/BuildHorizonView';
import BuildvibeEnvironment from './components/BuildvibeEnvironment';
import { Globe, ArrowLeft, Network, Compass, Sparkles } from 'lucide-react';

const API_BASE = 'http://localhost:3050';

export default function App() {
  const [currentTab, setCurrentTab] = useState('systems');
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#app') {
      return 'app';
    }
    return 'landing';
  });

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#app') setViewMode('app');
      else if (window.location.hash === '#landing') setViewMode('landing');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [isRegressed, setIsRegressed] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(2);
  const [customJourneys, setCustomJourneys] = useState([]);
  const [currentRepo, setCurrentRepo] = useState({
    name: 'my-saas-app',
    fullName: 'founder/my-saas-app',
    framework: 'Next.js 14, TypeScript, Supabase, Stripe',
    language: 'TypeScript'
  });

  // Modal states
  const [isAppMapOpen, setIsAppMapOpen] = useState(false);
  const [isDeployReadinessOpen, setIsDeployReadinessOpen] = useState(false);
  const [isAnalysisDetailOpen, setIsAnalysisDetailOpen] = useState(false);
  const [isRemediationOpen, setIsRemediationOpen] = useState(false);
  const [isAddJourneyOpen, setIsAddJourneyOpen] = useState(false);
  const [isRepoSelectorOpen, setIsRepoSelectorOpen] = useState(false);
  const [isCodePlaygroundOpen, setIsCodePlaygroundOpen] = useState(false);
  const [isLocalReviewOpen, setIsLocalReviewOpen] = useState(false);
  const [latestScan, setLatestScan] = useState(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  // Poll or fetch latest report on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/scan/latest`)
      .then(r => r.json())
      .then(data => {
        setLatestScan(data);
        if (data.explanation) {
          setIsRegressed(data.explanation.overallStatus === 'attention');
        }
      })
      .catch(() => {});
  }, []);

  // Real Server-Sent Events (SSE) Execution
  const handleRunScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setActiveStageIndex(0);

    try {
      const eventSource = new EventSource(`${API_BASE}/api/scan/stream`);

      eventSource.addEventListener('stage', (e) => {
        const data = JSON.parse(e.data);
        setActiveStageIndex(data.index);
      });

      eventSource.addEventListener('complete', (e) => {
        const data = JSON.parse(e.data);
        setIsScanning(false);
        setActiveStageIndex(5);
        setLatestScan(data);
        if (data.explanation) {
          setIsRegressed(data.explanation.overallStatus === 'attention');
        }
        eventSource.close();
      });

      eventSource.addEventListener('error', () => {
        setIsScanning(false);
        setActiveStageIndex(5);
        eventSource.close();
      });
    } catch (err) {
      setIsScanning(false);
    }
  };

  const handleApplyFix = async () => {
    try {
      await fetch(`${API_BASE}/api/remediate`, { method: 'POST' });
      setIsRegressed(false);
      handleRunScan();
    } catch (err) {
      setIsRegressed(false);
      handleRunScan();
    }
  };

  const handleToggleRegression = async () => {
    const nextState = !isRegressed;
    setIsRegressed(nextState);
    try {
      const endpoint = nextState ? `${API_BASE}/api/demo/break` : `${API_BASE}/api/demo/restore`;
      await fetch(endpoint, { method: 'POST' });
    } catch (err) {
      console.warn('Mode toggle offline fallback:', err);
    }
    handleRunScan();
  };

  const handleJourneyAdded = (journeyData) => {
    setCustomJourneys(prev => [...prev, journeyData]);
    handleRunScan();
  };

  const handleApplyCustomCode = (verifyResult) => {
    setIsRegressed(verifyResult.status === 'attention');
    handleRunScan();
  };

  // If in Public Landing mode
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onLaunchDemo={() => {
          window.location.hash = '#app';
          setViewMode('app');
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#080B0F] text-slate-100 font-sans selection:bg-indigo-500/30 relative pb-12">
      {/* Floating Pill to switch to Public Landing View */}
      <div className="fixed bottom-12 right-6 z-50">
        <button
          onClick={() => {
            window.location.hash = '#landing';
            setViewMode('landing');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] backdrop-blur-xl text-white text-xs font-bold transition shadow-2xl"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>View Public Landing Page</span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAppMap={() => setIsAppMapOpen(true)}
        openDeployReadiness={() => setIsDeployReadinessOpen(true)}
        openLocalReview={() => setIsLocalReviewOpen(true)}
        openEvidenceDrawer={() => setIsEvidenceDrawerOpen(true)}
        onGoLanding={() => {
          window.location.hash = '#landing';
          setViewMode('landing');
        }}
        latestScan={latestScan}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Sticky Top Header */}
        <Header
          isScanning={isScanning}
          activeStageIndex={activeStageIndex}
          onRunScan={handleRunScan}
          isRegressed={isRegressed}
          onToggleRegression={handleToggleRegression}
          currentRepo={currentRepo}
          onOpenRepoSelector={() => setIsRepoSelectorOpen(true)}
          onOpenCodePlayground={() => setIsCodePlaygroundOpen(true)}
          onOpenLocalReview={() => setIsLocalReviewOpen(true)}
        />

        {/* Dashboard Canvas */}
        <main className="p-8 max-w-[1700px] w-full mx-auto">
          {/* Project Title & Stack Ribbon */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                  Project Workspace
                </span>
                <button
                  onClick={() => setIsRepoSelectorOpen(true)}
                  className="text-[10px] text-sky-400 font-bold hover:underline font-mono"
                >
                  (Switch Repository)
                </button>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mt-0.5 flex items-center gap-3">
                <span>{currentRepo.name}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                AI-built. Continuously verified by legit.run isolated workers.
              </p>
            </div>

            {/* Tech Stack Pills with Organic Bevels */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Next.js
              </span>
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]"></span>
                TypeScript
              </span>
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                Supabase
              </span>
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]"></span>
                Stripe
              </span>
            </div>
            {/* View Mode Switcher Pills */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/[0.08] shadow-inner">
              <button
                onClick={() => setCurrentTab('systems')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  currentTab === 'systems'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>01 Systems</span>
              </button>

              <button
                onClick={() => setCurrentTab('horizon')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  currentTab === 'horizon'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>02 Horizon</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-slate-900 font-extrabold">Active</span>
              </button>

              <button
                onClick={() => setCurrentTab('buildvibe')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  currentTab === 'buildvibe'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>03 Buildvibe</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-slate-900 font-extrabold">Spatial</span>
              </button>
            </div>
          </div>

          {/* Conditional View Rendering */}
          {currentTab === 'horizon' ? (
            <BuildHorizonView
              onOpenEvidenceDrawer={() => setIsEvidenceDrawerOpen(true)}
            />
          ) : currentTab === 'buildvibe' ? (
            <BuildvibeEnvironment
              onRunScan={handleRunScan}
              onOpenRemediation={() => setIsRemediationOpen(true)}
              onOpenEvidenceDrawer={() => setIsEvidenceDrawerOpen(true)}
              isRegressed={isRegressed}
            />
          ) : (
            <>
              {/* Living Architectural System Canvas (The Gate for Systems) */}
              <div className="mb-6">
                <LivingSystemCanvas
                  latestScan={latestScan}
                  isRegressed={isRegressed}
                  onSelectComponent={() => {}}
                  onOpenEvidence={() => setIsEvidenceDrawerOpen(true)}
                />
              </div>

              {/* 4 Metric Cards */}
              <MetricCards latestScan={latestScan} isRegressed={isRegressed} />

              {/* Main 2-Column Grid: Center Stage + Buildvibe Partner */}
              <div className="flex flex-col xl:flex-row gap-6 mb-6 items-start">
                {/* Center Stage: Latest Change Hero + Critical Journeys */}
                <div className="flex-1 w-full min-w-0">
                  <LatestChangeHero
                    isRegressed={isRegressed}
                    onAskBuildgateToFix={() => setIsRemediationOpen(true)}
                    onViewDetails={() => setIsAnalysisDetailOpen(true)}
                    onOpenCodePlayground={() => setIsCodePlaygroundOpen(true)}
                  />

                  {/* Critical Features Journeys Grid */}
                  <CriticalJourneys
                    latestScan={latestScan}
                    isRegressed={isRegressed}
                    onAddJourney={() => setIsAddJourneyOpen(true)}
                    onManageJourneys={() => setIsAddJourneyOpen(true)}
                  />

                  {/* Recent Activity Feed */}
                  <RecentActivity latestScan={latestScan} isRegressed={isRegressed} />
                </div>

                {/* Right Column: Buildvibe AI Copilot Panel */}
                <BuildvibeAICopilot
                  latestScan={latestScan}
                  isRegressed={isRegressed}
                  onProposeFix={() => setIsRemediationOpen(true)}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Collapsible Live Worker Terminal Drawer */}
      <TerminalDrawer
        isScanning={isScanning}
        isRegressed={isRegressed}
      />

      {/* Modals */}
      <RepoSelectorModal
        isOpen={isRepoSelectorOpen}
        onClose={() => setIsRepoSelectorOpen(false)}
        currentRepo={currentRepo}
        onSelectRepo={(newRepo) => {
          setCurrentRepo(newRepo);
          handleRunScan();
        }}
      />

      <LiveCodePlaygroundModal
        isOpen={isCodePlaygroundOpen}
        onClose={() => setIsCodePlaygroundOpen(false)}
        onApplyCodeToSandbox={handleApplyCustomCode}
      />

      <LocalReviewModal
        isOpen={isLocalReviewOpen}
        onClose={() => setIsLocalReviewOpen(false)}
        onRunFullScan={handleRunScan}
      />

      <AppMapModal
        isOpen={isAppMapOpen}
        onClose={() => setIsAppMapOpen(false)}
      />

      <DeployReadinessModal
        isOpen={isDeployReadinessOpen}
        onClose={() => setIsDeployReadinessOpen(false)}
        isRegressed={isRegressed}
      />

      <AnalysisDetailModal
        isOpen={isAnalysisDetailOpen}
        onClose={() => setIsAnalysisDetailOpen(false)}
        isRegressed={isRegressed}
        onApplyFix={() => setIsRemediationOpen(true)}
      />

      <RemediationFixModal
        isOpen={isRemediationOpen}
        onClose={() => setIsRemediationOpen(false)}
        onConfirmFix={handleApplyFix}
      />

      <AddJourneyModal
        isOpen={isAddJourneyOpen}
        onClose={() => setIsAddJourneyOpen(false)}
        onJourneyAdded={handleJourneyAdded}
      />

      {/* Immutable Revision Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        scanData={latestScan}
      />
    </div>
  );
}
