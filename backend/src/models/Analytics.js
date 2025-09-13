const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'product_view', 
      'search',
      'cart_add',
      'cart_remove',
      'wishlist_add',
      'wishlist_remove',
      'order_created',
      'order_completed',
      'user_registration',
      'user_login',
      'email_sent',
      'notification_sent'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    default: null
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    device: String,
    browser: String,
    os: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ type: 1, date: -1 });
analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ type: 1, userId: 1, date: -1 });

// Static methods for analytics queries
analyticsSchema.statics.getAnalytics = async function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    groupBy = 'day',
    type = null
  } = options;

  const matchStage = {
    date: { $gte: startDate, $lte: endDate }
  };
  
  if (type) {
    matchStage.type = type;
  }

  let groupStage;
  switch (groupBy) {
    case 'hour':
      groupStage = {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
          hour: { $hour: '$date' }
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      };
      break;
    case 'day':
    default:
      groupStage = {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      };
      break;
    case 'week':
      groupStage = {
        _id: {
          year: { $year: '$date' },
          week: { $week: '$date' }
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      };
      break;
    case 'month':
      groupStage = {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      };
      break;
  }

  const pipeline = [
    { $match: matchStage },
    { $group: groupStage },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ];

  return await this.aggregate(pipeline);
};

analyticsSchema.statics.getTopProducts = async function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    limit = 10
  } = options;

  const pipeline = [
    {
      $match: {
        type: 'product_view',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$data.productId',
        views: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $addFields: {
        productObjectId: { $toObjectId: '$_id' }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productObjectId',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        productId: '$_id',
        productName: '$product.name',
        views: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { views: -1 } },
    { $limit: limit }
  ];

  return await this.aggregate(pipeline);
};

analyticsSchema.statics.getTopSearches = async function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    limit = 10
  } = options;

  const pipeline = [
    {
      $match: {
        type: 'search',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$data.query',
        searches: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        query: '$_id',
        searches: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { searches: -1 } },
    { $limit: limit }
  ];

  return await this.aggregate(pipeline);
};

analyticsSchema.statics.getConversionFunnel = async function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date()
  } = options;

  const pipeline = [
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        type: { $in: ['page_view', 'product_view', 'cart_add', 'order_created'] }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

analyticsSchema.statics.getUserEngagement = async function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date()
  } = options;

  const pipeline = [
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        userId: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalEvents: { $sum: 1 },
        eventTypes: { $addToSet: '$type' },
        lastActivity: { $max: '$date' }
      }
    },
    {
      $group: {
        _id: null,
        totalActiveUsers: { $sum: 1 },
        avgEventsPerUser: { $avg: '$totalEvents' },
        highlyEngagedUsers: {
          $sum: {
            $cond: [{ $gte: ['$totalEvents', 10] }, 1, 0]
          }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || { totalActiveUsers: 0, avgEventsPerUser: 0, highlyEngagedUsers: 0 };
};

module.exports = mongoose.model('Analytics', analyticsSchema);