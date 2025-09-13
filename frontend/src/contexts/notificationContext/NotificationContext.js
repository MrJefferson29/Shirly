import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuthContext } from '../authContext/AuthContext';
import { 
  getNotificationsService, 
  markNotificationAsReadService, 
  markAllNotificationsAsReadService,
  deleteNotificationService,
  getUnreadCountService
} from '../../api/apiServices';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetch: null
};

// Action types
const NOTIFICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        loading: false,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        lastFetch: new Date(),
        error: null
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload._id
            ? { ...notification, ...action.payload }
            : notification
        )
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification._id !== action.payload
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case NOTIFICATION_ACTIONS.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date()
        })),
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { token, userInfo } = useAuthContext();

  // Fetch notifications
  const fetchNotifications = async (options = {}) => {
    if (!token) return;

    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });

      const response = await getNotificationsService(token, options);
      
      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
          payload: {
            notifications: response.data.data.notifications,
            unreadCount: response.data.data.unreadCount
          }
        });
      } else {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_ERROR,
          payload: response.data.message || 'Failed to fetch notifications'
        });
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch notifications'
      });
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      const response = await getUnreadCountService(token);
      
      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT,
          payload: response.data.data.unreadCount
        });
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const response = await markNotificationAsReadService(notificationId, token);
      
      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.MARK_AS_READ,
          payload: notificationId
        });
      } else {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_ERROR,
          payload: response.data.message || 'Failed to mark notification as read'
        });
      }
    } catch (error) {
      console.error('Mark notification as read error:', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to mark notification as read'
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      const response = await markAllNotificationsAsReadService(token);
      
      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ,
          payload: null
        });
      } else {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_ERROR,
          payload: response.data.message || 'Failed to mark all notifications as read'
        });
      }
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to mark all notifications as read'
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!token) return;

    try {
      const response = await deleteNotificationService(notificationId, token);
      
      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
          payload: notificationId
        });
      } else {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_ERROR,
          payload: response.data.message || 'Failed to delete notification'
        });
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to delete notification'
      });
    }
  };

  // Add notification (for real-time updates)
  const addNotification = (notification) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: notification
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
  };

  // Auto-fetch notifications when user logs in
  useEffect(() => {
    if (userInfo && token) {
      fetchNotifications();
      // Set up periodic unread count updates
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    } else {
      // Clear notifications when user logs out
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
        payload: { notifications: [], unreadCount: 0 }
      });
    }
  }, [userInfo, token]);

  const value = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
