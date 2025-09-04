const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { 
  uploadProductImages, 
  uploadCategoryImage, 
  handleCloudinaryUploadError,
  deleteCloudinaryImage,
  extractPublicId
} = require('../middleware/cloudinaryUpload');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('category')
    .isIn(['Vision', 'Sports', 'Sunglasses'])
    .withMessage('Invalid category'),
  body('gender')
    .isIn(['Men', 'Women', 'Unisex'])
    .withMessage('Invalid gender'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('newPrice')
    .isFloat({ min: 0 })
    .withMessage('New price must be a positive number'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

const categoryValidation = [
  body('categoryName')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Display name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
];

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username email')
      .populate('items.product', 'name');

    // Get sales data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrdersData = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ['delivered', 'shipped'] }
    });

    const totalSales = recentOrdersData.reduce((sum, order) => sum + order.finalAmount, 0);

    // Get top selling products
    const topProducts = await Product.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5)
      .select('name brand price newPrice rating images');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalCategories,
          totalSales
        },
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all products (Admin view)
// @route   GET /api/admin/products
// @access  Private (Admin)
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviews.user', 'username');
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private (Admin)
router.post('/products', uploadProductImages.array('images', 5), productValidation, handleCloudinaryUploadError, async (req, res) => {
  try {
    const productData = req.body;
    
    // Handle uploaded images - Cloudinary returns secure_url
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path); // file.path contains the Cloudinary URL
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
router.put('/products/:id', uploadProductImages.array('images', 5), productValidation, handleCloudinaryUploadError, async (req, res) => {
  try {
    const productData = req.body;
    
    // Get existing product to handle image deletion
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Handle uploaded images - Cloudinary returns secure_url
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary if they exist
      if (existingProduct.images && existingProduct.images.length > 0) {
        for (const imageUrl of existingProduct.images) {
          const publicId = extractPublicId(imageUrl);
          if (publicId) {
            try {
              await deleteCloudinaryImage(publicId);
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
        }
      }
      
      productData.images = req.files.map(file => file.path); // file.path contains the Cloudinary URL
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary before deleting the product
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          try {
            await deleteCloudinaryImage(publicId);
          } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
          }
        }
      }
    }

    // Now delete the product from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username email')
      .populate('items.product', 'name brand images');

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        orders
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin)
router.post('/categories', uploadCategoryImage.single('categoryImg'), categoryValidation, handleCloudinaryUploadError, async (req, res) => {
  try {
    const categoryData = req.body;
    
    if (req.file) {
      categoryData.categoryImg = req.file.path; // file.path contains the Cloudinary URL
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        notes: notes || undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('user', 'username email')
     .populate('items.product', 'name brand images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status} successfully`,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update order payment status
// @route   PUT /api/admin/orders/:id/payment-status
// @access  Private (Admin)
router.put('/orders/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    // Validate payment status
    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('user', 'username email')
     .populate('items.product', 'name brand images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: `Order payment status updated to ${paymentStatus} successfully`,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
