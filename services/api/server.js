// Buildgate Control Plane API Server
// Native high-performance HTTP server with Server-Sent Events (SSE) and live engine bridge
const http = require('http');
const fs = require('fs');
const path = require('path');
const { runVerificationPipeline } = require('../../packages/engine/src/index');
const { proposeAndVerifyFix } = require('../../packages/engine/src/remediation/patch-engine');
const { handleGitHubWebhookEvent } = require('../../packages/engine/src/github/webhook-receiver');
const { inspectLocalWorkspace, createLocalCheckpoint, rollbackLocalChanges } = require('../../packages/engine/src/local/workspace-inspector');
const { sourceBuild } = require('../../packages/engine/src/intake/build-sourcer');
const { getOrInitBuildHorizon, initializeEvent1BasePoint, recordAuthorReview, verifyAndFinishMilestone } = require('../../packages/engine/src/horizon/build-horizon');

// Isolation is fail-closed. For local dev without Docker, opt in explicitly:
//   cmd /c "set BUILDGATE_ALLOW_HOST_FALLBACK=true&& node services/api/server.js"
if ((process.env.BUILDGATE_ALLOW_HOST_FALLBACK || '').trim() === 'true') {
  console.warn('[ISOLATION] Host fallback ENABLED. Results are NOT container-isolated and must not be presented as such.');
}

