// Simulates a signed GitHub Pull Request webhook event
const crypto = require('crypto');
const { handleGitHubWebhookEvent } = require('./webhook-receiver');

async function testGitHubWebhook() {
  const secret = 'sample_gh_secret_123';
  const payload = {
    action: 'opened',
    number: 24,
    pull_request: {
      number: 24,
      title: 'Add payment webhook handler',
      head: { sha: 'a3f9c2d', ref: 'main' },
      user: { login: 'ai-coder' }
    },
    repository: { full_name: 'founder/my-saas-app' }
  };

  const rawBody = JSON.stringify(payload);
  const signature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')}`;

  const req = {
    rawBody,
    headers: {
      'x-hub-signature-256': signature,
      'x-github-delivery': `deliv_${Date.now()}`,
      'x-github-event': 'pull_request'
    },
    webhookSecret: secret
  };

  const res = await handleGitHubWebhookEvent(req);
  console.log('✅ GitHub Webhook Dispatch Verified Successfully!');
  console.log('GitHub Check Run Conclusion:', res.checkRun.conclusion);
}

if (require.main === module) {
  testGitHubWebhook().catch(console.error);
}

module.exports = { testGitHubWebhook };
