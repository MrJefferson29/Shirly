import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext, useCartContext } from '../contexts';
import { notify } from '../utils/utils';
import { createOrderFromSessionService } from '../api/apiServices';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const { clearCart } = useCartContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Get session ID from URL params
      const urlParams = new URLSearchParams(location.search);
      const sessionId = urlParams.get('session_id');

      if (sessionId) {
        try {
          // Handle Stripe checkout session success
          notify('success', 'Payment successful! Processing your order...');
          
          // Clear the cart since payment was successful
          clearCart();
          
          // Try to create order from session (fallback for local development)
          try {
            const response = await createOrderFromSessionService(sessionId, token);
            if (response.data.success) {
              console.log('✅ Order created successfully:', response.data.data.order);
            }
          } catch (orderError) {
            console.log('ℹ️ Order creation failed (webhook may have already created it):', orderError.message);
          }
          
          // Wait a moment for processing, then redirect
          setTimeout(() => {
            navigate('/orders', { 
              state: { 
                message: 'Payment successful! Your order has been confirmed.',
                type: 'success'
              }
            });
          }, 2000);
        } catch (error) {
          console.error('Payment success handling error:', error);
          notify('error', 'There was an issue processing your payment. Please contact support.');
          navigate('/orders');
        }
      } else {
        // No session ID found, redirect to home
        notify('error', 'Invalid payment success page');
        navigate('/');
      }
      
      setLoading(false);
    };

    handlePaymentSuccess();
  }, [location, navigate, clearCart, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. We're now creating your order and will redirect you to your orders page.
        </p>
        
        <div className="mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Processing your order...</p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
          >
            View My Orders
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Redirecting to orders page in a few seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