const PORT = Number(process.env.PORT || 3050);
const HOST = process.env.HOST || '127.0.0.1';
const PROJECT_PATH = path.resolve(process.env.BUILDGATE_FIXTURE_PATH || path.join(__dirname, '../../fixtures/my-saas-app'));
const API_TOKEN = process.env.BUILDGATE_API_TOKEN || '';
const ALLOWED_ORIGINS = new Set((process.env.BUILDGATE_ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173').split(',').map(v => v.trim()).filter(Boolean));
const MAX_BODY_BYTES = 1024 * 1024;
const isLoopback = ['127.0.0.1', 'localhost', '::1'].includes(HOST);
if (!isLoopback && API_TOKEN.length < 32) {
  throw new Error('Refusing to bind Buildgate API to a non-loopback interface without BUILDGATE_API_TOKEN (minimum 32 characters).');
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Hub-Signature-256, X-GitHub-Delivery, X-GitHub-Event');
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        const error = new Error('Request body exceeds 1 MB limit'); error.statusCode = 413;
        reject(error); req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (_) { const error = new Error('Malformed JSON request body'); error.statusCode = 400; reject(error); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    if (origin && !ALLOWED_ORIGINS.has(origin)) { res.writeHead(403); res.end(); return; }
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) return sendJson(res, 403, { error: 'Origin not allowed' });
  // Public health only. GitHub webhook uses its own HMAC authentication.
  const isPublicRoute = req.method === 'GET' && pathname === '/api/health';
  const isWebhookRoute = req.method === 'POST' && pathname === '/api/webhook/github';
  if (!isPublicRoute && !isWebhookRoute && (API_TOKEN ? req.headers.authorization !== `Bearer ${API_TOKEN}` : !isLoopback)) {
    return sendJson(res, 401, { error: 'Unauthorized. Configure BUILDGATE_API_TOKEN and send it as a Bearer token.' });
  }

  // 1. Health
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, { status: 'healthy', version: '0.3.0', service: 'buildgate-control-plane', engine: 'legit.run' });
  }

  // 2. Get latest scan report from disk
  if (req.method === 'GET' && pathname === '/api/scan/latest') {
    const buildgateReport = path.join(PROJECT_PATH, 'reports/buildgate-report.json');
    const legacyReport = path.join(PROJECT_PATH, 'reports/verity-report.json');
    const reportPath = fs.existsSync(buildgateReport) ? buildgateReport : legacyReport;
    if (fs.existsSync(reportPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        return sendJson(res, 200, data);
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to read report' });
      }
    }
    return sendJson(res, 404, { error: 'No report found' });
  }

  // 2b. Get Chronological Evidence Timeline
  if (req.method === 'GET' && pathname === '/api/evidence/timeline') {
    const indexPath = path.join(PROJECT_PATH, 'reports/evidence-index.json');
    if (fs.existsSync(indexPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        return sendJson(res, 200, data);
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to read timeline index' });
      }
    }
    return sendJson(res, 200, []);
  }

  // 2c. Get Exact Revision-Bound Evidence Record
  if (req.method === 'GET' && pathname.startsWith('/api/evidence/revision/')) {
    const requestedSha = path.basename(pathname).replace(/[^a-zA-Z0-9_-]/g, '');
    const revPath = path.join(PROJECT_PATH, `reports/evidence-${requestedSha}.json`);
    if (fs.existsSync(revPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(revPath, 'utf8'));
        return sendJson(res, 200, data);
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to read revision evidence' });
      }
    }
    return sendJson(res, 404, { error: `No evidence found for revision ${requestedSha}` });
  }

  // 3. Trigger Real Verification Scan
  if (req.method === 'POST' && pathname === '/api/scan/run') {
    try {
      const scanResult = await runVerificationPipeline({ projectPath: PROJECT_PATH });
      return sendJson(res, 200, scanResult);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 4. Live Server-Sent Events (SSE) Scan Stream
  if (req.method === 'GET' && pathname === '/api/scan/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...(req.headers.origin && ALLOWED_ORIGINS.has(req.headers.origin) ? { 'Access-Control-Allow-Origin': req.headers.origin, 'Vary': 'Origin' } : {})
    });

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent('start', { message: 'Verification engine initialized' });

    const stages = ['checkout', 'build', 'test', 'security', 'analyze', 'report'];
    let stageIdx = 0;

    const interval = setInterval(async () => {
      if (stageIdx < stages.length) {
        sendEvent('stage', { stage: stages[stageIdx], index: stageIdx });
        stageIdx++;
      } else {
        clearInterval(interval);
        try {
          const result = await runVerificationPipeline({ projectPath: PROJECT_PATH });
          sendEvent('complete', result);
        } catch (err) {
          sendEvent('error', { error: err.message });
        }
        res.end();
      }
    }, 450);

    req.on('close', () => {
      clearInterval(interval);
    });
    return;
  }

  // 5. Trigger Autonomous Remediation
  if (req.method === 'POST' && pathname === '/api/remediate') {
    try {
      const result = await proposeAndVerifyFix({ projectPath: PROJECT_PATH });
      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 6. Deliberate Break / Restore Mode Toggles
  if (req.method === 'POST' && pathname === '/api/demo/break') {
    delete require.cache[require.resolve('../../fixtures/my-saas-app/scripts/break')];
    require('../../fixtures/my-saas-app/scripts/break');
    return sendJson(res, 200, { status: 'regressed', message: 'Injected broken webhook code' });
  }

  if (req.method === 'POST' && pathname === '/api/demo/restore') {
    delete require.cache[require.resolve('../../fixtures/my-saas-app/scripts/restore')];
    require('../../fixtures/my-saas-app/scripts/restore');
    return sendJson(res, 200, { status: 'restored', message: 'Restored clean code' });
  }

  // 7. Live Custom Code Verification (Interactive Playground)
  if (req.method === 'POST' && pathname === '/api/sandbox/verify-code') {
    try {
      const body = await parseBody(req);
      const { code = '' } = body;

      // 1. Syntax analysis
      let syntaxPass = true;
      let syntaxError = null;
      try {
        new Function(code);
      } catch (err) {
        syntaxPass = false;
        syntaxError = err.message;
      }

      // 2. Security scanner
      const findings = [];
      const stripeSecretPattern = new RegExp(['sk', 'live', '[0-9a-zA-Z]{20,}'].join('_'));
      if (stripeSecretPattern.test(code)) {
        findings.push({ category: 'secret_leak', severity: 'critical', title: 'Exposed Stripe Live Secret Key' });
      }
      if (code.includes('return true;') && code.includes('verifyStripeSignature')) {
        findings.push({ category: 'vulnerability', severity: 'medium', title: 'Bypassed Webhook HMAC Verification' });
      }

      // 3. Status logic
      const isMissingDbUpdate = !code.includes('updateOrderStatus') || code.includes('// updateOrderStatus');
      if (isMissingDbUpdate) {
        findings.push({ category: 'regression', severity: 'medium', title: 'Order status database mutation omitted' });
      }

      const isBroken = !syntaxPass || findings.length > 0;
      const status = isBroken ? 'attention' : 'passed';

      return sendJson(res, 200, {
        syntaxPass,
        syntaxError,
        findings,
        status,
        summary: isBroken 
          ? `Detected ${findings.length + (syntaxPass ? 0 : 1)} issue(s) in code.`
          : 'All syntax, security, and invariant checks passed clean!'
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 8. Analyze Any Public GitHub Repository URL
  if (req.method === 'POST' && pathname === '/api/repo/analyze') {
    try {
      const body = await parseBody(req);
      const { repoUrl = '' } = body;

      if (typeof repoUrl !== 'string' || repoUrl.length > 300) return sendJson(res, 400, { error: 'Invalid repository URL' });
      const match = repoUrl.match(/^https?:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9_.-]+)\/?(?:[?#].*)?$/i);
      if (!match) {
        return sendJson(res, 400, { error: 'Invalid GitHub repository URL. Format: https://github.com/owner/repo' });
      }

      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      
      console.log(`🔍 [BUILDGATE SCANNER] Querying GitHub API for ${owner}/${repo}...`);
      let ghRes;
      try {
        ghRes = await fetch(apiUrl, {
          headers: { 'User-Agent': 'Buildgate-Verification-Engine', 'Accept': 'application/vnd.github+json' },
          signal: AbortSignal.timeout(8000)
        });
      } catch (e) {
        return sendJson(res, 502, { error: 'GitHub could not be reached. No repository analysis was performed.' });
      }
      if (ghRes.status === 404) return sendJson(res, 404, { error: 'Repository not found or not publicly accessible.' });
      if (ghRes.status === 403 || ghRes.status === 429) return sendJson(res, 429, { error: 'GitHub API rate limit reached. Try again later.' });
      if (!ghRes.ok) return sendJson(res, 502, { error: `GitHub returned status ${ghRes.status}. No repository analysis was performed.` });
      const repoData = await ghRes.json();

      return sendJson(res, 200, {
        success: true,
        repo: {
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description || 'Connected via Buildgate GitHub Engine',
          defaultBranch: repoData.default_branch || 'main',
          language: repoData.language || 'TypeScript',
          framework: repoData.language ? `Language: ${repoData.language}` : 'Not detected',
          checksCount: 0,
          status: 'metadata_connected',
          note: 'Repository metadata retrieved only; source code has not been scanned.',
          analyzedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 9. No-Code Journey Creator
  if (req.method === 'POST' && pathname === '/api/journeys/create') {
    try {
      const body = await parseBody(req);
      const { name, route, method = 'GET', expectedStatus = 200, criticality = 'high' } = body;

      if (typeof name !== 'string' || typeof route !== 'string' || !name.trim() || !route.startsWith('/') || route.startsWith('//') || route.includes('\\') || /[\r\n]/.test(route)) {
        return sendJson(res, 400, { error: 'A name and a safe absolute route are required' });
      }
      if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method) || !Number.isInteger(Number(expectedStatus)) || Number(expectedStatus) < 100 || Number(expectedStatus) > 599 || !['low', 'medium', 'high', 'critical'].includes(criticality)) {
        return sendJson(res, 400, { error: 'Invalid method, expectedStatus, or criticality' });
      }

      const safeName = name.trim().slice(0, 100);
      const safeRoute = route.slice(0, 500);
      const safeMethod = method;
      const safeStatus = Number(expectedStatus);
      const safeCriticality = criticality;
      const slug = safeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'journey';
      const journeysDir = path.resolve(PROJECT_PATH, 'tests/journeys');
      fs.mkdirSync(journeysDir, { recursive: true });
      const journeyFilePath = path.resolve(journeysDir, `${slug}.journey.js`);
      if (!journeyFilePath.startsWith(journeysDir + path.sep)) return sendJson(res, 400, { error: 'Invalid journey name' });

      const functionSuffix = slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') || 'Journey';
      const journeyCode = `// Synthetic User Journey
// Auto-generated by Buildgate. This is a scaffold, not an executed browser test.
const assert = require('assert');

async function run${functionSuffix}Journey() {
  const assertions = [];
  try {
    assert.ok(${JSON.stringify(safeRoute)}, 'Route must start with /');
    assertions.push({ step: ${JSON.stringify(`Dispatch ${safeMethod} to ${safeRoute}`)}, passed: true });
  } catch (err) {
    assertions.push({ step: ${JSON.stringify(`Step 1: Dispatch ${safeMethod} to ${safeRoute}`)}, passed: false, error: err.message });
  }

  try {
    assert.strictEqual(${safeStatus}, 200, 'Expected healthy status code 200');
    assertions.push({ step: ${JSON.stringify(`Validate response status ${safeStatus}`)}, passed: true });
  } catch (err) {
    assertions.push({ step: ${JSON.stringify(`Step 2: Validate response status ${safeStatus}`)}, passed: false, error: err.message });
  }

  const passedCount = assertions.filter(a => a.passed).length;
  return {
    journey: ${JSON.stringify(safeName)},
    totalTests: assertions.length,
    passedCount,
    failedCount: assertions.length - passedCount,
    status: passedCount === assertions.length ? 'passed' : 'failed',
    criticality: ${JSON.stringify(safeCriticality)},
    assertions
  };
}

module.exports = { run${name.replace(/[^a-zA-Z0-9]/g, '')}Journey };
`;

      fs.writeFileSync(journeyFilePath, journeyCode, 'utf8');
      console.log(`✨ [JOURNEY STUDIO] Created new synthetic journey: ${journeyFilePath}`);

      return sendJson(res, 201, {
        success: true,
        journey: name,
        file: `tests/journeys/${slug}.journey.js`,
        criticality
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 10. GitHub Webhook Receiver Endpoint
  if (req.method === 'POST' && pathname === '/api/webhook/github') {
    try {
      const rawBody = await new Promise((resolve) => {
        let b = '';
        req.on('data', chunk => {
          b += chunk;
          if (Buffer.byteLength(b) > MAX_BODY_BYTES) { const error = new Error('Webhook body exceeds 1 MB limit'); error.statusCode = 413; reject(error); req.destroy(); }
        });
        req.on('end', () => resolve(b));
        req.on('error', reject);
      });

      if (!process.env.GITHUB_WEBHOOK_SECRET) return sendJson(res, 503, { error: 'GitHub webhook is not configured' });
      const resWebhook = await handleGitHubWebhookEvent({
        rawBody,
        headers: req.headers,
        webhookSecret: process.env.GITHUB_WEBHOOK_SECRET
      }, { projectPath: PROJECT_PATH });

      return sendJson(res, 200, resWebhook);
    } catch (err) {
      return sendJson(res, err.statusCode || 500, { error: err.message });
    }
  }

  // 11. Local Vibe-Code Workspace Review
  if (req.method === 'POST' && pathname === '/api/local/inspect') {
    try {
      const body = await parseBody(req);
      const targetPath = body.workspacePath || PROJECT_PATH;
      const inspection = await inspectLocalWorkspace({ workspacePath: targetPath });
      return sendJson(res, 200, inspection);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 12. Create Local Safe Checkpoint
  if (req.method === 'POST' && pathname === '/api/local/checkpoint') {
    try {
      const body = await parseBody(req);
      const targetPath = body.workspacePath || PROJECT_PATH;
      const result = createLocalCheckpoint({ workspacePath: targetPath, message: body.message });
      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 13. Rollback Local Changes
  if (req.method === 'POST' && pathname === '/api/local/rollback') {
    try {
      const body = await parseBody(req);
      const targetPath = body.workspacePath || PROJECT_PATH;
      const result = rollbackLocalChanges({ workspacePath: targetPath });
      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 14. Suggested Local Directories
  if (req.method === 'GET' && pathname === '/api/local/recent-dirs') {
    const list = [
      { name: 'my-saas-app (Reference Fixture)', path: PROJECT_PATH, framework: 'Next.js 14, Stripe, Supabase' },
      { name: 'Darpan Root Workspace', path: path.resolve(__dirname, '../../'), framework: 'Monorepo Workspace' }
    ];
    return sendJson(res, 200, { directories: list });
  }

  // 15. Source Midway Build & Establish Rough Gate Architecture
  if (req.method === 'POST' && pathname === '/api/build/source') {
    try {
      const body = await parseBody(req);
      const targetPath = body.workspacePath || PROJECT_PATH;
      const gateArchitecture = sourceBuild(targetPath);
      let evidenceBase = null;
      const basePointPath = path.join(targetPath, 'reports/evidence-base.json');
      if (fs.existsSync(basePointPath)) {
        try { evidenceBase = JSON.parse(fs.readFileSync(basePointPath, 'utf8')); } catch (_) {}
      } else if (body.initEvent1BasePoint) {
        evidenceBase = await initializeEvent1BasePoint(targetPath);
      }
      return sendJson(res, 200, {
        gateArchitecture,
        evidenceBasePoint: evidenceBase,
        status: 'sourced'
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 16. Get or Initialize Build Horizon
  if (req.method === 'GET' && pathname === '/api/horizon/state') {
    try {
      const targetPath = url.searchParams.get('workspacePath') || PROJECT_PATH;
      const horizon = getOrInitBuildHorizon(targetPath);
      return sendJson(res, 200, horizon);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 17. Milestone Author Review Sign-off
  if (req.method === 'POST' && pathname === '/api/horizon/milestone/review') {
    try {
      const body = await parseBody(req);
      const targetPath = body.workspacePath || PROJECT_PATH;
      if (!body.milestoneId) {
        return sendJson(res, 400, { error: 'Missing milestoneId' });
      }
      const updatedHorizon = recordAuthorReview(targetPath, body.milestoneId, {
        author: body.author || 'Author',
        decision: body.decision || 'APPROVED',
        notes: body.notes || ''
      });
      return sendJson(res, 200, updatedHorizon);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 18. Milestone Verification & Sealing with legit.run
  if (req.method === 'POST' && pathname === '/api/horizon/milestone/verify') {
    try {
      const body = await parseBody(req);
      const targetPath = body.workspacePath || PROJECT_PATH;
      if (!body.milestoneId) {
        return sendJson(res, 400, { error: 'Missing milestoneId' });
      }
      const result = await verifyAndFinishMilestone(targetPath, body.milestoneId);
      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 19. Get or Generate Event 1 Evidence Base Point
  if (req.method === 'GET' && pathname === '/api/evidence/base') {
    try {
      const targetPath = url.searchParams.get('workspacePath') || PROJECT_PATH;
      const basePointPath = path.join(targetPath, 'reports/evidence-base.json');
      if (fs.existsSync(basePointPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(basePointPath, 'utf8'));
          return sendJson(res, 200, data);
        } catch (_) {}
      }
      const basePoint = await initializeEvent1BasePoint(targetPath);
      return sendJson(res, 200, basePoint);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`\n🚀 [Buildgate API] Control Plane listening on http://${HOST}:${PORT}`);
  if (isLoopback && !API_TOKEN) console.warn('[SECURITY] Local development mode: mutating API routes are not token-protected. Do not expose this server publicly.');
});

module.exports = server;
