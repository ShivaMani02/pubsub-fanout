// mongo.js - MongoDB connection setup and management
// Handles connection creation with retry logic and error handling

const mongoose = require('mongoose');
const logger = require('./logger');

// MongoDB connection configuration
const mongoConfig = {
  maxRetries: 5,
  retryDelay: 5000, // 5 seconds
};

// Current retry attempt counter
let retryAttempt = 0;

/**
 * Connect to MongoDB database
 * Implements retry logic in case of connection failures
 */
const connectMongoDB = async () => {
  try {
    // Get MongoDB connection string from environment
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pubsub_db';

    logger.info('Attempting MongoDB connection...', mongoUri);

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✓ MongoDB connected successfully');
    retryAttempt = 0; // Reset retry counter on success
    return mongoose.connection;

  } catch (error) {
    retryAttempt++;
    logger.error(`MongoDB connection failed (Attempt ${retryAttempt}/${mongoConfig.maxRetries})`, error.message);

    // Check if we should retry
    if (retryAttempt < mongoConfig.maxRetries) {
      logger.info(`Retrying in ${mongoConfig.retryDelay}ms...`);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, mongoConfig.retryDelay));
      // Retry connection
      return connectMongoDB();
    } else {
      logger.error('Failed to connect to MongoDB after maximum retries');
      throw error;
    }
  }
};

/**
 * Get MongoDB connection instance
 */
const getMongoConnection = () => {
  return mongoose.connection;
};

/**
 * Disconnect from MongoDB
 */
const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('✓ MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', error.message);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  logger.error('Mongoose connection error', error.message);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose disconnected from MongoDB');
});

module.exports = {
  connectMongoDB,
  getMongoConnection,
  disconnectMongoDB
};
