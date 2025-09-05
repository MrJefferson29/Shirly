const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createReview,
  getProductReviews,
  getUserReviews,
  canUserReview,
  updateReview,
  deleteReview,
  markReviewHelpful
} = require('../controllers/reviewController');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const reviewValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

const updateReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protect, reviewValidation, createReview);

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', getProductReviews);

// @route   GET /api/reviews/user
// @desc    Get user's reviews
// @access  Private
router.get('/user', protect, getUserReviews);

// @route   GET /api/reviews/can-review/:productId/:orderId
// @desc    Check if user can review a product
// @access  Private
router.get('/can-review/:productId/:orderId', protect, canUserReview);

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private
router.put('/:reviewId', protect, updateReviewValidation, updateReview);

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private
router.delete('/:reviewId', protect, deleteReview);

// @route   POST /api/reviews/:reviewId/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:reviewId/helpful', protect, markReviewHelpful);

module.exports = router;
