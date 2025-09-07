const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  brand: {
    type: String,
    required: [false, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex', 'Kids'],
    trim: true
  },
  weight: {
    type: String,
    trim: true
  },
  dimensions: {
    length: String,
    width: String,
    height: String,
    unit: { type: String, default: 'cm' }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  newPrice: {
    type: Number,
    min: [0, 'New price cannot be negative'],
    validate: {
      validator: function(value) {
        // Only validate if newPrice is provided and not null/undefined
        if (value != null && this.price != null) {
          return value <= this.price;
        }
        return true;
      },
      message: 'New price cannot be higher than original price'
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  trending: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String,
    trim: true
  }],
  condition: {
    type: String,
    enum: ['New', 'Used', 'Refurbished'],
    default: 'New'
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ category: 1, gender: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ trending: -1 });
productSchema.index({ condition: 1 });
productSchema.index({ isActive: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.newPrice && this.price > this.newPrice) {
    return Math.round(((this.price - this.newPrice) / this.price) * 100);
  }
  return 0;
});


// Method to update rating and review count
productSchema.methods.updateRating = async function() {
  const Review = require('./Review');
  const stats = await Review.getAverageRating(this._id);
  
  if (stats.length > 0) {
    this.rating = Math.round(stats[0].averageRating * 10) / 10; // Round to 1 decimal
    this.reviewCount = stats[0].totalReviews;
  } else {
    this.rating = 0;
    this.reviewCount = 0;
  }
  
  await this.save();
  return { rating: this.rating, reviewCount: this.reviewCount };
};

// Static method to get products with reviews
productSchema.statics.getProductsWithReviews = function(filter = {}, limit = 10, skip = 0) {
  return this.find(filter)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });
};

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
