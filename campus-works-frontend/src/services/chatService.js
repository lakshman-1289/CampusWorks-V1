import io from 'socket.io-client';
import { apiService } from './api';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
  }

  /**
   * Connect to chat service
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} Connection success
   */
  async connect(token) {
    try {
      if (this.socket && this.isConnected) {
        console.log('Already connected to chat service');
        return true;
      }

      // Disconnect existing connection
      if (this.socket) {
        this.disconnect();
      }

      const chatServiceUrl = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3001';
      
      console.log('Connecting to chat service:', {
        url: chatServiceUrl,
        hasToken: !!token,
        tokenLength: token?.length
      });
      
      this.socket = io(chatServiceUrl, {
        auth: { token },
        transports: ['websocket', 'polling'], // Add polling as fallback
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('Connected to chat service');
          // Note: Toast notifications should be dispatched through Redux
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('Chat connection error:', error);
          // Note: Toast notifications should be dispatched through Redux
          reject(error);
        });
      });
    } catch (error) {
      console.error('Failed to connect to chat service:', error);
      // Note: Toast notifications should be dispatched through Redux
      return false;
    }
  }

  /**
   * Setup socket event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Chat service connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Chat service disconnected:', reason);
      this.emit('disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      this.reconnectAttempts++;
      console.error('Chat connection error:', error);
      this.emit('error', error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        // Note: Toast notifications should be dispatched through Redux
        console.warn('Chat service unavailable after max reconnection attempts');
      }
    });

    // Chat events
    this.socket.on('room-joined', (data) => {
      console.log('Joined chat room:', data);
      this.emit('room-joined', data);
    });

    this.socket.on('new-message', (message) => {
      console.log('New message received:', message);
      this.emit('new-message', message);
    });

    this.socket.on('user-typing', (data) => {
      this.emit('user-typing', data);
    });

    this.socket.on('messages-read', (data) => {
      this.emit('messages-read', data);
    });

    this.socket.on('error', (error) => {
      console.error('Chat service error:', error);
      // Note: Toast notifications should be dispatched through Redux
      this.emit('error', error);
    });
  }

  /**
   * Join a task chat room
   * @param {number} taskId - Task ID
   */
  joinTaskRoom(taskId) {
    if (!this.socket || !this.isConnected) {
      console.error('Not connected to chat service');
      return;
    }

    this.socket.emit('join-task-room', { taskId });
  }

  /**
   * Send a message
   * @param {number} taskId - Task ID
   * @param {string} message - Message content
   * @param {string} messageType - Message type (TEXT, FILE, IMAGE)
   */
  sendMessage(taskId, message, messageType = 'TEXT') {
    if (!this.socket || !this.isConnected) {
      console.error('Not connected to chat service');
      return;
    }

    if (!message || !message.trim()) {
      // Note: Toast notifications should be dispatched through Redux
      console.warn('Message cannot be empty');
      return;
    }

    this.socket.emit('send-message', {
      taskId,
      message: message.trim(),
      messageType
    });
  }

  /**
   * Send typing indicator
   * @param {number} taskId - Task ID
   */
  sendTyping(taskId) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('typing', { taskId });
  }

  /**
   * Send stop typing indicator
   * @param {number} taskId - Task ID
   */
  sendStopTyping(taskId) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('stop-typing', { taskId });
  }

  /**
   * Mark messages as read
   * @param {string} roomId - Room ID
   * @param {Array} messageIds - Array of message IDs
   */
  markMessagesAsRead(roomId, messageIds) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('mark-messages-read', {
      roomId,
      messageIds
    });
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.eventListeners.has(event)) return;
    
    this.eventListeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Get connection status
   * @returns {boolean} Is connected
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Disconnect from chat service
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
    console.log('Disconnected from chat service');
  }

  /**
   * Reconnect to chat service
   * @param {string} token - JWT token
   */
  async reconnect(token) {
    console.log('Attempting to reconnect to chat service...');
    this.disconnect();
    return await this.connect(token);
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
