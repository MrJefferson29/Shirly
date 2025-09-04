const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

const updateCartValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

// All cart routes require authentication
router.use(protect);

// Routes
router.get('/', getCart);
router.post('/', addToCartValidation, addToCart);
router.delete('/', clearCart);
router.put('/:productId', updateCartValidation, updateCartItem);
router.delete('/:productId', removeFromCart);

module.exports = router;
