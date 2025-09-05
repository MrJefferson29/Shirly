const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: true // Since it's only allowed after delivery
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure a user can only review a product once per order
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

// Index for better query performance
reviewSchema.index({ product: 1, isActive: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Static method to get reviews for a product
reviewSchema.statics.getProductReviews = function(productId, limit = 10, skip = 0) {
  return this.find({ 
    product: productId, 
    isActive: true 
  })
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get average rating for a product
reviewSchema.statics.getAverageRating = function(productId) {
  return this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isActive: true } },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
  ]);
};

// Static method to get rating distribution
reviewSchema.statics.getRatingDistribution = function(productId) {
  return this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isActive: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
};

// Method to check if user can review this product
reviewSchema.statics.canUserReview = async function(userId, productId, orderId) {
  // Check if user already reviewed this product for this order
  const existingReview = await this.findOne({
    user: userId,
    product: productId,
    order: orderId
  });
  
  if (existingReview) {
    return { canReview: false, reason: 'Already reviewed this product for this order' };
  }
  
  // Check if the order is delivered
  const Order = require('./Order');
  const order = await Order.findById(orderId);
  
  if (!order) {
    return { canReview: false, reason: 'Order not found' };
  }
  
  if (order.status !== 'delivered') {
    return { canReview: false, reason: 'Order must be delivered before reviewing' };
  }
  
  // Check if the product is in the order
  const productInOrder = order.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (!productInOrder) {
    return { canReview: false, reason: 'Product not found in this order' };
  }
  
  return { canReview: true };
};

module.exports = mongoose.model('Review', reviewSchema);
