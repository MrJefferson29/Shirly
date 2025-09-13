const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  timeout: 30000, // 30 seconds timeout (reduced from 60s)
  maxNetworkRetries: 2, // Retry failed requests up to 2 times (reduced from 3)
  apiVersion: '2024-06-20' // Use a more recent API version
});

// Configure Stripe with supported payment methods
const stripeConfig = {
  // Enable payment methods
  payment_method_types: [
    'card',           // Credit/Debit cards
    'apple_pay',      // Apple Pay
    'google_pay',     // Google Pay
    'link',           // Stripe Link
    'us_bank_account' // US Bank transfers (for Cash App compatibility)
  ],
  
  
  // Currency and locale
  currency: 'usd', // US Dollars
  locale: 'en',
  
  // Customer creation
  customer_creation: 'always',
  
  // Payment confirmation
  confirm: true,
  return_url: `${process.env.FRONTEND_URL || 'https://shirly-kappa.vercel.app'}/payment/success`,
  
  // Metadata
  metadata: {
    integration_check: 'accept_a_payment'
  }
};

module.exports = {
  stripe,
  stripeConfig
};
