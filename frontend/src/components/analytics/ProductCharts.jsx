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

const ProductCharts = ({ productData }) => {
  const { topProducts, productViews, productPerformance } = productData || {};
  
  // Sort product views chronologically and add index for proper chart rendering
  const productViewsWithIndex = productViews ? productViews
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
    if (!productViewsWithIndex || !productViewsWithIndex[index]) return '';
    
    const item = productViewsWithIndex[index];
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
      {/* Product Views Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Views Trend</h3>
        {productViewsWithIndex && productViewsWithIndex.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={productViewsWithIndex}>
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
                name="Total Views"
              />
              <Area
                type="monotone"
                dataKey="uniqueUsers"
                stroke={colors.secondary}
                fill={colors.secondary}
                fillOpacity={0.3}
                name="Unique Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No product view data available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Views */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Views</h3>
          {topProducts && topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="productName" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill={colors.primary} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No product view data available</p>
            </div>
          )}
        </div>

        {/* Product Performance Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance Distribution</h3>
          {topProducts && topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ productName, views }) => `${productName}: ${views}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="views"
                >
                  {topProducts.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No product distribution data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Products List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products Performance</h3>
        {topProducts && topProducts.length > 0 ? (
          <div className="space-y-4">
            {topProducts.slice(0, 10).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-amber-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-500">Views: {product.views}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{product.uniqueUsers}</p>
                  <p className="text-sm text-gray-500">Unique Users</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No product performance data available</p>
          </div>
        )}
      </div>

      {/* Product Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance Metrics</h3>
        {productPerformance && productPerformance.length > 0 ? (
          <div className="space-y-4">
            {productPerformance.slice(0, 8).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">Price: {formatCurrency(product.price)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{product.totalOrders}</p>
                  <p className="text-sm text-gray-500">Orders</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.totalRevenue)}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No product performance metrics available</p>
          </div>
        )}
      </div>

      {/* Product Views vs Unique Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Views vs Unique Users</h3>
        {productViewsWithIndex && productViewsWithIndex.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productViewsWithIndex}>
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
                dataKey="count"
                stroke={colors.primary}
                strokeWidth={2}
                name="Total Views"
              />
              <Line
                type="monotone"
                dataKey="uniqueUsers"
                stroke={colors.secondary}
                strokeWidth={2}
                name="Unique Users"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No comparison data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCharts;