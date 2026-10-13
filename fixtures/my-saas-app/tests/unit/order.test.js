// Unit test: Order calculation and lifecycle
const assert = require('assert');
const { calculateTotal, createOrder, getOrder } = require('../../src/services/order');

function runOrderTests() {
  const results = [];

  // Test 1: Calculate total with tax
  try {
    const items = [
      { name: 'Pro Plan', price: 100, quantity: 1 },
      { name: 'Addon Storage', price: 20, quantity: 2 }
    ];
    const calc = calculateTotal(items);
    assert.strictEqual(calc.subtotal, 140, 'Subtotal should be 140');
    assert.strictEqual(calc.tax, 11.2, 'Tax should be 8% of 140 = 11.2');
    assert.strictEqual(calc.total, 151.2, 'Total should be 151.20');
    results.push({ name: 'Order Calculation: Multi-item subtotal and tax', passed: true });
  } catch (err) {
    results.push({ name: 'Order Calculation: Multi-item subtotal and tax', passed: false, error: err.message });
  }

  // Test 2: Discount code application
  try {
    const items = [{ name: 'Team Seat', price: 100, quantity: 1 }];
    const calc = calculateTotal(items, 'FOUNDER20');
    assert.strictEqual(calc.discount, 20, '20% discount should equal 20');
    assert.strictEqual(calc.tax, 6.4, 'Tax should be 8% of 80 = 6.4');
    assert.strictEqual(calc.total, 86.4, 'Total should be 86.4');
    results.push({ name: 'Order Calculation: Discount code reduction', passed: true });
  } catch (err) {
    results.push({ name: 'Order Calculation: Discount code reduction', passed: false, error: err.message });
  }

  // Test 3: Order creation and initial state
  try {
    const order = createOrder('cust_101', [{ name: 'Solo Plan', price: 49, quantity: 1 }]);
    assert.ok(order.id.startsWith('ord_'), 'Order ID should have prefix ord_');
    assert.strictEqual(order.status, 'pending_payment', 'Initial status must be pending_payment');
    assert.strictEqual(order.customerId, 'cust_101', 'Customer ID should match');
    const fetched = getOrder(order.id);
    assert.deepStrictEqual(fetched.id, order.id, 'Fetched order must match');
    results.push({ name: 'Order Lifecycle: Record creation in pending state', passed: true });
  } catch (err) {
    results.push({ name: 'Order Lifecycle: Record creation in pending state', passed: false, error: err.message });
  }

  return results;
}

module.exports = { runOrderTests };
