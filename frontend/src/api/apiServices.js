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
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Order Services (moved to payment services section below)

export const getOrderByIdService = (orderId, token) =>
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Payment Services
export const getPaymentMethodsService = () =>
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/methods`);

export const createCheckoutSessionService = (checkoutData, token) =>
  axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/create-checkout-session`, 
    checkoutData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const createOrderFromSessionService = (sessionId, token) =>
  axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/create-order-from-session`, 
    { sessionId }, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// DEPRECATED - Use createCheckoutSessionService instead
// export const createPaymentIntentService = (paymentData, token) =>
//   axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/create-payment-intent`, 
//     paymentData, 
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

// DEPRECATED - Use createCheckoutSessionService instead
// export const createPaymentIntentLegacyService = (orderId, token) =>
//   axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/create-intent`, 
//     { orderId }, 
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

// DEPRECATED - Use Stripe webhooks instead
// export const confirmPaymentService = (paymentIntentId, token) =>
//   axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/confirm`, 
//     { paymentIntentId }, 
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

// Order Services (DEPRECATED - Use createCheckoutSessionService instead)
// export const createOrderService = (orderData, token) =>
//   axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/create-order`, 
//     orderData, 
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

export const getUserOrdersService = (token, params = {}) =>
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/payments/orders`, 
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
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/admin/orders`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params
    }
  );

export const updateOrderStatusService = (orderId, statusData, token) =>
  axios.put(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/admin/orders/${orderId}/status`, 
    statusData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const updateOrderPaymentStatusService = (orderId, paymentStatusData, token) =>
  axios.put(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/admin/orders/${orderId}/payment-status`, 
    paymentStatusData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// Address Services
export const getUserAddressService = (token) => {
  console.log('🏠 API: getUserAddressService called with token:', token ? 'present' : 'missing');
  return axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/auth/address`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateAddressService = (addressData, token) =>
  axios.put(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/auth/address`, 
    addressData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// Message Services
export const getOrderMessagesService = (orderId, token) =>
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/messages/order/${orderId}`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const getUnreadMessageCountService = (token) =>
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/messages/unread-count`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const markMessagesAsReadService = (messageIds, token) =>
  axios.put(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/messages/mark-read`, 
    { messageIds }, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const sendMessageService = (messageData, token) =>
  axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/messages/send`, 
    messageData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// Review Services
export const createReviewService = (reviewData, token) =>
  axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/reviews`, 
    reviewData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const getProductReviewsService = (productId, params = {}) =>
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/reviews/product/${productId}`, 
    { params }
  );

export const getUserReviewsService = (token, params = {}) =>
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/reviews/user`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params
    }
  );

export const canUserReviewService = (productId, orderId, token) =>
  axios.get(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/reviews/can-review/${productId}/${orderId}`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const updateReviewService = (reviewId, reviewData, token) =>
  axios.put(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/reviews/${reviewId}`, 
    reviewData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const deleteReviewService = (reviewId, token) =>
  axios.delete(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/reviews/${reviewId}`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const markReviewHelpfulService = (reviewId, token) =>
  axios.post(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/reviews/${reviewId}/helpful`, 
    {}, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
