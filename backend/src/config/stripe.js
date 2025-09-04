const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
  
  // Enable automatic payment methods
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'never'
  },
  
  // Currency and locale
  currency: 'usd', // US Dollars
  locale: 'en',
  
  // Customer creation
  customer_creation: 'always',
  
  // Payment confirmation
  confirm: true,
  return_url: `${process.env.FRONTEND_URL}/payment/success`,
  
  // Metadata
  metadata: {
    integration_check: 'accept_a_payment'
  }
};

module.exports = {
  stripe,
  stripeConfig
};
