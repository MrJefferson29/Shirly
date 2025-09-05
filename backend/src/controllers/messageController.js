const Message = require('../models/Message');
const Order = require('../models/Order');
const User = require('../models/User');

// Helper function to get an admin user ID
const getAdminUserId = async () => {
  const admin = await User.findOne({ role: 'admin' });
  return admin ? admin._id : null;
};

// @desc    Get messages for a specific order
// @route   GET /api/messages/order/:orderId
// @access  Private
const getOrderMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    // Verify user has access to this order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is admin or the order owner
    if (req.user.role !== 'admin' && order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages for this order
    const messages = await Message.find({ order: orderId })
      .populate('sender', 'username email role')
      .populate('receiver', 'username email role')
      .sort({ createdAt: 1 });

    // Hide admin usernames for privacy
    messages.forEach(message => {
      if (message.sender.role === 'admin') {
        message.sender.username = 'Admin';
      }
      if (message.receiver.role === 'admin') {
        message.receiver.username = 'Admin';
      }
    });

    res.status(200).json({
      success: true,
      data: {
        messages,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status
        }
      }
    });
  } catch (error) {
    console.error('Get order messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get unread message count for user
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's orders
    const userOrders = await Order.find({ user: userId }).select('_id');
    const orderIds = userOrders.map(order => order._id);

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/mark-read
// @access  Private
const markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Message IDs are required'
      });
    }

    // Mark messages as read
    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        receiver: userId 
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send a new message
// @route   POST /api/messages/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { orderId, receiverId, message } = req.body;
    const senderId = req.user._id;

    // Validate required fields
    if (!orderId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, receiver ID, and message are required'
      });
    }

    // Verify user has access to this order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is admin or the order owner
    if (req.user.role !== 'admin' && order.user.toString() !== senderId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Handle admin receiver ID
    let actualReceiverId = receiverId;
    if (receiverId === 'admin') {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        actualReceiverId = admin._id;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Admin user not found'
        });
      }
    }

    // Create new message
    const newMessage = new Message({
      order: orderId,
      sender: senderId,
      receiver: actualReceiverId,
      message: message.trim(),
      senderType: req.user.role === 'admin' ? 'admin' : 'customer'
    });

    await newMessage.save();

    // Populate sender and receiver
    await newMessage.populate('sender', 'username email role');
    await newMessage.populate('receiver', 'username email role');
    
    // Hide admin username for privacy
    if (newMessage.sender.role === 'admin') {
      newMessage.sender.username = 'Admin';
    }
    if (newMessage.receiver.role === 'admin') {
      newMessage.receiver.username = 'Admin';
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: newMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getOrderMessages,
  getUnreadMessageCount,
  markMessagesAsRead,
  sendMessage
};
