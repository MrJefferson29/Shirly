import React, { useState, useEffect } from 'react';
import { 
  createCheckoutSessionService,
  getPaymentMethodsService
} from '../../api/apiServices';
import { useAuthContext, useCartContext } from '../../contexts';
import { notify } from '../../utils/utils';
import spinningLoader from '../../assets/spinning-circles.svg';
import { 
  FaCreditCard, 
  FaMobileAlt, 
  FaUniversity,
  FaApple,
  FaGoogle
} from 'react-icons/fa';



const PaymentForm = ({ onPaymentSuccess, onPaymentError }) => {
  const { token } = useAuthContext();
  const { cart, clearCart, totalPriceOfCartProducts } = useCartContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [paymentMethods, setPaymentMethods] = useState({});
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Load available payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await getPaymentMethodsService();
        if (response.data.success) {
          setPaymentMethods(response.data.data.paymentMethods);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setLoadingMethods(false);
      }
    };

    loadPaymentMethods();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent multiple submissions
    if (isLoading) {
      return;
    }



    setIsLoading(true);
    setError(null);

    try {
      // Create checkout session with Stripe
      const response = await createCheckoutSessionService(
        {
          items: cart.map(item => ({
            product: item._id,
            quantity: item.qty,
            price: item.newPrice || item.price,
            name: item.name,
            image: item.images?.[0] || item.image
          })),
          totalAmount: totalPriceOfCartProducts,
          paymentMethod: selectedPaymentMethod,
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`
        },
        token
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create checkout session');
      }

      const { sessionId, checkoutUrl } = response.data.data;

      // Redirect to Stripe Checkout
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received from Stripe');
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

      {/* Payment Method Selection */}
      {!loadingMethods && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(paymentMethods).map(([key, method]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPaymentMethod(key)}
                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                  selectedPaymentMethod === key
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {key === 'card' && <FaCreditCard />}
                    {key === 'apple_pay' && <FaApple />}
                    {key === 'google_pay' && <FaGoogle />}
                    {key === 'samsung_pay' && <FaMobileAlt />}
                    {key === 'cash_app' && <FaUniversity />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

            {/* Payment Method Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl text-blue-600">
            {selectedPaymentMethod === 'card' && <FaCreditCard />}
            {selectedPaymentMethod === 'apple_pay' && <FaApple />}
            {selectedPaymentMethod === 'google_pay' && <FaGoogle />}
            {selectedPaymentMethod === 'samsung_pay' && <FaMobileAlt />}
            {selectedPaymentMethod === 'cash_app' && <FaUniversity />}
          </div>
          <div>
            <div className="font-medium text-blue-900">
              {paymentMethods[selectedPaymentMethod]?.name || 'Payment Method'} Selected
            </div>
            <div className="text-sm text-blue-700">
              You'll be redirected to Stripe's secure payment page where you can use cards, Apple Pay, Google Pay, and other payment methods.
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || loadingMethods}
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
            <span>Continue to {paymentMethods[selectedPaymentMethod]?.name || 'Payment'} • ${totalPriceOfCartProducts}</span>
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

const SimplePayment = ({ onPaymentSuccess, onPaymentError }) => {
  const { cart } = useCartContext();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <PaymentForm 
      onPaymentSuccess={onPaymentSuccess}
      onPaymentError={onPaymentError}
    />
  );
};

export default SimplePayment;
