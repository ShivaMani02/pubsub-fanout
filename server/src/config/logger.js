// logger.js - Simple logging utility with different log levels
// Supports: debug, info, warn, error levels

const LoggerLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Get log level from environment, default to INFO
const logLevel = process.env.LOG_LEVEL || 'info';
const currentLevel = LoggerLevels[logLevel.toUpperCase()] || LoggerLevels.INFO;

// Helper function to format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Logger object with methods for each level
const logger = {
  // Debug level - detailed information for debugging
  debug: (message, data = '') => {
    if (currentLevel <= LoggerLevels.DEBUG) {
      console.log(`[${getTimestamp()}] DEBUG: ${message}`, data);
    }
  },

  // Info level - general informational messages
  info: (message, data = '') => {
    if (currentLevel <= LoggerLevels.INFO) {
      console.log(`[${getTimestamp()}] INFO: ${message}`, data);
    }
  },

  // Warn level - warning messages for potential issues
  warn: (message, data = '') => {
    if (currentLevel <= LoggerLevels.WARN) {
      console.warn(`[${getTimestamp()}] WARN: ${message}`, data);
    }
  },

  // Error level - error messages for failures
  error: (message, error = '') => {
    if (currentLevel <= LoggerLevels.ERROR) {
      console.error(`[${getTimestamp()}] ERROR: ${message}`, error);
    }
  }
};

module.exports = logger;
