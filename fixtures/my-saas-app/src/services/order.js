// Order calculation and database access layer for my-saas-app
const ordersDatabase = new Map();

function calculateTotal(items = [], discountCode = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  let subtotal = 0;
  for (const item of items) {
    if (typeof item.price !== 'number' || item.price < 0) {
      throw new Error(`Invalid item price: ${item.price}`);
    }
    const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
    subtotal += item.price * quantity;
  }

  let discount = 0;
  if (discountCode === 'FOUNDER20') {
    discount = subtotal * 0.20;
  } else if (discountCode === 'BUILDGATE10' || discountCode === 'VERITY10') {
    discount = subtotal * 0.10;
  }

  const tax = (subtotal - discount) * 0.08;
  const total = Math.round((subtotal - discount + tax) * 100) / 100;

  return {
    subtotal,
    discount,
    tax: Math.round(tax * 100) / 100,
    total
  };
}

function createOrder(customerId, items, discountCode = null) {
  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  const breakdown = calculateTotal(items, discountCode);
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const order = {
    id: orderId,
    customerId,
    items,
    breakdown,
    status: 'pending_payment',
    paymentRef: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  ordersDatabase.set(orderId, order);
  return order;
}

function updateOrderStatus(orderId, status, paymentRef = null) {
  const order = ordersDatabase.get(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  order.status = status;
  if (paymentRef) {
    order.paymentRef = paymentRef;
  }
  order.updatedAt = new Date().toISOString();
  ordersDatabase.set(orderId, order);
  return order;
}

function getOrder(orderId) {
  return ordersDatabase.get(orderId) || null;
}

function listCustomerOrders(customerId) {
  const result = [];
  for (const order of ordersDatabase.values()) {
    if (order.customerId === customerId) {
      result.push(order);
    }
  }
  return result;
}

module.exports = {
  calculateTotal,
  createOrder,
  updateOrderStatus,
  getOrder,
  listCustomerOrders,
  ordersDatabase
};
