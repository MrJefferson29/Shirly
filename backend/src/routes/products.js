const express = require('express');
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  getTrendingProducts,
  getProductsByCategory,
  searchProducts,
  addReview,
  getCategories
} = require('../controllers/productController');

const router = express.Router();

// Validation rules
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Routes
router.get('/', optionalAuth, getProducts);
router.get('/trending', getTrendingProducts);
router.get('/search', optionalAuth, searchProducts);
router.get('/category/:category', optionalAuth, getProductsByCategory);
router.post('/:id/reviews', protect, reviewValidation, addReview);
router.get('/:id', optionalAuth, getProduct);

module.exports = router;
