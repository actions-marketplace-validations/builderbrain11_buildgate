// Critical Journey: User Login & Session Persistence
const assert = require('assert');
const { createSession, validateSession } = require('../../src/auth/session');

async function runLoginJourney() {
  const assertions = [];

  // Step 1: User authentication and token creation
  try {
    const { token, session } = createSession('usr_jane_doe', 'jane@example.com', 'founder');
    assert.ok(token.startsWith('sess_usr_jane_doe'), 'Token should format with user ID');
    assert.strictEqual(session.email, 'jane@example.com');
    assertions.push({ step: 'Step 1: Authenticate credentials and mint session token', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 1: Authenticate credentials and mint session token', passed: false, error: err.message });
  }

  // Step 2: Validate active session from incoming request
  try {
    const { token } = createSession('usr_jane_doe', 'jane@example.com', 'founder');
    const { valid, user } = validateSession(token);
    assert.strictEqual(valid, true, 'Session token should be valid');
    assert.strictEqual(user.role, 'founder', 'Role should be preserved');
    assertions.push({ step: 'Step 2: Validate bearer token on protected endpoint', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 2: Validate bearer token on protected endpoint', passed: false, error: err.message });
  }

  const passedCount = assertions.filter(a => a.passed).length;
  return {
    journey: 'User Login',
    totalTests: assertions.length,
    passedCount,
    failedCount: assertions.length - passedCount,
    status: passedCount === assertions.length ? 'passed' : 'failed',
    assertions
  };
}

module.exports = { runLoginJourney };
