const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'location'],
    default: 'text'
  },
  locationData: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  senderType: {
    type: String,
    enum: ['admin', 'customer'],
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
