import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import { getUserOrdersService, getUnreadMessageCountService } from '../api/apiServices';
import ChatModal from '../components/chat/ChatModal';
import ReviewModal from '../components/review/ReviewModal';
import { 
  HiOutlineSupport, 
  HiOutlineBell, 
  HiOutlineStar, 
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineXCircle
} from 'react-icons/hi';

const CustomerChat = () => {
  const { userInfo, token } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
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

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(product => 
          product.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Time filter
    if (timeFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (timeFilter) {
          case 'today':
            return orderDate >= today;
          case 'thisWeek':
            return orderDate >= thisWeek;
          case 'thisMonth':
            return orderDate >= thisMonth;
          default:
            return true;
        }
      });
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amountHigh':
          return b.totalAmount - a.totalAmount;
        case 'amountLow':
          return a.totalAmount - b.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, timeFilter, sortBy]);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <HiOutlineClock className="w-4 h-4" />;
      case 'confirmed':
        return <HiOutlineCheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <HiOutlineTruck className="w-4 h-4" />;
      case 'delivered':
        return <HiOutlineCheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <HiOutlineXCircle className="w-4 h-4" />;
      default:
        return <HiOutlineClock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTimeFilter('');
    setSortBy('newest');
  };

  if (userInfo?.role === 'admin') {
    return (
      <div className="min-h-screen bg-[--theme-color] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[--primary-text-color]">Access Denied</h1>
            <p className="mt-2 text-[--secondary-text-color]">This page is for customers only.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[--theme-color] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-black mb-2">
                Customer <span className="font-semibold">Support</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Chat with our support team about your orders
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-full">
                <HiOutlineBell />
                <span className="font-medium">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 card">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders by number or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <HiOutlineFilter className="w-5 h-5" />
                Filters
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amountHigh">Amount: High to Low</option>
                <option value="amountLow">Amount: Low to High</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Time Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period</label>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="thisWeek">This Week</option>
                      <option value="thisMonth">This Month</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineSupport className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-semibold text-black">
              {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
            </h3>
            <p className="mt-1 text-lg text-gray-600 leading-relaxed">
              {orders.length === 0 
                ? 'You need to have placed an order to start a conversation with support.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <div key={order._id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-black">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total:</span> ₹{order.totalAmount}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Items:</span> {order.products?.length || order.items?.length || 0} item{(order.products?.length || order.items?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-black mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {(order.products || order.items || []).map((item, index) => (
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
                            <div className="text-sm font-semibold text-black">{item.product?.name || 'Unknown Product'}</div>
                            <div className="text-xs text-gray-600">Qty: {item.quantity} • ₹{item.product?.price || item.price}</div>
                          </div>
                        </div>
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => openReviewModal(item.product, order._id)}
                            className="flex items-center space-x-1 px-2 py-1 bg-black text-white text-xs rounded-md hover:bg-gray-800 transition-colors"
                          >
                            <HiOutlineStar className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openChat(order)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <HiOutlineSupport />
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
