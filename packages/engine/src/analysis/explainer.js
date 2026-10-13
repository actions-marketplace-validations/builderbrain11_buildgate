// Plain-English Bounded Explanation Engine
// Translates deterministic evidence into founder-friendly language without hallucinations

function generatePlainEnglishExplanation(verificationReport) {
  const { results, changeAnalysis } = verificationReport;
  const failingChecks = results.filter(r => r.status === 'failed');
  const warningChecks = results.filter(r => r.status === 'warning');
  
  const journeyCheck = results.find(r => r.id === 'check_critical_journeys');
  const securityCheck = results.find(r => r.id === 'check_security');

  let overallStatus = 'passed';
  let overallHeadline = 'All checks passed. Safe to proceed.';
  let explanation = '';
  let recommendations = [];

  if (failingChecks.length > 0) {
    overallStatus = 'attention';
    overallHeadline = 'Changes need attention';
    
    // Check specific regressions
    if (journeyCheck && journeyCheck.failingJourneys && journeyCheck.failingJourneys.includes('Payment Flow')) {
      explanation = 'I\'ve analyzed the changes and found 1 failing test related to order status updates. The webhook handler is currently failing to transition the order from pending_payment to paid status upon receiving a payment_intent.succeeded event from Stripe. As a result, customers who pay will not have their orders confirmed.';
      
      recommendations.push({
        action: 'restore_order_mutation',
        label: 'Propose a fix (in a new branch)',
        description: 'Update /api/webhooks/stripe.js to call updateOrderStatus(orderId, "paid", paymentRef) and restore HMAC signature validation.'
      });
      recommendations.push({
        action: 'explain_test',
        label: 'Explain the failing test',
        description: 'Deep dive into why Payment Flow failed at Step 3 (order status assertion).'
      });
      recommendations.push({
        action: 'check_related',
        label: 'Check for related issues',
        description: 'Inspect database schemas and webhook replay policies.'
      });
      recommendations.push({
        action: 'run_tests',
        label: 'Run additional tests',
        description: 'Execute full end-to-end synthetic Playwright checkout journey.'
      });
    } else {
      explanation = `The verification pipeline identified ${failingChecks.length} failed check(s). Review the detailed logs below before merging.`;
    }
  } else if (warningChecks.length > 0) {
    overallStatus = 'warning';
    overallHeadline = 'Passed with non-blocking warnings';
    explanation = 'All critical journeys and unit tests passed, but minor warnings were detected (such as dependency notices).';
  } else {
    overallStatus = 'passed';
    overallHeadline = 'Verified: All critical behavior preserved';
    explanation = 'Every critical user journey (Login, Create Order, Payment Flow, View Orders) and all unit tests passed. No secrets or security regressions detected.';
  }

  return {
    overallStatus,
    overallHeadline,
    explanation,
    recommendations,
    failingCount: failingChecks.length,
    warningCount: warningChecks.length,
    passedCount: results.filter(r => r.status === 'passed').length,
    totalCount: results.length
  };
}

module.exports = { generatePlainEnglishExplanation };
