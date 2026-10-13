// Buildgate & legit.run Deterministic Verification Engine Core
const path = require('path');
const { execSync } = require('child_process');
const { runBuildCheck } = require('./checks/build-check');
const { runTestCheck } = require('./checks/test-check');
const { runJourneyCheck } = require('./checks/journey-check');
const { runSecurityCheck } = require('./checks/security-check');
const { runDependencyCheck } = require('./checks/dependency-check');
const { analyzeChange } = require('./analysis/diff-analyzer');
const { generatePlainEnglishExplanation } = require('./analysis/explainer');
const { saveVerificationEvidence } = require('./reporter/evidence-store');

function resolveGitMetadata(projectPath) {
  try {
    const sha = execSync('git rev-parse HEAD', { cwd: projectPath, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().slice(0, 7);
    const fullSha = execSync('git rev-parse HEAD', { cwd: projectPath, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const status = execSync('git status --porcelain', { cwd: projectPath, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    return {
      sha,
      fullSha,
      branch: branch || 'main',
      isDirty: status.length > 0,
      modifiedFiles: status ? status.split('\n').filter(Boolean).length : 0
    };
  } catch (_) {
    // Not a git repository (or git unavailable). Never invent a SHA.
    return {
      sha: 'unversioned',
      fullSha: null,
      branch: null,
      isDirty: null,
      modifiedFiles: 0
    };
  }
}

async function runVerificationPipeline(options = {}) {
  const projectPath = options.projectPath 
    ? path.resolve(options.projectPath) 
    : path.resolve(process.cwd(), 'fixtures/my-saas-app');

  const scanId = `scan-${Date.now().toString(36)}`;
  const startTime = Date.now();
  const gitMeta = resolveGitMetadata(projectPath);

  console.log(`\n🛡️  [BUILDGATE] Initializing Verification Pipeline for: ${path.basename(projectPath)}`);
  console.log(`⏱️  Scan ID: ${scanId} | Commit: ${gitMeta.sha} (${gitMeta.branch}) | Timestamp: ${new Date().toISOString()}`);

  // 1. Change and Blast Radius Analysis
  console.log('🔍 [1/6] Analyzing Git diff, touched routes, and blast radius...');
  const changeAnalysis = analyzeChange(projectPath);
  changeAnalysis.commit = {
    sha: gitMeta.sha,
    fullSha: gitMeta.fullSha,
    branch: gitMeta.branch,
    isDirty: gitMeta.isDirty,
    author: 'buildgate-sentinel',
    title: gitMeta.isDirty ? `Modified ${gitMeta.modifiedFiles} local file(s)` : 'Clean verified system revision',
    timestamp: new Date().toISOString()
  };

  // 2. Build & Type Integrity Check
  console.log('⚙️  [2/6] Running Build & Type Integrity Checks...');
  const buildResult = await runBuildCheck(projectPath);

  // 3. Unit Tests
  console.log('🧪 [3/6] Running Unit & Component Test Suite...');
  const testResult = await runTestCheck(projectPath);

  // 4. Critical User Journeys
  console.log('🚀 [4/6] Executing Critical Synthetic User Journeys...');
  const journeyResult = await runJourneyCheck(projectPath, testResult);

  // 5. Security & Secret Scanning
  console.log('🔒 [5/6] Performing High-Entropy Secret & Webhook Security Scan...');
  const securityResult = await runSecurityCheck(projectPath);

  // 6. Dependency Audit
  console.log('📦 [6/6] Auditing Package Dependencies and Lockfiles...');
  const depResult = await runDependencyCheck(projectPath);

  const results = [
    buildResult,
    testResult,
    journeyResult,
    securityResult,
    depResult
  ];

  const totalDurationMs = Date.now() - startTime;

  // Synthesis & Plain-English explanation
  const explanation = generatePlainEnglishExplanation({
    scanId,
    results,
    changeAnalysis
  });

  const isolated = testResult.isolatedExecution === true;
  const executionMode = isolated
    ? 'container'
    : (testResult.isolation === 'host-development-fallback' ? 'host-fallback' : 'not-executed');

  let projectName = path.basename(projectPath);
  try { projectName = require(path.join(projectPath, 'package.json')).name || projectName; } catch (_) {}

  const verificationData = {
    scanId,
    timestamp: new Date().toISOString(),
    projectPath,
    projectName,
    totalDurationMs,
    executionMode,
    // The gate only opens on zero failures (passed or non-blocking warnings) that ran inside the container sandbox.
    mergeEligible: explanation.overallStatus !== 'attention' && isolated,
    revision: {
      commitSha: gitMeta.sha,
      fullCommitSha: gitMeta.fullSha,
      branch: gitMeta.branch,
      isDirty: gitMeta.isDirty,
      workerMode: testResult.isolation || 'not-executed',
      isolated
    },
    changeAnalysis,
    results,
    explanation
  };

  // Persist Evidence
  const { jsonPath, mdPath } = saveVerificationEvidence(projectPath, verificationData);

  console.log('\n======================================================');
  console.log(`📊 [BUILDGATE REPORT] Status: ${explanation.overallHeadline.toUpperCase()}`);
  console.log(`📋 Checks Passing: ${explanation.passedCount}/${results.length}`);
  if (explanation.failingCount > 0) {
    console.log(`❌ Regressions Detected: ${explanation.failingCount} check(s) failed`);
  }
  console.log(`📝 Evidence Saved:`);
  console.log(`   - JSON: ${jsonPath}`);
  console.log(`   - Markdown: ${mdPath}`);
  console.log('======================================================\n');

  return verificationData;
}

module.exports = { runVerificationPipeline };
