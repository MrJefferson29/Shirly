# Email Service Setup

## Overview
The email service has been integrated to send order confirmation emails to customers when they place an order. The emails include order details and support information.

## Features
- ✅ Order confirmation emails with complete order details
- ✅ Support contact information and steps
- ✅ Direct link to support chat with order context
- ✅ Responsive HTML email template
- ✅ Error handling (email failures don't break order creation)

## Email Template Features
- **Order Details**: Order number, date, total amount, items
- **Shipping Information**: Complete shipping address
- **Support Section**: Step-by-step instructions for contacting support
- **Direct Support Link**: Links to chat page with order ID context
- **Contact Information**: Email, phone, and live chat options
- **Responsive Design**: Works on desktop and mobile devices

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@lumera.com
```

### Gmail Setup (Recommended for Development)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `EMAIL_PASS`

### Production Email Services
For production, consider using:
- **SendGrid**: Professional email service
- **Mailgun**: Developer-friendly email API
- **Amazon SES**: AWS email service
- **Postmark**: Transactional email service

## Testing

### Test Email Endpoint
```bash
POST /api/test-email
Content-Type: application/json

{
  "to": "test@example.com",
  "orderId": "optional_order_id_for_confirmation_email"
}
```

### Test Order Confirmation Email
```bash
POST /api/test-email
Content-Type: application/json

{
  "to": "customer@example.com",
  "orderId": "68c4ba77f67560a8fd99f046"
}
```

## Email Triggers
Emails are automatically sent when:
1. **Checkout Session Completed**: Via Stripe webhook
2. **Manual Order Creation**: Via `/api/payments/create-order-from-session`

## Support Link Structure
The support link includes the order ID for context:
```
http://localhost:3000/chat?orderId=ORDER_ID
```

This allows the support team to immediately see which order the customer is asking about.

## Error Handling
- Email failures are logged but don't prevent order creation
- Development mode uses Ethereal Email for testing
- Production mode requires proper email service configuration

## Files Created/Modified
- `backend/src/services/emailService.js` - Email service
- `backend/src/templates/email/orderConfirmation.hbs` - Email template
- `backend/src/controllers/paymentController.js` - Added email sending
- `backend/src/app.js` - Added email sending to webhook + test endpoint

## Next Steps
1. Configure email service credentials in `.env`
2. Test email functionality using `/api/test-email`
3. Place a test order to verify email sending
4. Customize email template as needed
5. Set up production email service for live deployment
