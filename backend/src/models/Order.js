const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    firstName: { type: String, default: 'N/A' },
    lastName: { type: String, default: 'N/A' },
    address: { type: String, default: 'N/A' },
    city: { type: String, default: 'N/A' },
    state: { type: String, default: 'N/A' },
    zipCode: { type: String, default: 'N/A' },
    country: { type: String, default: 'US' },
    phone: { type: String, default: 'N/A' }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'cashapp', 'samsung_pay'],
    default: 'stripe'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  stripeSessionId: {
    type: String,
    sparse: true
  },
  transactionId: {
    type: String,
    sparse: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  orderNumber: {
    type: String,
    unique: true,
    sparse: true // This allows multiple null values
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Generate order number: ORD + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ stripePaymentIntentId: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });

// Virtual for order total calculation
orderSchema.virtual('calculatedTotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
  return this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = function(newPaymentStatus) {
  this.paymentStatus = newPaymentStatus;
  this.updatedAt = new Date();
  return this.save();
};

// Method to check if shipping address is available
orderSchema.methods.hasShippingAddress = function() {
  return this.shippingAddress && 
         this.shippingAddress.firstName !== 'N/A' && 
         this.shippingAddress.lastName !== 'N/A' &&
         this.shippingAddress.address !== 'N/A' &&
         this.shippingAddress.city !== 'N/A' &&
         this.shippingAddress.state !== 'N/A' &&
         this.shippingAddress.zipCode !== 'N/A';
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId })
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status: status })
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema);