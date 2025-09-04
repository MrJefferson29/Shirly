const { validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/user/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.product', 'name brand price newPrice images category rating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate totals
    let totalPrice = 0;
    let totalItems = 0;

    const cartItems = user.cart.map(item => {
      const itemTotal = item.product.newPrice * item.quantity;
      totalPrice += itemTotal;
      totalItems += item.quantity;

      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        itemTotal,
        addedAt: item.addedAt
      };
    });

    res.json({
      success: true,
      count: cartItems.length,
      data: {
        cart: cartItems,
        summary: {
          totalItems,
          totalPrice,
          estimatedTax: Math.round(totalPrice * 0.18), // 18% GST
          finalAmount: Math.round(totalPrice * 1.18)
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/user/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in stock
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }

      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      user.cart.push({
        product: productId,
        quantity
      });
    }

    await user.save();

    // Populate the cart with product details
    await user.populate('cart.product', 'name brand price newPrice images category rating');

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: user.cart
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/user/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in stock
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find and update the cart item
    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    user.cart[cartItemIndex].quantity = quantity;
    await user.save();

    // Populate the cart with product details
    await user.populate('cart.product', 'name brand price newPrice images category rating');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        cart: user.cart
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/user/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove item from cart
    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    // Populate the cart with product details
    await user.populate('cart.product', 'name brand price newPrice images category rating');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: user.cart
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/user/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: []
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
