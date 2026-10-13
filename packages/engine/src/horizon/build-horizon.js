'use strict';

const fs = require('fs');
const path = require('path');
const { runVerificationPipeline } = require('../index');
const { sourceBuild, STATES } = require('../intake/build-sourcer');

/**
 * Derives initial milestone definitions dynamically from buildgate.json or blocks.
 * Never invents fake reviews, fake signatures, or fake passes.
 */
function deriveMilestones(gateArch) {
  if (Array.isArray(gateArch.milestonesConfig) && gateArch.milestonesConfig.length > 0) {
    return gateArch.milestonesConfig.map((m, idx) => ({
      id: m.id || `milestone-${idx + 1}`,
      sequence: idx + 1,
      title: m.title || `Milestone ${idx + 1}`,
      layer: m.layer || 'System Layer',
      description: m.description || `Milestone covering blocks: ${(m.blocks || []).join(', ')}`,
      blocks: m.blocks || [],
      status: 'PENDING_REVIEW',
      authorReview: null,
      verificationCheck: null
    }));
  }

  // Fallback if no milestones configured: derive one milestone per distinct layer
  const layers = Array.from(new Set(gateArch.blocks.map(b => b.layer)));
  return layers.map((layer, idx) => {
    const layerBlocks = gateArch.blocks.filter(b => b.layer === layer).map(b => b.id);
    return {
      id: `milestone-${idx + 1}`,
      sequence: idx + 1,
      title: `${layer} Stability`,
      layer,
      description: `Verify and review integrity of ${layerBlocks.join(', ')}`,
      blocks: layerBlocks,
      status: 'PENDING_REVIEW',
      authorReview: null,
      verificationCheck: null
    };
  });
}

/**
 * Dynamically computes Grounded Truth, Gaps, and Future Horizon
 * from real block states and real milestone progress. Zero slop.
 */
function computeGroundedTruth(gateArch, milestones) {
  const provenBlocks = gateArch.blocks.filter(b => b.state === STATES.PROVEN);
  const unisolatedBlocks = gateArch.blocks.filter(b => b.state === STATES.PASSED_UNISOLATED);
  const blockedBlocks = gateArch.blocks.filter(b => b.state === STATES.BLOCKED);
  const unverifiedBlocks = gateArch.blocks.filter(b => b.state === STATES.UNVERIFIED || b.state === STATES.MISSING);

  const provenCapabilities = provenBlocks.map(b =>
    `${b.name} (${b.path}): Verified in container sandbox via ${b.verifiedBy.join(', ')}`
  );

  if (unisolatedBlocks.length > 0) {
    provenCapabilities.push(
      `[Dev Mode] ${unisolatedBlocks.length} block(s) passed on host-fallback; container isolation required for gate seal.`
    );
  }

  const currentGaps = [];
  blockedBlocks.forEach(b => {
    currentGaps.push(`BLOCKED: ${b.name} (${b.path}) - ${b.reason || 'Check failed'}`);
  });
  unverifiedBlocks.forEach(b => {
    currentGaps.push(`UNVERIFIED: ${b.name} (${b.path}) - ${b.reason || 'No passing tests'}`);
  });
  if (gateArch.unmappedFiles && gateArch.unmappedFiles.length > 0) {
    currentGaps.push(`${gateArch.unmappedFiles.length} source file(s) not yet mapped into any architectural block.`);
  }

  const futureHorizon = milestones
    .filter(m => m.status !== 'APPROVED_VERIFIED')
    .map(m => `Milestone ${m.sequence}: ${m.title} (${m.blocks.join(', ')})`);

  return {
    provenCapabilities: provenCapabilities.length ? provenCapabilities : ['No blocks verified yet. Run verification.'],
    currentGaps: currentGaps.length ? currentGaps : ['No active verification gaps detected.'],
    futureHorizon: futureHorizon.length ? futureHorizon : ['All configured milestones completed and verified.']
  };
}

/**
 * Initializes or re-evaluates the Build Horizon model.
 */
