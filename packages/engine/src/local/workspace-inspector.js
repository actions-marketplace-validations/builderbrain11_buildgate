// Local Workspace Inspector for Vibe-Coded Projects
// Deterministically inspects local uncommitted codebases (Cursor, Claude Code, Windsurf, Aider)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// High-entropy regex patterns for secret detection
const SECRET_PATTERNS = [
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/, severity: 'critical' },
  { name: 'Stripe Restricted Key', regex: /rk_live_[0-9a-zA-Z]{24,}/, severity: 'critical' },
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{32,}/, severity: 'critical' },
  { name: 'GitHub Personal Access Token', regex: /ghp_[0-9a-zA-Z]{36}/, severity: 'critical' },
  { name: 'Supabase Service Role Key', regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[0-9a-zA-Z_-]{50,}/, severity: 'critical' },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/, severity: 'critical' },
  { name: 'Generic Private Key', regex: /-----BEGIN PRIVATE KEY-----/, severity: 'critical' }
];

function assertSafeWorkspacePath(targetPath) {
  if (!targetPath || typeof targetPath !== 'string') {
    throw new Error('Workspace path is required.');
  }
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Directory does not exist: ${resolved}`);
  }
  const stat = fs.statSync(resolved);
  if (!stat.isDirectory()) {
    throw new Error(`Path is not a directory: ${resolved}`);
  }
  const rootDir = path.parse(resolved).root;
  if (resolved === rootDir || resolved.toLowerCase().includes('windows\\system32')) {
    throw new Error('Access to system root or sensitive system directory is forbidden.');
  }
  return resolved;
}

/**
 * Inspect a local workspace directory
 * @param {Object} options
 * @param {string} options.workspacePath - Local directory path to inspect
 * @returns {Promise<Object>} Detailed local inspection result
 */
async function inspectLocalWorkspace({ workspacePath }) {
  const resolvedPath = assertSafeWorkspacePath(workspacePath);

  const isGitRepo = fs.existsSync(path.join(resolvedPath, '.git'));
  const timestamp = new Date().toISOString();

  let uncommittedFiles = [];
  let gitDiffOutput = '';
  let branchName = 'local';
  let lastCommit = 'none';

  if (isGitRepo) {
    try {
      branchName = execSync('git rev-parse --abbrev-ref HEAD', { cwd: resolvedPath, encoding: 'utf8' }).trim();
    } catch (_) {}
    try {
      lastCommit = execSync('git log -1 --pretty=format:"%h - %s (%cr)"', { cwd: resolvedPath, encoding: 'utf8' }).trim();
    } catch (_) {}
    try {
      const statusOutput = execSync('git status --porcelain', { cwd: resolvedPath, encoding: 'utf8' });
      uncommittedFiles = statusOutput
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => {
          const status = l.substring(0, 2).trim();
          const filePath = l.substring(3).trim();
          return { status, filePath };
        });
    } catch (_) {}
    try {
      gitDiffOutput = execSync('git diff', { cwd: resolvedPath, encoding: 'utf8' });
    } catch (_) {}
  } else {
    // If not a git repo, inspect recently modified files within the last 2 hours
    const now = Date.now();
    function walkDir(dir) {
      const files = [];
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist') continue;
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            files.push(...walkDir(fullPath));
          } else {
            const stats = fs.statSync(fullPath);
            if (now - stats.mtimeMs < 2 * 60 * 60 * 1000) {
              files.push({
                status: 'M',
                filePath: path.relative(resolvedPath, fullPath)
              });
            }
          }
        }
      } catch (_) {}
      return files;
    }
    uncommittedFiles = walkDir(resolvedPath);
  }

  // 1. AST / Syntax Check across modified JS/TS/JSON files
  const syntaxErrors = [];
  for (const item of uncommittedFiles) {
    const fullPath = path.join(resolvedPath, item.filePath);
    if (!fs.existsSync(fullPath)) continue;
    const ext = path.extname(fullPath).toLowerCase();
    if (['.js', '.mjs', '.cjs'].includes(ext)) {
      try {
        const code = fs.readFileSync(fullPath, 'utf8');
        new Function(code);
      } catch (err) {
        syntaxErrors.push({
          file: item.filePath,
          error: err.message,
          line: err.lineNumber || 'unknown'
        });
      }
    } else if (ext === '.json') {
      try {
        JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      } catch (err) {
        syntaxErrors.push({
          file: item.filePath,
          error: `Invalid JSON syntax: ${err.message}`
        });
      }
    }
  }

  // 2. Secret Scan on modified files & local .env files
  const secretFindings = [];
  const filesToScan = [...uncommittedFiles.map(f => f.filePath)];
  ['.env', '.env.local', '.env.development'].forEach(envFile => {
    if (fs.existsSync(path.join(resolvedPath, envFile)) && !filesToScan.includes(envFile)) {
      filesToScan.push(envFile);
    }
  });

  for (const relPath of filesToScan) {
    const fullPath = path.join(resolvedPath, relPath);
    if (!fs.existsSync(fullPath)) continue;
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(content)) {
          secretFindings.push({
            file: relPath,
            rule: pattern.name,
            severity: pattern.severity,
            message: `Unmasked secret pattern detected matching ${pattern.name}`
          });
        }
      }
    } catch (_) {}
  }

  // 3. Detect Package Manager & Runnable Tests
  const pkgPath = path.join(resolvedPath, 'package.json');
  let hasPackageJson = fs.existsSync(pkgPath);
  let hasTests = false;
  let testCommand = null;
  let framework = 'JavaScript/TypeScript';

  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.scripts && pkg.scripts.test && !pkg.scripts.test.includes('no test specified')) {
        hasTests = true;
        testCommand = pkg.scripts.test;
      }
      if (pkg.dependencies) {
        if (pkg.dependencies.next) framework = 'Next.js';
        else if (pkg.dependencies.react) framework = 'React';
        else if (pkg.dependencies.express) framework = 'Express.js';
        else if (pkg.dependencies.fastify) framework = 'Fastify';
      }
    } catch (_) {}
  }

  // 4. Calculate Risk & Plain-English Vibe Explanation
  const hasSecurityBreach = secretFindings.length > 0;
  const hasSyntaxBreak = syntaxErrors.length > 0;
  let riskLevel = 'Low Risk';
  if (hasSecurityBreach || hasSyntaxBreak) {
    riskLevel = 'High Risk';
  } else if (uncommittedFiles.length > 4) {
    riskLevel = 'Medium Risk';
  }

  let plainSummary = '';
  if (uncommittedFiles.length === 0) {
    plainSummary = 'Clean working directory. No uncommitted local edits detected.';
  } else {
    plainSummary = `Detected ${uncommittedFiles.length} local uncommitted file(s) modified by your AI tool (Cursor/Claude Code).`;
    if (hasSyntaxBreak) {
      plainSummary += ` WARNING: Found ${syntaxErrors.length} syntax/parse error(s) in local files.`;
    }
    if (hasSecurityBreach) {
      plainSummary += ` CRITICAL: Found ${secretFindings.length} unmasked high-entropy secret(s) in source or .env files.`;
    }
  }

  return {
    workspacePath: resolvedPath,
    folderName: path.basename(resolvedPath),
    isGitRepo,
    branchName,
    lastCommit,
    timestamp,
    framework,
    uncommittedFiles,
    filesCount: uncommittedFiles.length,
    syntaxErrors,
    secretFindings,
    hasTests,
    testCommand,
    riskLevel,
    plainSummary,
    readyToCommit: !hasSyntaxBreak && !hasSecurityBreach,
    gitDiffSummary: gitDiffOutput.substring(0, 4000)
  };
}

/**
 * Create a safe recovery checkpoint (snapshot) in the local workspace
 */
function createLocalCheckpoint({ workspacePath, message = 'Buildgate Safe Checkpoint: Prior to Agent Work' }) {
  const resolvedPath = assertSafeWorkspacePath(workspacePath);
  const isGitRepo = fs.existsSync(path.join(resolvedPath, '.git'));
  const timestamp = Date.now();
  const checkpointTag = `buildgate-checkpoint-${timestamp}`;

  if (!isGitRepo) {
    // If not git repo, create a local backup folder in .buildgate_snapshots
    const snapshotDir = path.join(resolvedPath, '.buildgate_snapshots', checkpointTag);
    fs.mkdirSync(snapshotDir, { recursive: true });
    return {
      success: true,
      checkpointId: checkpointTag,
      type: 'directory_snapshot',
      path: snapshotDir,
      message: 'Created local file snapshot in .buildgate_snapshots'
    };
  }

  try {
    execSync('git add -A', { cwd: resolvedPath });
    execSync(`git -c user.name="BuildGate Sentinel" -c user.email="sentinel@legit.run" commit -m "[BuildGate Checkpoint] ${message}" --allow-empty`, { cwd: resolvedPath });
    execSync(`git -c user.name="BuildGate Sentinel" -c user.email="sentinel@legit.run" tag -a ${checkpointTag} -m "${message}"`, { cwd: resolvedPath });

    const commitSha = execSync('git rev-parse --short HEAD', { cwd: resolvedPath, encoding: 'utf8' }).trim();
    return {
      success: true,
      checkpointId: checkpointTag,
      commitSha,
      type: 'git_checkpoint',
      message: `Safe checkpoint created: ${checkpointTag} (${commitSha})`
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to create checkpoint: ${err.message}`
    };
  }
}

/**
 * Roll back uncommitted local changes to restore the clean state
 */
function rollbackLocalChanges({ workspacePath }) {
  const resolvedPath = assertSafeWorkspacePath(workspacePath);
  const isGitRepo = fs.existsSync(path.join(resolvedPath, '.git'));

  if (!isGitRepo) {
    return {
      success: false,
      error: 'Workspace is not a git repository. Cannot auto-revert without git.'
    };
  }

  try {
    execSync('git reset --hard HEAD', { cwd: resolvedPath });
    execSync('git clean -fd', { cwd: resolvedPath });
    return {
      success: true,
      message: 'Clean rollback executed! Restored workspace to last known-good state.'
    };
  } catch (err) {
    return {
      success: false,
      error: `Rollback failed: ${err.message}`
    };
  }
}

module.exports = {
  inspectLocalWorkspace,
  createLocalCheckpoint,
  rollbackLocalChanges
};
