// Critical Journey: View Orders
const assert = require('assert');
const { createOrder, listCustomerOrders } = require('../../src/services/order');

async function runViewOrdersJourney() {
  const assertions = [];

  const customerId = 'usr_jane_doe';
  createOrder(customerId, [{ name: 'Seat 1', price: 20, quantity: 1 }]);
  createOrder(customerId, [{ name: 'Seat 2', price: 20, quantity: 1 }]);

  // Step 1: Query customer order history
  try {
    const list = listCustomerOrders(customerId);
    assert.ok(list.length >= 2, 'Should return at least 2 customer orders');
    assertions.push({ step: 'Step 1: Retrieve customer order collection from database', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 1: Retrieve customer order collection from database', passed: false, error: err.message });
  }

  // Step 2: Ensure sensitive credentials or other tenants are not leaked
  try {
    const list = listCustomerOrders(customerId);
    for (const ord of list) {
      assert.strictEqual(ord.customerId, customerId, 'Cross-tenant isolation check');
    }
    assertions.push({ step: 'Step 2: Enforce tenant isolation on order records', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 2: Enforce tenant isolation on order records', passed: false, error: err.message });
  }

  const passedCount = assertions.filter(a => a.passed).length;
  return {
    journey: 'View Orders',
    totalTests: assertions.length,
    passedCount,
    failedCount: assertions.length - passedCount,
    status: passedCount === assertions.length ? 'passed' : 'failed',
    assertions
  };
}

module.exports = { runViewOrdersJourney };
