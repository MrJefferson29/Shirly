const Analytics = require('../models/Analytics');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const analyticsService = {
  // Track analytics event
  trackEvent: async (eventData) => {
    try {
      const analytics = new Analytics(eventData);
      await analytics.save();
      return analytics;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      throw error;
    }
  },

  // Track page view
  trackPageView: async (page, userId = null, sessionId = null, metadata = {}) => {
    return await analyticsService.trackEvent({
      type: 'page_view',
      userId,
      sessionId,
      data: { page },
      metadata
    });
  },

  // Track product view
  trackProductView: async (productId, userId = null, sessionId = null, metadata = {}) => {
    return await analyticsService.trackEvent({
      type: 'product_view',
      userId,
      sessionId,
      data: { productId },
      metadata
    });
  },

  // Track search
  trackSearch: async (query, resultsCount, userId = null, sessionId = null, metadata = {}) => {
    return await analyticsService.trackEvent({
      type: 'search',
      userId,
      sessionId,
      data: { query, resultsCount },
      metadata
    });
  },

  // Track cart action
  trackCartAction: async (action, productId, quantity, userId = null, sessionId = null, metadata = {}) => {
    return await analyticsService.trackEvent({
      type: action === 'add' ? 'cart_add' : 'cart_remove',
      userId,
      sessionId,
      data: { productId, quantity },
      metadata
    });
  },

  // Track wishlist action
  trackWishlistAction: async (action, productId, userId = null, sessionId = null, metadata = {}) => {
    return await analyticsService.trackEvent({
      type: action === 'add' ? 'wishlist_add' : 'wishlist_remove',
      userId,
      sessionId,
      data: { productId },
      metadata
    });
  },

  // Track order event
  trackOrderEvent: async (orderId, status, userId = null, sessionId = null, metadata = {}) => {
    return await analyticsService.trackEvent({
      type: status === 'created' ? 'order_created' : 'order_completed',
      userId,
      sessionId,
      data: { orderId, status },
      metadata
    });
  },

  // Track user event
  trackUserEvent: async (eventType, userId = null, sessionId = null, metadata = {}) => {
    return await analyticsService.trackEvent({
      type: eventType,
      userId,
      sessionId,
      data: {},
      metadata
    });
  },

  // Get dashboard analytics
  getDashboardAnalytics: async (options = {}) => {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date()
      } = options;

      // Get basic counts
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        analyticsData,
        topProducts,
        topSearches,
        conversionFunnel
      ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: { $in: ['completed', 'delivered'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ]),
        Analytics.getAnalytics({ startDate, endDate, groupBy: 'day' }),
        Analytics.getTopProducts({ startDate, endDate, limit: 5 }),
        Analytics.getTopSearches({ startDate, endDate, limit: 5 }),
        Analytics.getConversionFunnel({ startDate, endDate })
      ]);

      // Get user engagement
      const userEngagement = await Analytics.getUserEngagement({ startDate, endDate });

      // Calculate growth metrics
      const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
      const previousPeriodEnd = startDate;

      const [
        previousOrders,
        previousRevenue
      ] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd } }),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
              status: { $in: ['completed', 'delivered'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ])
      ]);

      const currentRevenue = totalRevenue[0]?.total || 0;
      const previousRevenueTotal = previousRevenue[0]?.total || 0;
      const revenueGrowth = previousRevenueTotal > 0 ? 
        ((currentRevenue - previousRevenueTotal) / previousRevenueTotal) * 100 : 0;

      const orderGrowth = previousOrders > 0 ? 
        ((totalOrders - previousOrders) / previousOrders) * 100 : 0;

      return {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: currentRevenue,
          revenueGrowth,
          orderGrowth
        },
        analytics: analyticsData,
        topProducts,
        topSearches,
        conversionFunnel,
        userEngagement
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw error;
    }
  },

  // Get sales analytics
  getSalesAnalytics: async (options = {}) => {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
        groupBy = 'day'
      } = options;

      const [salesData, topSellingProducts] = await Promise.all([
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: { $in: ['completed', 'delivered'] }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              totalRevenue: { $sum: '$totalAmount' },
              totalOrders: { $sum: 1 },
              averageOrderValue: { $avg: '$totalAmount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: { $in: ['completed', 'delivered'] }
            }
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              totalSold: { $sum: '$items.quantity' },
              totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: '_id',
              as: 'product'
            }
          },
          { $unwind: '$product' },
          {
            $project: {
              productId: '$_id',
              productName: '$product.name',
              totalSold: 1,
              totalRevenue: 1
            }
          },
          { $sort: { totalSold: -1 } },
          { $limit: 10 }
        ])
      ]);

      return {
        salesData,
        topSellingProducts
      };
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      throw error;
    }
  },

  // Get user analytics
  getUserAnalytics: async (options = {}) => {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date()
      } = options;

      const [registrations, logins, engagement, demographics] = await Promise.all([
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        Analytics.aggregate([
          {
            $match: {
              type: 'user_login',
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' }
              },
              count: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' }
            }
          },
          {
            $project: {
              count: 1,
              uniqueUsers: { $size: '$uniqueUsers' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        Analytics.getUserEngagement({ startDate, endDate }),
        User.aggregate([
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              activeUsers: {
                $sum: {
                  $cond: [
                    { $gte: ['$lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ])
      ]);

      return {
        registrations,
        logins,
        engagement,
        demographics: demographics[0] || { totalUsers: 0, activeUsers: 0 }
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  },

  // Get product analytics
  getProductAnalytics: async (options = {}) => {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date()
      } = options;

      const [topProducts, productViews, productPerformance] = await Promise.all([
        Analytics.getTopProducts({ startDate, endDate, limit: 10 }),
        Analytics.aggregate([
          {
            $match: {
              type: 'product_view',
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' }
              },
              count: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' }
            }
          },
          {
            $project: {
              count: 1,
              uniqueUsers: { $size: '$uniqueUsers' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        Product.aggregate([
          {
            $lookup: {
              from: 'orders',
              localField: '_id',
              foreignField: 'items.product',
              as: 'orders'
            }
          },
          {
            $project: {
              name: 1,
              price: 1,
              totalOrders: { $size: '$orders' },
              totalRevenue: {
                $sum: {
                  $map: {
                    input: '$orders',
                    as: 'order',
                    in: {
                      $multiply: [
                        { $arrayElemAt: ['$$order.items.quantity', 0] },
                        { $arrayElemAt: ['$$order.items.price', 0] }
                      ]
                    }
                  }
                }
              }
            }
          },
          { $sort: { totalOrders: -1 } },
          { $limit: 10 }
        ])
      ]);

      return {
        topProducts,
        productViews,
        productPerformance
      };
    } catch (error) {
      console.error('Error getting product analytics:', error);
      throw error;
    }
  },

  // Get search analytics
  getSearchAnalytics: async (options = {}) => {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date()
      } = options;

      const [topSearches, searchTrends, searchPerformance] = await Promise.all([
        Analytics.getTopSearches({ startDate, endDate, limit: 10 }),
        Analytics.aggregate([
          {
            $match: {
              type: 'search',
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' }
              },
              count: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' }
            }
          },
          {
            $project: {
              count: 1,
              uniqueUsers: { $size: '$uniqueUsers' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        Analytics.aggregate([
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
              avgResults: { $avg: '$data.resultsCount' },
              uniqueUsers: { $addToSet: '$userId' }
            }
          },
          {
            $project: {
              query: '$_id',
              searches: 1,
              avgResults: { $round: ['$avgResults', 2] },
              uniqueUsers: { $size: '$uniqueUsers' }
            }
          },
          { $sort: { searches: -1 } },
          { $limit: 20 }
        ])
      ]);

      return {
        topSearches,
        searchTrends,
        searchPerformance
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw error;
    }
  }
};

module.exports = analyticsService;