const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const UserSession = require('../models/UserSession');
const taskService = require('../services/taskService');
const biddingService = require('../services/biddingService');
const authService = require('../services/authService');
const logger = require('../utils/logger');

class ChatController {
  /**
   * Create or get chat room for a task
   */
  async createOrGetRoom(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      logger.info('Creating/getting chat room', { taskId, userId });

      // Validate task access
      const taskValidation = await taskService.validateTaskAccess(taskId, userId);
      if (!taskValidation.valid) {
        return res.status(400).json({
          success: false,
          error: taskValidation.error
        });
      }

      const task = taskValidation.task;

      // Check if user is task owner or assigned user
      const isOwner = task.ownerId === userId;
      const isAssigned = task.assignedUserId === userId;

      if (!isOwner && !isAssigned) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Get or create chat room
      let room = await ChatRoom.findByTaskId(taskId);
      
      if (!room) {
        // Get bidder information
        const bidderInfo = await biddingService.getBidderInfo(taskId);
        
        room = await ChatRoom.create({
          taskId: parseInt(taskId),
          taskTitle: task.title,
          ownerId: task.ownerId,
          ownerEmail: task.ownerEmail,
          bidderId: task.assignedUserId,
          bidderEmail: task.assignedUserEmail,
          status: 'ACTIVE'
        });

        logger.info('Created new chat room', { roomId: room._id, taskId });
      }

      // Get recent messages
      const messages = await Message.findByRoom(room._id, 50, 0);

      // Get other user information
      const otherUser = room.getOtherUser(userId);

      res.json({
        success: true,
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
        }) // Return in chronological order with role data
      });

    } catch (error) {
      logger.errorWithContext('Failed to create/get chat room', error, {
        taskId: req.params.taskId,
        userId: req.user?.userId
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get chat room by task ID
   */
  async getRoomByTaskId(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      const room = await ChatRoom.findByTaskId(taskId);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Chat room not found'
        });
      }

      // Check if user can access room
      if (!room.canUserAccess(userId)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Get recent messages
      const messages = await Message.findByRoom(room._id, 50, 0);

      // Get other user information
      const otherUser = room.getOtherUser(userId);

      res.json({
        success: true,
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

    } catch (error) {
      logger.errorWithContext('Failed to get chat room', error, {
        taskId: req.params.taskId,
        userId: req.user?.userId
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user's chat rooms
   */
  async getUserRooms(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;
      const rooms = await ChatRoom.findByUserId(userId)
        .skip(skip)
        .limit(parseInt(limit));

      const roomsWithMessages = await Promise.all(
        rooms.map(async (room) => {
          const lastMessage = await Message.findOne({ roomId: room._id })
            .sort({ createdAt: -1 })
            .limit(1);

          const otherUser = room.getOtherUser(userId);

          return {
            id: room._id,
            taskId: room.taskId,
            taskTitle: room.taskTitle,
            status: room.status,
            lastMessageAt: room.lastMessageAt,
            unreadCount: room.unreadCount,
            otherUser,
            lastMessage: lastMessage ? {
              id: lastMessage._id,
              message: lastMessage.message,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt
            } : null
          };
        })
      );

      res.json({
        success: true,
        rooms: roomsWithMessages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: rooms.length
        }
      });

    } catch (error) {
      logger.errorWithContext('Failed to get user rooms', error, {
        userId: req.user?.userId
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get messages for a room
   */
  async getMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user.userId;

      const skip = (page - 1) * limit;

      // Verify room access
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.canUserAccess(userId)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const messages = await Message.findByRoom(roomId, parseInt(limit), skip);

      res.json({
        success: true,
        messages: messages.reverse(),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });

    } catch (error) {
      logger.errorWithContext('Failed to get messages', error, {
        roomId: req.params.roomId,
        userId: req.user?.userId
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(req, res) {
    try {
      const { roomId } = req.params;
      const { messageIds } = req.body;
      const userId = req.user.userId;

      // Verify room access
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.canUserAccess(userId)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
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

      res.json({
        success: true,
        unreadCount
      });

    } catch (error) {
      logger.errorWithContext('Failed to mark messages as read', error, {
        roomId: req.params.roomId,
        userId: req.user?.userId
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.userId;

      const rooms = await ChatRoom.findByUserId(userId);
      let totalUnread = 0;

      for (const room of rooms) {
        const unreadCount = room.ownerId === userId ? room.unreadCount.owner : room.unreadCount.bidder;
        totalUnread += unreadCount;
      }

      res.json({
        success: true,
        totalUnread
      });

    } catch (error) {
      logger.errorWithContext('Failed to get unread count', error, {
        userId: req.user?.userId
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new ChatController();
