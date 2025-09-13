const Notification = require('../models/Notification');
const emailService = require('./emailService');

const notificationService = {
  // Create and send notification
  createNotification: async (notificationData) => {
    try {
      const notification = await Notification.createNotification(notificationData);
      
      // Send email if it's an important notification
      if (notificationData.sendEmail && notificationData.user?.email) {
        await notificationService.sendEmailNotification(notification);
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Send email notification
  sendEmailNotification: async (notification) => {
    try {
      if (notification.isEmailSent) {
        return { success: true, message: 'Email already sent' };
      }

      let emailResult = { success: false };
      
      switch (notification.type) {
        case 'order_confirmation':
          emailResult = await emailService.sendOrderConfirmation(notification.data.order);
          break;
        case 'order_status_update':
          emailResult = await emailService.sendOrderStatusUpdate(
            notification.data.order, 
            notification.data.newStatus
          );
          break;
        case 'welcome':
          emailResult = await emailService.sendWelcomeEmail(notification.user);
          break;
        case 'password_reset':
          emailResult = await emailService.sendPasswordReset(
            notification.user, 
            notification.data.resetToken
          );
          break;
        default:
          // Generic email for other notification types
          emailResult = await notificationService.sendGenericEmail(notification);
      }

      if (emailResult.success) {
        notification.isEmailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
      }

      return emailResult;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send generic email notification
  sendGenericEmail: async (notification) => {
    try {
      const transporter = require('nodemailer').createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Luméra</h1>
          </div>
          
          <div style="padding: 20px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">${notification.title}</h2>
            <p style="color: #6b7280;">${notification.message}</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://shirly-kappa.vercel.app'}" 
                 style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Visit Luméra
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              © 2025 Luméra. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: notification.user.email,
        subject: notification.title,
        html: html
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending generic email:', error);
      return { success: false, error: error.message };
    }
  },

  // Notification templates
  templates: {
    orderConfirmation: (order) => ({
      type: 'order_confirmation',
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber || order._id.slice(-8)} has been confirmed and is being processed.`,
      data: { order },
      priority: 'high',
      sendEmail: true
    }),

    orderStatusUpdate: (order, newStatus) => ({
      type: 'order_status_update',
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber || order._id.slice(-8)} status has been updated to ${newStatus}.`,
      data: { order, newStatus },
      priority: 'medium',
      sendEmail: true
    }),

    orderShipped: (order, trackingNumber) => ({
      type: 'order_shipped',
      title: 'Order Shipped',
      message: `Your order #${order.orderNumber || order._id.slice(-8)} has been shipped. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`,
      data: { order, trackingNumber },
      priority: 'high',
      sendEmail: true
    }),

    orderDelivered: (order) => ({
      type: 'order_delivered',
      title: 'Order Delivered',
      message: `Your order #${order.orderNumber || order._id.slice(-8)} has been delivered. Thank you for shopping with us!`,
      data: { order },
      priority: 'medium',
      sendEmail: true
    }),

    paymentSuccess: (order) => ({
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment for order #${order.orderNumber || order._id.slice(-8)} has been processed successfully.`,
      data: { order },
      priority: 'high',
      sendEmail: true
    }),

    paymentFailed: (order) => ({
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Payment for order #${order.orderNumber || order._id.slice(-8)} failed. Please try again.`,
      data: { order },
      priority: 'urgent',
      sendEmail: true
    }),

    lowStock: (product) => ({
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `Product "${product.name}" is running low on stock (${product.quantity} remaining).`,
      data: { product },
      priority: 'medium',
      sendEmail: false
    }),

    productReview: (product, review) => ({
      type: 'product_review',
      title: 'New Product Review',
      message: `A new review has been posted for "${product.name}".`,
      data: { product, review },
      priority: 'low',
      sendEmail: false
    }),

    welcome: (user) => ({
      type: 'welcome',
      title: 'Welcome to Luméra!',
      message: `Welcome to Luméra, ${user.username}! We're excited to have you as part of our community.`,
      data: { user },
      priority: 'medium',
      sendEmail: true
    }),

    promotion: (promoData) => ({
      type: 'promotion',
      title: promoData.title || 'Special Offer',
      message: promoData.message || 'Check out our latest special offers!',
      data: { promoData },
      priority: 'low',
      sendEmail: false
    }),

    system: (title, message, data = {}) => ({
      type: 'system',
      title,
      message,
      data,
      priority: 'medium',
      sendEmail: false
    })
  },

  // Helper methods for common notifications
  notifyOrderConfirmation: async (order) => {
    const template = notificationService.templates.orderConfirmation(order);
    return await notificationService.createNotification({
      ...template,
      user: order.user
    });
  },

  notifyOrderStatusUpdate: async (order, newStatus) => {
    const template = notificationService.templates.orderStatusUpdate(order, newStatus);
    return await notificationService.createNotification({
      ...template,
      user: order.user
    });
  },

  notifyOrderShipped: async (order, trackingNumber) => {
    const template = notificationService.templates.orderShipped(order, trackingNumber);
    return await notificationService.createNotification({
      ...template,
      user: order.user
    });
  },

  notifyOrderDelivered: async (order) => {
    const template = notificationService.templates.orderDelivered(order);
    return await notificationService.createNotification({
      ...template,
      user: order.user
    });
  },

  notifyPaymentSuccess: async (order) => {
    const template = notificationService.templates.paymentSuccess(order);
    return await notificationService.createNotification({
      ...template,
      user: order.user
    });
  },

  notifyPaymentFailed: async (order) => {
    const template = notificationService.templates.paymentFailed(order);
    return await notificationService.createNotification({
      ...template,
      user: order.user
    });
  },

  notifyLowStock: async (product, adminUsers) => {
    const template = notificationService.templates.lowStock(product);
    
    // Send notification to all admin users
    const notifications = await Promise.all(
      adminUsers.map(admin => 
        notificationService.createNotification({
          ...template,
          user: admin._id
        })
      )
    );
    
    return notifications;
  },

  notifyWelcome: async (user) => {
    const template = notificationService.templates.welcome(user);
    return await notificationService.createNotification({
      ...template,
      user: user._id
    });
  },

  notifyProductReview: async (product, review, adminUsers) => {
    const template = notificationService.templates.productReview(product, review);
    
    // Send notification to all admin users
    const notifications = await Promise.all(
      adminUsers.map(admin => 
        notificationService.createNotification({
          ...template,
          user: admin._id
        })
      )
    );
    
    return notifications;
  },

  // Bulk notification methods
  notifyAllUsers: async (template, excludeUsers = []) => {
    try {
      const User = require('../models/User');
      const users = await User.find({ 
        _id: { $nin: excludeUsers },
        role: { $ne: 'admin' } // Don't send to admins by default
      });

      const notifications = await Promise.all(
        users.map(user => 
          notificationService.createNotification({
            ...template,
            user: user._id
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  },

  // Cleanup expired notifications
  cleanupExpired: async () => {
    try {
      const result = await Notification.deleteExpired();
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
};

module.exports = notificationService;
