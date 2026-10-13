// Unit test: Stripe Webhook handler and security verification
const assert = require('assert');
const crypto = require('crypto');
const { handleStripeWebhook, verifyStripeSignature } = require('../../src/api/webhooks/stripe');
const { createOrder, getOrder } = require('../../src/services/order');
const env = require('../../src/config/env');

function makeValidSignature(payload, secret = env.STRIPE_WEBHOOK_SECRET) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const sig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${sig}`;
}

async function runWebhookTests() {
  const results = [];

  // Test 1: Reject unauthenticated webhook calls
  try {
    const rawPayload = JSON.stringify({ type: 'payment_intent.succeeded' });
    let errorThrown = false;
    try {
      await handleStripeWebhook(rawPayload, { 'stripe-signature': 'invalid_signature_header' });
    } catch (err) {
      errorThrown = true;
      assert.strictEqual(err.message, 'Invalid Stripe signature');
    }
    assert.strictEqual(errorThrown, true, 'Handler must reject invalid signature');
    results.push({ name: 'Webhook Security: Signature verification rejection', passed: true });
  } catch (err) {
    results.push({ name: 'Webhook Security: Signature verification rejection', passed: false, error: err.message });
  }

  // Test 2: Process valid payment_intent.succeeded
  try {
    const order = createOrder('cust_test', [{ name: 'Growth Tier', price: 99, quantity: 1 }]);
    const payloadObj = {
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_abc',
          amount: 9900,
          metadata: { orderId: order.id }
        }
      }
    };
    const rawPayload = JSON.stringify(payloadObj);
    const signature = makeValidSignature(rawPayload);

    const res = await handleStripeWebhook(rawPayload, { 'stripe-signature': signature });
    assert.strictEqual(res.status, 'paid');
    const updated = getOrder(order.id);
    assert.strictEqual(updated.status, 'paid', 'Database record must reflect paid status');
    assert.strictEqual(updated.paymentRef, 'pi_test_abc', 'Database record must store payment reference');
    results.push({ name: 'Webhook Handler: Transition order from pending to paid', passed: true });
  } catch (err) {
    results.push({ name: 'Webhook Handler: Transition order from pending to paid', passed: false, error: err.message });
  }

  return results;
}

module.exports = { runWebhookTests };
