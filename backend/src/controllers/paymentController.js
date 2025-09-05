const { stripe, stripeConfig } = require('../config/stripe');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Create Stripe Payment Intent (like your working example)
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user._id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    // Calculate total amount in cents
    const amountInCents = Math.round((totalAmount || 0) * 100);

    if (amountInCents < 50) { // Stripe minimum is 50 cents
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least $0.50'
      });
    }

    // Create or get Stripe customer
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: req.user.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.username,
          metadata: {
            userId: userId.toString()
          }
        });
      }
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create customer'
      });
    }

    // Create payment intent (like your working example)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: customer.id,
      metadata: {
        userId: userId.toString(),
        items: JSON.stringify(items)
      },
      description: `Payment for ${items.length} item(s)`,
      capture_method: 'automatic'
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// @desc    Create Stripe Payment Intent (Legacy)
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntentLegacy = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get the order
    const order = await Order.findById(orderId).populate('user');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order is no longer pending'
      });
    }

    // Create or get Stripe customer
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: order.user.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: order.user.email,
          name: order.user.username,
          metadata: {
            userId: order.user._id.toString()
          }
        });
      }
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create customer'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.finalAmount * 100), // Convert to cents
      currency: 'usd',
      customer: customer.id,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
        orderNumber: order.orderNumber
      },
      description: `Payment for order ${order.orderNumber}`,
      shipping: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address: {
          line1: order.shippingAddress.address,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postal_code: order.shippingAddress.zipCode,
          country: order.shippingAddress.country || 'US'
        },
        phone: order.shippingAddress.phone
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    // Update order with payment intent ID
    order.paymentId = paymentIntent.id;
    await order.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          finalAmount: order.finalAmount
        }
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
};

