import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import { notify } from '../utils/utils';
import { getAdminOrdersService, updateOrderStatusService } from '../api/apiServices';

const AdminOrders = () => {
  const { token, userInfo } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    if (userInfo?.role !== 'admin') {
      notify('error', 'Access denied. Admin privileges required.');
      return;
    }
    fetchOrders();
  }, [userInfo]);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      const response = await getAdminOrdersService(token);
      if (response.data.success) {
        setOrders(response.data.data.orders);
      } else {
        notify('error', 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Orders error:', error);
      notify('error', 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatusService(orderId, { status: newStatus }, token);
      if (response.data.success) {
        notify('success', 'Order status updated successfully!');
        fetchOrders();
      } else {
        notify('error', 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update error:', error);
      notify('error', 'Error updating order status');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-indigo-100 text-indigo-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (userInfo?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">Manage customer orders and track their status</p>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(order => order.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(order => order.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
              <input
                type="text"
                placeholder="Search by order #, customer, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <div className="px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-md">
                View only - managed automatically
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Bulk Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onChange={(e) => {
                  if (e.target.value) {
                    // Implement bulk status update
                    notify('info', 'Bulk actions coming soon!');
                  }
                }}
              >
                <option value="">Select Action</option>
                <option value="mark-confirmed">Mark as Confirmed</option>
                <option value="mark-shipped">Mark as Shipped</option>
                <option value="mark-delivered">Mark as Delivered</option>
                <option value="export-csv">Export to CSV</option>
              </select>
              <button
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onClick={() => notify('info', 'Bulk actions coming soon!')}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Orders ({filteredOrders.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleOrderExpansion(order._id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {expandedOrders.has(order._id) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order.orderNumber || order._id.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${order.totalAmount}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.user?.username || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                                                 <div className="text-xs text-gray-400">
                           {order.shippingAddress?.city && order.shippingAddress.city !== 'N/A' && 
                            order.shippingAddress?.state && order.shippingAddress.state !== 'N/A' 
                            ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                            : 'Location not available'
                           }
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {order.items.map(item => item.product?.name || 'Unknown Product').join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                          <div className="text-xs text-gray-500">
                            {order.paymentMethod}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Order Details */}
                    {expandedOrders.has(order._id) && (
                      <tr>
                                                 <td colSpan="6" className="px-6 py-4 bg-gray-50">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Details */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Order Number:</span>
                                  <span className="font-medium">{order.orderNumber || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Created:</span>
                                  <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Updated:</span>
                                  <span className="font-medium">{new Date(order.updatedAt).toLocaleString()}</span>
                                </div>
                                {order.notes && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Notes:</span>
                                    <span className="font-medium">{order.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                                                         {/* Shipping Address */}
                             <div>
                               <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                               {order.shippingAddress && 
                                (order.shippingAddress.firstName !== 'N/A' || 
                                 order.shippingAddress.address !== 'N/A') ? (
                                 <div className="space-y-2 text-sm">
                                   <div className="flex justify-between">
                                     <span className="text-gray-500">Name:</span>
                                     <span className="font-medium">
                                       {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                     </span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-500">Address:</span>
                                     <span className="font-medium">{order.shippingAddress?.address}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-500">City:</span>
                                     <span className="font-medium">{order.shippingAddress?.city}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-500">State:</span>
                                     <span className="font-medium">{order.shippingAddress?.state}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-500">ZIP:</span>
                                     <span className="font-medium">{order.shippingAddress?.zipCode}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-500">Phone:</span>
                                     <span className="font-medium">{order.shippingAddress?.phone}</span>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="space-y-2 text-sm">
                                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                     <div className="text-yellow-800 text-sm">
                                       <p className="font-medium mb-2">⚠️ Shipping Address Not Available</p>
                                       <p className="text-xs">
                                         This order was created before shipping address collection was implemented. 
                                         The customer's shipping information was not captured during checkout.
                                       </p>
                                       <p className="text-xs mt-2">
                                         <strong>Note:</strong> New orders will properly collect and display shipping addresses.
                                       </p>
                                     </div>
                                   </div>
                                 </div>
                               )}
                             </div>
                          </div>
                          
                          {/* Order Items */}
                          <div className="mt-6">
                            <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                            <div className="bg-white rounded-lg border">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                                  <div className="flex items-center space-x-4">
                                    {item.product?.images && item.product.images.length > 0 && (
                                      <img 
                                        src={item.product.images[0]} 
                                        alt={item.product.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</div>
                                      <div className="text-sm text-gray-500">{item.product?.brand || 'N/A'}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                    <div className="font-medium text-gray-900">${item.price}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {orders.length === 0 ? 'No orders' : 'No orders match your filters'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {orders.length === 0 ? 'No orders have been placed yet.' : 'Try adjusting your search criteria or clearing filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
