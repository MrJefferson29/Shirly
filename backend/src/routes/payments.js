const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  createCheckoutSession,
  createOrderFromSession,
  getPaymentMethods,
  getUserOrders,
  getOrder
} = require('../controllers/paymentController');

const router = express.Router();

// Validation rules
const createCheckoutSessionValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Valid quantity is required'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Valid price is required'),
  body('totalAmount')
    .isFloat({ min: 0.5 })
    .withMessage('Total amount must be at least $0.50')
];

// Public routes
router.get('/methods', getPaymentMethods);
// Note: Webhook handling moved to main app.js for better organization

// Protected routes
router.use(protect);

// @desc    Create checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
router.post('/create-checkout-session', createCheckoutSessionValidation, createCheckoutSession);

// @desc    Create order from checkout session (fallback for local development)
// @route   POST /api/payments/create-order-from-session
// @access  Private
router.post('/create-order-from-session', [
  body('sessionId').notEmpty().withMessage('Session ID is required')
], createOrderFromSession);

// @desc    Create payment intent (DEPRECATED - Use create-checkout-session instead)
// @route   POST /api/payments/create-payment-intent
// @access  Private
// router.post('/create-payment-intent', createPaymentIntentValidation, createPaymentIntent);

// @desc    Create payment intent (legacy method) (DEPRECATED - Use create-checkout-session instead)
// @route   POST /api/payments/create-intent
// @access  Private
// router.post('/create-intent', createPaymentIntentLegacyValidation, createPaymentIntentLegacy);

// @desc    Confirm payment (DEPRECATED - Use Stripe webhooks instead)
// @route   POST /api/payments/confirm
// @access  Private
// router.post('/confirm', confirmPaymentValidation, confirmPayment);

// @desc    Create order and payment intent (DEPRECATED - Use create-checkout-session instead)
// @route   POST /api/payments/create-order
// @access  Private
// router.post('/create-order', createPaymentIntentValidation, createOrder);

// @desc    Get user orders
// @route   GET /api/payments/orders
// @access  Private
router.get('/orders', getUserOrders);

// @desc    Get single order
// @route   GET /api/payments/orders/:orderId
// @access  Private
router.get('/orders/:orderId', getOrder);

module.exports = router;
