const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/authController');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const addressValidation = [
  body('fullname')
    .notEmpty()
    .trim()
    .withMessage('Full name is required'),
  body('mobile')
    .notEmpty()
    .trim()
    .withMessage('Mobile number is required'),
  body('flat')
    .notEmpty()
    .trim()
    .withMessage('Address line 1 is required'),
  body('area')
    .notEmpty()
    .trim()
    .withMessage('Area/Street is required'),
  body('city')
    .notEmpty()
    .trim()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .trim()
    .withMessage('State is required'),
  body('pincode')
    .notEmpty()
    .trim()
    .withMessage('Pin code is required')
];

// Routes
router.post('/signup', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);

// Address routes
router.get('/addresses', protect, getUserAddresses);
router.post('/addresses', protect, addressValidation, addAddress);
router.put('/addresses/:addressId', protect, addressValidation, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
