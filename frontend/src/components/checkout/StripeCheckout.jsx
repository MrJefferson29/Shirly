import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  createPaymentIntentService
} from '../../api/apiServices';
import { useAuthContext, useCartContext } from '../../contexts';
import { notify } from '../../utils/utils';
import spinningLoader from '../../assets/spinning-circles.svg';

// Initialize Stripe with a working test key
const stripePromise = loadStripe('pk_test_51RqgIV3yXXeQwXZ6cR2Zf8bNwzOHW5SPbDhmfd6L0kSDuN9qK8DPwzPGmLshkU1FhQeNQRhrFTVqkxZckeLhlT0w00CN2Ln9zY');

const StripeCheckout = ({ onPaymentSuccess, onPaymentError }) => {
  const { token } = useAuthContext();
  const { cart, totalPriceOfCartProducts } = useCartContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!cart || cart.length === 0) {
      notify('error', 'Your cart is empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent with cart items
      const response = await createPaymentIntentService(
        {
          items: cart.map(item => ({
            productId: item._id,
            quantity: item.qty,
            price: item.newPrice || item.price
          })),
          totalAmount: totalPriceOfCartProducts
        },
        token
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = response.data.data;

      // For Payment Intents, we need to use Elements instead of redirectToCheckout
      // This component should not be used anymore since we have PaymentIntentCheckout
      throw new Error('This component is deprecated. Please use PaymentIntentCheckout instead.');

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to process checkout. Please try again.');
      onPaymentError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={isLoading || !cart || cart.length === 0}
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 
        text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200
        flex items-center justify-center space-x-2 text-lg"
      >
        {isLoading ? (
          <>
            <img src={spinningLoader} alt="Loading" className="w-6 h-6" />
            <span>Redirecting to Payment...</span>
          </>
        ) : (
          <>
            <span>Proceed to Payment</span>
            <span className="text-xl">→</span>
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <p>🔒 You will be redirected to Stripe's secure payment page</p>
        <p>Powered by Stripe</p>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Accepted Payment Methods:</h3>
        <div className="flex flex-wrap gap-2 text-sm text-blue-700">
          <span className="bg-white px-2 py-1 rounded">💳 Credit/Debit Cards</span>
          <span className="bg-white px-2 py-1 rounded">📱 Apple Pay</span>
          <span className="bg-white px-2 py-1 rounded">📱 Google Pay</span>
          <span className="bg-white px-2 py-1 rounded">💰 Cash App</span>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
