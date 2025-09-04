const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart
} = require('../controllers/wishlistController');

const router = express.Router();

// Validation rules
const addToWishlistValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required')
];

const moveToCartValidation = [
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

// All wishlist routes require authentication
router.use(protect);

// Routes
router.get('/', getWishlist);
router.post('/', addToWishlistValidation, addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);
router.post('/:productId/move-to-cart', moveToCartValidation, moveToCart);

module.exports = router;
