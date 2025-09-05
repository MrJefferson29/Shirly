import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from '../../contexts';
import { 
  getOrderMessagesService, 
  markMessagesAsReadService,
  sendMessageService
} from '../../api/apiServices';
import { FaTimes, FaPaperPlane, FaUser, FaUserShield } from 'react-icons/fa';

const ChatModal = ({ isOpen, onClose, orderId, orderNumber, customerName, orderData }) => {
  const { userInfo, token } = useAuthContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && orderId) {
      console.log('🔌 Initializing socket connection for order:', orderId);
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      setSocket(newSocket);

      // Join order room
      newSocket.emit('join-order', orderId);
      console.log('📡 Joined order room:', orderId);

      // Listen for new messages
      newSocket.on('new-message', (message) => {
        console.log('📨 Received new message:', message);
        setMessages(prev => [...prev, message]);
      });

      // Listen for message errors
      newSocket.on('message-error', (error) => {
        console.error('❌ Message error:', error);
      });

      // Listen for connection events
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

      return () => {
        console.log('🔌 Disconnecting socket');
        newSocket.disconnect();
      };
    }
  }, [isOpen, orderId]);

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      if (isOpen && orderId && token) {
        setLoading(true);
        try {
          const response = await getOrderMessagesService(orderId, token);
          if (response.data.success) {
            setMessages(response.data.data.messages);
            
            // Determine the other user (receiver)
            if (response.data.data.messages.length > 0) {
              const firstMessage = response.data.data.messages[0];
              if (userInfo.role === 'admin') {
                // If current user is admin, other user is the customer
                setOtherUser(firstMessage.sender._id === userInfo._id ? firstMessage.receiver : firstMessage.sender);
              } else {
                // If current user is customer, other user is admin
                setOtherUser(firstMessage.sender.role === 'admin' ? firstMessage.sender : firstMessage.receiver);
              }
            } else if (orderData) {
              // If no messages yet, set other user based on order data
              if (userInfo.role === 'admin') {
                setOtherUser(orderData.user);
              } else {
                // For customer, we need to find an admin user
                setOtherUser({ _id: 'admin', username: 'Admin', role: 'admin' });
              }
            }
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMessages();
    
    // Set up periodic refresh to check for new messages (fallback for Socket.IO)
    const refreshInterval = setInterval(() => {
      if (isOpen && orderId && token) {
        loadMessages();
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(refreshInterval);
  }, [isOpen, orderId, token, userInfo, orderData]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && msg.receiver._id === userInfo._id
      );
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg._id);
        markMessagesAsReadService(messageIds, token).catch(console.error);
      }
    }
  }, [isOpen, messages, userInfo._id, token]);

  const sendMessage = async () => {
    if (newMessage.trim() && orderId && otherUser) {
      const messageText = newMessage.trim();
      setNewMessage(''); // Clear input immediately
      
      const messageData = {
        orderId,
        receiverId: otherUser._id,
        message: messageText
      };

      console.log('Sending message:', messageData);
      
      // Add message to local state immediately for better UX
      const tempMessage = {
        _id: Date.now(), // Temporary ID
        order: orderId,
        sender: { 
          _id: userInfo._id, 
          username: userInfo.role === 'admin' ? 'Admin' : userInfo.username, 
          role: userInfo.role 
        },
        receiver: otherUser,
        message: messageText,
        senderType: userInfo.role === 'admin' ? 'admin' : 'customer',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      try {
        // Send via REST API (primary method)
        const response = await sendMessageService(messageData, token);
        if (response.data.success) {
          console.log('✅ Message saved to database:', response.data.data.message);
          
          // Replace temporary message with real one
          setMessages(prev => prev.map(msg => 
            msg._id === tempMessage._id ? response.data.data.message : msg
          ));
          
          // Also send via socket for real-time updates
          if (socket) {
            socket.emit('send-message', {
              orderId,
              senderId: userInfo._id,
              receiverId: otherUser._id,
              message: messageText,
              senderType: userInfo.role === 'admin' ? 'admin' : 'customer'
            });
          }
        }
      } catch (error) {
        console.error('❌ Error sending message:', error);
        // Remove the temporary message if sending failed
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        setNewMessage(messageText); // Restore the message text
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
                      <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {userInfo.role === 'admin' ? (
                  <FaUserShield className="text-blue-500" />
                ) : (
                  <FaUser className="text-green-500" />
                )}
                <span className="font-semibold text-gray-800">
                  {userInfo.role === 'admin' ? 'Admin' : 'Customer'} Chat
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Order: {orderNumber}
              </span>
              {userInfo.role === 'admin' && customerName && (
                <span className="text-sm text-gray-500">
                  with {customerName}
                </span>
              )}
            </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender._id === userInfo._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender._id === userInfo._id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {message.senderType === 'admin' ? 'Admin' : message.sender.username}
                    {message.senderType === 'admin' && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-sm">{message.message}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FaPaperPlane />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
