import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  createPaymentIntentService,
  confirmPaymentService 
} from '../../api/apiServices';
import { useAuthContext, useCartContext } from '../../contexts';
import { notify } from '../../utils/utils';
import spinningLoader from '../../assets/spinning-circles.svg';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RqgIV3yXXeQwXZ6cR2Zf8bNwzOHW5SPbDhmfd6L0kSDuN9qK8DPwzPGmLshkU1FhQeNQRhrFTVqkxZckeLhlT0w00CN2Ln9zY');

const CheckoutForm = ({ onPaymentSuccess, onPaymentError, paymentIntentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuthContext();
  const { cart, clearCart, totalPriceOfCartProducts } = useCartContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Confirm payment with Stripe (payment intent already created by parent)
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        console.error('Payment failed:', stripeError);
        setError(stripeError.message || 'Payment failed. Please try again.');
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        const confirmResponse = await confirmPaymentService(paymentIntentId, token);
        
        if (confirmResponse.data.success) {
          notify('success', 'Payment successful! Your order has been confirmed.');
          clearCart();
          onPaymentSuccess(confirmResponse.data.data);
        } else {
          throw new Error(confirmResponse.data.message || 'Failed to confirm payment');
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      onPaymentError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Stripe Payment Element */}
      <div className="border border-gray-200 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 
        text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200
        flex items-center justify-center space-x-2 text-lg"
      >
        {isLoading ? (
          <>
            <img src={spinningLoader} alt="Loading" className="w-6 h-6" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <span>Pay ${totalPriceOfCartProducts}</span>
            <span className="text-xl">→</span>
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>Powered by Stripe</p>
      </div>
    </form>
  );
};

const PaymentIntentCheckout = ({ onPaymentSuccess, onPaymentError }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();
  const { cart, totalPriceOfCartProducts } = useCartContext();

  React.useEffect(() => {
    const createPaymentIntent = async () => {
      try {
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
        
        if (response.data.success) {
          setClientSecret(response.data.data.clientSecret);
          setPaymentIntentId(response.data.data.paymentIntentId);
        } else {
          throw new Error(response.data.message || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('Failed to create payment intent:', error);
        setError('Failed to initialize payment. Please try again.');
        onPaymentError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (cart && cart.length > 0) {
      createPaymentIntent();
    } else {
      setIsLoading(false);
    }
  }, [cart, token, onPaymentError]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#f59e0b',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
    loader: 'auto',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <img src={spinningLoader} alt="Loading" className="w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">No payment information available</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        paymentIntentId={paymentIntentId}
      />
    </Elements>
  );
};

export default PaymentIntentCheckout;
