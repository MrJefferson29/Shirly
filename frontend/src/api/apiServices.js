import axios from "axios";
import {
  CART_URL,
  PRODUCTS_URL,
  LOGIN_URL,
  SIGNUP_URL,
  WISHLIST_URL,
  CATEGORIES_URL,
} from "./apiUrls";

export const loginService = (email, password) =>
  axios.post(LOGIN_URL, { email, password });

export const signupService = (username, email, password) =>
  axios.post(SIGNUP_URL, { username, email, password });

export const getAllProductsService = () => axios.get(PRODUCTS_URL);

export const getProductByIdService = (productId) =>
  axios.get(`${PRODUCTS_URL}/${productId}`);

export const getCartItemsService = (token) =>
  axios.get(CART_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const postAddProductToCartService = (product, token) =>
  axios.post(
    CART_URL,
    { productId: product._id },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const putUpdateProductQtyCartService = (productId, quantity, token) =>
  axios.put(
    `${CART_URL}/${productId}`,
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const deleteProductFromCartService = (productId, token) =>
  axios.delete(`${CART_URL}/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getWishlistItemsService = (token) =>
  axios.get(WISHLIST_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const postAddProductToWishlistService = (product, token) =>
  axios.post(
    WISHLIST_URL,
    { productId: product._id },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const deleteProductFromWishlistService = (productId, token) =>
  axios.delete(`${WISHLIST_URL}/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getAllCategoriesService = () => axios.get(CATEGORIES_URL);

export const getCurrentUserService = (token) =>
  axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Order Services (moved to payment services section below)

export const getOrderByIdService = (orderId, token) =>
  axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/payments/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Payment Services
export const getPaymentMethodsService = () =>
  axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/payments/methods`);

export const createCheckoutSessionService = (checkoutData, token) =>
  axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/payments/create-checkout-session`, 
    checkoutData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// DEPRECATED - Use createCheckoutSessionService instead
// export const createPaymentIntentService = (paymentData, token) =>
//   axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/payments/create-payment-intent`, 
//     paymentData, 
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

// DEPRECATED - Use createCheckoutSessionService instead
// export const createPaymentIntentLegacyService = (orderId, token) =>
//   axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/payments/create-intent`, 
//     { orderId }, 
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

// DEPRECATED - Use Stripe webhooks instead
// export const confirmPaymentService = (paymentIntentId, token) =>
//   axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/payments/confirm`, 
//     { paymentIntentId }, 
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

// Order Services (DEPRECATED - Use createCheckoutSessionService instead)
// export const createOrderService = (orderData, token) =>
//   axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/payments/create-order`, 
//     orderData, 
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

export const getUserOrdersService = (token, params = {}) =>
  axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/payments/orders`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params
    }
  );

// getOrderService removed - use getOrderByIdService instead

// Admin Order Services
export const getAdminOrdersService = (token, params = {}) =>
  axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/orders`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params
    }
  );

export const updateOrderStatusService = (orderId, statusData, token) =>
  axios.put(`${process.env.REACT_APP_URL || "http://localhost:5000/api"}/admin/orders/${orderId}/status`, 
    statusData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const updateOrderPaymentStatusService = (orderId, paymentStatusData, token) =>
  axios.put(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/orders/${orderId}/payment-status`, 
    paymentStatusData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// Address Services
export const getUserAddressesService = (token) =>
  axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/addresses`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const addAddressService = (addressData, token) =>
  axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/addresses`, 
    addressData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const updateAddressService = (addressId, addressData, token) =>
  axios.put(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/addresses/${addressId}`, 
    addressData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const deleteAddressService = (addressId, token) =>
  axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/addresses/${addressId}`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
