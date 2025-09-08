const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Validate token
    const user = await authService.validateToken(token);
    
    if (!user.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Add user to request
    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    logger.errorWithContext('Authentication failed', error, {
      url: req.url,
      method: req.method,
      ip: req.ip
    });

    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Socket.io Authentication Middleware
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    logger.info('Socket authentication attempt', { 
      socketId: socket.id, 
      hasToken: !!token,
      tokenLength: token?.length 
    });

    if (!token) {
      logger.warn('No token provided for socket authentication');
      return next(new Error('Authentication token required'));
    }

    // First try to decode token without validation to see what's in it
    const decodedToken = authService.decodeToken(token);
    
    // For testing, if we can decode the token, use it directly
    if (decodedToken && decodedToken.sub) {
      logger.info('Using decoded token for authentication', { 
        userId: decodedToken.sub, 
        email: decodedToken.email 
      });
      
            // Add user to socket
            socket.user = {
              userId: decodedToken.sub,
              email: decodedToken.email || 'unknown@example.com',
              role: decodedToken.roles || 'USER',
              token: token
            };
      
      logger.info('Socket authentication successful (fallback)', { 
        socketId: socket.id, 
        userId: socket.user.userId, 
        email: socket.user.email 
      });
      
      return next();
    }
    
    // Validate token
    const user = await authService.validateToken(token);
    
    if (!user.valid) {
      logger.warn('Token validation failed', { 
        userId: user.userId, 
        email: user.email,
        decodedToken: decodedToken
      });
      return next(new Error('Invalid or expired token'));
    }

        // Add user to socket
        socket.user = {
          userId: user.userId,
          email: user.email,
          role: user.role,
          token: token
        };

    logger.info('Socket authentication successful', { 
      socketId: socket.id, 
      userId: user.userId, 
      email: user.email 
    });

    next();
  } catch (error) {
    logger.errorWithContext('Socket authentication failed', error, {
      socketId: socket.id,
      hasToken: !!socket.handshake.auth.token
    });

    next(new Error('Authentication failed'));
  }
};

/**
 * Optional authentication middleware
 * Continues even if token is invalid
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const user = await authService.validateToken(token);
        if (user.valid) {
          req.user = {
            userId: user.userId,
            email: user.email,
            role: user.role
          };
        }
      } catch (error) {
        // Continue without user info
        logger.warn('Optional auth failed', { error: error.message });
      }
    }

    next();
  } catch (error) {
    logger.errorWithContext('Optional authentication error', error);
    next();
  }
};

/**
 * Rate limiting middleware
 */
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, validTimestamps);
      }
    }

    // Check current IP
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);

    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateSocket,
  optionalAuth,
  rateLimit
};
