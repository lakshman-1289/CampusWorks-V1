const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const database = require('./utils/database');
const logger = require('./utils/logger');
const SocketHandler = require('./socket/socketHandler');

// Import routes
const chatRoutes = require('./routes/chat');

class ChatServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.socketHandler = null;
    this.port = config.port;
  }

  async initialize() {
    try {
      // Connect to database
      await database.connect();
      logger.info('Database connected successfully');

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      // Setup Socket.io
      this.socketHandler = new SocketHandler(this.server, config);
      logger.info('Socket.io initialized');

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.errorWithContext('Failed to initialize server', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for Socket.io
      crossOriginEmbedderPolicy: false
    }));

    // CORS middleware
    this.app.use(cors({
      origin: config.socketCorsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Email', 'X-User-Roles']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(logger.request);

    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await database.healthCheck();
        const socketHealth = this.socketHandler ? {
          status: 'connected',
          connectedUsers: this.socketHandler.getConnectedUsersCount()
        } : { status: 'disconnected' };

        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: dbHealth,
          socket: socketHealth,
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || '1.0.0'
        });
      } catch (error) {
        logger.errorWithContext('Health check failed', error);
        res.status(500).json({
          status: 'unhealthy',
          error: error.message
        });
      }
    });

    // Simple test endpoint
    this.app.get('/test', (req, res) => {
      res.json({
        message: 'Chat service is running',
        timestamp: new Date().toISOString(),
        config: {
          port: config.port,
          jwtSecret: config.jwtSecret ? 'SET' : 'NOT SET',
          mongodbUri: config.mongodbUri ? 'SET' : 'NOT SET'
        }
      });
    });

    // Test task endpoint
    this.app.get('/test-task/:taskId', async (req, res) => {
      try {
        const { taskId } = req.params;
        console.log('🧪 TEST ENDPOINT: Testing task fetch for taskId:', taskId);
        const taskService = require('./services/taskService');
        const task = await taskService.getTaskById(taskId);
        console.log('✅ TEST ENDPOINT: Task fetched successfully:', task);
        res.json({
          success: true,
          task: task
        });
      } catch (error) {
        console.error('❌ TEST ENDPOINT: Error fetching task:', error.message);
        res.json({
          success: false,
          error: error.message,
          taskId: req.params.taskId
        });
      }
    });

    // API info endpoint
    this.app.get('/api/info', (req, res) => {
      res.json({
        name: 'CampusWorks Chat Service',
        version: '1.0.0',
        description: 'Real-time chat service for CampusWorks platform',
        endpoints: {
          health: '/health',
          chat: '/api/chat',
          websocket: 'ws://localhost:' + this.port
        }
      });
    });
  }

  setupRoutes() {
    // API routes
    this.app.use('/api/chat', chatRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.errorWithContext('Unhandled error', error, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.errorWithContext('Uncaught Exception', error);
      this.gracefulShutdown('SIGTERM');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.errorWithContext('Unhandled Rejection', new Error(reason), {
        promise: promise.toString()
      });
      this.gracefulShutdown('SIGTERM');
    });
  }

  setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach(signal => {
      process.on(signal, () => {
        logger.info(`Received ${signal}, starting graceful shutdown`);
        this.gracefulShutdown(signal);
      });
    });
  }

  async gracefulShutdown(signal) {
    try {
      logger.info('Starting graceful shutdown...');

      // Stop accepting new connections
      this.server.close(() => {
        logger.info('HTTP server closed');
      });

      // Disconnect from database
      await database.disconnect();
      logger.info('Database disconnected');

      // Close any other connections
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.errorWithContext('Error during graceful shutdown', error);
      process.exit(1);
    }
  }

  async start() {
    try {
      await this.initialize();

      this.server.listen(this.port, () => {
        logger.info(`Chat service started on port ${this.port}`, {
          port: this.port,
          environment: config.nodeEnv,
          database: config.mongodbUri,
          corsOrigin: config.socketCorsOrigin
        });
      });

    } catch (error) {
      logger.errorWithContext('Failed to start server', error);
      process.exit(1);
    }
  }
}

// Start server
const server = new ChatServer();
server.start().catch(error => {
  logger.errorWithContext('Server startup failed', error);
  process.exit(1);
});

module.exports = ChatServer;
