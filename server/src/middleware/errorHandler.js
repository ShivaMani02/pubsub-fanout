// errorHandler.js - Express error handling middleware
// Centralizes error handling for the application

const logger = require('../config/logger');

/**
 * Error handling middleware
 * Should be mounted last after all other middleware and routes
 */
const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('Server Error', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
