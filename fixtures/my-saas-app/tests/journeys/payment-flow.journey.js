// Critical Journey: Payment Flow and Webhook Processing
const assert = require('assert');
const crypto = require('crypto');
const { createOrder, getOrder } = require('../../src/services/order');
const { handleStripeWebhook } = require('../../src/api/webhooks/stripe');
const env = require('../../src/config/env');

async function runPaymentFlowJourney() {
  const assertions = [];

  // Create test order
  const order = createOrder('usr_jane_doe', [
    { name: 'Developer Plan Annual', price: 299, quantity: 1 }
  ]);

  // Step 1: Initialize payment intent / checkout
  try {
    assert.strictEqual(order.status, 'pending_payment');
    assert.strictEqual(order.breakdown.total > 0, true);
    assertions.push({ step: 'Step 1: Initialize payment session and associate with order', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 1: Initialize payment session and associate with order', passed: false, error: err.message });
  }

  // Step 2: Receive and verify payment.succeeded webhook payload
  const webhookEvent = {
    id: 'evt_stripe_sim_99',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_3MtwBwLkdIwHu7ix28a3tqZ',
        status: 'succeeded',
        amount: Math.round(order.breakdown.total * 100),
        currency: 'usd',
        metadata: {
          orderId: order.id
        }
      }
    }
  };

  const rawBody = JSON.stringify(webhookEvent);
  const timestamp = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${rawBody}`).digest('hex');
  const headers = { 'stripe-signature': `t=${timestamp},v1=${sig}` };

  let webhookResult;
  try {
    webhookResult = await handleStripeWebhook(rawBody, headers);
    assert.strictEqual(webhookResult.received, true);
    assertions.push({ step: 'Step 2: Authenticate and ingest Stripe webhook signature', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 2: Authenticate and ingest Stripe webhook signature', passed: false, error: err.message });
  }

  // Step 3: Verify order status updated to paid in database
  try {
    const updatedOrder = getOrder(order.id);
    if (!updatedOrder) {
      throw new Error(`Order ${order.id} not found in database`);
    }
    assert.strictEqual(
      updatedOrder.status,
      'paid',
      `Expected order status to be 'paid' upon webhook confirmation, but found '${updatedOrder.status}'`
    );
    assert.strictEqual(
      updatedOrder.paymentRef,
      'pi_3MtwBwLkdIwHu7ix28a3tqZ',
      'Order record must store verified payment transaction reference'
    );
    assertions.push({ step: 'Step 3: Transition order to paid state and link transaction ID', passed: true });
  } catch (err) {
    assertions.push({ step: 'Step 3: Transition order to paid state and link transaction ID', passed: false, error: err.message });
  }

  const passedCount = assertions.filter(a => a.passed).length;
  return {
    journey: 'Payment Flow',
    totalTests: assertions.length,
    passedCount,
    failedCount: assertions.length - passedCount,
    status: passedCount === assertions.length ? 'passed' : 'failed',
    assertions
  };
}

module.exports = { runPaymentFlowJourney };
