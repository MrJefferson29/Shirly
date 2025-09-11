import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useAuthContext, useCartContext, useProductsContext } from "../../contexts";
import { notify } from "../../utils/utils";
import { useNavigate } from "react-router";
import SimplePayment from "./SimplePayment";
import OrderSummary from "./OrderSummary";
import spinningLoader from '../../assets/spinning-circles.svg';

const NewStripeModal = ({ showModal, setShowModal }) => {
  const { userInfo, token } = useAuthContext();
  const { cart, clearCart, totalPriceOfCartProducts } = useCartContext();
  const { currentAddress, userAddress, addressLoading } = useProductsContext();
  const navigate = useNavigate();
  
  // Debug: Log the address values
  console.log('🔍 NewStripeModal render - currentAddress:', currentAddress);
  console.log('🔍 NewStripeModal render - userAddress:', userAddress);
  console.log('🔍 NewStripeModal render - currentAddress keys:', currentAddress ? Object.keys(currentAddress) : 'undefined');
  console.log('🔍 NewStripeModal render - userAddress keys:', userAddress ? Object.keys(userAddress) : 'undefined');

  const handlePaymentSuccess = (orderData) => {
    // Don't show notification here since PaymentSuccess page will handle it
    clearCart();
    setShowModal(false);
    navigate("/payment/success", { 
      state: { 
        order: orderData,
        message: "Payment successful! Your order has been confirmed." 
      } 
    });
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    notify("error", "Payment failed. Please try again.");
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Order</h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Order Summary */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                <OrderSummary />
              </div>

              {/* Address Information */}
              {currentAddress && Object.keys(currentAddress).length > 0 && currentAddress.fullname ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">
                        {currentAddress.fullname || currentAddress.fullName || 'N/A'}
                      </p>
                      <p>{currentAddress.flat || currentAddress.street || 'N/A'}</p>
                      <p>
                        {currentAddress.city || 'N/A'}, {currentAddress.state || 'N/A'} {currentAddress.pincode || currentAddress.zipCode || 'N/A'}
                      </p>
                      <p>{currentAddress.country || 'US'}</p>
                      <p>{currentAddress.mobile || currentAddress.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Please add a shipping address before proceeding to payment.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Payment */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment</h3>
                {addressLoading ? (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <img src={spinningLoader} alt="Loading" className="w-8 h-8 mx-auto mb-4" />
                    <p className="text-gray-600">Loading address information...</p>
                  </div>
                ) : currentAddress && Object.keys(currentAddress).length > 0 && currentAddress.fullname ? (
                  <SimplePayment
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-600">Please add a shipping address to proceed with payment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewStripeModal;
