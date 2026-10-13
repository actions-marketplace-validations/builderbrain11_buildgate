// Security and Secret Scanner Check
const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  { name: 'Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/g, severity: 'critical' },
  { name: 'Supabase Service Role Key', regex: /service_role_[0-9a-zA-Z]{20,}/g, severity: 'critical' },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g, severity: 'high' },
  { name: 'Generic Private Key', regex: /-----BEGIN PRIVATE KEY-----/g, severity: 'critical' }
];

async function runSecurityCheck(projectPath) {
  const startTime = Date.now();
  const findings = [];
  const scannedFiles = [];

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'reports') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.env')) {
        scannedFiles.push(full);
        const content = fs.readFileSync(full, 'utf8');
        const rel = path.relative(projectPath, full).replace(/\\/g, '/');

        // 1. Check for real exposed secrets
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.regex.test(content)) {
            findings.push({
              category: 'secret_leak',
              severity: pattern.severity,
              confidence: 'high',
              title: `Exposed ${pattern.name} in ${rel}`,
              evidence: `Matched token pattern in ${rel}`,
              file: rel,
              recommendation: 'Rotate secret immediately and move to environment variable.'
            });
          }
        }

        // 2. Universal Cryptographic & Auth Bypass Detection (Applies across all files)
        const signatureBypassRegex = /(?:function\s+(?:verify|validate|check)\w*(?:Signature|Hmac|Webhook|Auth|Token)?\s*\([^)]*\)\s*\{[^}]*return\s+true\s*;|(?:const|let|var)\s+(?:verify|validate|check)\w*(?:Signature|Hmac|Webhook|Auth|Token)?\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>\s*true)/i;
        if (signatureBypassRegex.test(content) || (content.includes('// AI shortcut') && content.includes('return true;'))) {
          findings.push({
            category: 'vulnerability',
            severity: 'medium',
            confidence: 'high',
            title: `Bypassed Cryptographic Verification in ${rel}`,
            evidence: 'Signature/HMAC validation routine returns true unconditionally without validating cryptographic payload',
            file: rel,
            recommendation: 'Restore cryptographic timingSafeEqual HMAC verification to prevent spoofed requests.'
          });
        }

        // 3. Database Invariant & Mutation Omission Checks (e.g. commented-out DB writes in event/webhook handlers)
        const unpersistedEventPattern = /(?:\/\/\s*(?:await\s+)?(?:db\.|prisma\.|update|save|commit|insert)\w*\s*\(|acknowledged_without_db_update)/i;
        if ((rel.includes('webhook') || rel.includes('handler') || rel.includes('api/')) && unpersistedEventPattern.test(content)) {
          findings.push({
            category: 'logic_flaw',
            severity: 'medium',
            confidence: 'high',
            title: `Unpersisted State Mutation in ${rel}`,
            evidence: 'Webhook/event handler acknowledges external event while state persistence mutation is commented out or missing',
            file: rel,
            recommendation: 'Ensure database state transition is committed before returning success response.'
          });
        }

        // 4. Row Level Security Disabling Checks
        if (/ALTER\s+TABLE\s+\w+\s+DISABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(content)) {
          findings.push({
            category: 'vulnerability',
            severity: 'critical',
            confidence: 'high',
            title: `Disabled Row Level Security in ${rel}`,
            evidence: 'Table RLS policy was explicitly disabled, exposing multi-tenant records',
            file: rel,
            recommendation: 'Re-enable ROW LEVEL SECURITY and enforce tenant isolation policies.'
          });
        }
      }
    }
  }

  scan(projectPath);

  const durationMs = Date.now() - startTime;
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const status = criticalCount > 0 ? 'failed' : (mediumCount > 0 ? 'warning' : 'passed');

  return {
    id: 'check_security',
    name: 'Security & Secret Scan',
    category: 'security',
    status,
    durationMs,
    summary: findings.length === 0 
      ? 'No security vulnerabilities or secret exposures detected.'
      : `${findings.length} security finding(s) detected: ${criticalCount} critical, ${mediumCount} medium.`,
    findings,
    secretStatus: criticalCount === 0 ? 'passed' : 'failed'
  };
}

module.exports = { runSecurityCheck };
