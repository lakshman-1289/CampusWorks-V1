const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.baseUrl = config.springBootBaseUrl;
    this.jwtSecret = config.jwtSecret;
    
    // Debug logging
    console.log('AuthService initialized with:', {
      baseUrl: this.baseUrl,
      jwtSecret: this.jwtSecret ? this.jwtSecret.substring(0, 10) + '...' : 'NOT SET'
    });
  }

  /**
   * Validate JWT token with Spring Boot auth service
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User information
   */
  async validateToken(token) {
    try {
      logger.info('Validating token', { 
        tokenLength: token?.length, 
        tokenStart: token?.substring(0, 20),
        jwtSecret: this.jwtSecret?.substring(0, 10) + '...'
      });
      
      // First try to validate locally
      try {
        const decoded = jwt.verify(token, this.jwtSecret);
        logger.info('Local JWT validation successful', { 
          userId: decoded.sub, 
          email: decoded.email, 
          role: decoded.roles,
          allClaims: Object.keys(decoded)
        });
        return {
          userId: decoded.sub, // subject is the userId
          email: decoded.email, // email is in claims
          role: decoded.roles, // roles is in claims
          valid: true
        };
      } catch (localError) {
        logger.warn('Local JWT validation failed, trying Spring Boot service', { 
          error: localError.message,
          errorName: localError.name
        });
      }

      // Fallback to Spring Boot service
      const response = await axios.get(
        `${this.baseUrl}/api/auth/validate`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      if (response.data && response.data.userId) {
        logger.info('Spring Boot JWT validation successful', { 
          userId: response.data.userId, 
          email: response.data.email 
        });
        return {
          userId: response.data.userId,
          email: response.data.email,
          role: response.data.role || response.data.roles,
          valid: true
        };
      }

      throw new Error('Invalid token response');
    } catch (error) {
      logger.error('Token validation failed:', error.message);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user information by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User information
   */
  async getUserInfo(userId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/auth/user/${userId}`,
        {
          timeout: 5000
        }
      );

      return {
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
        enabled: response.data.enabled
      };
    } catch (error) {
      logger.error('Failed to get user info:', error.message);
      throw new Error('User not found');
    }
  }

  /**
   * Get user information by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User information
   */
  async getUserByEmail(email) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/auth/user/${email}`,
        {
          timeout: 5000
        }
      );

      return {
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
        enabled: response.data.enabled
      };
    } catch (error) {
      logger.error('Failed to get user by email:', error.message);
      throw new Error('User not found');
    }
  }

  /**
   * Verify if user has access to a specific task
   * @param {number} userId - User ID
   * @param {number} taskId - Task ID
   * @returns {Promise<boolean>} Access permission
   */
  async canUserAccessTask(userId, taskId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/tasks/${taskId}`,
        {
          headers: { 
            'X-User-Id': userId.toString(),
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      const task = response.data;
      return task.ownerId === userId || task.assignedUserId === userId;
    } catch (error) {
      logger.error('Failed to verify task access:', error.message);
      return false;
    }
  }

  /**
   * Extract user info from JWT token without validation
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded token or null
   */
  decodeToken(token) {
    try {
      const decoded = jwt.decode(token);
      logger.info('Decoded token (without validation)', { 
        userId: decoded?.sub, 
        email: decoded?.email, 
        role: decoded?.roles,
        allClaims: Object.keys(decoded || {})
      });
      return decoded;
    } catch (error) {
      logger.error('Failed to decode token:', error.message);
      return null;
    }
  }
}

module.exports = new AuthService();