// @desc    Confirm Payment and Update Order
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: 'Payment intent not found'
      });
    }

    // Find the order
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update order based on payment status
    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
      order.paymentId = paymentIntent.id;
      
      // Store payment method details
      if (paymentIntent.payment_method) {
        const paymentMethod = await stripe.paymentMethods.retrieve(
          paymentIntent.payment_method
        );
        order.paymentMethodDetails = {
          type: paymentMethod.type,
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          funding: paymentMethod.card?.funding
        };
      }

      await order.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            finalAmount: order.finalAmount
          },
          payment: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          }
        }
      });

    } else if (paymentIntent.status === 'requires_payment_method') {
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
        data: {
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus
          }
        }
      });

    } else {
      res.status(400).json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`,
        data: {
          paymentStatus: paymentIntent.status
        }
      });
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

// @desc    Handle Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment intent succeeded:', paymentIntent.id);
        
        // Create order after successful payment
        await createOrderFromPaymentIntent(paymentIntent);
        break;



      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('PaymentIntent failed:', failedPayment.id);
        
        // Update order status
        await Order.findOneAndUpdate(
          { paymentId: failedPayment.id },
          { 
            paymentStatus: 'failed',
            status: 'cancelled'
          }
        );
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object;
        console.log('PaymentIntent canceled:', canceledPayment.id);
        
        // Update order status
        await Order.findOneAndUpdate(
          { paymentId: canceledPayment.id },
          { 
            paymentStatus: 'failed',
            status: 'cancelled'
          }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper function to create order from payment intent
const createOrderFromPaymentIntent = async (paymentIntent) => {
  try {
    const { userId, items } = paymentIntent.metadata;
    const parsedItems = JSON.parse(items);

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for payment intent:', userId);
      return;
    }

    // Get products
    const productIds = parsedItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Create order items
    const orderItems = parsedItems.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        product: product._id,
        quantity: item.quantity,
        price: item.price
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = 10; // Fixed shipping cost
    const finalAmount = subtotal + shippingCost;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: {
        firstName: user.username?.split(' ')[0] || 'N/A',
        lastName: user.username?.split(' ').slice(1).join(' ') || 'N/A',
        address: 'N/A',
        city: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        country: 'US',
        phone: 'N/A'
      },
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      status: 'confirmed',
      subtotal,
      shippingCost,
      finalAmount,
      stripePaymentIntentId: paymentIntent.id,
      paymentMethodDetails: {
        type: 'card',
        brand: 'stripe',
        last4: '****'
      }
    });

    await order.save();
    console.log('Order created from payment intent:', order.orderNumber);

  } catch (error) {
    console.error('Error creating order from payment intent:', error);
  }
};

// @desc    Get Payment Methods
// @route   GET /api/payments/methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = {
      card: {
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        icon: '💳',
        enabled: true
      },
      apple_pay: {
        name: 'Apple Pay',
        description: 'Pay with Apple Pay',
        icon: '🍎',
        enabled: true
      },
      google_pay: {
        name: 'Google Pay',
        description: 'Pay with Google Pay',
        icon: '📱',
        enabled: true
      },
      samsung_pay: {
        name: 'Samsung Pay',
        description: 'Pay with Samsung Pay',
        icon: '📱',
        enabled: true
      },
      cash_app: {
        name: 'Cash App',
        description: 'Pay with Cash App',
        icon: '💰',
        enabled: true
      }
    };

    res.json({
      success: true,
              data: {
        paymentMethods,
        currency: 'USD',
        supportedCountries: ['US']
      }
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods'
    });
  }
};

// @desc    Get User Orders
// @route   GET /api/payments/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    console.log('📦 Getting orders for user:', userId);

    let query = { user: userId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders: orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total: total
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

// @desc    Get Single Order
// @route   GET /api/payments/orders/:orderId
// @access  Private
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    console.log('📦 Getting order:', orderId);

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product', 'name price images description')
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order: order
      }
    });

  } catch (error) {
    console.error('❌ Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

// @desc    Create Order and Payment Intent
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    const userId = req.user._id;

    console.log('📦 Creating order for user:', userId);
    console.log('📋 Items:', items);
    console.log('💰 Total amount:', totalAmount);

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required and must be a non-empty array'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total amount must be greater than 0'
      });
    }

    // Create order first
    const order = new Order({
      user: userId,
      items: items,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress || {
        firstName: 'N/A',
        lastName: 'N/A',
        address: 'N/A',
        city: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        country: 'US',
        phone: 'N/A'
      },
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      status: 'pending'
    });

    await order.save();
    console.log('✅ Order created:', order._id);

    // Create or retrieve Stripe customer
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: req.user.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.username,
          metadata: {
            userId: userId.toString()
          }
        });
      }
    } catch (customerError) {
      console.error('❌ Error with Stripe customer:', customerError);
      return res.status(400).json({
        success: false,
        message: 'Error setting up payment customer',
        error: customerError.message
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      customer: customer.id,
      description: `Payment for order ${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
        type: 'order_payment'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    console.log('✅ Payment intent created for order:', paymentIntent.id);

    res.json({
      success: true,
      data: {
        order: order,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, shippingAddress, successUrl, cancelUrl } = req.body;
    const userId = req.user._id;
    
    console.log('📋 Backend received shipping address:', shippingAddress);
    console.log('📋 Shipping address type:', typeof shippingAddress);
    console.log('📋 Shipping address keys:', shippingAddress ? Object.keys(shippingAddress) : 'undefined');

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'Success and cancel URLs are required'
      });
    }

    // Calculate total amount in cents
    const amountInCents = Math.round((totalAmount || 0) * 100);

    if (amountInCents < 50) { // Stripe minimum is 50 cents
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least $0.50'
      });
    }

    // Create or get Stripe customer
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: req.user.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.username,
          metadata: {
            userId: userId.toString()
          }
        });
      }
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create customer'
      });
    }

    // Prepare line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || 'Product',
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        paymentMethod: paymentMethod || 'card',
        items: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress || {})
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB'],
      },
    });

    console.log('✅ Checkout session created:', session.id);

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url
      }
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  createPaymentIntentLegacy,
  createOrder,
  createCheckoutSession,
  confirmPayment,
  getPaymentMethods,
  getUserOrders,
  getOrder
};
