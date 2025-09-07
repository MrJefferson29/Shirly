const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

console.log('🔧 Starting debug server...');

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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

console.log('✅ Middleware loaded successfully');

// Test basic routes first
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ShirlyBlack API is running',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Basic routes loaded');

// Try to load routes one by one
try {
  console.log('🔍 Loading auth routes...');
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Auth routes error:', error.message);
}

try {
  console.log('🔍 Loading product routes...');
  const productRoutes = require('./src/routes/products');
  app.use('/api/products', productRoutes);
  console.log('✅ Product routes loaded');
} catch (error) {
  console.error('❌ Product routes error:', error.message);
}

try {
  console.log('🔍 Loading cart routes...');
  const cartRoutes = require('./src/routes/cart');
  app.use('/api/user/cart', cartRoutes);
  console.log('✅ Cart routes loaded');
} catch (error) {
  console.error('❌ Cart routes error:', error.message);
}

try {
  console.log('🔍 Loading wishlist routes...');
  const wishlistRoutes = require('./src/routes/wishlist');
  app.use('/api/user/wishlist', wishlistRoutes);
  console.log('✅ Wishlist routes loaded');
} catch (error) {
  console.error('❌ Wishlist routes error:', error.message);
}

try {
  console.log('🔍 Loading order routes...');
  const orderRoutes = require('./src/routes/orders');
  app.use('/api/orders', orderRoutes);
  console.log('✅ Order routes loaded');
} catch (error) {
  console.error('❌ Order routes error:', error.message);
}

try {
  console.log('🔍 Loading admin routes...');
  const adminRoutes = require('./src/routes/admin');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.error('❌ Admin routes error:', error.message);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Debug server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
