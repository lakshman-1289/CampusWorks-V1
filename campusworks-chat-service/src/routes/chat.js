const express = require('express');
const { authenticateToken, rateLimit } = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const logger = require('../utils/logger');

const router = express.Router();

// Apply rate limiting to all routes
router.use(rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/chat/rooms/task/:taskId
 * @desc    Create or get chat room for a task
 * @access  Private
 */
router.post('/rooms/task/:taskId', async (req, res) => {
  await chatController.createOrGetRoom(req, res);
});

/**
 * @route   GET /api/chat/rooms/task/:taskId
 * @desc    Get chat room by task ID
 * @access  Private
 */
router.get('/rooms/task/:taskId', async (req, res) => {
  await chatController.getRoomByTaskId(req, res);
});

/**
 * @route   GET /api/chat/rooms
 * @desc    Get user's chat rooms
 * @access  Private
 */
router.get('/rooms', async (req, res) => {
  await chatController.getUserRooms(req, res);
});

/**
 * @route   GET /api/chat/rooms/:roomId/messages
 * @desc    Get messages for a room
 * @access  Private
 */
router.get('/rooms/:roomId/messages', async (req, res) => {
  await chatController.getMessages(req, res);
});

/**
 * @route   POST /api/chat/rooms/:roomId/messages/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.post('/rooms/:roomId/messages/read', async (req, res) => {
  await chatController.markMessagesAsRead(req, res);
});

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get unread message count for user
 * @access  Private
 */
router.get('/unread-count', async (req, res) => {
  await chatController.getUnreadCount(req, res);
});

// Error handling middleware
router.use((error, req, res, next) => {
  logger.errorWithContext('Chat route error', error, {
    url: req.url,
    method: req.method,
    userId: req.user?.userId
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

module.exports = router;
