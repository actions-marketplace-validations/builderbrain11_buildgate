// Stripe Webhook Endpoint Handler
// Endpoint: /api/webhooks/stripe
const crypto = require('crypto');
const { updateOrderStatus, getOrder } = require('../../services/order');
const env = require('../../config/env');

function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) {
    return false;
  }
  const parts = signatureHeader.split(',');
  let timestamp = null;
  let signature = null;

  for (const part of parts) {
    const [key, val] = part.trim().split('=');
    if (key === 't') timestamp = val;
    if (key === 'v1') signature = val;
  }

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

async function handleStripeWebhook(rawBody, headers) {
  const signature = headers['stripe-signature'];

  // Signature verification
  const isValid = verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!isValid) {
    const error = new Error('Invalid Stripe signature');
    error.statusCode = 400;
    throw error;
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    const error = new Error('Invalid JSON payload');
    error.statusCode = 400;
    throw error;
  }

  // Handle payment success event
  if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
    const orderId = event.data?.object?.metadata?.orderId;
    const paymentId = event.data?.object?.id;

    if (!orderId) {
      throw new Error('Missing orderId in payment metadata');
    }

    const order = getOrder(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} does not exist`);
    }

    // Critical Invariant: Update status to 'paid' with payment transaction ID
    updateOrderStatus(orderId, 'paid', paymentId);

    return {
      received: true,
      action: 'order_marked_paid',
      orderId,
      status: 'paid'
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
