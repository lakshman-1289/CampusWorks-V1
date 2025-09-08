const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
    index: true
  },
  taskId: {
    type: Number,
    required: true,
    index: true
  },
  senderId: {
    type: Number,
    required: true,
    index: true
  },
  senderEmail: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['owner', 'bidder'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['TEXT', 'FILE', 'IMAGE', 'SYSTEM'],
    default: 'TEXT'
  },
  fileUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  editedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ taskId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1, createdAt: -1 });

// Static method to find messages by room
messageSchema.statics.findByRoom = function(roomId, limit = 50, skip = 0) {
  return this.find({ 
    roomId, 
    deletedAt: null 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip)
  .populate('roomId', 'taskTitle ownerId bidderId');
};

// Static method to find unread messages for user
messageSchema.statics.findUnreadForUser = function(userId, roomId) {
  return this.find({
    roomId,
    senderId: { $ne: userId },
    isRead: false,
    deletedAt: null
  });
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(messageIds, userId) {
  return this.updateMany(
    { 
      _id: { $in: messageIds },
      senderId: { $ne: userId }
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
};

// Instance method to check if user can edit message
messageSchema.methods.canUserEdit = function(userId) {
  return this.senderId === userId && this.messageType === 'TEXT';
};

// Instance method to check if user can delete message
messageSchema.methods.canUserDelete = function(userId) {
  return this.senderId === userId;
};

// Virtual for message age
messageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);
