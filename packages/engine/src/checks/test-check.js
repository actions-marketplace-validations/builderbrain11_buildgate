// Unit Tests Runner Check: customer test code must run inside the isolated worker.
const { runIsolatedJob } = require('../isolation/sandbox-runner');

const RESULT_PREFIX = 'BUILDGATE_RESULTS_JSON=';

async function runTestCheck(projectPath, options = {}) {
  const startTime = Date.now();
  try {
    const execution = await runIsolatedJob('tests/run-tests.js', [], {
      projectPath,
      timeoutMs: options.timeoutMs,
      image: options.image,
      env: { CI: 'true', NODE_ENV: 'test' }
    });
    const marker = execution.stdout.split(/\r?\n/).find((line) => line.startsWith(RESULT_PREFIX));
    if (!marker) {
      throw new Error(`Test harness did not emit structured results (exit ${execution.exitCode}). ${execution.stderr.slice(0, 1200)}`);
    }
    const suiteResults = JSON.parse(marker.slice(RESULT_PREFIX.length));
    const tests = Array.isArray(suiteResults.unitTests) ? suiteResults.unitTests : [];
    const passedCount = tests.filter((item) => item.passed).length;
    const failedCount = tests.length - passedCount;
    const passed = execution.exitCode === 0 && failedCount === 0;
    const isolated = execution.isolated === true;
    const where = isolated ? 'an isolated Docker worker' : 'HOST FALLBACK (not isolated)';
    return {
      id: 'check_unit_tests', name: 'Unit Tests', category: 'tests',
      status: passed ? 'passed' : 'failed', durationMs: Date.now() - startTime,
      summary: `${passedCount}/${tests.length} unit tests passed in ${where}.`,
      totalTests: tests.length, passedCount, failedCount, tests,
      isolatedExecution: isolated, isolation: execution.isolation,
      suiteResults,
      ...(execution.exitCode !== 0 && failedCount === 0 ? { executionError: `Test process exited with code ${execution.exitCode}.` } : {})
    };
  } catch (error) {
    return {
      id: 'check_unit_tests', name: 'Unit Tests', category: 'tests', status: 'failed',
      durationMs: Date.now() - startTime,
      summary: 'Tests were not executed because isolated worker execution failed. No host fallback was attempted.',
      totalTests: 0, passedCount: 0, failedCount: 1, tests: [], isolatedExecution: false,
      isolation: 'not-executed',
      executionError: error.message
    };
  }
}

module.exports = { runTestCheck };
