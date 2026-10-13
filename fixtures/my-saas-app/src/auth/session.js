// User session and authentication logic
const activeSessions = new Map();

function createSession(userId, email, role = 'customer') {
  if (!userId || !email) {
    throw new Error('User ID and email are required to create a session');
  }
  const token = `sess_${userId}_${Date.now()}`;
  const session = {
    userId,
    email,
    role,
    createdAt: new Date().toISOString()
  };
  activeSessions.set(token, session);
  return { token, session };
}

function validateSession(token) {
  if (!token || !activeSessions.has(token)) {
    return { valid: false, user: null };
  }
  return { valid: true, user: activeSessions.get(token) };
}

function clearSession(token) {
  return activeSessions.delete(token);
}

module.exports = {
  createSession,
  validateSession,
  clearSession
};
