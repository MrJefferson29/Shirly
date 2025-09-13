import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const OverviewCharts = ({ dashboardData }) => {
  const { analytics, topProducts, topSearches, conversionFunnel } = dashboardData;
  
  // Sort analytics data chronologically and add index for proper chart rendering
  const analyticsWithIndex = analytics ? analytics
    .sort((a, b) => {
      // Sort by date (older dates first)
      if (a._id && b._id) {
        const dateA = new Date(a._id.year, a._id.month - 1, a._id.day);
        const dateB = new Date(b._id.year, b._id.month - 1, b._id.day);
        return dateA - dateB;
      }
      return 0;
    })
    .map((item, index) => ({
      ...item,
      index
    })) : [];

  // Colors for charts
  const colors = {
    primary: '#F59E0B',
    secondary: '#10B981',
    accent: '#3B82F6',
    warning: '#EF4444',
    success: '#22C55E'
  };

  const pieColors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format date for x-axis
  const formatDate = (value, index) => {
    if (!analyticsWithIndex || !analyticsWithIndex[index]) return '';
    
    const item = analyticsWithIndex[index];
    if (item._id) {
      // Handle aggregated data structure
      const { year, month, day } = item._id;
      const date = new Date(year, month - 1, day);
      // Show full date to ensure current dates are visible
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    }
    return '';
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Activity Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsWithIndex}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index"
              tickFormatter={formatDate}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="count"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.3}
              name="Total Events"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products Performance</h3>
          {topProducts && topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="productName" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill={colors.primary} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No product data available</p>
            </div>
          )}
        </div>

        {/* Top Search Terms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Search Terms</h3>
          {topSearches && topSearches.length > 0 ? (
            <div className="space-y-3">
              {topSearches.slice(0, 8).map((search, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                    {search.query}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {search.searches}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No search data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        {conversionFunnel && conversionFunnel.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionFunnel} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="type" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill={colors.secondary} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No conversion data available</p>
          </div>
        )}
      </div>

      {/* Search Activity Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Activity Distribution</h3>
        {topSearches && topSearches.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topSearches.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ query, searches }) => `${query}: ${searches}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="searches"
              >
                {topSearches.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No search distribution data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewCharts;