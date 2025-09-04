const { validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/user/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist.product', 'name brand price newPrice images category rating trending');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const wishlistItems = user.wishlist.map(item => ({
      _id: item._id,
      product: item.product,
      addedAt: item.addedAt
    }));

    res.json({
      success: true,
      count: wishlistItems.length,
      data: {
        wishlist: wishlistItems
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add item to wishlist
// @route   POST /api/user/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

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

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if item already exists in wishlist
    const existingItem = user.wishlist.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    user.wishlist.push({
      product: productId
    });

    await user.save();

    // Populate the wishlist with product details
    await user.populate('wishlist.product', 'name brand price newPrice images category rating trending');

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/user/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove item from wishlist
    user.wishlist = user.wishlist.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    // Populate the wishlist with product details
    await user.populate('wishlist.product', 'name brand price newPrice images category rating trending');

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully',
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/user/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.wishlist = [];
    await user.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        wishlist: []
      }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Move item from wishlist to cart
// @route   POST /api/user/wishlist/:productId/move-to-cart
// @access  Private
const moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

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

    // Check if item exists in wishlist
    const wishlistItemIndex = user.wishlist.findIndex(
      item => item.product.toString() === productId
    );

    if (wishlistItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    // Check if item already exists in cart
    const existingCartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (existingCartItemIndex > -1) {
      // Update quantity in cart
      user.cart[existingCartItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity
      });
    }

    // Remove from wishlist
    user.wishlist.splice(wishlistItemIndex, 1);

    await user.save();

    // Populate both cart and wishlist
    await user.populate([
      { path: 'cart.product', select: 'name brand price newPrice images category rating' },
      { path: 'wishlist.product', select: 'name brand price newPrice images category rating trending' }
    ]);

    res.json({
      success: true,
      message: 'Item moved to cart successfully',
      data: {
        cart: user.cart,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart
};