function getOrInitBuildHorizon(projectPath) {
  const reportsDir = path.join(projectPath, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const gateArch = sourceBuild(projectPath);
  const horizonPath = path.join(reportsDir, 'build-horizon.json');

  let existing = null;
  if (fs.existsSync(horizonPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(horizonPath, 'utf8'));
    } catch (_) {}
  }

  let milestones;
  if (existing && Array.isArray(existing.milestones) && existing.milestones.length > 0) {
    // Reconcile existing milestones with latest block evaluations
    milestones = existing.milestones.map(m => {
      const milestoneBlocks = gateArch.blocks.filter(b => (m.blocks || []).includes(b.id));
      const allProven = milestoneBlocks.length > 0 && milestoneBlocks.every(b => b.state === STATES.PROVEN);
      const anyBlocked = milestoneBlocks.some(b => b.state === STATES.BLOCKED);

      let status = m.status;
      if (anyBlocked) {
        status = 'CHANGES_REQUESTED';
      } else if (status === 'APPROVED_VERIFIED' && !allProven) {
        // Regressed! Files changed or check no longer passes
        status = 'IN_VERIFICATION';
      }

      return {
        ...m,
        status: status || 'PENDING_REVIEW'
      };
    });
  } else {
    milestones = deriveMilestones(gateArch);
  }

  // Active milestone is the first non-completed milestone
  const activeMilestone = milestones.find(m => m.status !== 'APPROVED_VERIFIED') || milestones[milestones.length - 1];

  const horizon = {
    systemName: gateArch.systemName,
    framework: gateArch.framework,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visionStatement: gateArch.vision || 'Continuous evidence-bound verification for AI-built software.',
    currentHorizonPhase: activeMilestone ? `Phase ${activeMilestone.sequence} · ${activeMilestone.title}` : 'All Milestones Completed',
    evidenceBasePointId: existing?.evidenceBasePointId || null,
    activeMilestoneId: activeMilestone?.id || milestones[0]?.id,
    milestones,
    groundedTruth: computeGroundedTruth(gateArch, milestones),
    gateArchitecture: gateArch
  };

  fs.writeFileSync(horizonPath, JSON.stringify(horizon, null, 2), 'utf8');
  return horizon;
}

/**
 * Executes legit.run verification and stores Event 1 as the Evidence Base Point.
 */
async function initializeEvent1BasePoint(projectPath) {
  const reportsDir = path.join(projectPath, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const verificationResult = await runVerificationPipeline({ projectPath });
  const basePointPath = path.join(reportsDir, 'evidence-base.json');
  const basePointData = {
    eventId: 'event-1-base',
    eventName: 'Event 1: Sourced Midway Build Baseline',
    timestamp: new Date().toISOString(),
    scanId: verificationResult.scanId,
    commitSha: verificationResult.revision?.commitSha || 'unversioned',
    executionMode: verificationResult.executionMode,
    mergeEligible: verificationResult.mergeEligible,
    status: verificationResult.explanation.overallStatus,
    headline: verificationResult.explanation.overallHeadline,
    verification: verificationResult
  };

  fs.writeFileSync(basePointPath, JSON.stringify(basePointData, null, 2), 'utf8');

  const horizon = getOrInitBuildHorizon(projectPath);
  horizon.evidenceBasePointId = 'event-1-base';
  horizon.updatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(reportsDir, 'build-horizon.json'), JSON.stringify(horizon, null, 2), 'utf8');

  return basePointData;
}

/**
 * Records Author Review on a specific milestone with strict sequencing enforcement.
 */
function recordAuthorReview(projectPath, milestoneId, { author = '', decision = 'APPROVED', notes = '' }) {
  if (!author || typeof author !== 'string' || !author.trim()) {
    throw new Error('Author review requires an explicit author name or reviewer identifier.');
  }

  const reportsDir = path.join(projectPath, 'reports');
  const horizonPath = path.join(reportsDir, 'build-horizon.json');
  const horizon = getOrInitBuildHorizon(projectPath);

  const milestoneIndex = horizon.milestones.findIndex(m => m.id === milestoneId);
  if (milestoneIndex === -1) {
    throw new Error(`Milestone not found: ${milestoneId}`);
  }

  // Sequencing Enforcement: prior milestones must be approved & verified
  for (let i = 0; i < milestoneIndex; i++) {
    if (horizon.milestones[i].status !== 'APPROVED_VERIFIED') {
      throw new Error(`Cannot review ${milestoneId}: Prior milestone "${horizon.milestones[i].title}" must be APPROVED_VERIFIED first.`);
    }
  }

  const milestone = horizon.milestones[milestoneIndex];
  milestone.authorReview = {
    author: author.trim(),
    decision,
    signedAt: new Date().toISOString(),
    notes: notes ? notes.trim() : `Milestone review recorded by ${author.trim()}`
  };

  if (decision === 'APPROVED') {
    milestone.status = 'IN_VERIFICATION';
  } else {
    milestone.status = 'CHANGES_REQUESTED';
  }

  horizon.updatedAt = new Date().toISOString();
  fs.writeFileSync(horizonPath, JSON.stringify(horizon, null, 2), 'utf8');
  return horizon;
}

