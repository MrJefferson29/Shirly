const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const Analytics = require('./src/models/Analytics');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shirlyblack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addAnalyticsData() {
  try {
    console.log('Adding analytics data...');

    // Get existing users and products
    const users = await User.find();
    const products = await Product.find();

    if (users.length === 0 || products.length === 0) {
      console.log('No users or products found. Please create some first.');
      return;
    }

    console.log(`Found ${users.length} users and ${products.length} products`);

    // Create sample orders
    const orders = await Order.insertMany([
      {
        user: users[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            price: products[0].newPrice || products[0].price
          }
        ],
        totalAmount: products[0].newPrice || products[0].price,
        shippingCost: 0,
        finalAmount: products[0].newPrice || products[0].price,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          phone: '555-0123'
        },
        paymentMethod: 'stripe',
        status: 'delivered',
        paymentStatus: 'completed'
      },
      {
        user: users[1] ? users[1]._id : users[0]._id,
        items: [
          {
            product: products[1] ? products[1]._id : products[0]._id,
            quantity: 2,
            price: products[1] ? (products[1].newPrice || products[1].price) : (products[0].newPrice || products[0].price)
          }
        ],
        totalAmount: products[1] ? (products[1].newPrice || products[1].price) * 2 : (products[0].newPrice || products[0].price) * 2,
        shippingCost: 5,
        finalAmount: (products[1] ? (products[1].newPrice || products[1].price) * 2 : (products[0].newPrice || products[0].price) * 2) + 5,
        shippingAddress: {
          firstName: 'Jane',
          lastName: 'Smith',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
          phone: '555-0456'
        },
        paymentMethod: 'stripe',
        status: 'delivered',
        paymentStatus: 'completed'
      }
    ]);

    console.log('Created orders:', orders.length);

    // Create sample analytics data for the last 30 days
    const analyticsEvents = [];
    const eventTypes = ['page_view', 'product_view', 'search', 'cart_add', 'order_created', 'user_registration', 'user_login'];
    const pages = ['/admin/analytics', '/products', '/product/1', '/cart', '/checkout', '/home'];
    const searchQueries = ['sunglasses', 'sports glasses', 'reading glasses', 'aviator', 'blue light', 'eyewear'];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create 5-15 events per day
      const eventsPerDay = Math.floor(Math.random() * 11) + 5;
      
      for (let j = 0; j < eventsPerDay; j++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        
        let eventData = {};
        
        switch (eventType) {
          case 'page_view':
            eventData = { page: pages[Math.floor(Math.random() * pages.length)] };
            break;
          case 'product_view':
            eventData = { productId: product._id };
            break;
          case 'search':
            eventData = { 
              query: searchQueries[Math.floor(Math.random() * searchQueries.length)],
              resultsCount: Math.floor(Math.random() * 20) + 1
            };
            break;
          case 'cart_add':
            eventData = { 
              productId: product._id,
              quantity: Math.floor(Math.random() * 3) + 1
            };
            break;
          case 'order_created':
            eventData = { 
              orderId: orders[Math.floor(Math.random() * orders.length)]._id,
              totalAmount: Math.floor(Math.random() * 200) + 50
            };
            break;
          case 'user_registration':
            eventData = { 
              username: user.username,
              email: user.email
            };
            break;
          case 'user_login':
            eventData = { 
              username: user.username,
              email: user.email
            };
            break;
        }

        analyticsEvents.push({
          type: eventType,
          userId: user._id,
          sessionId: `session-${i}-${j}`,
          data: eventData,
          date: date,
          metadata: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ipAddress: '127.0.0.1',
            referrer: 'https://example.com'
          }
        });
      }
    }

    await Analytics.insertMany(analyticsEvents);
    console.log('Created analytics events:', analyticsEvents.length);

    console.log('Sample data created successfully!');
    console.log('Summary:');
    console.log('- Users:', await User.countDocuments());
    console.log('- Products:', await Product.countDocuments());
    console.log('- Orders:', await Order.countDocuments());
    console.log('- Analytics Events:', await Analytics.countDocuments());
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
}

addAnalyticsData();
