import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineBell, HiOutlineX, HiOutlineCheck, HiOutlineTrash } from 'react-icons/hi';
import { useNotificationContext } from '../../contexts/notificationContext/NotificationContext';
// import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError
  } = useNotificationContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications({ limit: showAll ? 50 : 10 });
    }
  }, [isOpen, showAll]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_confirmation':
      case 'order_status_update':
      case 'order_shipped':
      case 'order_delivered':
        return '📦';
      case 'payment_success':
        return '💳';
      case 'payment_failed':
        return '❌';
      case 'welcome':
        return '👋';
      case 'promotion':
        return '🎉';
      case 'low_stock':
        return '⚠️';
      case 'product_review':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'text-gray-500';
    
    switch (type) {
      case 'payment_failed':
      case 'low_stock':
        return 'text-red-600';
      case 'payment_success':
      case 'order_delivered':
        return 'text-green-600';
      case 'order_shipped':
        return 'text-blue-600';
      case 'promotion':
        return 'text-purple-600';
      default:
        return 'text-gray-900';
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200"
        aria-label="Notifications"
      >
        <HiOutlineBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden
                       fixed sm:absolute top-16 sm:top-auto left-4 sm:left-auto right-4 sm:right-0 w-auto sm:w-80">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-64 sm:max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-amber-600 hover:text-amber-700"
                >
                  Try again
                </button>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <HiOutlineBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.isRead ? 'bg-amber-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-xs sm:text-sm font-medium ${getNotificationColor(notification.type, notification.isRead)}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="text-gray-400 hover:text-green-600 transition-colors duration-200"
                                title="Mark as read"
                              >
                                <HiOutlineCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                              title="Delete"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                {showAll ? 'Show less' : `Show all (${notifications.length})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
