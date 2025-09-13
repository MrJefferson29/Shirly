# Luméra Backend API

A fully functional Express.js backend for the Luméra ecommerce application.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access
- **Product Management** - CRUD operations for products with image uploads
- **Shopping Cart** - Add, remove, update cart items
- **Wishlist** - Save and manage favorite products
- **Order Management** - Complete order processing and tracking
- **Admin Panel** - Full administrative capabilities
- **File Uploads** - Image upload support with Multer
- **Data Validation** - Express-validator for input validation
- **Security** - Helmet, CORS, rate limiting
- **Database** - MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/eyesome
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   - Local: Make sure MongoDB is running on your system
   - Cloud: Use MongoDB Atlas connection string

5. **Seed the database** (Optional)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/trending` - Get trending products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search` - Search products
- `POST /api/products/:id/reviews` - Add product review

### Cart
- `GET /api/user/cart` - Get user's cart
- `POST /api/user/cart` - Add item to cart
- `PUT /api/user/cart/:productId` - Update cart item
- `DELETE /api/user/cart/:productId` - Remove item from cart
- `DELETE /api/user/cart` - Clear entire cart

### Wishlist
- `GET /api/user/wishlist` - Get user's wishlist
- `POST /api/user/wishlist` - Add item to wishlist
- `DELETE /api/user/wishlist/:productId` - Remove item from wishlist
- `DELETE /api/user/wishlist` - Clear entire wishlist
- `POST /api/user/wishlist/:productId/move-to-cart` - Move to cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/users/:id/status` - Update user status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
- username, email, password
- role (user/admin)
- cart, wishlist, orders
- timestamps

### Product
- name, description, brand
- category, gender, weight
- price, newPrice, rating
- quantity, images, trending
- features, specifications
- reviews

### Order
- user, items, totalAmount
- shippingAddress, paymentMethod
- status, paymentStatus
- trackingNumber, timestamps

### Category
- categoryName, displayName
- description, categoryImg
- isActive, sortOrder

## 🛡️ Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Express-validator
- **Password Hashing** - bcryptjs
- **JWT Authentication** - Secure tokens

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   └── app.js          # Main application file
├── uploads/            # File uploads directory
├── package.json
├── .env
└── README.md
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eyesome
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Deploy to Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

## 📝 Default Credentials

After seeding the database:

**Admin User:**
- Email: admin@eyesome.com
- Password: admin123

**Test User:**
- Email: test@eyesome.com
- Password: test123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@eyesome.com or create an issue in the repository.
