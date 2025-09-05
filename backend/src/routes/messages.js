const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getOrderMessages,
  getUnreadMessageCount,
  markMessagesAsRead,
  sendMessage
} = require('../controllers/messageController');

const router = express.Router();

// Get messages for a specific order
router.get('/order/:orderId', protect, getOrderMessages);

// Get unread message count for user
router.get('/unread-count', protect, getUnreadMessageCount);

// Mark messages as read
router.put('/mark-read', protect, markMessagesAsRead);

// Send a new message
router.post('/send', protect, sendMessage);

module.exports = router;
