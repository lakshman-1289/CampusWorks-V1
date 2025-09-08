const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  isOnline: {
    type: Boolean,
    default: true,
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSessionSchema.index({ userId: 1, isOnline: 1 });
userSessionSchema.index({ socketId: 1 });
userSessionSchema.index({ lastSeen: -1 });

// Static method to find active sessions for user
userSessionSchema.statics.findActiveByUserId = function(userId) {
  return this.find({ userId, isOnline: true });
};

// Static method to find session by socket ID
userSessionSchema.statics.findBySocketId = function(socketId) {
  return this.findOne({ socketId });
};

// Static method to update user online status
userSessionSchema.statics.updateOnlineStatus = function(userId, isOnline) {
  return this.updateMany(
    { userId },
    { 
      isOnline,
      lastSeen: new Date()
    }
  );
};

// Static method to cleanup old sessions
userSessionSchema.statics.cleanupOldSessions = function(hoursOld = 24) {
  const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
  return this.deleteMany({
    lastSeen: { $lt: cutoffTime },
    isOnline: false
  });
};

// Instance method to update last seen
userSessionSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Instance method to set offline
userSessionSchema.methods.setOffline = function() {
  this.isOnline = false;
  this.lastSeen = new Date();
  return this.save();
};

module.exports = mongoose.model('UserSession', userSessionSchema);
