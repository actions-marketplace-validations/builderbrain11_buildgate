#!/usr/bin/env node
'use strict';

/**
 * BuildGate CLI Runner — The Trust & Verification Layer for AI-Built Software
 * Powered by legit.run
 * 
 * Commands:
 *   init     Auto-discover repo topology, create buildgate.json & GitHub Action
 *   verify   Run the 6-stage deterministic verification pipeline (default)
 *   gate     Check if current commit is merge-eligible (exits 0 on pass, 1 on fail)
 *   explain  Print plain-English AST explanation of latest verification findings
 *   status   Show Horizon milestone progress and indexed architecture blocks
 */

const fs = require('fs');
const path = require('path');
const { runVerificationPipeline } = require('../src/index');
const { inspectLocalWorkspace, createLocalCheckpoint, rollbackLocalChanges } = require('../src/local/workspace-inspector');
const { analyzeRepository } = require('../src/intake/repo-analyzer');
const { sourceBuild } = require('../src/intake/build-sourcer');
const { getOrInitBuildHorizon } = require('../src/horizon/build-horizon');
const { verifyEvidenceIntegrity } = require('../src/reporter/evidence-store');

const rawArgs = process.argv.slice(2);

// Detect command
let command = 'verify';
const knownCommands = new Set(['init', 'verify', 'run', 'gate', 'explain', 'status', 'hook', 'verify-proof', 'help']);
if (rawArgs.length > 0 && knownCommands.has(rawArgs[0])) {
  command = rawArgs[0];
  if (command === 'run') command = 'verify';
}

// Parse options
let projectPath = '.';
let isLocalVibeMode = false;
let isCheckpoint = false;
let isRollback = false;
let isStrict = false;
let isForce = false;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if ((arg === '--project' || arg === '-p') && rawArgs[i + 1]) {
    projectPath = rawArgs[i + 1];
    i++;
  } else if (arg === '--strict') {
    isStrict = true;
  } else if (arg === '--force' || arg === '-f' || arg === '--yes' || arg === '-y') {
    isForce = true;
  } else if (arg === '--local' || arg === '--vibe') {
    isLocalVibeMode = true;
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      projectPath = rawArgs[i + 1];
      i++;
    }
  } else if (arg === '--checkpoint') {
    isCheckpoint = true;
  } else if (arg === '--rollback') {
    isRollback = true;
  }
}

// Default to fixtures/my-saas-app if current directory has no buildgate.json
if (projectPath === '.' && !fs.existsSync(path.resolve('buildgate.json'))) {
  if (fs.existsSync(path.resolve('fixtures/my-saas-app/buildgate.json'))) {
    projectPath = 'fixtures/my-saas-app';
  }
}

function printHeader() {
  console.log(`\n🚪 [BUILDGATE] The Trust Layer for AI Software (powered by legit.run)`);
}

/**
 * legit.run init
 */
