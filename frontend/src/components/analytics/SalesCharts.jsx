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

const SalesCharts = ({ salesData, topSellingProducts }) => {
  // Sort sales data chronologically and add index for proper chart rendering
  const salesDataWithIndex = salesData ? salesData
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

  // Format currency for tooltips
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Format date for x-axis
  const formatDate = (value, index) => {
    if (!salesDataWithIndex || !salesDataWithIndex[index]) return '';
    
    const item = salesDataWithIndex[index];
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
              {entry.name}: {entry.dataKey === 'totalRevenue' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Revenue Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesDataWithIndex}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index"
              tickFormatter={formatDate}
            />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalRevenue"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.3}
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesDataWithIndex}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="index"
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalOrders"
                stroke={colors.secondary}
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Order Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesDataWithIndex}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="index"
                tickFormatter={formatDate}
              />
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="averageOrderValue" fill={colors.accent} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
        {topSellingProducts && topSellingProducts.length > 0 ? (
          <div className="space-y-4">
            {topSellingProducts.slice(0, 10).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-amber-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-500">Units sold: {product.totalSold}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.totalRevenue)}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No product sales data available</p>
          </div>
        )}
      </div>

      {/* Revenue vs Orders Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Orders Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesDataWithIndex}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index"
              tickFormatter={formatDate}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalOrders"
              stroke={colors.secondary}
              strokeWidth={2}
              name="Orders"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalRevenue"
              stroke={colors.primary}
              strokeWidth={2}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesCharts;