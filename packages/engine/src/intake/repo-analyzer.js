'use strict';

/**
 * Buildgate & legit.run Repository Topology & Invariant Analyzer
 * 
 * Auto-discovers frameworks, API routes, database schemas, and external service
 * integrations to synthesize an authentic, repo-owned buildgate.json manifest.
 */

const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 
  'reports', '.buildgate_snapshots', 'coverage', '.turbo'
]);

function walkFiles(dir, baseDir = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, baseDir, out);
    } else {
      out.push(path.relative(baseDir, full).split(path.sep).join('/'));
    }
  }
  return out;
}

function detectFramework(pkg, allFiles) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  if (deps.next || allFiles.some(f => f.startsWith('app/') || f.startsWith('pages/'))) return 'Next.js';
  if (deps.express) return 'Express';
  if (deps.fastify) return 'Fastify';
  if (deps['@remix-run/node']) return 'Remix';
  if (deps['@nestjs/core']) return 'NestJS';
  if (deps.vite) return 'Vite';
  return 'Node.js';
}

function detectDatabaseAndSchemas(pkg, allFiles) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const schemas = [];

  // Prisma
  const prismaFiles = allFiles.filter(f => f.endsWith('schema.prisma'));
  if (deps['@prisma/client'] || prismaFiles.length) {
    schemas.push({ type: 'prisma', files: prismaFiles });
  }

  // Supabase / SQL
  const sqlFiles = allFiles.filter(f => f.endsWith('.sql'));
  if (deps['@supabase/supabase-js'] || sqlFiles.length) {
    schemas.push({ type: 'supabase_sql', files: sqlFiles });
  }

  // Drizzle
  const drizzleFiles = allFiles.filter(f => f.includes('schema') && (f.endsWith('.ts') || f.endsWith('.js')));
  if (deps['drizzle-orm']) {
    schemas.push({ type: 'drizzle', files: drizzleFiles });
  }

  // Mongoose / MongoDB
  if (deps.mongoose || deps.mongodb) {
    const modelFiles = allFiles.filter(f => f.includes('models/') || f.includes('schemas/'));
    schemas.push({ type: 'mongodb_mongoose', files: modelFiles });
  }

  return schemas;
}

function detectIntegrations(pkg, allFiles) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const integrations = [];

  if (deps.stripe) {
    const files = allFiles.filter(f => /stripe|payment|billing|webhook/i.test(f));
    integrations.push({ name: 'stripe', category: 'Payments', files });
  }

  if (deps['@supabase/supabase-js']) {
    const files = allFiles.filter(f => /supabase|auth|db|client/i.test(f));
    integrations.push({ name: 'supabase', category: 'Backend & Database', files });
  }

  if (deps.openai || deps['@anthropic-ai/sdk']) {
    const files = allFiles.filter(f => /ai|openai|claude|llm|agent/i.test(f));
    integrations.push({ name: 'ai_sdk', category: 'AI Models', files });
  }

  if (deps['@aws-sdk/client-s3'] || deps['aws-sdk']) {
    const files = allFiles.filter(f => /aws|s3|storage/i.test(f));
    integrations.push({ name: 'aws', category: 'Cloud Infrastructure', files });
  }

  if (deps['@clerk/nextjs'] || deps['@clerk/clerk-sdk-node'] || deps.jsonwebtoken) {
    const files = allFiles.filter(f => /auth|session|jwt|login/i.test(f));
    integrations.push({ name: 'auth_provider', category: 'Authentication', files });
  }

  return integrations;
}

