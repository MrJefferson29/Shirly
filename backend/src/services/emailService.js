const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Try to load handlebars, but don't fail if it's not available
let handlebars = null;
try {
  handlebars = require('handlebars');
} catch (error) {
  console.log('⚠️ Handlebars not available, using simple template replacement');
}

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // For development, use a mock transporter that logs emails
      if (process.env.NODE_ENV !== 'production') {
        this.transporter = {
          sendMail: async (mailOptions) => {
            console.log('📧 [MOCK EMAIL] Would send email:');
            console.log('   To:', mailOptions.to);
            console.log('   Subject:', mailOptions.subject);
            console.log('   From:', mailOptions.from);
            console.log('   Preview URL: https://ethereal.email/message/' + Date.now());
            
            return {
              messageId: 'mock-' + Date.now(),
              getTestMessageUrl: () => 'https://ethereal.email/message/' + Date.now()
            };
          }
        };
        console.log('📧 Development email service configured (mock mode)');
      } else {
        // Production email configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: process.env.EMAIL_PORT == 465,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      }

      // Verify connection configuration
      if (process.env.NODE_ENV === 'production') {
        await this.transporter.verify();
        console.log('✅ Email service ready');
      } else {
        console.log('📧 Email service configured (development mode)');
      }
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      // Don't throw error in development
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      if (handlebars) {
        return handlebars.compile(templateContent);
      } else {
        // Simple template replacement fallback
        return (data) => {
          let content = templateContent;
          // Replace common placeholders
          Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, data[key] || '');
          });
          return content;
        };
      }
    } catch (error) {
      console.error(`❌ Failed to load email template ${templateName}:`, error);
      throw error;
    }
  }

  async sendOrderConfirmationEmail(order, user) {
    try {
      if (!this.transporter) {
        console.log('📧 Email service not available, skipping email send');
        return { success: false, message: 'Email service not configured' };
      }

      let template;
      try {
        template = await this.loadTemplate('orderConfirmation');
      } catch (templateError) {
        console.log('⚠️ Using fallback simple email template');
        template = this.getSimpleOrderConfirmationTemplate();
      }
      
      // Prepare template data
      const templateData = {
        customerName: user.username || user.email,
        orderNumber: order.orderNumber,
        orderDate: new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        totalAmount: order.totalAmount,
        items: order.items.map(item => ({
          name: item.name || 'Product',
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        })),
        shippingAddress: {
          name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          address: order.shippingAddress.address,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.zipCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone
        },
        supportUrl: `${process.env.FRONTEND_URL || 'https://shirly-kappa.vercel.app'}/chat?orderId=${order._id}`,
        companyName: 'Luméra',
        companyEmail: 'support@lumera.com',
        companyPhone: '+1 (555) 123-4567'
      };

      const htmlContent = template(templateData);

      const mailOptions = {
        from: `"${templateData.companyName}" <${process.env.EMAIL_FROM || 'noreply@lumera.com'}>`,
        to: user.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: htmlContent,
        // For development, also log the email content
        ...(process.env.NODE_ENV !== 'production' && {
          // In development, we can preview the email
          preview: true
        })
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Order confirmation email sent:', {
        to: user.email,
        orderNumber: order.orderNumber,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId,
        previewUrl: result.getTestMessageUrl ? result.getTestMessageUrl() : null
      };

    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getSimpleOrderConfirmationTemplate() {
    return (data) => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Order Confirmation - Luméra</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 20px; border: 1px solid #ddd; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .order-info { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .support-section { background: #e3f2fd; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .items-table th { background: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase, ${data.customerName}!</p>
          </div>
          
          <div class="content">
            <p>We're excited to let you know that your order has been successfully placed and is being processed.</p>
            
            <div class="order-info">
              <h3>📋 Order Details</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Order Date:</strong> ${data.orderDate}</p>
              <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
            </div>

            <h3>🛍️ Items Ordered</h3>
            <table class="items-table">
              <thead>
                <tr><th>Item</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price}</td>
                    <td>$${item.total}</td>
                  </tr>
                `).join('')}
                <tr style="background: #f8f9fa; font-weight: bold;">
                  <td colspan="3">Total</td>
                  <td>$${data.totalAmount}</td>
                </tr>
              </tbody>
            </table>

            <div style="background: #e3f2fd; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <h3>🚚 Shipping Address</h3>
              <p><strong>${data.shippingAddress.name}</strong></p>
              <p>${data.shippingAddress.address}</p>
              <p>${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
              <p>${data.shippingAddress.country}</p>
              <p>📞 ${data.shippingAddress.phone}</p>
            </div>

            <div class="support-section">
              <h3>🆘 Need Help? We're Here for You!</h3>
              <p>If you have any questions about your order, our support team is ready to help:</p>
              
              <div style="margin: 15px 0;">
                <p><strong>Step 1:</strong> Click the "Contact Support" button below</p>
                <p><strong>Step 2:</strong> Provide your order number: <strong>${data.orderNumber}</strong></p>
                <p><strong>Step 3:</strong> Describe your question or concern</p>
                <p><strong>Step 4:</strong> Our team will respond promptly</p>
              </div>

              <a href="${data.supportUrl}" class="cta-button">💬 Contact Support Now</a>

              <p style="margin-top: 15px; font-size: 14px;">
                <strong>Quick Support Options:</strong><br>
                📧 Email: ${data.companyEmail}<br>
                📞 Phone: ${data.companyPhone}<br>
                💬 Live Chat: Available 24/7
              </p>
            </div>

            <p style="text-align: center; margin-top: 20px;">
              We'll send you another email when your order ships. Thank you for choosing ${data.companyName}!
            </p>
          </div>

          <div class="footer">
            <p><strong>${data.companyName}</strong></p>
            <p>Your premier destination for quality products and exceptional shopping experience.</p>
            <p>📧 ${data.companyEmail} | 📞 ${data.companyPhone}</p>
            <p style="font-size: 12px; margin-top: 15px;">© 2025 ${data.companyName}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;
    };
  }

  async sendTestEmail(to, subject, content) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: `"Luméra" <${process.env.EMAIL_FROM || 'noreply@lumera.com'}>`,
        to: to,
        subject: subject,
        html: content
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: result.getTestMessageUrl ? result.getTestMessageUrl() : null
      };
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();