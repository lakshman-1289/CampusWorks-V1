const { Server } = require('socket.io');
const { authenticateSocket } = require('../middleware/auth');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const UserSession = require('../models/UserSession');
const taskService = require('../services/taskService');
const biddingService = require('../services/biddingService');
const logger = require('../utils/logger');

class SocketHandler {
  constructor(server, config) {
    this.io = new Server(server, {
      cors: {
        origin: config.socketCorsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
      },
      maxHttpBufferSize: 1e6, // 1MB
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.connectedUsers = new Map(); // userId -> socketId
    this.userRooms = new Map(); // userId -> Set of roomIds
    this.typingUsers = new Map(); // roomId -> Set of userIds

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(authenticateSocket);

    // Connection middleware
    this.io.use(async (socket, next) => {
      try {
        // Store user session
        await this.createUserSession(socket);
        next();
      } catch (error) {
        logger.errorWithContext('Socket middleware error', error);
        next(error);
      }
    });
  }

  async createUserSession(socket) {
    const session = new UserSession({
      userId: socket.user.userId,
      email: socket.user.email,
      socketId: socket.id,
      isOnline: true,
      userAgent: socket.handshake.headers['user-agent'],
      ipAddress: socket.handshake.address
    });

    await session.save();
    
    // Store in memory
    this.connectedUsers.set(socket.user.userId, socket.id);
    
    logger.info('User connected', {
      userId: socket.user.userId,
      socketId: socket.id
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.user.userId;
    const userEmail = socket.user.email;

    // Handle join task room
    socket.on('join-task-room', async (data) => {
      try {
        await this.handleJoinTaskRoom(socket, data);
      } catch (error) {
        logger.errorWithContext('Join task room error', error, {
          userId,
          data
        });
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle send message
    socket.on('send-message', async (data) => {
      try {
        await this.handleSendMessage(socket, data);
      } catch (error) {
        logger.errorWithContext('Send message error', error, {
          userId,
          data
        });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', async (data) => {
      try {
        await this.handleTyping(socket, data);
      } catch (error) {
        logger.errorWithContext('Typing error', error, {
          userId,
          data
        });
      }
    });

    // Handle stop typing
    socket.on('stop-typing', async (data) => {
      try {
        await this.handleStopTyping(socket, data);
      } catch (error) {
        logger.errorWithContext('Stop typing error', error, {
          userId,
          data
        });
      }
    });

    // Handle mark messages as read
    socket.on('mark-messages-read', async (data) => {
      try {
        await this.handleMarkMessagesRead(socket, data);
      } catch (error) {
        logger.errorWithContext('Mark messages read error', error, {
          userId,
          data
        });
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        await this.handleDisconnect(socket);
      } catch (error) {
        logger.errorWithContext('Disconnect error', error, {
          userId
        });
      }
    });
  }

  async handleJoinTaskRoom(socket, data) {
    const { taskId } = data;
    const userId = socket.user.userId;

    logger.info('Attempting to join task room', { taskId, userId });

    try {
      // Get or create room - simplified approach
      let room = await ChatRoom.findByTaskId(taskId);
      
      if (!room) {
        logger.info('Creating new room for task', { taskId, userId });
        
        try {
          // ✅ CRITICAL FIX: Get actual task data to determine correct owner/bidder
          const task = await taskService.getTaskById(taskId);
          
          if (!task) {
            throw new Error('Task not found');
          }
          
          // ✅ FIXED: Use actual task owner and assigned user IDs
          room = await ChatRoom.create({
            taskId: parseInt(taskId),
            taskTitle: task.title || `Task ${taskId}`,
            ownerId: task.ownerId, // ✅ Use actual task owner
            ownerEmail: task.ownerEmail,
            bidderId: task.assignedUserId, // ✅ Use actual assigned user
            bidderEmail: task.assignedUserEmail,
            status: 'ACTIVE'
          });
          
          logger.info('Room created with correct owner/bidder IDs', {
            taskId,
            roomId: room._id,
            ownerId: room.ownerId,
            bidderId: room.bidderId
          });
        } catch (error) {
          if (error.code === 11000) {
            // Room already exists, fetch it
            room = await ChatRoom.findByTaskId(taskId);
            logger.info('Room already exists, using existing room', { taskId, roomId: room._id });
          } else {
            logger.error('Failed to create room', { error: error.message });
            throw error;
          }
        }
      } else {
        logger.info('Using existing room', { taskId, roomId: room._id });
      }

      // Join socket room
      socket.join(`task-${taskId}`);
      
      // Store user room mapping
      if (!this.userRooms.has(userId)) {
        this.userRooms.set(userId, new Set());
      }
      this.userRooms.get(userId).add(room._id.toString());

      // Get recent messages
      const messages = await Message.findByRoom(room._id, 50, 0);

      // Get other user info
      const otherUser = room.getOtherUser(userId);

      // Emit room joined event
      socket.emit('room-joined', {
        room: {
          id: room._id,
          taskId: room.taskId,
          taskTitle: room.taskTitle,
          status: room.status,
          lastMessageAt: room.lastMessageAt,
          unreadCount: room.unreadCount,
          ownerId: room.ownerId,
          bidderId: room.bidderId,
          ownerEmail: room.ownerEmail,
          bidderEmail: room.bidderEmail,
          otherUser
        },
        messages: messages.reverse().map(msg => {
          // ✅ CRITICAL: Ensure sender role is always correctly set
          const isSenderTaskOwner = msg.senderId === room.ownerId;
          const isSenderBidder = msg.senderId === room.bidderId;
          
          let senderRole = msg.senderRole || 'bidder'; // Default to bidder
          if (isSenderTaskOwner) {
            senderRole = 'owner';
          } else if (isSenderBidder) {
            senderRole = 'bidder';
          }
          
          return {
            ...msg.toObject(),
            senderRole: senderRole // ✅ Force correct role
          };
        })
      });

      logger.info('User successfully joined task room', {
        userId,
        taskId,
        roomId: room._id
      });

    } catch (error) {
      logger.error('Join task room error', { 
        data: { taskId }, 
        error: error.message,
        stack: error.stack 
      });
      socket.emit('error', { message: 'Failed to join task room' });
    }
  }

  async handleSendMessage(socket, data) {
    const { taskId, message, messageType = 'TEXT' } = data;
    const userId = socket.user.userId;
    const userEmail = socket.user.email;

    // Validate input
    if (!message || !message.trim()) {
      socket.emit('error', { message: 'Message cannot be empty' });
      return;
    }

    if (message.length > 2000) {
      socket.emit('error', { message: 'Message too long' });
      return;
    }

    // Get room
    const room = await ChatRoom.findByTaskId(taskId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Check if user can send message
    if (!room.canUserAccess(userId)) {
      socket.emit('error', { message: 'Access denied' });
      return;
    }

    // ✅ CRITICAL FIX: Determine sender role based on room data
    const isSenderTaskOwner = room.ownerId === userId;
    const isSenderBidder = room.bidderId === userId;
    
    // Ensure we have a valid role
    let senderRole = 'bidder'; // Default to bidder
    if (isSenderTaskOwner) {
      senderRole = 'owner';
    } else if (isSenderBidder) {
      senderRole = 'bidder';
    }
    
    console.log('🔍 BACKEND: Message sender role determination:', {
      userId,
      roomOwnerId: room.ownerId,
      roomBidderId: room.bidderId,
      isSenderTaskOwner,
      isSenderBidder,
      determinedRole: senderRole,
      messageText: message.substring(0, 30) + '...'
    });
    
    const newMessage = new Message({
      roomId: room._id,
      taskId: parseInt(taskId),
      senderId: userId,
      senderEmail: userEmail,
      senderName: userEmail.split('@')[0], // Simple name extraction
      senderRole: senderRole, // ✅ CRITICAL: Always set correct role
      message: message.trim(),
      messageType,
      isRead: false
    });

    await newMessage.save();

    // Update room
    const isOwner = room.ownerId === userId;
    const updateField = isOwner ? 'unreadCount.bidder' : 'unreadCount.owner';
    
    await ChatRoom.findByIdAndUpdate(room._id, {
      lastMessageAt: new Date(),
      lastMessageBy: userId,
      $inc: { [updateField]: 1 }
    });

    // ✅ FIXED: Broadcast to room with sender role
    const messageToBroadcast = {
      id: newMessage._id,
      roomId: newMessage.roomId,
      taskId: newMessage.taskId,
      senderId: newMessage.senderId,
      senderEmail: newMessage.senderEmail,
      senderName: newMessage.senderName,
      senderRole: newMessage.senderRole, // ✅ CRITICAL: Include sender role
      message: newMessage.message,
      messageType: newMessage.messageType,
      isRead: newMessage.isRead,
      createdAt: newMessage.createdAt
    };
    
    console.log('📡 BACKEND: Broadcasting message with role:', {
      messageId: newMessage._id,
      senderRole: newMessage.senderRole,
      messageText: newMessage.message.substring(0, 30) + '...',
      fullMessage: messageToBroadcast
    });
    
    this.io.to(`task-${taskId}`).emit('new-message', messageToBroadcast);

    logger.info('Message sent', {
      userId,
      taskId,
      messageId: newMessage._id,
      messageLength: message.length
    });
  }

  async handleTyping(socket, data) {
    const { taskId } = data;
    const userId = socket.user.userId;

    // Add to typing users
    if (!this.typingUsers.has(taskId)) {
      this.typingUsers.set(taskId, new Set());
    }
    this.typingUsers.get(taskId).add(userId);

    // Broadcast to other users in room
    socket.to(`task-${taskId}`).emit('user-typing', {
      userId,
      isTyping: true
    });

    // Set timeout to stop typing indicator
    setTimeout(() => {
      this.handleStopTyping(socket, { taskId });
    }, 3000);
  }

  async handleStopTyping(socket, data) {
    const { taskId } = data;
    const userId = socket.user.userId;

    // Remove from typing users
    if (this.typingUsers.has(taskId)) {
      this.typingUsers.get(taskId).delete(userId);
    }

    // Broadcast to other users in room
    socket.to(`task-${taskId}`).emit('user-typing', {
      userId,
      isTyping: false
    });
  }

  async handleMarkMessagesRead(socket, data) {
    const { roomId, messageIds } = data;
    const userId = socket.user.userId;

    // Verify room access
    const room = await ChatRoom.findById(roomId);
    if (!room || !room.canUserAccess(userId)) {
      socket.emit('error', { message: 'Access denied' });
      return;
    }

    // Mark messages as read
    await Message.markAsRead(messageIds, userId);

    // Update unread count
    const unreadCount = await Message.countDocuments({
      roomId,
      senderId: { $ne: userId },
      isRead: false,
      deletedAt: null
    });

    // Update room unread count
    const updateField = room.ownerId === userId ? 'unreadCount.owner' : 'unreadCount.bidder';
    await ChatRoom.findByIdAndUpdate(roomId, {
      [updateField]: unreadCount
    });

    // Emit confirmation
    socket.emit('messages-read', {
      roomId,
      unreadCount
    });
  }

  async handleDisconnect(socket) {
    const userId = socket.user.userId;

    try {
      // Update user session
      await UserSession.updateOnlineStatus(userId, false);

      // Remove from connected users
      this.connectedUsers.delete(userId);

      // Remove from user rooms
      this.userRooms.delete(userId);

      // Remove from typing users
      for (const [taskId, typingSet] of this.typingUsers.entries()) {
        typingSet.delete(userId);
        if (typingSet.size === 0) {
          this.typingUsers.delete(taskId);
        }
      }

      logger.info('User disconnected', {
        userId,
        socketId: socket.id
      });
    } catch (error) {
      logger.errorWithContext('Error during disconnect', error, {
        userId,
        socketId: socket.id
      });
    }
  }

  // Utility methods
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getUserSocketId(userId) {
    return this.connectedUsers.get(userId);
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  getRoomUsers(taskId) {
    const room = this.io.sockets.adapter.rooms.get(`task-${taskId}`);
    return room ? room.size : 0;
  }
}

module.exports = SocketHandler;
