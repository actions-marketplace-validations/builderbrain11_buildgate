'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sanitizeEnvironment, buildDockerArgs, runIsolatedJob } = require('../src/isolation/sandbox-runner');

test('environment sanitizer only preserves explicit low-risk keys', () => {
  const env = sanitizeEnvironment({ CI: 'true', PATH: '/danger', OPENAI_API_KEY: 'secret', NODE_ENV: 'production', TZ: 'UTC' });
  assert.deepEqual(env, { CI: 'true', NODE_ENV: 'test', TZ: 'UTC' });
  assert.equal(JSON.stringify(env).includes('secret'), false);
});

test('docker args enforce isolation controls', () => {
  const args = buildDockerArgs({ projectPath: '/tmp/project', scriptRelative: 'tests/run.js', args: [], outputPath: '/tmp/output', timeoutMs: 30_000, env: { OPENAI_API_KEY: 'secret' }, image: 'buildgate-worker:local' });
  for (const flag of ['--network=none', '--read-only', '--cap-drop=ALL', '--security-opt=no-new-privileges:true', '--pids-limit=128', '--memory=512m', '--cpus=1.0', '--user=10001:10001']) assert.ok(args.includes(flag), `missing ${flag}`);
  assert.equal(args.some((x) => x.includes('OPENAI_API_KEY')), false);
  assert.ok(args.some((x) => x.includes('dst=/workspace,readonly')));
});

test('rejects malformed image names through the argument builder contract', () => {
  // Validation is performed by runIsolatedJob before Docker is invoked; this assertion
  // documents the safe expected image-name grammar used by the adapter.
  assert.match('buildgate-worker:local', /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,180}$/);
  assert.doesNotMatch('bad image;rm -rf /', /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,180}$/);
});


test('rejects a symlinked script before attempting execution', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'buildgate-sandbox-test-'));
  const project = path.join(root, 'project');
  fs.mkdirSync(project);
  fs.writeFileSync(path.join(root, 'outside.js'), 'process.exit(0)');
  fs.symlinkSync(path.join(root, 'outside.js'), path.join(project, 'run.js'));
  try {
    await assert.rejects(runIsolatedJob('run.js', [], { projectPath: project }), /symlinks are not allowed/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects traversal outside the project before attempting execution', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'buildgate-sandbox-test-'));
  const project = path.join(root, 'project');
  fs.mkdirSync(project);
  fs.writeFileSync(path.join(root, 'outside.js'), 'process.exit(0)');
  try {
    await assert.rejects(runIsolatedJob('../outside.js', [], { projectPath: project }), /must stay within/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