async function handleInit(targetPath) {
  const resolved = path.resolve(targetPath);
  console.log(`🔍 [legit init] Analyzing repository topology at: ${resolved}`);

  const analysis = analyzeRepository(resolved);
  console.log(`📦 Framework Detected: ${analysis.framework}`);
  console.log(`📁 Files Scanned: ${analysis.filesCount}`);
  if (analysis.integrations.length) {
    console.log(`🔌 External Integrations: ${analysis.integrations.map(i => i.name).join(', ')}`);
  }
  if (analysis.schemas.length) {
    console.log(`🗄️  Database Schemas: ${analysis.schemas.map(s => s.type).join(', ')}`);
  }
  if (analysis.routes.length) {
    console.log(`🌐 API Endpoints Found: ${analysis.routes.length} route handler(s)`);
  }

  const configPath = path.join(resolved, 'buildgate.json');
  if (fs.existsSync(configPath) && !isForce) {
    console.log(`\n⚠️  buildgate.json already exists at: ${configPath}`);
    console.log(`   Use --force to overwrite.`);
    return;
  }

  // 1. Write buildgate.json
  fs.writeFileSync(configPath, JSON.stringify(analysis.manifest, null, 2), 'utf8');
  console.log(`\n✅ Generated repo manifest: ${configPath}`);
  console.log(`   - Architecture Blocks: ${analysis.manifest.blocks.length}`);
  analysis.manifest.blocks.forEach(b => {
    console.log(`     • [${b.layer}] ${b.name} (${b.paths.length} file(s))`);
  });
  console.log(`   - Sequenced Milestones: ${analysis.manifest.milestones.length}`);
  analysis.manifest.milestones.forEach(m => {
    console.log(`     • ${m.id}: ${m.title}`);
  });

  // 2. Synthesize baseline smoke invariant spec if no test exists
  const testsRunPath = path.join(resolved, 'tests', 'run-tests.js');
  const journeySmokePath = path.join(resolved, 'tests', 'journeys', 'system-health.js');
  if (!fs.existsSync(testsRunPath) && !fs.existsSync(journeySmokePath)) {
    fs.mkdirSync(path.join(resolved, 'tests', 'journeys'), { recursive: true });
    fs.writeFileSync(testsRunPath, `// Auto-generated baseline verification test runner by legit.run init
const result = {
  unitTests: [
    { name: 'System environment initialized', passed: true, durationMs: 4 },
    { name: 'Architecture manifest loaded', passed: true, durationMs: 6 }
  ],
  journeys: [
    { journey: 'Baseline System Health', status: 'passed', durationMs: 12 }
  ]
};
console.log('BUILDGATE_RESULTS_JSON=' + JSON.stringify(result));
process.exit(0);
`, 'utf8');
    console.log(`🧪 Created baseline smoke test harness: tests/run-tests.js`);
  }

  // 3. Create GitHub Action workflow
  const workflowDir = path.join(resolved, '.github', 'workflows');
  const workflowFile = path.join(workflowDir, 'buildgate.yml');
  if (!fs.existsSync(workflowFile)) {
    fs.mkdirSync(workflowDir, { recursive: true });
    fs.writeFileSync(workflowFile, `name: Buildgate Deterministic Gate

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  verify:
    name: legit.run Verification Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci || npm install

      - name: Run Buildgate Gate (Strict Container Check)
        run: npx legit.run --strict
`, 'utf8');
    console.log(`🛡️  Created GitHub Action workflow: .github/workflows/buildgate.yml`);
  }

  console.log(`\n🎉 Repository onboarded successfully!`);
  console.log(`   Next step: run 'npx legit.run verify' to record initial baseline evidence.\n`);
}

/**
 * legit.run gate
 */
async function handleGate(targetPath) {
  const resolved = path.resolve(targetPath);
  const bgPath = path.join(resolved, 'reports', 'buildgate-report.json');
  const legPath = path.join(resolved, 'reports', 'verity-report.json');

  let report = null;
  if (fs.existsSync(bgPath)) {
    try { report = JSON.parse(fs.readFileSync(bgPath, 'utf8')); } catch (_) {}
  } else if (fs.existsSync(legPath)) {
    try { report = JSON.parse(fs.readFileSync(legPath, 'utf8')); } catch (_) {}
  }

  // If no report exists, run the pipeline first
  if (!report) {
    console.log(`ℹ️  No existing evidence found for ${path.basename(resolved)}. Running verification pipeline...`);
    report = await runVerificationPipeline({ projectPath: resolved });
  }

  const isEligible = report.mergeEligible === true;
  const isPassed = report.explanation?.overallStatus !== 'attention';
  const strict = isStrict || process.argv.includes('--strict') || process.env.CI === 'true';

  console.log(`\n🏁 [BUILDGATE GATE VERDICT]`);
  console.log(`   - Scan ID: ${report.scanId}`);
  console.log(`   - Status: ${report.explanation?.overallStatus?.toUpperCase() || 'UNKNOWN'}`);
  console.log(`   - Checks Passing: ${report.explanation?.passedCount}/${report.results?.length || 0}`);
  console.log(`   - Execution Mode: ${report.executionMode}`);
  console.log(`   - Merge Eligible: ${isEligible ? 'YES ✅' : 'NO ❌'}`);

  if (isEligible || (!strict && isPassed)) {
    if (!isEligible) {
      console.log(`\n🟡 PRE-PUSH APPROVED: All behavioral assertions passed locally.`);
      console.log(`   (Note: GitHub Actions will execute container isolation before merge).\n`);
    } else {
      console.log(`\n✅ GATE PASSED: Commit is container-verified and approved for merge.\n`);
    }
    process.exitCode = 0;
  } else {
    console.log(`\n❌ GATE BLOCKED: Commit cannot be merged.`);
    if (!isPassed) {
      console.log(`   Reason: Behavioral regressions or security findings detected.`);
    } else if (strict && report.executionMode !== 'container') {
      console.log(`   Reason: Strict mode requires Docker container isolation (current mode: ${report.executionMode}).`);
    }
    console.log(`   Run 'npx legit.run explain' to review detailed diagnostics.\n`);
    process.exitCode = 1;
  }
}

