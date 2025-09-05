import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import { getUserOrdersService, getUnreadMessageCountService } from '../api/apiServices';
import ChatModal from '../components/chat/ChatModal';
import ReviewModal from '../components/review/ReviewModal';
import { FaComments, FaBell, FaStar } from 'react-icons/fa';

const CustomerChat = () => {
  const { userInfo, token } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatModal, setChatModal] = useState({ 
    isOpen: false, 
    orderId: null, 
    orderNumber: '', 
    customerName: userInfo?.username || 'Customer',
    orderData: null
  });
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    product: null,
    orderId: null,
    existingReview: null
  });

  useEffect(() => {
    if (userInfo?.role === 'admin') {
      return;
    }
    fetchOrders();
    fetchUnreadCount();
  }, [userInfo, token]);

  const fetchOrders = async () => {
    try {
      const response = await getUserOrdersService(token);
      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadMessageCountService(token);
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const openChat = (order) => {
    setChatModal({
      isOpen: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: userInfo?.username || 'Customer',
      orderData: order
    });
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

  if (userInfo?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">This page is for customers only.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
              <p className="mt-2 text-gray-600">
                Chat with our support team about your orders
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 rounded-full">
                <FaBell />
                <span className="font-medium">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FaComments className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to have placed an order to start a conversation with support.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total:</span> ${order.totalAmount}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Items:</span> {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          {item.product?.images && item.product.images.length > 0 && (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</div>
                            <div className="text-xs text-gray-500">Qty: {item.quantity} • ${item.price}</div>
                          </div>
                        </div>
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => openReviewModal(item.product, order._id)}
                            className="flex items-center space-x-1 px-2 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition-colors"
                          >
                            <FaStar className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openChat(order)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaComments />
                  Start Conversation
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chat Modal */}
        <ChatModal
          isOpen={chatModal.isOpen}
          onClose={() => setChatModal({ 
            isOpen: false, 
            orderId: null, 
            orderNumber: '', 
            customerName: userInfo?.username || 'Customer',
            orderData: null
          })}
          orderId={chatModal.orderId}
          orderNumber={chatModal.orderNumber}
          customerName={chatModal.customerName}
          orderData={chatModal.orderData}
        />

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

export default CustomerChat;
