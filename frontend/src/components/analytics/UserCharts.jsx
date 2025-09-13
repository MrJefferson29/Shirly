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

const UserCharts = ({ userData }) => {
  const { registrations, logins, engagement, demographics } = userData || {};
  
  // Sort user data chronologically and add index for proper chart rendering
  const registrationsWithIndex = registrations ? registrations
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
  
  const loginsWithIndex = logins ? logins
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
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    warning: '#EF4444',
    success: '#22C55E'
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

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
  const formatDate = (value, index, dataArray) => {
    if (!dataArray || !dataArray[index]) return '';
    
    const item = dataArray[index];
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
      {/* User Registration Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registration Trend</h3>
        {registrationsWithIndex && registrationsWithIndex.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={registrationsWithIndex}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="index"
                tickFormatter={(value) => formatDate(value, value, registrationsWithIndex)}
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
                name="New Registrations"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No registration data available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Activity</h3>
          {loginsWithIndex && loginsWithIndex.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={loginsWithIndex}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="index"
                  tickFormatter={(value) => formatDate(value, value, loginsWithIndex)}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  name="Total Logins"
                />
                <Line
                  type="monotone"
                  dataKey="uniqueUsers"
                  stroke={colors.accent}
                  strokeWidth={2}
                  name="Unique Users"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No login data available</p>
            </div>
          )}
        </div>

        {/* User Engagement Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
          {engagement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-600">Active Users</p>
                  <p className="text-2xl font-bold text-blue-900">{engagement.totalActiveUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">👥</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-600">Avg Events per User</p>
                  <p className="text-2xl font-bold text-green-900">{(engagement.avgEventsPerUser || 0).toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">📊</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Highly Engaged</p>
                  <p className="text-2xl font-bold text-yellow-900">{engagement.highlyEngagedUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">⭐</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No engagement data available</p>
            </div>
          )}
        </div>
      </div>

      {/* User Demographics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
        {demographics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{demographics.totalUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">👤</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{demographics.activeUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">🟢</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Activity Rate</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${demographics.totalUsers > 0 ? (demographics.activeUsers / demographics.totalUsers) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {demographics.totalUsers > 0 ? 
                    ((demographics.activeUsers / demographics.totalUsers) * 100).toFixed(1) : 0
                  }% of users active in last 30 days
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No demographics data available</p>
          </div>
        )}
      </div>

      {/* Registration vs Login Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration vs Login Activity</h3>
        {registrationsWithIndex && loginsWithIndex && registrationsWithIndex.length > 0 && loginsWithIndex.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationsWithIndex}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="index"
                tickFormatter={(value) => formatDate(value, value, registrationsWithIndex)}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke={colors.primary}
                strokeWidth={2}
                name="New Registrations"
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={colors.secondary}
                strokeWidth={2}
                name="Logins"
                data={loginsWithIndex}
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

export default UserCharts;