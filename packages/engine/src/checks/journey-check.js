// Critical User Journeys: consume structured results from the same isolated test run.
async function runJourneyCheck(projectPath, testCheckResult) {
  const startTime = Date.now();
  const suiteResults = testCheckResult && testCheckResult.suiteResults;
  if (!suiteResults || !Array.isArray(suiteResults.journeys)) {
    return {
      id: 'check_critical_journeys', name: 'Critical Journey Tests', category: 'journeys',
      status: 'failed', durationMs: Date.now() - startTime,
      summary: 'Critical journeys were not executed because isolated test results were unavailable.',
      failingJourneys: ['All journeys unavailable'], journeys: [], isolatedExecution: false,
      executionError: testCheckResult && testCheckResult.executionError ? testCheckResult.executionError : 'Missing isolated suite results.'
    };
  }

  const journeys = suiteResults.journeys;
  const failingJourneys = journeys.filter((journey) => journey.status === 'failed');
  const passed = failingJourneys.length === 0;
  const isolated = testCheckResult.isolatedExecution === true;
  const where = isolated ? 'an isolated Docker worker' : 'HOST FALLBACK (not isolated)';
  return {
    id: 'check_critical_journeys', name: 'Critical Journey Tests', category: 'journeys',
    status: passed ? 'passed' : 'failed', durationMs: Date.now() - startTime,
    summary: passed ? `All ${journeys.length} critical user journeys passed in ${where}.` : `${failingJourneys.length} of ${journeys.length} critical journeys failed.`,
    failingJourneys: failingJourneys.map((journey) => journey.journey), journeys,
    isolatedExecution: isolated, isolation: testCheckResult.isolation
  };
}

module.exports = { runJourneyCheck };
