// Buildgate Evidence Store and Report Generator
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeEvidenceDigest(data) {
  const canonical = {
    scanId: data.scanId,
    commitSha: (data.revision && data.revision.commitSha) || (data.changeAnalysis && data.changeAnalysis.commit && data.changeAnalysis.commit.sha) || 'unversioned',
    executionMode: data.executionMode,
    overallStatus: data.explanation && data.explanation.overallStatus,
    passedCount: data.explanation && data.explanation.passedCount,
    totalCount: Array.isArray(data.results) ? data.results.length : 0,
    timestamp: data.timestamp
  };
  return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

function verifyEvidenceIntegrity(report) {
  if (!report || !report.attestation || !report.attestation.sha256Digest) {
    return { valid: false, reason: 'No cryptographic attestation block found in evidence' };
  }
  const expected = computeEvidenceDigest(report);
  const match = expected === report.attestation.sha256Digest;
  return {
    valid: match,
    expectedDigest: expected,
    recordedDigest: report.attestation.sha256Digest,
    reason: match ? 'Tamper-free verified evidence' : 'Digest mismatch: evidence payload was altered after generation'
  };
}

function saveVerificationEvidence(projectPath, verificationData) {
  const reportsDir = path.join(projectPath, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Bind cryptographic SHA-256 evidence attestation
  const sha = (verificationData.changeAnalysis && verificationData.changeAnalysis.commit && verificationData.changeAnalysis.commit.sha) || 'latest';
  const digest = computeEvidenceDigest(verificationData);
  verificationData.attestation = {
    version: '1.0',
    algorithm: 'SHA-256',
    sha256Digest: digest,
    provenance: {
      commitSha: sha,
      executionMode: verificationData.executionMode,
      mergeEligible: Boolean(verificationData.mergeEligible),
      signedAt: new Date().toISOString()
    }
  };

  // 1. Machine-readable JSON artifact (Buildgate report & legacy verity pointer)
  const buildgateJsonPath = path.join(reportsDir, 'buildgate-report.json');
  const legacyJsonPath = path.join(reportsDir, 'verity-report.json');
  const jsonContent = JSON.stringify(verificationData, null, 2);
  fs.writeFileSync(buildgateJsonPath, jsonContent, 'utf8');
  fs.writeFileSync(legacyJsonPath, jsonContent, 'utf8');

  // 2. Immutable revision-bound evidence record
  const revisionPath = path.join(reportsDir, `evidence-${sha}.json`);
  fs.writeFileSync(revisionPath, jsonContent, 'utf8');

  // 3. Maintain chronological historical timeline index
  const indexPath = path.join(reportsDir, 'evidence-index.json');
  let history = [];
  try {
    if (fs.existsSync(indexPath)) {
      history = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }
  } catch (_) {
    history = [];
  }
  const entry = {
    scanId: verificationData.scanId,
    timestamp: verificationData.timestamp,
    commitSha: sha,
    branch: (verificationData.changeAnalysis && verificationData.changeAnalysis.commit && verificationData.changeAnalysis.commit.branch) || 'main',
    status: verificationData.explanation.overallStatus,
    headline: verificationData.explanation.overallHeadline,
    passedCount: verificationData.explanation.passedCount,
    totalCount: verificationData.explanation.totalCount,
    executionMode: verificationData.executionMode || 'container',
    mergeEligible: Boolean(verificationData.mergeEligible),
    workerMode: verificationData.revision ? verificationData.revision.workerMode : 'docker-worker',
    durationMs: verificationData.totalDurationMs
  };
  // Append if new or update existing scan entry
  history = [entry, ...history.filter(h => h.scanId !== entry.scanId)].slice(0, 50);
  fs.writeFileSync(indexPath, JSON.stringify(history, null, 2), 'utf8');

  // 4. Human-readable Markdown summary for GitHub PR or founder review
  const buildgateMdPath = path.join(reportsDir, 'buildgate-report.md');
  const legacyMdPath = path.join(reportsDir, 'verity-report.md');
  const mdContent = generateMarkdownReport(verificationData);
  fs.writeFileSync(buildgateMdPath, mdContent, 'utf8');
  fs.writeFileSync(legacyMdPath, mdContent, 'utf8');

  // 5. Mirror into apps/web for live dashboard sync if web exists
  const webDataDir = path.join(__dirname, '../../../../apps/web/src/data');
  if (fs.existsSync(webDataDir)) {
    fs.writeFileSync(path.join(webDataDir, 'latest-scan.json'), jsonContent, 'utf8');
  }

  return {
    jsonPath: buildgateJsonPath,
    mdPath: buildgateMdPath,
    revisionPath
  };
}

function generateMarkdownReport(data) {
  const { changeAnalysis, explanation, results } = data;
  const statusEmoji = explanation.overallStatus === 'passed' ? '✅' : '❌';

  let md = `# Buildgate Verification Report ${statusEmoji}\n\n`;
  md += `**Commit:** \`${changeAnalysis.commit.sha}\` (${changeAnalysis.commit.branch})  \n`;
  md += `**Author:** ${changeAnalysis.commit.author}  \n`;
  md += `**Risk Level:** **${changeAnalysis.riskLevel}**  \n`;
  md += `**Execution Mode:** \`${data.executionMode || 'container'}\` | **Merge Eligible:** ${data.mergeEligible ? 'YES ✅' : 'NO ❌'}  \n`;
  md += `**Scan ID:** \`${data.scanId}\` | **Duration:** ${data.totalDurationMs}ms\n\n`;

  md += `## Overall Result: ${explanation.overallHeadline}\n\n`;
  md += `> ${explanation.explanation}\n\n`;

  md += `### What Changed\n`;
  for (const item of changeAnalysis.whatChanged) {
    md += `- **${item.item}** (${item.type})\n`;
  }
  md += `\n`;

  md += `### Verification Results\n\n`;
  md += `| Check | Status | Duration | Summary |\n`;
  md += `| :--- | :---: | :---: | :--- |\n`;
  for (const r of results) {
    const icon = r.status === 'passed' ? '✅ Passed' : (r.status === 'warning' ? '⚠️ Warning' : '❌ Failed');
    md += `| **${r.name}** | ${icon} | ${r.durationMs}ms | ${r.summary} |\n`;
  }
  md += `\n`;

  if (explanation.recommendations && explanation.recommendations.length > 0) {
    md += `### Recommended Next Actions\n`;
    for (const rec of explanation.recommendations) {
      md += `- **${rec.label}**: ${rec.description}\n`;
    }
  }

  md += `\n---\n*Generated by Buildgate — The Trust & Verification Gate for AI-Built Software (powered by legit.run)*\n`;
  return md;
}

module.exports = {
  saveVerificationEvidence,
  computeEvidenceDigest,
  verifyEvidenceIntegrity
};
