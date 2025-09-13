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

const SearchCharts = ({ searchData }) => {
  const { topSearches, searchTrends, searchPerformance } = searchData || {};
  
  // Sort search trends chronologically and add index for proper chart rendering
  const searchTrendsWithIndex = searchTrends ? searchTrends
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
    if (!searchTrendsWithIndex || !searchTrendsWithIndex[index]) return '';
    
    const item = searchTrendsWithIndex[index];
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

  return (
    <div className="space-y-6">
      {/* Search Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Activity Trends</h3>
        {searchTrendsWithIndex && searchTrendsWithIndex.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={searchTrendsWithIndex}>
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
                name="Total Searches"
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
            <p>No search trend data available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Search Terms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Search Terms</h3>
          {topSearches && topSearches.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSearches.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="query" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="searches" fill={colors.primary} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No search terms data available</p>
            </div>
          )}
        </div>

        {/* Search Terms Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Terms Distribution</h3>
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

      {/* Top Search Terms List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Search Terms Performance</h3>
        {topSearches && topSearches.length > 0 ? (
          <div className="space-y-4">
            {topSearches.slice(0, 15).map((search, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-amber-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{search.query}</p>
                    <p className="text-sm text-gray-500">Searches: {search.searches}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{search.uniqueUsers}</p>
                  <p className="text-sm text-gray-500">Unique Users</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No search terms data available</p>
          </div>
        )}
      </div>

      {/* Search Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Performance Metrics</h3>
        {searchPerformance && searchPerformance.length > 0 ? (
          <div className="space-y-4">
            {searchPerformance.slice(0, 10).map((search, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{search.query}</p>
                    <p className="text-sm text-gray-500">Searches: {search.searches}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{search.avgResults}</p>
                  <p className="text-sm text-gray-500">Avg Results</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900">{search.uniqueUsers}</p>
                  <p className="text-sm text-gray-500">Unique Users</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No search performance data available</p>
          </div>
        )}
      </div>

      {/* Search Activity vs Unique Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Activity vs Unique Users</h3>
        {searchTrendsWithIndex && searchTrendsWithIndex.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={searchTrendsWithIndex}>
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
                name="Total Searches"
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

export default SearchCharts;