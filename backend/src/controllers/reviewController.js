const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user._id;

    console.log('📝 Creating review with data:', { productId, orderId, rating, comment, userId });

    // Check if user can review this product
    const canReview = await Review.canUserReview(userId, productId, orderId);
    console.log('📝 Can review result:', canReview);
    if (!canReview.canReview) {
      return res.status(400).json({
        success: false,
        message: canReview.reason
      });
    }

    // Create the review
    const review = new Review({
      product: productId,
      user: userId,
      order: orderId,
      rating,
      comment: comment?.trim()
    });

    await review.save();
    await review.populate('user', 'username');

    // Update product rating
    const product = await Product.findById(productId);
    if (product) {
      await product.updateRating();
    }

    console.log('✅ Review created:', review._id);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });

  } catch (error) {
    console.error('❌ Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let sortOption = { createdAt: -1 }; // Default: newest first

    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest') {
      sortOption = { rating: 1, createdAt: -1 };
    }

    const reviews = await Review.find({ 
      product: productId, 
      isActive: true 
    })
      .populate('user', 'username')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    const totalReviews = await Review.countDocuments({ 
      product: productId, 
      isActive: true 
    });

    // Get rating distribution
    const ratingDistribution = await Review.getRatingDistribution(productId);

    // Get average rating
    const averageStats = await Review.getAverageRating(productId);
    const averageRating = averageStats.length > 0 ? averageStats[0].averageRating : 0;
    const totalCount = averageStats.length > 0 ? averageStats[0].totalReviews : 0;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1
        },
        stats: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: totalCount,
          ratingDistribution
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ 
      user: userId, 
      isActive: true 
    })
      .populate('product', 'name images')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalReviews = await Review.countDocuments({ 
      user: userId, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews',
      error: error.message
    });
  }
};

// @desc    Check if user can review a product
// @route   GET /api/reviews/can-review/:productId/:orderId
// @access  Private
const canUserReview = async (req, res) => {
  try {
    const { productId, orderId } = req.params;
    const userId = req.user._id;

    const canReview = await Review.canUserReview(userId, productId, orderId);

    res.json({
      success: true,
      data: canReview
    });

  } catch (error) {
    console.error('❌ Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const review = await Review.findOne({ 
      _id: reviewId, 
      user: userId, 
      isActive: true 
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to update it'
      });
    }

    // Update review
    review.rating = rating;
    review.comment = comment?.trim();
    await review.save();

    // Update product rating
    const product = await Product.findById(review.product);
    if (product) {
      await product.updateRating();
    }

    console.log('✅ Review updated:', review._id);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });

  } catch (error) {
    console.error('❌ Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({ 
      _id: reviewId, 
      user: userId, 
      isActive: true 
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it'
      });
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    // Update product rating
    const product = await Product.findById(review.product);
    if (product) {
      await product.updateRating();
    }

    console.log('✅ Review deleted:', review._id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked this review as helpful
    // For now, we'll just increment the helpful count
    // In a real app, you'd want to track which users marked it helpful
    review.helpful += 1;
    await review.save();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { helpful: review.helpful }
    });

  } catch (error) {
    console.error('❌ Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  canUserReview,
  updateReview,
  deleteReview,
  markReviewHelpful
};
