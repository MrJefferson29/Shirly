const express = require('express');
const { getCategories } = require('../controllers/productController');

const router = express.Router();

// Routes
router.get('/', getCategories);

module.exports = router;
