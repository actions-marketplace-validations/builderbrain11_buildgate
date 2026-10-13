'use strict';

// Buildgate isolated execution adapter.
// IMPORTANT: this adapter intentionally has no host-process fallback. If Docker is
// unavailable, jobs fail closed rather than executing customer code on the API host.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_TIMEOUT_MS = 300_000;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const DEFAULT_IMAGE = process.env.BUILDGATE_SANDBOX_IMAGE || 'buildgate-worker:local';
const ENV_ALLOWLIST = new Set(['CI', 'NODE_ENV', 'TZ', 'LANG', 'LC_ALL']);

function boundedInteger(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function sanitizeEnvironment(env = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(env)) {
    if (ENV_ALLOWLIST.has(key) && typeof value === 'string' && value.length <= 256) clean[key] = value;
  }
  clean.NODE_ENV = 'test';
  clean.CI = 'true';
  return clean;
}

function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function buildDockerArgs({ projectPath, scriptRelative, args, outputPath, timeoutMs, env, image }) {
  const seconds = Math.ceil(timeoutMs / 1000);
  const dockerArgs = [
    'run', '--rm', '--init',
    '--network=none',
    '--read-only',
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges:true',
    '--pids-limit=128',
    '--memory=512m',
    '--memory-swap=512m',
    '--cpus=1.0',
    '--user=10001:10001',
    '--hostname=buildgate-job',
    '--workdir=/workspace',
    '--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=64m',
    '--mount', `type=bind,src=${projectPath},dst=/workspace,readonly`,
    '--mount', `type=bind,src=${outputPath},dst=/output`,
    '--env', 'HOME=/tmp',
    '--env', 'TMPDIR=/tmp',
    '--env', `BUILDGATE_JOB_TIMEOUT_SECONDS=${seconds}`
  ];
  for (const [key, value] of Object.entries(sanitizeEnvironment(env))) dockerArgs.push('--env', `${key}=${value}`);
  dockerArgs.push(image, 'node', '--max-old-space-size=384', `/workspace/${scriptRelative}`, ...args);
  return dockerArgs;
}

function runDocker(args, timeoutMs, maxOutputBytes = MAX_OUTPUT_BYTES) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let stdout = '';
    let stderr = '';
    let outputBytes = 0;
    let timedOut = false;
    let tooMuchOutput = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    const collect = (target) => (chunk) => {
      outputBytes += chunk.length;
      if (outputBytes > maxOutputBytes) {
        tooMuchOutput = true;
        child.kill('SIGKILL');
        return;
      }
      if (target === 'stdout') stdout += chunk.toString('utf8');
      else stderr += chunk.toString('utf8');
    };
    child.stdout.on('data', collect('stdout'));
    child.stderr.on('data', collect('stderr'));
    child.on('error', (error) => {
      clearTimeout(timer);
      if (error.code === 'ENOENT') return reject(new Error('Docker is required for isolated execution but was not found. No host execution was attempted.'));
      reject(error);
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return reject(new Error(`Sandbox job exceeded ${timeoutMs}ms and was terminated.`));
      if (tooMuchOutput) return reject(new Error(`Sandbox job exceeded ${maxOutputBytes} bytes of output and was terminated.`));
      if (code !== 0 && /pull access denied|Unable to find image/i.test(stderr)) {
        return reject(new Error('Sandbox image is unavailable. Build it with: docker build -t buildgate-worker:local -f infra/worker-sandbox/Dockerfile .'));
      }
      if (code !== 0 && /failed to connect to the docker API|docker daemon is not running|error during connect|Is the docker daemon running/i.test(stderr)) {
        return reject(new Error('Docker daemon is not running. Please start Docker Desktop or the Docker service. No host execution was attempted.'));
      }
      resolve({ exitCode: code == null ? 1 : code, signal, stdout, stderr, isolated: true, isolation: 'docker-no-network-readonly-root' });
    });
  });
}

function runHostFallback(scriptAbsolute, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptAbsolute, ...args], {
      cwd: options.projectPath,
      env: { ...process.env, ...sanitizeEnvironment(options.env) },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8'); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8'); });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      resolve({
        exitCode: code == null ? 1 : code,
        signal,
        stdout,
        stderr,
        isolated: false,
        isolation: 'host-development-fallback'
      });
    });
  });
}

async function runIsolatedJob(scriptPath, args = [], options = {}) {
  if (typeof scriptPath !== 'string' || !scriptPath.trim()) throw new TypeError('scriptPath is required');
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== 'string' || arg.includes('\0'))) throw new TypeError('args must be an array of strings');

  const projectPath = fs.realpathSync(path.resolve(options.projectPath || options.cwd || process.cwd()));
  const scriptAbsolute = path.resolve(projectPath, scriptPath);
  if (!isWithin(projectPath, scriptAbsolute)) throw new Error('Script path must stay within the configured project directory.');
  const linkStat = fs.lstatSync(scriptAbsolute, { throwIfNoEntry: false });
  if (!linkStat || !linkStat.isFile() || linkStat.isSymbolicLink()) throw new Error('Script must be a regular file inside the configured project directory; symlinks are not allowed.');
  const canonicalScript = fs.realpathSync(scriptAbsolute);
  if (!isWithin(projectPath, canonicalScript)) throw new Error('Script path resolves outside the configured project directory.');

  const timeoutMs = boundedInteger(options.timeoutMs, DEFAULT_TIMEOUT_MS, 1_000, MAX_TIMEOUT_MS);
  const image = options.image || DEFAULT_IMAGE;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,180}$/.test(image)) throw new Error('Invalid sandbox image name.');
  const outputPath = fs.mkdtempSync(path.join(os.tmpdir(), 'buildgate-output-'));
  try { fs.chmodSync(outputPath, 0o777); } catch (_) {}
  try {
    const dockerArgs = buildDockerArgs({
      projectPath, scriptRelative: path.relative(projectPath, scriptAbsolute).split(path.sep).join('/'),
      args, outputPath, timeoutMs, env: options.env || {}, image
    });
    return await runDocker(dockerArgs, timeoutMs + 5_000, boundedInteger(options.maxOutputBytes, MAX_OUTPUT_BYTES, 1024, MAX_OUTPUT_BYTES));
  } catch (dockerError) {
    if ((process.env.BUILDGATE_ALLOW_HOST_FALLBACK || '').trim() === 'true') {
      return await runHostFallback(canonicalScript, args, { projectPath, timeoutMs, env: options.env });
    }
    throw dockerError;
  } finally {
    fs.rmSync(outputPath, { recursive: true, force: true });
  }
}

module.exports = { sanitizeEnvironment, buildDockerArgs, runIsolatedJob };
