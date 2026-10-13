'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Block states. Nothing is PROVEN unless a check that maps to it passed
 * inside the container sandbox, against files that haven't changed since.
 */
const STATES = {
  PROVEN: 'PROVEN',                       // all mapped checks passed, container-isolated, files unchanged since
  PASSED_UNISOLATED: 'PASSED_UNISOLATED', // passed, but on host fallback: not gate-grade
  BLOCKED: 'BLOCKED',                     // at least one mapped check failed / finding in its files
  STALE: 'STALE',                         // files changed after the last verification
  UNVERIFIED: 'UNVERIFIED',               // no covering check, or checks never ran / not found
  MISSING: 'MISSING'                      // config points at files that don't exist (config drift)
};

const SOURCE_EXT = /\.(js|jsx|ts|tsx|mjs|cjs)$/;
const IGNORE_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'reports', '.buildgate_snapshots', 'coverage']);

function git(cmd, cwd) {
  return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
}

function readGitProvenance(projectPath) {
  try {
    const status = git('git status --porcelain', projectPath);
    return {
      commitSha: git('git rev-parse --short HEAD', projectPath),
      fullSha: git('git rev-parse HEAD', projectPath),
      branch: git('git rev-parse --abbrev-ref HEAD', projectPath),
      isDirty: status.length > 0,
      modifiedFiles: status ? status.split('\n').filter(Boolean).map(l => l.trim()) : []
    };
  } catch (_) {
    return { commitSha: 'unversioned', fullSha: null, branch: null, isDirty: null, modifiedFiles: [] };
  }
}

function walk(root, base = root, out = []) {
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else if (SOURCE_EXT.test(entry.name)) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function loadConfig(projectPath) {
  const configPath = path.join(projectPath, 'buildgate.json');
  if (!fs.existsSync(configPath)) return null;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!Array.isArray(config.blocks)) throw new Error('buildgate.json: "blocks" must be an array');
  const ids = new Set();
  for (const b of config.blocks) {
    if (!b.id || !Array.isArray(b.paths) || b.paths.length === 0) throw new Error(`buildgate.json: block "${b.id || '?'}" needs an id and at least one path`);
    if (ids.has(b.id)) throw new Error(`buildgate.json: duplicate block id "${b.id}"`);
    ids.add(b.id);
  }
  for (const b of config.blocks) {
    for (const dep of b.dependsOn || []) {
      if (!ids.has(dep)) throw new Error(`buildgate.json: block "${b.id}" depends on unknown block "${dep}"`);
    }
  }
  return config;
}

function loadLatestReport(projectPath) {
  const bgPath = path.join(projectPath, 'reports', 'buildgate-report.json');
  if (fs.existsSync(bgPath)) {
    try { return JSON.parse(fs.readFileSync(bgPath, 'utf8')); } catch (_) {}
  }
  const reportPath = path.join(projectPath, 'reports', 'verity-report.json');
  if (!fs.existsSync(reportPath)) return null;
  try { return JSON.parse(fs.readFileSync(reportPath, 'utf8')); } catch (_) { return null; }
}

function executionModeOf(report) {
  if (!report) return 'none';
  if (report.executionMode) return report.executionMode;
  // Reports written before executionMode existed: derive from the unit test check.
  const unit = (report.results || []).find(r => r.id === 'check_unit_tests');
  if (!unit || unit.isolation === undefined) return 'not-executed';
  if (unit.isolation === 'host-development-fallback') return 'host-fallback';
  return unit.isolatedExecution ? 'container' : 'not-executed';
}

function evaluateSelector(selector, block, report) {
  const results = report.results || [];
  const [kind, ...rest] = selector.split(':');
  const arg = rest.join(':').trim();

  if (kind === 'journey') {
    const check = results.find(r => r.id === 'check_critical_journeys');
    if (!check || !Array.isArray(check.journeys) || check.journeys.length === 0) return { selector, result: 'not-executed' };
    const j = check.journeys.find(x => x.journey === arg);
    if (!j) return { selector, result: 'not-found' };
    return { selector, result: j.status === 'passed' ? 'passed' : 'failed' };
  }

  if (kind === 'unit') {
    const check = results.find(r => r.id === 'check_unit_tests');
    if (!check || !Array.isArray(check.tests) || check.tests.length === 0) return { selector, result: 'not-executed' };
    const matched = check.tests.filter(t => (t.name || '').startsWith(arg));
    if (matched.length === 0) return { selector, result: 'not-found' };
    const failed = matched.filter(t => !t.passed).length;
    return { selector, result: failed ? 'failed' : 'passed', detail: `${matched.length - failed}/${matched.length}` };
  }

  if (kind === 'security') {
    const check = results.find(r => r.category === 'security');
    if (!check) return { selector, result: 'not-executed' };
    const hits = (check.findings || []).filter(f => block.paths.includes(f.file));
    return hits.length
      ? { selector, result: 'failed', detail: hits.map(h => h.title).join('; ') }
      : { selector, result: 'passed' };
  }

  return { selector, result: 'not-found', detail: `Unknown selector kind "${kind}"` };
}

