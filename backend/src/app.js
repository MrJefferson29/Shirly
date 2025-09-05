const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting (more lenient for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
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
    
    // Get user's saved address as primary source
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    let shippingAddress = {
      firstName: 'N/A',
      lastName: 'N/A',
      address: 'N/A',
      city: 'N/A',
      state: 'N/A',
      zipCode: 'N/A',
      country: 'US',
      phone: 'N/A'
    };
    
    // Use user's saved address if available
    if (user.shippingAddress && Object.keys(user.shippingAddress).length > 0) {
      const fullAddress = [user.shippingAddress.flat, user.shippingAddress.area].filter(Boolean).join(', ');
      shippingAddress = {
        firstName: user.shippingAddress.fullname?.split(' ')[0] || 'N/A',
        lastName: user.shippingAddress.fullname?.split(' ').slice(1).join(' ') || 'N/A',
        address: fullAddress || 'N/A',
        city: user.shippingAddress.city || 'N/A',
        state: user.shippingAddress.state || 'N/A',
        zipCode: user.shippingAddress.pincode || 'N/A',
        country: 'US',
        phone: user.shippingAddress.mobile || 'N/A'
      };
      console.log('📋 Using user\'s saved address:', shippingAddress);
    }
    
    // Check if address was updated during checkout (from metadata)
    if (metadata.shippingAddress && metadata.shippingAddress !== '{}') {
      try {
        const parsedAddress = JSON.parse(metadata.shippingAddress);
        console.log('📋 Address updated during checkout:', parsedAddress);
        
        // Use the updated address for the order
        const fullAddress = [parsedAddress.flat, parsedAddress.area].filter(Boolean).join(', ');
        shippingAddress = {
          firstName: parsedAddress.fullname?.split(' ')[0] || 'N/A',
          lastName: parsedAddress.fullname?.split(' ').slice(1).join(' ') || 'N/A',
          address: fullAddress || 'N/A',
          city: parsedAddress.city || 'N/A',
          state: parsedAddress.state || 'N/A',
          zipCode: parsedAddress.pincode || 'N/A',
          country: 'US',
          phone: parsedAddress.mobile || 'N/A'
        };
        console.log('📋 Using updated address for order:', shippingAddress);
      } catch (parseError) {
        console.error('❌ Error parsing shipping address from metadata:', parseError);
        console.error('❌ Raw metadata.shippingAddress:', metadata.shippingAddress);
      }
    }
    
    // Create order from checkout session
    const order = new Order({
      user: userId,
      items: items,
      totalAmount: session.amount_total / 100, // Convert from cents
      shippingAddress: shippingAddress,
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      status: 'confirmed',
      stripePaymentIntentId: session.payment_intent,
      transactionId: session.id,
      stripeSessionId: session.id
    });
    
    await order.save();
    console.log('✅ Order created from checkout session:', order._id);
    
    // Update user's shipping address if it was changed during checkout
    if (metadata.shippingAddress && metadata.shippingAddress !== '{}') {
      try {
        const parsedAddress = JSON.parse(metadata.shippingAddress);
        console.log('📋 Updating user shipping address:', parsedAddress);
        
        // Update the user's shipping address
        user.shippingAddress = {
          fullname: parsedAddress.fullname,
          mobile: parsedAddress.mobile,
          flat: parsedAddress.flat,
          area: parsedAddress.area,
          city: parsedAddress.city,
          state: parsedAddress.state,
          pincode: parsedAddress.pincode
        };
        
        await user.save();
        console.log('✅ User shipping address updated');
      } catch (addressError) {
        console.error('❌ Error updating user shipping address:', addressError);
      }
    }
    
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
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user/cart', cartRoutes);
app.use('/api/user/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);


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
        userId: req.body.userId || '68bb56c348bccb4ca59be6d9', // Use real user ID
        items: JSON.stringify(req.body.items || [{
          product: '68b778cf97508f5d155f156c',
          quantity: 1,
          price: 200,
          name: 'I got a chopper',
          image: 'https://res.cloudinary.com/da57ehczx/image/upload/v1756854469/eyesome/products/x1xjzhxyvzuvkvtuizwf.jpg'
        }])
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join order-specific room
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`👥 User ${socket.id} joined order room: order-${orderId}`);
  });

  // Handle new message
  socket.on('send-message', async (data) => {
    try {
      const Message = require('./models/Message');
      const User = require('./models/User');
      const { orderId, senderId, receiverId, message, senderType } = data;

      // If receiverId is 'admin', find the actual admin user
      let actualReceiverId = receiverId;
      if (receiverId === 'admin') {
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
          actualReceiverId = admin._id;
        } else {
          throw new Error('No admin user found');
        }
      }

      // Save message to database
      const newMessage = new Message({
        order: orderId,
        sender: senderId,
        receiver: actualReceiverId,
        message,
        senderType
      });

      await newMessage.save();

      // Populate sender and receiver for the response
      await newMessage.populate('sender', 'username email role');
      await newMessage.populate('receiver', 'username email role');
      
      // Hide admin usernames for privacy
      if (newMessage.sender.role === 'admin') {
        newMessage.sender.username = 'Admin';
      }
      if (newMessage.receiver.role === 'admin') {
        newMessage.receiver.username = 'Admin';
      }

      // Emit message to all users in the order room
      io.to(`order-${orderId}`).emit('new-message', {
        _id: newMessage._id,
        order: newMessage.order,
        sender: newMessage.sender,
        receiver: newMessage.receiver,
        message: newMessage.message,
        senderType: newMessage.senderType,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt
      });

      console.log(`💬 Message sent in order ${orderId}:`, message);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('mark-message-read', async (messageId) => {
    try {
      const Message = require('./models/Message');
      await Message.findByIdAndUpdate(messageId, { isRead: true });
      console.log(`✅ Message ${messageId} marked as read`);
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
