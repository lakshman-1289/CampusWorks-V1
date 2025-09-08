const mongoose = require('mongoose');
const config = require('../../config');
const logger = require('./logger');

class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false
      };

      this.connection = await mongoose.connect(config.mongodbUri, options);
      
      logger.info('Connected to MongoDB', {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        name: this.connection.connection.name
      });

      // Set up connection event listeners
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get connection info
   */
  getConnectionInfo() {
    if (!this.connection) {
      return null;
    }

    return {
      host: this.connection.connection.host,
      port: this.connection.connection.port,
      name: this.connection.connection.name,
      readyState: this.connection.connection.readyState
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected()) {
        return {
          status: 'disconnected',
          message: 'Database not connected'
        };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'connected',
        message: 'Database is healthy',
        info: this.getConnectionInfo()
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

module.exports = new Database();
