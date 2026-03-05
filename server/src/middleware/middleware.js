// middleware.js - Logger.js - Additional middleware utilities
// Provides request/response logging and error tracking

const logger = require('../config/logger');

/**
 * Request logging middleware
 * Logs HTTP requests with method, path, and response time
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Call next middleware
  next();

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
};

/**
 * CORS middleware configuration
 * Enables cross-origin requests from frontend
 */
const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

/**
 * Session tracking middleware
 * Assigns unique session IDs to incoming requests
 */
const sessionMiddleware = (req, res, next) => {
  req.sessionId = req.get('X-Session-ID') || `session_${Date.now()}_${Math.random()}`;
  req.startTime = Date.now();
  next();
};

module.exports = {
  requestLogger,
  corsConfig,
  sessionMiddleware
};
