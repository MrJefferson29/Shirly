const mongoose = require('mongoose');
const Analytics = require('./src/models/Analytics');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shirlyblack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleAnalyticsData() {
  try {
    console.log('Creating sample analytics data...');

    // Get a user and product for testing
    const user = await User.findOne();
    const product = await Product.findOne();

    if (!user || !product) {
      console.log('No user or product found. Please create some users and products first.');
      return;
    }

    // Create sample analytics events
    const sampleEvents = [
      {
        type: 'page_view',
        userId: user._id,
        sessionId: 'test-session-1',
        data: { page: '/admin/analytics' },
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1',
          referrer: 'https://example.com'
        }
      },
      {
        type: 'product_view',
        userId: user._id,
        sessionId: 'test-session-1',
        data: { productId: product._id },
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        }
      },
      {
        type: 'search',
        userId: user._id,
        sessionId: 'test-session-1',
        data: { query: 'sunglasses', resultsCount: 5 },
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        }
      },
      {
        type: 'cart_add',
        userId: user._id,
        sessionId: 'test-session-1',
        data: { productId: product._id, quantity: 1 },
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        }
      }
    ];

    // Create events for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      for (const event of sampleEvents) {
        const analyticsEvent = new Analytics({
          ...event,
          date: date
        });
        await analyticsEvent.save();
      }
    }

    console.log('Sample analytics data created successfully!');
    console.log('Total analytics events:', await Analytics.countDocuments());
    
  } catch (error) {
    console.error('Error creating sample analytics data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleAnalyticsData();
