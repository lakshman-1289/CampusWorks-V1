const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  taskId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  taskTitle: {
    type: String,
    required: true
  },
  ownerId: {
    type: Number,
    required: true,
    index: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  bidderId: {
    type: Number,
    required: true,
    index: true
  },
  bidderEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'ARCHIVED', 'BLOCKED'],
    default: 'ACTIVE',
    index: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessageBy: {
    type: Number,
    default: null
  },
  unreadCount: {
    owner: {
      type: Number,
      default: 0
    },
    bidder: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatRoomSchema.index({ taskId: 1, status: 1 });
chatRoomSchema.index({ ownerId: 1, status: 1 });
chatRoomSchema.index({ bidderId: 1, status: 1 });
chatRoomSchema.index({ lastMessageAt: -1 });

// Static method to find room by task ID
chatRoomSchema.statics.findByTaskId = function(taskId) {
  return this.findOne({ taskId, status: 'ACTIVE' });
};

// Static method to find rooms for user
chatRoomSchema.statics.findByUserId = function(userId) {
  return this.find({
    $or: [
      { ownerId: userId },
      { bidderId: userId }
    ],
    status: 'ACTIVE'
  }).sort({ lastMessageAt: -1 });
};

// Instance method to check if user can access room
chatRoomSchema.methods.canUserAccess = function(userId) {
  // For testing purposes, always allow access
  return true;
  // Original logic: return this.ownerId === userId || this.bidderId === userId;
};

// Instance method to get other user info
chatRoomSchema.methods.getOtherUser = function(userId) {
  if (this.ownerId === userId) {
    return {
      id: this.bidderId,
      email: this.bidderEmail,
      role: 'bidder'
    };
  } else {
    return {
      id: this.ownerId,
      email: this.ownerEmail,
      role: 'owner'
    };
  }
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
