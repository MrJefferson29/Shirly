import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import { notify } from '../utils/utils';
import { getAdminOrdersService, updateOrderStatusService } from '../api/apiServices';
import ChatModal from '../components/chat/ChatModal';
import { 
  HiOutlineChat, 
  HiOutlineClipboardList, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineCurrencyDollar,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineRefresh,
  HiOutlineX
} from 'react-icons/hi';

const AdminOrders = () => {
  const { token, userInfo } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [amountRangeFilter, setAmountRangeFilter] = useState({ min: '', max: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [chatModal, setChatModal] = useState({ isOpen: false, orderId: null, orderNumber: '', customerName: '', orderData: null });

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

    // Filter by payment status
    if (paymentStatusFilter) {
      filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter);
    }

    // Filter by date range
    if (dateRangeFilter.start) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= new Date(dateRangeFilter.start)
      );
    }
    if (dateRangeFilter.end) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) <= new Date(dateRangeFilter.end)
      );
    }

    // Filter by amount range
    if (amountRangeFilter.min) {
      filtered = filtered.filter(order => order.totalAmount >= parseFloat(amountRangeFilter.min));
    }
    if (amountRangeFilter.max) {
      filtered = filtered.filter(order => order.totalAmount <= parseFloat(amountRangeFilter.max));
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

    // Sort orders
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, statusFilter, paymentStatusFilter, dateRangeFilter, amountRangeFilter, searchTerm, sortConfig]);

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

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleOrderSelection = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    if (selectedOrders.size === paginatedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginatedOrders.map(order => order._id)));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.size === 0) {
      notify('error', 'Please select orders first');
      return;
    }

    try {
      const selectedOrderIds = Array.from(selectedOrders);
      
      switch (action) {
        case 'mark-confirmed':
          await Promise.all(selectedOrderIds.map(id => updateOrderStatus(id, 'confirmed')));
          notify('success', `${selectedOrderIds.length} orders marked as confirmed`);
          break;
        case 'mark-shipped':
          await Promise.all(selectedOrderIds.map(id => updateOrderStatus(id, 'shipped')));
          notify('success', `${selectedOrderIds.length} orders marked as shipped`);
          break;
        case 'mark-delivered':
          await Promise.all(selectedOrderIds.map(id => updateOrderStatus(id, 'delivered')));
          notify('success', `${selectedOrderIds.length} orders marked as delivered`);
          break;
        case 'export-csv':
          exportToCSV(selectedOrderIds);
          break;
        default:
          notify('error', 'Invalid action');
      }
      
      setSelectedOrders(new Set());
    } catch (error) {
      notify('error', 'Failed to perform bulk action');
    }
  };

  const exportToCSV = (orderIds = null) => {
    const ordersToExport = orderIds ? 
      filteredOrders.filter(order => orderIds.includes(order._id)) : 
      filteredOrders;

    const csvContent = [
      ['Order Number', 'Customer', 'Email', 'Status', 'Payment Status', 'Total Amount', 'Date', 'Items'],
      ...ordersToExport.map(order => [
        order.orderNumber || order._id.slice(-8),
        order.user?.username || 'N/A',
        order.user?.email || 'N/A',
        order.status,
        order.paymentStatus,
        order.totalAmount,
        new Date(order.createdAt).toLocaleDateString(),
        order.items.map(item => `${item.product?.name} (x${item.quantity})`).join('; ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    notify('success', `Exported ${ordersToExport.length} orders to CSV`);
  };

  const clearAllFilters = () => {
    setStatusFilter('');
    setPaymentStatusFilter('');
    setDateRangeFilter({ start: '', end: '' });
    setAmountRangeFilter({ min: '', max: '' });
    setSearchTerm('');
    setSelectedOrders(new Set());
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-orange-100 text-orange-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-orange-200 text-orange-900';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (userInfo?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[--theme-color] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-[--secondary-text-color]">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[--theme-color] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--theme-color] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[--primary-text-color] flex items-center gap-3">
                <HiOutlineClipboardList className="text-amber-600" />
                Order Management
              </h1>
              <p className="mt-2 text-[--secondary-text-color]">Manage customer orders and track their status</p>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <HiOutlineRefresh />
              Refresh
            </button>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <HiOutlineClipboardList className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[--secondary-text-color]">Total Orders</p>
                <p className="text-2xl font-semibold text-[--primary-text-color]">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <HiOutlineClock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[--secondary-text-color]">Pending</p>
                <p className="text-2xl font-semibold text-[--primary-text-color]">
                  {orders.filter(order => order.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[--secondary-text-color]">Completed</p>
                <p className="text-2xl font-semibold text-[--primary-text-color]">
                  {orders.filter(order => order.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-amber-200 rounded-lg">
                <HiOutlineCurrencyDollar className="w-6 h-6 text-amber-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[--secondary-text-color]">Total Revenue</p>
                <p className="text-2xl font-semibold text-[--primary-text-color]">
                  ${orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="card mb-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[--primary-text-color] flex items-center gap-2">
              <HiOutlineFilter className="text-amber-600" />
              Filters & Search
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
              >
                {showAdvancedFilters ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
              </button>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[--primary-text-color] text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <HiOutlineX />
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[--primary-text-color] mb-2 flex items-center gap-2">
                <HiOutlineSearch className="text-amber-600" />
                Search Orders
              </label>
              <div className="relative">
              <input
                type="text"
                placeholder="Search by order #, customer, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-black/[0.1] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/[0.7] text-[--primary-text-color] placeholder-[--secondary-text-color]"
              />
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[--secondary-text-color] w-4 h-4" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[--primary-text-color] mb-2">Order Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-black/[0.1] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/[0.7] text-[--primary-text-color]"
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
              <label className="block text-sm font-medium text-[--primary-text-color] mb-2">Payment Status</label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-black/[0.1] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/[0.7] text-[--primary-text-color]"
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-black/[0.1]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[--primary-text-color] mb-2">Date From</label>
                  <input
                    type="date"
                    value={dateRangeFilter.start}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-black/[0.1] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/[0.7] text-[--primary-text-color]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--primary-text-color] mb-2">Date To</label>
                  <input
                    type="date"
                    value={dateRangeFilter.end}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-black/[0.1] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/[0.7] text-[--primary-text-color]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--primary-text-color] mb-2">Min Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amountRangeFilter.min}
                    onChange={(e) => setAmountRangeFilter(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 py-2 border border-black/[0.1] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/[0.7] text-[--primary-text-color]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--primary-text-color] mb-2">Max Amount</label>
                  <input
                    type="number"
                    placeholder="999.99"
                    value={amountRangeFilter.max}
                    onChange={(e) => setAmountRangeFilter(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 py-2 border border-black/[0.1] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/[0.7] text-[--primary-text-color]"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Bulk Actions */}
          <div className="mt-6 pt-4 border-t border-black/[0.1]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[--primary-text-color] flex items-center gap-2">
                  <HiOutlineClipboardList className="text-amber-600" />
                  Bulk Actions:
                </span>
              <select
                  className="px-3 py-2 border border-black/[0.1] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/[0.7] text-[--primary-text-color]"
                onChange={(e) => {
                  if (e.target.value) {
                        handleBulkAction(e.target.value);
                        e.target.value = ''; // Reset selection
                  }
                }}
              >
                <option value="">Select Action</option>
                <option value="mark-confirmed">Mark as Confirmed</option>
                <option value="mark-shipped">Mark as Shipped</option>
                <option value="mark-delivered">Mark as Delivered</option>
                  <option value="export-csv">Export Selected to CSV</option>
              </select>
              </div>
              <div className="flex items-center gap-4">
              <button
                  onClick={() => exportToCSV()}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                  <HiOutlineDownload />
                  Export All to CSV
              </button>
                {selectedOrders.size > 0 && (
                  <span className="text-sm text-[--secondary-text-color] bg-amber-100 px-3 py-1 rounded-full">
                    {selectedOrders.size} selected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="card overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-black/[0.1] bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-[--primary-text-color] flex items-center gap-2">
                <HiOutlineClipboardList className="text-amber-600" />
                Orders ({filteredOrders.length})
                {filteredOrders.length !== orders.length && (
                  <span className="text-sm text-[--secondary-text-color] ml-2 bg-amber-100 px-2 py-1 rounded-full">
                    (filtered from {orders.length} total)
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[--secondary-text-color]">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    // This would need to be handled by parent component
                    // For now, we'll keep it as display only
                  }}
                  className="px-2 py-1 text-sm border border-black/[0.1] rounded bg-white/[0.7] text-[--primary-text-color] focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/[0.1]">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[--secondary-text-color] uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={selectAllOrders}
                      className="rounded border-black/[0.1] text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-[--secondary-text-color] uppercase tracking-wider cursor-pointer hover:text-[--primary-text-color] transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Order Info
                      {sortConfig.key === 'createdAt' && (
                        <span className="text-amber-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-[--secondary-text-color] uppercase tracking-wider cursor-pointer hover:text-[--primary-text-color] transition-colors"
                    onClick={() => handleSort('user.username')}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      {sortConfig.key === 'user.username' && (
                        <span className="text-amber-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[--secondary-text-color] uppercase tracking-wider">Items</th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-[--secondary-text-color] uppercase tracking-wider cursor-pointer hover:text-[--primary-text-color] transition-colors"
                    onClick={() => handleSort('paymentStatus')}
                  >
                    <div className="flex items-center gap-1">
                      Payment
                      {sortConfig.key === 'paymentStatus' && (
                        <span className="text-amber-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-[--secondary-text-color] uppercase tracking-wider cursor-pointer hover:text-[--primary-text-color] transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Order Status
                      {sortConfig.key === 'status' && (
                        <span className="text-amber-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[--secondary-text-color] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/[0.7] divide-y divide-black/[0.1]">
                {paginatedOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-amber-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order._id)}
                          onChange={() => toggleOrderSelection(order._id)}
                          className="rounded border-black/[0.1] text-amber-600 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleOrderExpansion(order._id)}
                            className="text-[--secondary-text-color] hover:text-amber-600 transition-colors duration-200 p-1 rounded hover:bg-amber-100"
                          >
                            {expandedOrders.has(order._id) ? (
                              <HiOutlineEyeOff className="w-4 h-4" />
                            ) : (
                              <HiOutlineEye className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <div className="text-sm font-medium text-[--primary-text-color]">
                              #{order.orderNumber || order._id.slice(-8)}
                            </div>
                            <div className="text-sm text-[--secondary-text-color]">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                              <HiOutlineCurrencyDollar className="w-3 h-3" />
                              ${order.totalAmount}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[--primary-text-color]">{order.user?.username || 'N/A'}</div>
                        <div className="text-sm text-[--secondary-text-color]">{order.user?.email || 'N/A'}</div>
                        <div className="text-xs text-[--secondary-text-color]">
                           {order.shippingAddress && 
                            order.shippingAddress.city && 
                            order.shippingAddress.city !== 'N/A' && 
                            order.shippingAddress.state && 
                            order.shippingAddress.state !== 'N/A' 
                            ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                            : 'Location not available'
                           }
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[--primary-text-color]">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-[--secondary-text-color] max-w-xs truncate">
                          {order.items.map(item => item.product?.name || 'Unknown Product').join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                          <div className="text-xs text-[--secondary-text-color]">
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
                            className="text-xs border border-black/[0.1] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full bg-white/[0.7] text-[--primary-text-color] hover:bg-amber-50 transition-colors"
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
                        <td colSpan="7" className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Details */}
                            <div>
                              <h4 className="font-medium text-[--primary-text-color] mb-3">Order Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-[--secondary-text-color]">Order Number:</span>
                                  <span className="font-medium text-[--primary-text-color]">{order.orderNumber || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[--secondary-text-color]">Created:</span>
                                  <span className="font-medium text-[--primary-text-color]">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[--secondary-text-color]">Updated:</span>
                                  <span className="font-medium text-[--primary-text-color]">{new Date(order.updatedAt).toLocaleString()}</span>
                                </div>
                                {order.notes && (
                                  <div className="flex justify-between">
                                    <span className="text-[--secondary-text-color]">Notes:</span>
                                    <span className="font-medium text-[--primary-text-color]">{order.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                                                         {/* Shipping Address */}
                             <div>
                              <h4 className="font-medium text-[--primary-text-color] mb-3">Shipping Address</h4>
                               {order.shippingAddress && 
                                order.shippingAddress.firstName && 
                                order.shippingAddress.firstName !== 'N/A' && 
                                order.shippingAddress.address && 
                                order.shippingAddress.address !== 'N/A' ? (
                                 <div className="space-y-2 text-sm">
                                   <div className="flex justify-between">
                                    <span className="text-[--secondary-text-color]">Name:</span>
                                    <span className="font-medium text-[--primary-text-color]">
                                       {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                     </span>
                                   </div>
                                   <div className="flex justify-between">
                                    <span className="text-[--secondary-text-color]">Address:</span>
                                    <span className="font-medium text-[--primary-text-color]">{order.shippingAddress?.address}</span>
                                   </div>
                                   <div className="flex justify-between">
                                    <span className="text-[--secondary-text-color]">City:</span>
                                    <span className="font-medium text-[--primary-text-color]">{order.shippingAddress?.city}</span>
                                   </div>
                                   <div className="flex justify-between">
                                    <span className="text-[--secondary-text-color]">State:</span>
                                    <span className="font-medium text-[--primary-text-color]">{order.shippingAddress?.state}</span>
                                   </div>
                                   <div className="flex justify-between">
                                    <span className="text-[--secondary-text-color]">ZIP:</span>
                                    <span className="font-medium text-[--primary-text-color]">{order.shippingAddress?.zipCode}</span>
                                   </div>
                                   <div className="flex justify-between">
                                    <span className="text-[--secondary-text-color]">Phone:</span>
                                    <span className="font-medium text-[--primary-text-color]">{order.shippingAddress?.phone}</span>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="space-y-2 text-sm">
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <div className="text-amber-800 text-sm">
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
                            <h4 className="font-medium text-[--primary-text-color] mb-3">Order Items</h4>
                            <div className="bg-white/[0.7] rounded-lg border border-black/[0.1]">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border-b border-black/[0.1] last:border-b-0">
                                  <div className="flex items-center space-x-4">
                                    {item.product?.images && item.product.images.length > 0 && (
                                      <img 
                                        src={item.product.images[0]} 
                                        alt={item.product.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium text-[--primary-text-color]">{item.product?.name || 'Unknown Product'}</div>
                                      <div className="text-sm text-[--secondary-text-color]">{item.product?.brand || 'N/A'}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-[--secondary-text-color]">Qty: {item.quantity}</div>
                                    <div className="font-medium text-amber-600">${item.price}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Message Button */}
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={() => setChatModal({
                                isOpen: true,
                                orderId: order._id,
                                orderNumber: order.orderNumber,
                                customerName: order.user?.username || 'Customer',
                                orderData: order
                              })}
                              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
                            >
                              <HiOutlineChat />
                              Message Customer
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-black/[0.1] bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[--secondary-text-color] flex items-center gap-2">
                  <HiOutlineClipboardList className="w-4 h-4" />
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-white/[0.7] text-[--primary-text-color] rounded-md border border-black/[0.1] hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            currentPage === pageNum
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/[0.7] text-[--primary-text-color] border border-black/[0.1] hover:bg-amber-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-[--secondary-text-color]">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            currentPage === totalPages
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/[0.7] text-[--primary-text-color] border border-black/[0.1] hover:bg-amber-100'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-white/[0.7] text-[--primary-text-color] rounded-md border border-black/[0.1] hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-[--secondary-text-color] mb-4">
              <HiOutlineClipboardList className="w-full h-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-[--primary-text-color]">
              {orders.length === 0 ? 'No orders' : 'No orders match your filters'}
            </h3>
            <p className="mt-1 text-sm text-[--secondary-text-color]">
              {orders.length === 0 ? 'No orders have been placed yet.' : 'Try adjusting your search criteria or clearing filters.'}
            </p>
            {orders.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal({ isOpen: false, orderId: null, orderNumber: '', customerName: '', orderData: null })}
        orderId={chatModal.orderId}
        orderNumber={chatModal.orderNumber}
        customerName={chatModal.customerName}
        orderData={chatModal.orderData}
      />
    </div>
  );
};

export default AdminOrders;