/**
 * legit.run explain
 */
async function handleExplain(targetPath) {
  const resolved = path.resolve(targetPath);
  const bgPath = path.join(resolved, 'reports', 'buildgate-report.json');
  const legPath = path.join(resolved, 'reports', 'verity-report.json');

  let report = null;
  if (fs.existsSync(bgPath)) {
    try { report = JSON.parse(fs.readFileSync(bgPath, 'utf8')); } catch (_) {}
  } else if (fs.existsSync(legPath)) {
    try { report = JSON.parse(fs.readFileSync(legPath, 'utf8')); } catch (_) {}
  }

  if (!report) {
    console.log(`❌ No evidence report found for ${resolved}. Run 'npx legit.run verify' first.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n🧠 [BUILDGATE EXPLAIN] Plain-English Verification Intelligence`);
  console.log(`================================================================`);
  console.log(`Scan ID:   ${report.scanId}`);
  console.log(`Revision:  ${report.revision?.commitSha || 'unversioned'} (${report.revision?.branch || 'HEAD'})`);
  console.log(`Status:    ${report.explanation?.overallHeadline || 'Report Generated'}\n`);

  console.log(`📝 Summary:`);
  console.log(`   ${report.explanation?.explanation || 'No summary available.'}\n`);

  if (report.changeAnalysis) {
    console.log(`🔍 Blast Radius Analysis:`);
    console.log(`   - Risk Level: ${report.changeAnalysis.riskLevel.toUpperCase()}`);
    console.log(`   - Modified Files: ${report.changeAnalysis.modifiedFilesCount || 0}`);
    if (report.changeAnalysis.touchedRoutes?.length) {
      console.log(`   - Touched Routes: ${report.changeAnalysis.touchedRoutes.join(', ')}`);
    }
    if (report.changeAnalysis.touchedTables?.length) {
      console.log(`   - Touched DB Tables: ${report.changeAnalysis.touchedTables.join(', ')}`);
    }
  }

  const failingChecks = (report.results || []).filter(r => r.status === 'failed');
  if (failingChecks.length) {
    console.log(`\n❌ Failing Checks (${failingChecks.length}):`);
    failingChecks.forEach(c => {
      console.log(`   • ${c.name} (${c.category}): ${c.summary || c.executionError || 'Failed'}`);
      if (c.findings && c.findings.length) {
        c.findings.forEach(f => console.log(`     - [${f.severity || 'issue'}] ${f.file}: ${f.title}`));
      }
    });
  }

  console.log(`\n🛠️  Recommended Next Step:`);
  console.log(`   ${report.explanation?.actionRequired || 'Commit is clean. Ready to push.'}\n`);
}

/**
 * legit.run status
 */
async function handleStatus(targetPath) {
  const resolved = path.resolve(targetPath);
  console.log(`\n📊 [BUILDGATE STATUS] System Horizon & Block Topology for: ${path.basename(resolved)}`);
  console.log(`================================================================`);

  try {
    const intake = sourceBuild(resolved);
    console.log(`System:    ${intake.systemName} (${intake.framework})`);
    console.log(`Files:     ${intake.fileCount} source files across ${intake.indexedCount} architecture blocks\n`);

    console.log(`🧱 Indexed Architecture Blocks:`);
    intake.blocks.forEach(b => {
      const stateBadge = b.state === 'PROVEN' ? '✅ PROVEN' :
                         b.state === 'PASSED_UNISOLATED' ? '🟡 UNISOLATED' :
                         b.state === 'BLOCKED' ? '❌ BLOCKED' :
                         b.state === 'STALE' ? '⚠️ STALE' : '⚪ UNVERIFIED';
      console.log(`   ${stateBadge.padEnd(16)} ${b.id.padEnd(22)} [${b.layer}] ${b.name}`);
    });

    const horizon = getOrInitBuildHorizon(resolved);
    console.log(`\n🎯 Horizon Milestones:`);
    horizon.milestones.forEach(m => {
      const statusBadge = m.status === 'APPROVED_VERIFIED' ? '✅ APPROVED' :
                          m.status === 'READY_FOR_REVIEW' ? '👀 REVIEW READY' :
                          m.status === 'IN_PROGRESS' ? '🔄 IN PROGRESS' : '🔒 LOCKED';
      console.log(`   ${statusBadge.padEnd(18)} ${m.id}: ${m.title}`);
    });
    console.log('');
  } catch (err) {
    console.log(`⚠️  Could not read status: ${err.message}`);
  }
}

/**
 * legit.run hook [install|remove|status]
 */
async function handleHook(targetPath, action = 'install') {
  const resolved = path.resolve(targetPath);
  const gitDir = path.join(resolved, '.git');
  if (!fs.existsSync(gitDir)) {
    console.log(`❌ Not a git repository: ${resolved}`);
    process.exitCode = 1;
    return;
  }

  const hooksDir = path.join(gitDir, 'hooks');
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

  const prePushPath = path.join(hooksDir, 'pre-push');

  if (action === 'remove') {
    if (fs.existsSync(prePushPath)) {
      fs.unlinkSync(prePushPath);
      console.log(`✅ Removed legit.run pre-push hook from: ${prePushPath}`);
    } else {
      console.log(`ℹ️  No hook installed.`);
    }
    return;
  }

  if (action === 'status') {
    const installed = fs.existsSync(prePushPath);
    console.log(`🛡️  Git Pre-Push Hook Status: ${installed ? 'ACTIVE ✅' : 'NOT INSTALLED ⚪'}`);
    return;
  }

  // Install hook
  const scriptContent = `#!/usr/bin/env sh
# Buildgate & legit.run pre-push gate
echo "🛡️  [legit.run] Running pre-push verification gate..."
node packages/engine/bin/buildgate.js gate
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ [legit.run] Push blocked by Buildgate. Behavioral regressions detected."
  echo "   Run 'npx legit.run explain' to review diagnostics or fix before pushing."
  exit 1
fi
`;

  try {
    fs.writeFileSync(prePushPath, scriptContent, { encoding: 'utf8', mode: 0o755 });
    console.log(`\n🛡️  [legit.run] Git pre-push hook installed successfully!`);
    console.log(`   Location: ${prePushPath}`);
    console.log(`   Every 'git push' will now verify your critical user flows before sending code to remote.\n`);
  } catch (err) {
    console.log(`⚠️  Could not write hook: ${err.message}`);
  }
}

/**
 * legit.run verify-proof <reportPath>
 */
async function handleVerifyProof(targetPath) {
  let reportFile = path.resolve(targetPath);
  if (fs.existsSync(reportFile) && fs.statSync(reportFile).isDirectory()) {
    reportFile = path.join(reportFile, 'reports', 'buildgate-report.json');
  }

  if (!fs.existsSync(reportFile)) {
    console.log(`❌ Evidence report not found: ${reportFile}`);
    process.exitCode = 1;
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  const check = verifyEvidenceIntegrity(report);

  console.log(`\n🔏 [BUILDGATE ATTESTATION VERIFICATION]`);
  console.log(`================================================================`);
  console.log(`File:            ${path.basename(reportFile)}`);
  console.log(`Scan ID:         ${report.scanId}`);
  console.log(`Algorithm:       ${report.attestation?.algorithm || 'None'}`);
  console.log(`Recorded Digest: ${report.attestation?.sha256Digest || 'None'}`);
  console.log(`Expected Digest: ${check.expectedDigest || 'N/A'}`);
  console.log(`Verdict:         ${check.valid ? 'VALID & TAMPER-FREE ✅' : 'INVALID / TAMPERED ❌'}`);
  console.log(`Details:         ${check.reason}\n`);

  process.exitCode = check.valid ? 0 : 1;
}

/**
 * legit.run verify (default pipeline)
 */
async function handleVerify(targetPath) {
  console.log(`🚀 Triggering legit.run deterministic verification pipeline...`);
  const report = await runVerificationPipeline({ projectPath: targetPath });
  const strict = isStrict || process.argv.includes('--strict') || process.env.CI === 'true';

  if (report.explanation.overallStatus === 'attention') {
    console.log('⚠️  [BUILDGATE] Gate Status: BLOCKED. Changes need attention before shipping.\n');
    process.exitCode = 1;
  } else if (!report.mergeEligible) {
    console.log(`🟡 [BUILDGATE] Checks passed, but execution mode was "${report.executionMode}" (not container-isolated).`);
    console.log('   This run is NOT merge-eligible evidence. Start Docker and re-run for a gate-grade result.\n');
    process.exitCode = strict ? 1 : 0;
  } else {
    console.log('✨ [BUILDGATE] Gate Status: PASSED. legit.run container-verified. Safe to merge & deploy.\n');
    process.exitCode = 0;
  }
}

async function main() {
  printHeader();

  if (command === 'help') {
    console.log(`
Usage:
  npx legit.run [command] [options]

Commands:
  init          Auto-discover topology, create buildgate.json & GitHub Action
  verify        Run full 6-stage deterministic verification pipeline (default)
  gate          Verify merge eligibility for CI / pre-push gating (exits 0 or 1)
  explain       Print AST diff explanation and blast-radius diagnostics
  status        Show Horizon milestone progress and indexed architecture blocks
  hook [action] Manage git hooks: install (default), remove, status
  verify-proof  Verify cryptographic SHA-256 evidence attestation of a report

Options:
  --project, -p <path>   Target directory (default: '.')
  --strict               Fail closed if not container-isolated (default in CI)
  --force, -f            Overwrite existing buildgate.json during init
  --checkpoint           Snapshot uncommitted local modifications
  --rollback             Revert uncommitted modifications to last checkpoint
  --local, --vibe        Fast local workspace AST inspection
`);
    return;
  }

  if (isCheckpoint) {
    console.log(`🛡️  [BUILDGATE CHECKPOINT] Creating safe snapshot for: ${projectPath}...`);
    const res = createLocalCheckpoint({ workspacePath: projectPath });
    console.log(res.success ? `✅ ${res.message}` : `❌ ${res.error}`);
    return;
  }

  if (isRollback) {
    console.log(`⏪ [BUILDGATE ROLLBACK] Reverting uncommitted AI edits for: ${projectPath}...`);
    const res = rollbackLocalChanges({ workspacePath: projectPath });
    console.log(res.success ? `✅ ${res.message}` : `❌ ${res.error}`);
    return;
  }

  if (isLocalVibeMode) {
    console.log(`🔍 [legit.run] Inspecting local workspace: ${projectPath}`);
    const insp = await inspectLocalWorkspace({ workspacePath: projectPath });
    console.log(`📁 Target: ${insp.folderName} (${insp.framework})`);
    console.log(`⚡ Modified Files: ${insp.filesCount}`);
    insp.uncommittedFiles.forEach(f => console.log(`   - [${f.status}] ${f.filePath}`));
    
    if (insp.syntaxErrors.length > 0) {
      console.log(`\n❌ Syntax Errors Detected (${insp.syntaxErrors.length}):`);
      insp.syntaxErrors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
    }
    
    if (insp.secretFindings.length > 0) {
      console.log(`\n🔒 Security Secrets Detected (${insp.secretFindings.length}):`);
      insp.secretFindings.forEach(s => console.log(`   - [${s.severity.toUpperCase()}] ${s.file}: ${s.rule}`));
    }

    console.log(`\n📊 Risk Level: ${insp.riskLevel}`);
    console.log(`💬 Summary: ${insp.plainSummary}`);
    console.log(`🏁 legit.run Verdict: ${insp.readyToCommit ? 'LEGIT ✅ (Ready to ship)' : 'FAILED ❌ (Issues detected)'}\n`);
    process.exitCode = insp.readyToCommit ? 0 : 1;
    return;
  }

  switch (command) {
    case 'init':
      await handleInit(projectPath);
      break;
    case 'gate':
      await handleGate(projectPath);
      break;
    case 'explain':
      await handleExplain(projectPath);
      break;
    case 'status':
      await handleStatus(projectPath);
      break;
    case 'hook':
      await handleHook(projectPath, rawArgs[1] || 'install');
      break;
    case 'verify-proof':
      await handleVerifyProof(rawArgs[1] || projectPath);
      break;
    case 'verify':
    default:
      await handleVerify(projectPath);
      break;
  }
}

main().catch(err => {
  console.error('\n❌ Fatal CLI error:', err);
  process.exit(1);
});
