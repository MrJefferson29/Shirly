import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useAuthContext, useCartContext, useProductsContext } from "../../contexts";
import { createCheckoutSessionService } from "../../api/apiServices";
import { notify } from "../../utils/utils";
import { useNavigate } from "react-router";
import OrderSummary from "./OrderSummary";
import AddressSelector from "../address/AddressSelector";

const StripeModal = ({ showModal, setShowModal }) => {
  const { userInfo, token } = useAuthContext();
  const { cart, clearCart, totalPriceOfCartProducts } = useCartContext();
  const { currentAddress } = useProductsContext();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const navigate = useNavigate();

  const createCheckoutSession = async () => {
    console.log('📋 Current address check:', currentAddress);
    console.log('📋 Address keys:', currentAddress ? Object.keys(currentAddress) : 'undefined');
    console.log('📋 Address length:', currentAddress ? Object.keys(currentAddress).length : 'undefined');
    
    if (!currentAddress || Object.keys(currentAddress).length === 0) {
      notify("warn", "Please select or add a shipping address.");
      return;
    }

    if (!cart || cart.length === 0) {
      notify("warn", "Your cart is empty.");
      return;
    }

    console.log('📋 Current address being sent:', currentAddress);

    setIsCreatingCheckout(true);

    try {
      // Prepare items for checkout session
      const checkoutItems = cart.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.newPrice || item.product.price,
        quantity: item.quantity,
        image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : undefined
      }));

      const checkoutData = {
        items: checkoutItems,
        totalAmount: totalPriceOfCartProducts,
        paymentMethod: 'stripe',
        shippingAddress: currentAddress,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cart`
      };

      console.log('📋 Checkout data being sent:', checkoutData);

      // Create checkout session
      const response = await createCheckoutSessionService(checkoutData, token);
      
      if (response.data.success) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.data.checkoutUrl;
      } else {
        throw new Error(response.data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Create checkout session error:', error);
      notify("error", error.response?.data?.message || error.message || 'Failed to create checkout session. Please try again.');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      {showModal ? (
        <>
          <div className="transition justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-4xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-xl font-semibold">
                    Order Summary & Checkout
                  </h3>
                  <button className="p-1" onClick={handleClose}>
                    <AiOutlineClose />
                  </button>
                </div>

                <div className="p-6">
                  <OrderSummary />
                  
                  {/* Order Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Order Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Items:</span> {cart.length}</p>
                      <p><span className="font-medium">Total:</span> ${totalPriceOfCartProducts}</p>
                      <p><span className="font-medium">Payment Method:</span> Stripe (Card, Apple Pay, Google Pay, etc.)</p>
                    </div>
                  </div>

                  {/* Address Selection */}
                  <div className="mt-4">
                    <AddressSelector 
                      onAddressSelect={(address) => {
                        console.log('Address selected:', address);
                      }}
                      selectedAddress={currentAddress}
                    />
                  </div>

                  {/* Checkout Button */}
                  <div className="mt-6">
                    <button
                      disabled={isCreatingCheckout}
                      className="btn-rounded-primary w-full text-sm ease-linear transition-all duration-150 h-12 flex justify-center items-center disabled:cursor-wait"
                      type="button"
                      onClick={createCheckoutSession}
                    >
                      {isCreatingCheckout ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating Checkout...</span>
                        </div>
                      ) : (
                        <span>Proceed to Checkout</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default StripeModal;
