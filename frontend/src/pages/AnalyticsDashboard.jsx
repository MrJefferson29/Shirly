import React, { useState, useEffect } from 'react';
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineShoppingBag, 
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineRefresh,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineStar
} from 'react-icons/hi';
import { useAuthContext } from '../contexts';
import { 
  getDashboardAnalyticsService,
  getSalesAnalyticsService,
  getUserAnalyticsService,
  getProductAnalyticsService,
  getSearchAnalyticsService,
  trackPageViewService
} from '../api/apiServices';
import SalesCharts from '../components/analytics/SalesCharts';
import UserCharts from '../components/analytics/UserCharts';
import ProductCharts from '../components/analytics/ProductCharts';
import SearchCharts from '../components/analytics/SearchCharts';
import OverviewCharts from '../components/analytics/OverviewCharts';

const AnalyticsDashboard = () => {
  const { token } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [analytics, setAnalytics] = useState(null);

  // Date range options
  const dateRanges = {
    '7d': { days: 7, label: 'Last 7 days' },
    '30d': { days: 30, label: 'Last 30 days' },
    '90d': { days: 90, label: 'Last 90 days' },
    '1y': { days: 365, label: 'Last year' }
  };

  // Get date range
  const getDateRange = (range) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    return { startDate, endDate };
  };

  // Track page view
  const trackPageView = async () => {
    try {
      await trackPageViewService(token, {
        page: '/admin/analytics',
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(dateRanges[dateRange].days);

      const [dashboardData, salesData, userData, productData, searchData] = await Promise.all([
        getDashboardAnalyticsService(token, { startDate, endDate }),
        getSalesAnalyticsService(token, { startDate, endDate }),
        getUserAnalyticsService(token, { startDate, endDate }),
        getProductAnalyticsService(token, { startDate, endDate }),
        getSearchAnalyticsService(token, { startDate, endDate })
      ]);

      setAnalytics({
        dashboard: dashboardData.data.data,
        sales: salesData.data.data,
        users: userData.data.data,
        products: productData.data.data,
        search: searchData.data.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      trackPageView();
      fetchAnalytics();
    }
  }, [token, dateRange]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  // Format percentage
  const formatPercentage = (num) => {
    return `${num >= 0 ? '+' : ''}${num?.toFixed(1) || 0}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="btn-primary"
          >
            <HiOutlineRefresh className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { dashboard } = analytics || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your business performance and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {Object.entries(dateRanges).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
              <button
                onClick={fetchAnalytics}
                className="btn-primary"
              >
                <HiOutlineRefresh className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
              { id: 'sales', label: 'Sales', icon: HiOutlineCurrencyDollar },
              { id: 'users', label: 'Users', icon: HiOutlineUsers },
              { id: 'products', label: 'Products', icon: HiOutlineShoppingBag },
              { id: 'search', label: 'Search', icon: HiOutlineSearch }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineUsers className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboard?.overview?.totalUsers)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineShoppingBag className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboard?.overview?.totalOrders)}</p>
                    {dashboard?.overview?.orderGrowth !== undefined && (
                      <div className="flex items-center mt-1">
                        {dashboard.overview.orderGrowth >= 0 ? (
                          <HiOutlineTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <HiOutlineTrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${dashboard.overview.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(dashboard.overview.orderGrowth)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineCurrencyDollar className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard?.overview?.totalRevenue || 0)}</p>
                    {dashboard?.overview?.revenueGrowth !== undefined && (
                      <div className="flex items-center mt-1">
                        {dashboard.overview.revenueGrowth >= 0 ? (
                          <HiOutlineTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <HiOutlineTrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${dashboard.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(dashboard.overview.revenueGrowth)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HiOutlineEye className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboard?.overview?.totalUsers > 0 
                        ? ((dashboard?.overview?.totalOrders / dashboard.overview.totalUsers) * 100).toFixed(1) + '%'
                        : '0%'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Charts */}
            {dashboard && <OverviewCharts dashboardData={dashboard} />}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <SalesCharts 
              salesData={analytics?.sales?.salesData || []} 
              topSellingProducts={analytics?.sales?.topSellingProducts || []} 
            />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <UserCharts userData={analytics?.users || {}} />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <ProductCharts productData={analytics?.products || {}} />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchCharts searchData={analytics?.search || {}} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;