/**
 * Verifies and seals a milestone using legit.run verification checks.
 * Scoped to the actual blocks and checks belonging to this milestone.
 */
async function verifyAndFinishMilestone(projectPath, milestoneId) {
  const reportsDir = path.join(projectPath, 'reports');
  const horizonPath = path.join(reportsDir, 'build-horizon.json');
  const horizon = getOrInitBuildHorizon(projectPath);

  const milestoneIndex = horizon.milestones.findIndex(m => m.id === milestoneId);
  if (milestoneIndex === -1) {
    throw new Error(`Milestone not found: ${milestoneId}`);
  }

  // Sequencing check
  for (let i = 0; i < milestoneIndex; i++) {
    if (horizon.milestones[i].status !== 'APPROVED_VERIFIED') {
      throw new Error(`Cannot verify ${milestoneId}: Prior milestone "${horizon.milestones[i].title}" is not yet approved and verified.`);
    }
  }

  const milestone = horizon.milestones[milestoneIndex];

  // Run real verification pipeline
  const verificationResult = await runVerificationPipeline({ projectPath });
  const updatedArch = sourceBuild(projectPath);

  // Scoped evaluation: check the blocks of this milestone
  const milestoneBlocks = updatedArch.blocks.filter(b => (milestone.blocks || []).includes(b.id));
  const hasBlocked = milestoneBlocks.some(b => b.state === STATES.BLOCKED);
  const allProven = milestoneBlocks.length > 0 && milestoneBlocks.every(b => b.state === STATES.PROVEN);
  const unisolated = milestoneBlocks.some(b => b.state === STATES.PASSED_UNISOLATED);

  const isPass = !hasBlocked && (allProven || (unisolated && verificationResult.explanation.overallStatus === 'passed'));

  milestone.verificationCheck = {
    status: isPass ? (allProven ? 'passed' : 'warning') : 'failed',
    evidenceId: `evidence-${milestoneId}-${Date.now().toString(36)}`,
    checksPassed: `${verificationResult.explanation.passedCount}/${verificationResult.explanation.totalCount}`,
    executionMode: verificationResult.executionMode,
    summary: allProven
      ? `All ${milestoneBlocks.length} block(s) verified clean inside isolated container.`
      : unisolated
      ? `Checks passed under host-fallback. Docker container execution required for merge-grade seal.`
      : `Verification detected regressions in milestone blocks: ${milestoneBlocks.filter(b => b.state === STATES.BLOCKED).map(b => b.name).join(', ')}`
  };

  if (allProven && milestone.authorReview?.decision === 'APPROVED') {
    milestone.status = 'APPROVED_VERIFIED';

    if (milestoneIndex < horizon.milestones.length - 1) {
      const nextMilestone = horizon.milestones[milestoneIndex + 1];
      horizon.activeMilestoneId = nextMilestone.id;
      horizon.currentHorizonPhase = `Phase ${nextMilestone.sequence} · ${nextMilestone.title}`;
    } else {
      horizon.currentHorizonPhase = 'System Launch Horizon Reached';
    }
  } else if (unisolated && milestone.authorReview?.decision === 'APPROVED') {
    milestone.status = 'PASSED_UNISOLATED';
  } else if (hasBlocked) {
    milestone.status = 'CHANGES_REQUESTED';
  }

  horizon.gateArchitecture = updatedArch;
  horizon.groundedTruth = computeGroundedTruth(updatedArch, horizon.milestones);
  horizon.updatedAt = new Date().toISOString();
  fs.writeFileSync(horizonPath, JSON.stringify(horizon, null, 2), 'utf8');

  return {
    horizon,
    verificationResult
  };
}

module.exports = {
  getOrInitBuildHorizon,
  initializeEvent1BasePoint,
  recordAuthorReview,
  verifyAndFinishMilestone
};
