import React, { useState, useEffect } from 'react';
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
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RqgIV3yXXeQwXZ6cR2Zf8bNwzOHW5SPbDhmfd6L0kSDuN9qK8DPwzPGmLshkU1FhQeNQRhrFTVqkxZckeLhlT0w00CN2Ln9zY'
);

const CheckoutForm = ({ orderId, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuthContext();
  const { clearCart } = useCartContext();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(null);

  useEffect(() => {
    // Load payment methods info
    const loadPaymentMethods = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/methods`);
        const data = await response.json();
        if (data.success) {
          setPaymentMethods(data.data.paymentMethods);
        }
      } catch (error) {
        console.error('Failed to load payment methods:', error);
      }
    };

    loadPaymentMethods();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent
      const paymentIntentResponse = await createPaymentIntentService(orderId, token);
      
      if (!paymentIntentResponse.data.success) {
        throw new Error(paymentIntentResponse.data.message || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = paymentIntentResponse.data.data;

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('Payment failed:', error);
        notify('error', error.message || 'Payment failed. Please try again.');
        onPaymentError(error);
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
      notify('error', error.message || 'Payment failed. Please try again.');
      onPaymentError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Methods Info */}
      {paymentMethods && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Available Payment Methods</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(paymentMethods).map(([key, method]) => (
              <div key={key} className="flex items-center space-x-2">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <p className="font-medium text-sm">{method.name}</p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stripe Payment Element */}
      <div className="border border-gray-200 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'link']
          }}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 
        text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200
        flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <img src={spinningLoader} alt="Loading" className="w-5 h-5" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <span>Pay Now</span>
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

const StripePayment = ({ orderId, onPaymentSuccess, onPaymentError }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await createPaymentIntentService(orderId, localStorage.getItem('token'));
        
        if (response.data.success) {
          setClientSecret(response.data.data.clientSecret);
        } else {
          throw new Error(response.data.message || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('Failed to create payment intent:', error);
        notify('error', 'Failed to initialize payment. Please try again.');
        onPaymentError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      createPaymentIntent();
    } else {
      setIsLoading(false);
    }
  }, [orderId, onPaymentError]);

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
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px',
      },
      '.Input:focus': {
        border: '1px solid #f59e0b',
        boxShadow: '0 0 0 1px #f59e0b',
      },
    },
  };

  const options = {
    clientSecret,
    appearance,
    loader: 'auto',
  };

  if (isLoading || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <img src={spinningLoader} alt="Loading" className="w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        orderId={orderId}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripePayment;
