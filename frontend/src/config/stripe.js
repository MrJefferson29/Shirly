import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RqgIV3yXXeQwXZ6cR2Zf8bNwzOHW5SPbDhmfd6L0kSDuN9qK8DPwzPGmLshkU1FhQeNQRhrFTVqkxZckeLhlT0w00CN2Ln9zY'
);

export default stripePromise;