function detectRoutes(framework, allFiles) {
  const routes = [];
  if (framework === 'Next.js') {
    // App Router API routes
    allFiles.filter(f => f.startsWith('app/') && (f.endsWith('route.js') || f.endsWith('route.ts'))).forEach(f => {
      const routePath = '/' + f.replace(/^app\//, '').replace(/\/route\.(js|ts)$/, '');
      routes.push({ type: 'next_app_route', file: f, path: routePath });
    });
    // Pages Router API routes
    allFiles.filter(f => f.startsWith('pages/api/') && (f.endsWith('.js') || f.endsWith('.ts'))).forEach(f => {
      const routePath = '/' + f.replace(/^pages\//, '').replace(/\.(js|ts)$/, '');
      routes.push({ type: 'next_page_api', file: f, path: routePath });
    });
  } else {
    // Generic API or Express routes
    allFiles.filter(f => /routes?\/|api\//i.test(f) && /\.(js|ts)$/.test(f)).forEach(f => {
      routes.push({ type: 'service_route', file: f, path: '/' + path.basename(f, path.extname(f)) });
    });
  }
  return routes;
}

/**
 * Synthesizes logical architecture blocks from discovered files
 */
function synthesizeBlocks(allFiles, integrations, schemas, routes) {
  const blocks = [];
  const assignedFiles = new Set();

  // 1. Auth block
  const authFiles = allFiles.filter(f => /auth|session|login|signup|user/i.test(f) && /\.(js|ts|jsx|tsx)$/.test(f));
  if (authFiles.length) {
    blocks.push({
      id: 'block-auth',
      name: 'Authentication & Session Control',
      layer: 'Access',
      description: 'Session validation, user identity, and token verification',
      paths: authFiles,
      dependsOn: [],
      verifiedBy: ['security:secrets']
    });
    authFiles.forEach(f => assignedFiles.add(f));
  }

  // 2. Database block
  const dbFiles = allFiles.filter(f => 
    (schemas.flatMap(s => s.files).includes(f) || /db|database|schema|models/i.test(f)) && 
    !assignedFiles.has(f) && /\.(js|ts|sql|prisma)$/.test(f)
  );
  if (dbFiles.length) {
    blocks.push({
      id: 'block-database',
      name: 'Database Models & State Layer',
      layer: 'Data',
      description: 'Data persistence, schema migrations, and relational mutations',
      paths: dbFiles,
      dependsOn: [],
      verifiedBy: []
    });
    dbFiles.forEach(f => assignedFiles.add(f));
  }

  // 3. Payments / Integrations block
  const paymentFiles = allFiles.filter(f => 
    /stripe|payment|billing|checkout|webhook/i.test(f) && 
    !assignedFiles.has(f) && /\.(js|ts|jsx|tsx)$/.test(f)
  );
  if (paymentFiles.length) {
    blocks.push({
      id: 'block-payments',
      name: 'Billing & External Webhooks',
      layer: 'Integration',
      description: 'Stripe payments, HMAC webhook validation, and monetary state transitions',
      paths: paymentFiles,
      dependsOn: blocks.some(b => b.id === 'block-database') ? ['block-database'] : [],
      verifiedBy: ['security:secrets']
    });
    paymentFiles.forEach(f => assignedFiles.add(f));
  }

  // 4. API Endpoints / Core Domain block
  const apiFiles = allFiles.filter(f => 
    (routes.map(r => r.file).includes(f) || /api|routes|services|controllers/i.test(f)) && 
    !assignedFiles.has(f) && /\.(js|ts|jsx|tsx)$/.test(f)
  );
  if (apiFiles.length) {
    blocks.push({
      id: 'block-core-services',
      name: 'Core Application Services',
      layer: 'Domain',
      description: 'Business logic endpoints and server handlers',
      paths: apiFiles,
      dependsOn: blocks.some(b => b.id === 'block-auth') ? ['block-auth'] : [],
      verifiedBy: []
    });
    apiFiles.forEach(f => assignedFiles.add(f));
  }

  // 5. Catch-all for remaining source files if no blocks were matched
  const remainingSource = allFiles.filter(f => 
    !assignedFiles.has(f) && 
    /\.(js|ts|jsx|tsx)$/.test(f) && 
    !f.includes('test') && !f.includes('script')
  );
  if (remainingSource.length && blocks.length === 0) {
    blocks.push({
      id: 'block-core',
      name: 'Primary Application Code',
      layer: 'Application',
      description: 'Core source modules and entrypoint handlers',
      paths: remainingSource,
      dependsOn: [],
      verifiedBy: []
    });
  }

  return blocks;
}

/**
 * Derives progressive Horizon Milestones
 */
function synthesizeMilestones(blocks) {
  const milestones = [
    {
      id: 'M1',
      title: 'Foundation & Health Invariants',
      description: 'Baseline compilation integrity, zero secret leaks, and clean lockfile auditing',
      targetBlocks: blocks.slice(0, 1).map(b => b.id),
      exitCriteria: ['check_build_type:passed', 'check_security_secrets:passed']
    }
  ];

  if (blocks.some(b => b.id === 'block-auth' || b.id === 'block-database')) {
    milestones.push({
      id: 'M2',
      title: 'Authentication & Data Isolation',
      description: 'Identity verification, session handling, and schema state guarantees',
      targetBlocks: blocks.filter(b => b.id === 'block-auth' || b.id === 'block-database').map(b => b.id),
      exitCriteria: ['check_unit_tests:passed']
    });
  }

  if (blocks.some(b => b.id === 'block-payments')) {
    milestones.push({
      id: 'M3',
      title: 'Payments & Financial Integrity',
      description: 'Cryptographic webhook validation and deterministic payment state transitions',
      targetBlocks: ['block-payments'],
      exitCriteria: ['check_critical_journeys:passed']
    });
  }

  milestones.push({
    id: `M${milestones.length + 1}`,
    title: 'Production Merge Readiness',
    description: 'All invariants verified in isolated container sandbox, merge-eligible sign-off',
    targetBlocks: blocks.map(b => b.id),
    exitCriteria: ['mergeEligible:true']
  });

  return milestones;
}

/**
 * Analyzes target repository and returns complete recommended manifest
 */
function analyzeRepository(projectPath) {
  const resolvedPath = path.resolve(projectPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Directory does not exist: ${resolvedPath}`);
  }

  let pkg = {};
  const pkgPath = path.join(resolvedPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch (_) {}
  }

  const allFiles = walkFiles(resolvedPath, resolvedPath);
  const framework = detectFramework(pkg, allFiles);
  const schemas = detectDatabaseAndSchemas(pkg, allFiles);
  const integrations = detectIntegrations(pkg, allFiles);
  const routes = detectRoutes(framework, allFiles);
  const blocks = synthesizeBlocks(allFiles, integrations, schemas, routes);
  const milestones = synthesizeMilestones(blocks);

  const existingConfigPath = path.join(resolvedPath, 'buildgate.json');
  const alreadyConfigured = fs.existsSync(existingConfigPath);

  // Discover candidate source roots
  const defaultRoots = ['src', 'app', 'pages', 'lib', 'bin'].filter(d => 
    fs.existsSync(path.join(resolvedPath, d))
  );

  const manifest = {
    $schema: 'https://buildgate.dev/schema/v1/buildgate.json',
    system: pkg.name || path.basename(resolvedPath),
    framework,
    vision: `Deterministic verification and behavioral integrity for ${pkg.name || path.basename(resolvedPath)}`,
    sourceRoots: defaultRoots.length ? defaultRoots : ['.'],
    blocks,
    milestones,
    invariants: [
      {
        id: 'inv_zero_leaked_secrets',
        name: 'Zero Leaked Secrets',
        rule: 'No high-entropy live secret tokens committed in code',
        severity: 'critical'
      },
      {
        id: 'inv_dependency_lockfile',
        name: 'Deterministic Dependency Tree',
        rule: 'Package lockfile must be committed and pass integrity check',
        severity: 'high'
      }
    ]
  };

  return {
    projectPath: resolvedPath,
    alreadyConfigured,
    framework,
    filesCount: allFiles.length,
    schemas,
    integrations,
    routes,
    manifest
  };
}

module.exports = {
  analyzeRepository,
  detectFramework,
  detectDatabaseAndSchemas,
  detectIntegrations,
  detectRoutes,
  synthesizeBlocks,
  synthesizeMilestones
};
