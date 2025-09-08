import { useState, useEffect, useCallback } from 'react';
import chatService from '@services/chatService';

export const useChat = (taskId, currentUser) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = chatService.getConnectionStatus();
      setIsConnected(connected);
    };

    checkConnection();

    // Listen for connection changes
    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        setError('Connection lost. Attempting to reconnect...');
      }
    };

    const handleError = (error) => {
      setError(error.message || 'Chat service error');
    };

    chatService.on('connected', handleConnected);
    chatService.on('disconnected', handleDisconnected);
    chatService.on('error', handleError);

    return () => {
      chatService.off('connected', handleConnected);
      chatService.off('disconnected', handleDisconnected);
      chatService.off('error', handleError);
    };
  }, []);

  // Connect to chat service
  const connect = useCallback(async () => {
    if (isConnected) return true;

    setIsConnecting(true);
    setError(null);

    try {
      const token = localStorage.getItem('campusworks_auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const connected = await chatService.connect(token);
      if (connected) {
        setIsConnected(true);
        return true;
      } else {
        throw new Error('Failed to connect to chat service');
      }
    } catch (error) {
      console.error('Failed to connect to chat:', error);
      setError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected]);

  // Disconnect from chat service
  const disconnect = useCallback(() => {
    chatService.disconnect();
    setIsConnected(false);
    setError(null);
  }, []);

  // Join task room
  const joinRoom = useCallback((taskId) => {
    if (!isConnected) {
      console.warn('Not connected to chat service');
      return;
    }
    chatService.joinTaskRoom(taskId);
  }, [isConnected]);

  // Send message
  const sendMessage = useCallback((taskId, message, messageType = 'TEXT') => {
    if (!isConnected) {
      console.warn('Not connected to chat service');
      return;
    }
    chatService.sendMessage(taskId, message, messageType);
  }, [isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((taskId) => {
    if (!isConnected) return;
    chatService.sendTyping(taskId);
  }, [isConnected]);

  // Send stop typing indicator
  const sendStopTyping = useCallback((taskId) => {
    if (!isConnected) return;
    chatService.sendStopTyping(taskId);
  }, [isConnected]);

  // Mark messages as read
  const markMessagesAsRead = useCallback((roomId, messageIds) => {
    if (!isConnected) return;
    chatService.markMessagesAsRead(roomId, messageIds);
  }, [isConnected]);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return chatService.getConnectionStatus();
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    unreadCount,
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    sendTyping,
    sendStopTyping,
    markMessagesAsRead,
    getConnectionStatus
  };
};

export default useChat;
