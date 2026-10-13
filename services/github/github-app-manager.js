// GitHub App Manager
// Generates GitHub App manifests, manages JWT tokens, and handles PR Check Runs
const crypto = require('crypto');

function generateGitHubAppManifest() {
  return {
    name: "Buildgate-Trust-Engine",
    url: "https://buildgate.dev",
    hook_attributes: {
      url: "http://localhost:3050/api/webhook/github"
    },
    redirect_url: "http://localhost:3000",
    public: false,
    default_permissions: {
      checks: "write",
      pull_requests: "read",
      contents: "read",
      statuses: "write"
    },
    default_events: [
      "pull_request",
      "push",
      "check_run",
      "check_suite"
    ]
  };
}

function createJWT(appId, privateKeyPem) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + (10 * 60),
    iss: appId
  };

  const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const data = `${b64(header)}.${b64(payload)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  const signature = signer.sign(privateKeyPem, 'base64url');

  return `${data}.${signature}`;
}

async function updateGitHubCheckRun(installationToken, repoFullName, checkRunData) {
  console.log(`📡 [GITHUB APP] Updating Check Run for ${repoFullName}: ${checkRunData.conclusion}`);
  // In production, dispatches to https://api.github.com/repos/{owner}/{repo}/check-runs
  return { id: 101, status: checkRunData.status, conclusion: checkRunData.conclusion };
}

module.exports = {
  generateGitHubAppManifest,
  createJWT,
  updateGitHubCheckRun
};
