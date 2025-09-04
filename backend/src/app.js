const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Stripe Webhook must use raw body parser (MUST BE BEFORE express.json())
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('🔔 Webhook endpoint hit!');
  console.log('📋 Headers:', req.headers);
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('📋 Webhook received:', event.type);
    console.log('📋 Event ID:', event.id);
    console.log('📋 Event data:', JSON.stringify(event.data.object, null, 2));

    // Handle payment intent events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    console.error('❌ Full error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Body parsing middleware (AFTER webhook endpoint)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Helper function to handle successful payment intent
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  console.log('✅ Payment intent succeeded:', paymentIntent.id);
  
  try {
    const Order = require('./models/Order');
    const metadata = paymentIntent.metadata;
    
    if (metadata.type === 'order_payment' && metadata.orderId) {
      // Update existing order
      const order = await Order.findById(metadata.orderId);
      
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'confirmed';
        order.transactionId = paymentIntent.id;
        await order.save();
        console.log('✅ Order updated from webhook:', order._id);
      }
    } else if (metadata.type === 'cart_checkout') {
      // Create new order from cart checkout
      const order = await createOrderFromPaymentIntent(paymentIntent);
      console.log('✅ Order created from payment intent:', order._id);
    }
  } catch (error) {
    console.error('❌ Error handling payment intent success:', error);
  }
};

// Helper function to handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent) => {
  console.log('❌ Payment intent failed:', paymentIntent.id);
  
  try {
    const Order = require('./models/Order');
    const metadata = paymentIntent.metadata;
    
    if (metadata.orderId) {
      const order = await Order.findById(metadata.orderId);
      
      if (order) {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();
        console.log('✅ Order updated to failed status:', order._id);
      }
    }
  } catch (error) {
    console.error('❌ Error updating failed order:', error);
  }
};

// Helper function to create order from payment intent
const createOrderFromPaymentIntent = async (paymentIntent) => {
  const Order = require('./models/Order');
  
  try {
    const metadata = paymentIntent.metadata;
    const userId = metadata.userId;
    const items = JSON.parse(metadata.items || '[]');
    
    // Create order with default shipping address
    const order = new Order({
      user: userId,
      items: items,
      totalAmount: paymentIntent.amount / 100, // Convert from cents
      shippingAddress: {
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
      paymentStatus: 'completed',
      status: 'confirmed',
      stripePaymentIntentId: paymentIntent.id,
      transactionId: paymentIntent.id
    });
    
    await order.save();
    return order;
  } catch (error) {
    console.error('❌ Error creating order from payment intent:', error);
    throw error;
  }
};

// Helper function to handle completed checkout session
const handleCheckoutSessionCompleted = async (session) => {
  console.log('✅ Checkout session completed:', session.id);
  
  try {
    const Order = require('./models/Order');
    const User = require('./models/User');
    const metadata = session.metadata;
    const userId = metadata.userId;
    const items = JSON.parse(metadata.items || '[]');
    
    // Create order from checkout session
    const order = new Order({
      user: userId,
      items: items,
      totalAmount: session.amount_total / 100, // Convert from cents
      shippingAddress: {
        firstName: session.customer_details?.name?.split(' ')[0] || 'N/A',
        lastName: session.customer_details?.name?.split(' ').slice(1).join(' ') || 'N/A',
        address: session.customer_details?.address?.line1 || 'N/A',
        city: session.customer_details?.address?.city || 'N/A',
        state: session.customer_details?.address?.state || 'N/A',
        zipCode: session.customer_details?.address?.postal_code || 'N/A',
        country: session.customer_details?.address?.country || 'US',
        phone: session.customer_details?.phone || 'N/A'
      },
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      status: 'confirmed',
      stripePaymentIntentId: session.payment_intent,
      transactionId: session.id
    });
    
    await order.save();
    console.log('✅ Order created from checkout session:', order._id);
    
    // Clear user's cart after successful order
    try {
      await User.findByIdAndUpdate(userId, { $set: { cart: [] } });
      console.log('✅ User cart cleared for user:', userId);
    } catch (cartError) {
      console.error('❌ Error clearing user cart:', cartError);
    }
    
  } catch (error) {
    console.error('❌ Error creating order from checkout session:', error);
  }
};

// Import routes (load them regardless of database connection)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user/cart', cartRoutes);
app.use('/api/user/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);


console.log('✅ All routes loaded successfully');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Server will continue without database connection');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Eyesome API is running',
    timestamp: new Date().toISOString()
  });
});

// Test webhook endpoint (for development only)
app.post('/api/test-webhook', async (req, res) => {
  try {
    console.log('🧪 Test webhook triggered manually');
    
    // Simulate a checkout session completed event
    const mockSession = {
      id: 'cs_test_' + Date.now(),
      metadata: {
        userId: req.body.userId || 'test_user_id',
        items: JSON.stringify(req.body.items || [])
      },
      amount_total: (req.body.totalAmount || 100) * 100, // Convert to cents
      customer_details: {
        name: req.body.customerName || 'Test Customer',
        address: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US'
        },
        phone: '1234567890'
      },
      payment_intent: 'pi_test_' + Date.now()
    };
    
    await handleCheckoutSessionCompleted(mockSession);
    
    res.json({ 
      success: true, 
      message: 'Test webhook processed successfully',
      sessionId: mockSession.id
    });
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Test webhook failed',
      error: error.message 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
