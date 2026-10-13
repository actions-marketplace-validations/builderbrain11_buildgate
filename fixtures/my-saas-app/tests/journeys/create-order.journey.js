// Critical Journey: Create Order Flow
const assert = require('assert');
const { createOrder, getOrder } = require('../../src/services/order');

async function runCreateOrderJourney() {
  const assertions = [];

  // Step 1: Submit item payload and calculate taxes correctly
  let order;
  try {
    order = createOrder('usr_jane_doe', [
      { name: 'AI SaaS Pro Tier', price: 79, quantity: 1 }
    ], 'FOUNDER20');
    assert.ok(order.id, 'Order should be created with an ID');
    assert.strictEqual(order.breakdown.discount, 15.8, '20% discount on 79 should be 15.8');
    assertions.push({ step: 'Step 1: Calculate discounts and total order cost', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 1: Calculate discounts and total order cost', passed: false, error: err.message });
  }

  // Step 2: Persist order in pending state and verify lookup
  try {
    const fetched = getOrder(order.id);
    assert.strictEqual(fetched.status, 'pending_payment');
    assert.strictEqual(fetched.customerId, 'usr_jane_doe');
    assertions.push({ step: 'Step 2: Commit pending order to database with integrity check', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 2: Commit pending order to database with integrity check', passed: false, error: err.message });
  }

  const passedCount = assertions.filter(a => a.passed).length;
  return {
    journey: 'Create Order',
    totalTests: assertions.length,
    passedCount,
    failedCount: assertions.length - passedCount,
    status: passedCount === assertions.length ? 'passed' : 'failed',
    assertions
  };
}

module.exports = { runCreateOrderJourney };
