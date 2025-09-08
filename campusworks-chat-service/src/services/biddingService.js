const axios = require('axios');
const config = require('../../config');
const logger = require('../utils/logger');

class BiddingService {
  constructor() {
    this.baseUrl = config.springBootBaseUrl;
  }

  /**
   * Get accepted bid for a task
   * @param {number} taskId - Task ID
   * @returns {Promise<Object>} Accepted bid information
   */
  async getAcceptedBid(taskId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/bids/task/${taskId}/accepted`,
        {
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get accepted bid:', error.message);
      throw new Error('No accepted bid found');
    }
  }

  /**
   * Check if bid is accepted for user
   * @param {number} taskId - Task ID
   * @param {number} bidderId - Bidder ID
   * @returns {Promise<boolean>} Is bid accepted
   */
  async isBidAccepted(taskId, bidderId) {
    try {
      const acceptedBid = await this.getAcceptedBid(taskId);
      return acceptedBid.bidderId === bidderId;
    } catch (error) {
      logger.error('Failed to check bid acceptance:', error.message);
      return false;
    }
  }

  /**
   * Get all bids for a task
   * @param {number} taskId - Task ID
   * @returns {Promise<Array>} List of bids
   */
  async getBidsForTask(taskId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/bids/task/${taskId}`,
        {
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get bids for task:', error.message);
      throw new Error('Failed to get bids');
    }
  }

  /**
   * Get winning bid for a task
   * @param {number} taskId - Task ID
   * @returns {Promise<Object>} Winning bid information
   */
  async getWinningBid(taskId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/bids/task/${taskId}/winning`,
        {
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get winning bid:', error.message);
      throw new Error('No winning bid found');
    }
  }

  /**
   * Validate bidder access for chat
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Validation result
   */
  async validateBidderAccess(taskId, userId) {
    try {
      const acceptedBid = await this.getAcceptedBid(taskId);
      
      if (acceptedBid.bidderId !== userId) {
        return {
          valid: false,
          error: 'User is not the accepted bidder',
          bid: null
        };
      }

      return {
        valid: true,
        error: null,
        bid: {
          id: acceptedBid.id,
          taskId: acceptedBid.taskId,
          bidderId: acceptedBid.bidderId,
          bidderEmail: acceptedBid.bidderEmail,
          amount: acceptedBid.amount,
          status: acceptedBid.status
        }
      };
    } catch (error) {
      logger.error('Failed to validate bidder access:', error.message);
      return {
        valid: false,
        error: 'No accepted bid found',
        bid: null
      };
    }
  }

  /**
   * Get bidder information for chat
   * @param {number} taskId - Task ID
   * @returns {Promise<Object>} Bidder information
   */
  async getBidderInfo(taskId) {
    try {
      const acceptedBid = await this.getAcceptedBid(taskId);
      
      return {
        id: acceptedBid.bidderId,
        email: acceptedBid.bidderEmail,
        amount: acceptedBid.amount,
        proposal: acceptedBid.proposal,
        status: acceptedBid.status
      };
    } catch (error) {
      logger.error('Failed to get bidder info:', error.message);
      throw new Error('Bidder information not available');
    }
  }

  /**
   * Check if user can access task chat
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Access validation result
   */
  async canUserAccessChat(taskId, userId) {
    try {
      // Check if there's an accepted bid
      const acceptedBid = await this.getAcceptedBid(taskId);
      
      // Check if user is task owner or accepted bidder
      const isOwner = acceptedBid.taskOwnerId === userId;
      const isBidder = acceptedBid.bidderId === userId;

      if (!isOwner && !isBidder) {
        return {
          canAccess: false,
          error: 'Access denied',
          userRole: null
        };
      }

      return {
        canAccess: true,
        error: null,
        userRole: isOwner ? 'owner' : 'bidder',
        bidInfo: acceptedBid
      };
    } catch (error) {
      logger.error('Failed to check chat access:', error.message);
      return {
        canAccess: false,
        error: 'No accepted bid found',
        userRole: null
      };
    }
  }
}

module.exports = new BiddingService();
