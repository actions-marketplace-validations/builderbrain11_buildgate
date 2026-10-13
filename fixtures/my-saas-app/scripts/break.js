// Introduces the AI-coder regression into my-saas-app
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'api', 'webhooks', 'stripe.js');

const brokenCode = `// Stripe Webhook Endpoint Handler (Modified by ai-coder)
// WARNING: AI introduced regression - signature check bypassed and order status update omitted!
const crypto = require('crypto');
const { updateOrderStatus, getOrder } = require('../../services/order');
const env = require('../../config/env');

// Flaw 1 (Security finding): Signature validation bypassed
function verifyStripeSignature(payload, signatureHeader, secret) {
  // AI shortcut: "return true for now during testing"
  return true; 
}

async function handleStripeWebhook(rawBody, headers) {
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    const error = new Error('Invalid JSON payload');
    error.statusCode = 400;
    throw error;
  }

  // Flaw 2 (Critical regression): AI omitted updating the order status in database!
  if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
    const orderId = event.data?.object?.metadata?.orderId;
    console.log('[AI Webhook] Payment confirmed for order:', orderId);
    
    // REGRESSION BUG: Order status update omitted! Order remains 'pending_payment'
    // updateOrderStatus(orderId, 'paid', event.data?.object?.id); <-- AI commented out!

    return {
      received: true,
      action: 'acknowledged_without_db_update',
      orderId,
      status: 'pending_payment'
    };
  }

  return {
    received: true,
    action: 'event_ignored',
    eventType: event.type
  };
}

module.exports = {
  handleStripeWebhook,
  verifyStripeSignature
};
`;

fs.writeFileSync(targetFile, brokenCode, 'utf8');
console.log('🔴 Introduced regression: Bypassed webhook signature & omitted order status update in stripe.js');
