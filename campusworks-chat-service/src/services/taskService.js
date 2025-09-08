const axios = require('axios');
const config = require('../../config');
const logger = require('../utils/logger');

class TaskService {
  constructor() {
    this.baseUrl = config.springBootBaseUrl;
  }

  /**
   * Get task by ID
   * @param {number} taskId - Task ID
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Task information
   */
  async getTaskById(taskId, token = null) {
    try {
      logger.info('Fetching task from Spring Boot', { taskId, baseUrl: this.baseUrl, hasToken: !!token });
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.get(
        `${this.baseUrl}/api/tasks/${taskId}`,
        {
          headers,
          timeout: 5000
        }
      );

      logger.info('Task fetched successfully', { 
        taskId, 
        title: response.data?.title, 
        status: response.data?.status 
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get task:', { 
        taskId, 
        error: error.message, 
        status: error.response?.status,
        data: error.response?.data 
      });
      throw new Error('Task not found');
    }
  }

  /**
   * Get task status
   * @param {number} taskId - Task ID
   * @returns {Promise<string>} Task status
   */
  async getTaskStatus(taskId) {
    try {
      const task = await this.getTaskById(taskId);
      return task.status;
    } catch (error) {
      logger.error('Failed to get task status:', error.message);
      throw error;
    }
  }

  /**
   * Check if task is in progress
   * @param {number} taskId - Task ID
   * @returns {Promise<boolean>} Is task in progress
   */
  async isTaskInProgress(taskId) {
    try {
      const status = await this.getTaskStatus(taskId);
      return status === 'IN_PROGRESS';
    } catch (error) {
      logger.error('Failed to check task progress:', error.message);
      return false;
    }
  }

  /**
   * Get task with user context
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Task with user context
   */
  async getTaskWithContext(taskId, userId) {
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

      return response.data;
    } catch (error) {
      logger.error('Failed to get task with context:', error.message);
      throw new Error('Task not found or access denied');
    }
  }

  /**
   * Check if user is task owner
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Is user task owner
   */
  async isUserTaskOwner(taskId, userId) {
    try {
      const task = await this.getTaskById(taskId);
      return task.ownerId === userId;
    } catch (error) {
      logger.error('Failed to check task ownership:', error.message);
      return false;
    }
  }

  /**
   * Check if user is assigned to task
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Is user assigned to task
   */
  async isUserAssignedToTask(taskId, userId) {
    try {
      const task = await this.getTaskById(taskId);
      return task.assignedUserId === userId;
    } catch (error) {
      logger.error('Failed to check task assignment:', error.message);
      return false;
    }
  }

  /**
   * Validate task access for chat
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Validation result
   */
  async validateTaskAccess(taskId, userId) {
    try {
      const task = await this.getTaskById(taskId);
      
      // Check if task is in progress
      if (task.status !== 'IN_PROGRESS') {
        return {
          valid: false,
          error: 'Task is not in progress',
          task: null
        };
      }

      // Check if user is owner or assigned user
      const isOwner = task.ownerId === userId;
      const isAssigned = task.assignedUserId === userId;

      if (!isOwner && !isAssigned) {
        return {
          valid: false,
          error: 'Access denied',
          task: null
        };
      }

      return {
        valid: true,
        error: null,
        task: {
          id: task.id,
          title: task.title,
          status: task.status,
          ownerId: task.ownerId,
          ownerEmail: task.ownerEmail,
          assignedUserId: task.assignedUserId,
          assignedUserEmail: task.assignedUserEmail
        }
      };
    } catch (error) {
      logger.error('Failed to validate task access:', error.message);
      return {
        valid: false,
        error: 'Task not found',
        task: null
      };
    }
  }
}

module.exports = new TaskService();
