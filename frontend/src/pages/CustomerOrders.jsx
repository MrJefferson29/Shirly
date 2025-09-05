import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import { getUserOrdersService } from '../api/apiServices';
import ReviewModal from '../components/review/ReviewModal';
import { FaStar, FaEye } from 'react-icons/fa';

const CustomerOrders = () => {
  const { userInfo, token } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    product: null,
    orderId: null,
    existingReview: null
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getUserOrdersService(token);
      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const openReviewModal = (product, orderId, existingReview = null) => {
    setReviewModal({
      isOpen: true,
      product,
      orderId,
      existingReview
    });
  };

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      product: null,
      orderId: null,
      existingReview: null
    });
  };

  const handleReviewSubmitted = () => {
    // Refresh orders to show updated review status
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {expandedOrders.has(order._id) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.orderNumber || order._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${order.totalAmount}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrders.has(order._id) && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Details */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Order Number:</span>
                            <span className="font-medium">{order.orderNumber || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Placed:</span>
                            <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last Updated:</span>
                            <span className="font-medium">{new Date(order.updatedAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Payment Method:</span>
                            <span className="font-medium capitalize">{order.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                        {/* Debug: Log order data */}
                        {console.log('🔍 Order shipping address:', order.shippingAddress)}
                        {order.shippingAddress && 
                         (order.shippingAddress.firstName || order.shippingAddress.fullname) && 
                         (order.shippingAddress.firstName !== 'N/A' || order.shippingAddress.fullname !== 'N/A') && 
                         (order.shippingAddress.address || order.shippingAddress.flat) && 
                         (order.shippingAddress.address !== 'N/A' || order.shippingAddress.flat !== 'N/A') ? (
                          <div className="space-y-1 text-sm">
                            <div className="font-medium">
                              {order.shippingAddress.fullname || `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim()}
                            </div>
                            <div>{order.shippingAddress.flat || order.shippingAddress.address}</div>
                            {order.shippingAddress.area && (
                              <div>{order.shippingAddress.area}</div>
                            )}
                            <div>
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode || order.shippingAddress.zipCode}
                            </div>
                            <div>{order.shippingAddress.country || 'US'}</div>
                            {(order.shippingAddress.mobile || order.shippingAddress.phone) && (order.shippingAddress.mobile !== 'N/A' || order.shippingAddress.phone !== 'N/A') && (
                              <div>Phone: {order.shippingAddress.mobile || order.shippingAddress.phone}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Shipping address not available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                            <div className="flex items-center space-x-4">
                              {item.product?.images && item.product.images.length > 0 && (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</div>
                                <div className="text-sm text-gray-500">{item.product?.brand || 'N/A'}</div>
                                <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">${item.price}</div>
                              {order.status === 'delivered' && (
                                <button
                                  onClick={() => openReviewModal(item.product, order._id)}
                                  className="mt-2 flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  <FaStar className="w-3 h-3" />
                                  <span>Review</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={closeReviewModal}
          product={reviewModal.product}
          orderId={reviewModal.orderId}
          existingReview={reviewModal.existingReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>
    </div>
  );
};

export default CustomerOrders;
