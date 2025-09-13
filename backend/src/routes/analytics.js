const express = require('express');
const { protect } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = req.query;

    const analytics = await analyticsService.getDashboardAnalytics({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    });
  }
});

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private (Admin)
router.get('/sales', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      groupBy = 'day'
    } = req.query;

    const analytics = await analyticsService.getSalesAnalytics({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      groupBy
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics'
    });
  }
});

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = req.query;

    const analytics = await analyticsService.getUserAnalytics({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
});

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private (Admin)
router.get('/products', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = req.query;

    const analytics = await analyticsService.getProductAnalytics({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product analytics'
    });
  }
});

// @desc    Get search analytics
// @route   GET /api/analytics/search
// @access  Private (Admin)
router.get('/search', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = req.query;

    const analytics = await analyticsService.getSearchAnalytics({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get search analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search analytics'
    });
  }
});

// @desc    Track analytics event
// @route   POST /api/analytics/track
// @access  Private
router.post('/track', async (req, res) => {
  try {
    const { type, data, metadata } = req.body;
    const userId = req.user._id;

    const analytics = await analyticsService.trackEvent({
      type,
      userId,
      data,
      metadata
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track analytics event'
    });
  }
});

// @desc    Track page view
// @route   POST /api/analytics/track-page-view
// @access  Private
router.post('/track-page-view', async (req, res) => {
  try {
    const { page, metadata } = req.body;
    const userId = req.user._id;

    const analytics = await analyticsService.trackPageView(page, userId, null, metadata);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Track page view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track page view'
    });
  }
});

module.exports = router;