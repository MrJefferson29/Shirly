const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      limit = 20,
      skip = 0,
      unreadOnly = false,
      type = null
    } = req.query;

    const notifications = await Notification.getUserNotifications(req.user._id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true',
      type
    });

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          limit: parseInt(limit),
          skip: parseInt(skip),
          total: notifications.length
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.markAsRead(req.params.id, req.user._id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
router.put('/mark-all-read', async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user._id);

    res.json({
      success: true,
      data: { 
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} notifications marked as read`
      }
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
router.delete('/', async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      data: { 
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} notifications deleted`
      }
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notifications'
    });
  }
});

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin)
router.post('/', [
  body('type')
    .isIn([
      'order_confirmation',
      'order_status_update',
      'order_shipped',
      'order_delivered',
      'payment_success',
      'payment_failed',
      'low_stock',
      'product_review',
      'welcome',
      'promotion',
      'system'
    ])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { type, title, message, userId, data = {}, priority = 'medium', sendEmail = false } = req.body;

    const notification = await notificationService.createNotification({
      user: userId,
      type,
      title,
      message,
      data,
      priority,
      sendEmail
    });

    res.status(201).json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// @desc    Send bulk notification (Admin only)
// @route   POST /api/notifications/bulk
// @access  Private (Admin)
router.post('/bulk', [
  body('type')
    .isIn([
      'order_confirmation',
      'order_status_update',
      'order_shipped',
      'order_delivered',
      'payment_success',
      'payment_failed',
      'low_stock',
      'product_review',
      'welcome',
      'promotion',
      'system'
    ])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { type, title, message, data = {}, priority = 'medium', sendEmail = false, excludeUsers = [] } = req.body;

    const template = {
      type,
      title,
      message,
      data,
      priority,
      sendEmail
    };

    const notifications = await notificationService.notifyAllUsers(template, excludeUsers);

    res.status(201).json({
      success: true,
      data: { 
        notifications,
        count: notifications.length,
        message: `Sent ${notifications.length} notifications`
      }
    });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications'
    });
  }
});

// @desc    Test email configuration (Admin only)
// @route   GET /api/notifications/test-email
// @access  Private (Admin)
router.get('/test-email', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const emailService = require('../services/emailService');
    const result = await emailService.testEmailConfig();

    res.json({
      success: result.success,
      message: result.success ? 'Email configuration is valid' : 'Email configuration error',
      error: result.error
    });
  } catch (error) {
    console.error('Test email configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test email configuration'
    });
  }
});

module.exports = router;
