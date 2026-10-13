// Test aggregator for my-saas-app fixture
const { runOrderTests } = require('./unit/order.test');
const { runWebhookTests } = require('./unit/webhook.test');
const { runLoginJourney } = require('./journeys/login.journey');
const { runCreateOrderJourney } = require('./journeys/create-order.journey');
const { runPaymentFlowJourney } = require('./journeys/payment-flow.journey');
const { runViewOrdersJourney } = require('./journeys/view-orders.journey');

async function main() {
  console.log('--- Running my-saas-app test suite ---');
  const unitOrder = runOrderTests();
  const unitWebhook = await runWebhookTests();
  const journeyLogin = await runLoginJourney();
  const journeyCreate = await runCreateOrderJourney();
  const journeyPayment = await runPaymentFlowJourney();
  const journeyView = await runViewOrdersJourney();

  const allUnit = [...unitOrder, ...unitWebhook];
  const unitPassed = allUnit.filter(u => u.passed).length;

  console.log(`Unit Tests: ${unitPassed}/${allUnit.length} passed`);
  console.log(`Journey Login: ${journeyLogin.passedCount}/${journeyLogin.totalTests} passed`);
  console.log(`Journey Create Order: ${journeyCreate.passedCount}/${journeyCreate.totalTests} passed`);
  console.log(`Journey Payment Flow: ${journeyPayment.passedCount}/${journeyPayment.totalTests} passed`);
  console.log(`Journey View Orders: ${journeyView.passedCount}/${journeyView.totalTests} passed`);

  const hasFailures = allUnit.some(u => !u.passed) ||
    journeyLogin.failedCount > 0 ||
    journeyCreate.failedCount > 0 ||
    journeyPayment.failedCount > 0 ||
    journeyView.failedCount > 0;

  // Machine-readable result consumed by Buildgate after isolated execution.
  const machineResult = {
    unitTests: allUnit,
    journeys: [journeyLogin, journeyCreate, journeyPayment, journeyView]
  };
  console.log(`BUILDGATE_RESULTS_JSON=${JSON.stringify(machineResult)}`);

  if (hasFailures) {
    console.error('❌ Failures detected in suite');
    process.exit(1);
  } else {
    console.log('✅ All tests and critical journeys passed');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
}

module.exports = {
  runOrderTests,
  runWebhookTests,
  runLoginJourney,
  runCreateOrderJourney,
  runPaymentFlowJourney,
  runViewOrdersJourney
};