function evaluateBlock(block, projectPath, report) {
  const base = {
    id: block.id,
    name: block.name || block.id,
    layer: block.layer || 'Unspecified',
    paths: block.paths,
    path: block.paths[0],
    dependencies: block.dependsOn || [],
    verifiedBy: block.verifiedBy || [],
    inferred: Boolean(block.inferred),
    evidence: []
  };

  const missing = block.paths.filter(p => !fs.existsSync(path.join(projectPath, p)));
  if (missing.length) return { ...base, state: STATES.MISSING, reason: `Configured path(s) not found: ${missing.join(', ')}` };

  if (base.verifiedBy.length === 0) return { ...base, state: STATES.UNVERIFIED, reason: 'No check is mapped to this block.' };
  if (!report) return { ...base, state: STATES.UNVERIFIED, reason: 'No verification run recorded yet.' };

  const reportTime = Date.parse(report.timestamp);
  const changed = block.paths.filter(p => fs.statSync(path.join(projectPath, p)).mtimeMs > reportTime + 1000);

  const evidence = base.verifiedBy.map(sel => evaluateSelector(sel, block, report));
  const out = { ...base, evidence, verifiedAt: report.timestamp, verifiedCommit: report.revision && report.revision.commitSha };

  if (changed.length) return { ...out, state: STATES.STALE, reason: `Changed after last verification: ${changed.join(', ')}` };
  if (evidence.some(e => e.result === 'failed')) {
    return { ...out, state: STATES.BLOCKED, reason: evidence.filter(e => e.result === 'failed').map(e => e.detail ? `${e.selector} (${e.detail})` : e.selector).join(', ') + ' failed' };
  }
  const gaps = evidence.filter(e => e.result !== 'passed');
  if (gaps.length) return { ...out, state: STATES.UNVERIFIED, reason: gaps.map(e => `${e.selector}: ${e.result}`).join(', ') };

  return executionModeOf(report) === 'container'
    ? { ...out, state: STATES.PROVEN, reason: 'All mapped checks passed in the container sandbox.' }
    : { ...out, state: STATES.PASSED_UNISOLATED, reason: `All mapped checks passed, but execution mode was "${executionModeOf(report)}". Not gate-grade.` };
}

/**
 * Sources an in-progress build: real files, real git state, blocks from buildgate.json,
 * and block state computed from the latest evidence on disk.
 */
function sourceBuild(projectPath) {
  const resolvedPath = path.resolve(projectPath);
  if (!fs.existsSync(resolvedPath)) throw new Error(`Project directory does not exist: ${resolvedPath}`);

  let pkg = {};
  try { pkg = JSON.parse(fs.readFileSync(path.join(resolvedPath, 'package.json'), 'utf8')); } catch (_) {}
  const dependencies = Object.keys(pkg.dependencies || {});

  const config = loadConfig(resolvedPath);
  const report = loadLatestReport(resolvedPath);
  const defaultRoots = ['src', 'app', 'pages', 'lib', 'bin'].filter(d => fs.existsSync(path.join(resolvedPath, d)));
  const sourceRoots = (config && config.sourceRoots) || (defaultRoots.length ? defaultRoots : ['.']);
  const sourceFiles = sourceRoots.flatMap(r => walk(path.join(resolvedPath, r), resolvedPath));

  let blockDefs;
  if (config) {
    blockDefs = config.blocks;
  } else {
    // No config: propose one block per top-level source folder, clearly marked inferred and unverified.
    const groups = {};
    for (const f of sourceFiles) {
      const parts = f.split('/');
      const key = parts.length > 2 ? parts.slice(0, 2).join('/') : parts[0];
      (groups[key] = groups[key] || []).push(f);
    }
    blockDefs = Object.entries(groups).map(([key, files]) => ({
      id: key.replace(/[^a-zA-Z0-9]+/g, '-'), name: key, layer: 'Inferred', paths: files, dependsOn: [], verifiedBy: [], inferred: true
    }));
  }

  const blocks = blockDefs.map(b => evaluateBlock(b, resolvedPath, report));
  const mapped = new Set(blocks.flatMap(b => b.paths));
  const unmappedFiles = sourceFiles.filter(f => !mapped.has(f));
  const count = (s) => blocks.filter(b => b.state === s).length;

  return {
    systemName: (config && config.system) || pkg.name || path.basename(resolvedPath),
    vision: (config && config.vision) || null,
    configured: Boolean(config),
    framework: dependencies.includes('next') ? 'Next.js' : (dependencies.includes('express') ? 'Express' : 'Node.js'),
    intakeTimestamp: new Date().toISOString(),
    gitProvenance: readGitProvenance(resolvedPath),
    latestEvidence: report ? {
      scanId: report.scanId,
      timestamp: report.timestamp,
      commitSha: report.revision && report.revision.commitSha,
      executionMode: executionModeOf(report),
      overallStatus: report.explanation && report.explanation.overallStatus
    } : null,
    fileCount: sourceFiles.length,
    dependenciesCount: dependencies.length,
    dependencies,
    scripts: pkg.scripts || {},
    blocks,
    unmappedFiles,
    milestonesConfig: (config && config.milestones) || [],
    indexedCount: blocks.length,
    provenCount: count(STATES.PROVEN),
    unisolatedCount: count(STATES.PASSED_UNISOLATED),
    blockedCount: count(STATES.BLOCKED),
    staleCount: count(STATES.STALE),
    unverifiedCount: count(STATES.UNVERIFIED),
    missingCount: count(STATES.MISSING)
  };
}

module.exports = { sourceBuild, STATES, loadConfig };
