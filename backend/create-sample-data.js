const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const Analytics = require('./src/models/Analytics');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shirlyblack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleData() {
  try {
    console.log('Creating sample data...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@shirlyblack.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'user',
        isActive: true
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'user',
        isActive: true
      }
    ]);

    console.log('Created users:', users.length);

    // Create sample products
    const products = await Product.insertMany([
      {
        name: 'Classic Aviator Sunglasses',
        description: 'Timeless aviator sunglasses with UV protection',
        price: 89.99,
        newPrice: 69.99,
        category: 'sunglasses',
        brand: 'ShirlyBlack',
        images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500'],
        quantity: 50,
        rating: 4.5,
        numReviews: 12,
        isActive: true,
        trending: true
      },
      {
        name: 'Sport Performance Glasses',
        description: 'High-performance sports eyewear for active lifestyle',
        price: 129.99,
        newPrice: 99.99,
        category: 'sports',
        brand: 'ShirlyBlack',
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
        quantity: 30,
        rating: 4.8,
        numReviews: 8,
        isActive: true,
        trending: true
      },
      {
        name: 'Reading Glasses - Blue Light',
        description: 'Blue light blocking reading glasses for digital eye strain',
        price: 49.99,
        category: 'vision',
        brand: 'ShirlyBlack',
        images: ['https://images.unsplash.com/photo-1506629905607-1a4b4b4b4b4b?w=500'],
        quantity: 75,
        rating: 4.2,
        numReviews: 15,
        isActive: true,
        trending: false
      }
    ]);

    console.log('Created products:', products.length);

    // Create sample orders
    const orders = await Order.insertMany([
      {
        user: users[1]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            price: products[0].newPrice
          }
        ],
        totalAmount: products[0].newPrice,
        shippingCost: 0,
        finalAmount: products[0].newPrice,
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
        user: users[2]._id,
        items: [
          {
            product: products[1]._id,
            quantity: 2,
            price: products[1].newPrice
          }
        ],
        totalAmount: products[1].newPrice * 2,
        shippingCost: 5,
        finalAmount: products[1].newPrice * 2 + 5,
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
    const pages = ['/admin/analytics', '/products', '/product/1', '/cart', '/checkout'];
    const searchQueries = ['sunglasses', 'sports glasses', 'reading glasses', 'aviator', 'blue light'];

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

createSampleData();
