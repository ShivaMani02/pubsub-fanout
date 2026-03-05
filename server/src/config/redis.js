// redis.js - Redis client setup for pub/sub and caching
// Handles Redis connections with connection pooling and error handling

const redis = require('redis');
const logger = require('./logger');

// Redis configuration
const redisConfig = {
  // Connection timeout
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Too many Redis connection attempts');
        return new Error('Redis max retries exceeded');
      }
      // Retry with exponential backoff
      return Math.min(retries * 50, 500);
    }
  }
};

// Redis client instances
let publisherClient = null;
let subscriberClient = null;

/**
 * Create and connect Redis publisher client
 */
const createPublisherClient = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    publisherClient = redis.createClient({
      url: redisUrl,
      ...redisConfig
    });

    // Handle connection events
    publisherClient.on('error', (error) => {
      logger.error('Redis Publisher Error', error.message);
    });

    publisherClient.on('connect', () => {
      logger.info('✓ Redis Publisher connected');
    });

    // Connect the client
    await publisherClient.connect();
    logger.info('✓ Redis Publisher client created and connected');
    return publisherClient;

  } catch (error) {
    logger.error('Failed to create Redis Publisher client', error.message);
    throw error;
  }
};

/**
 * Create and connect Redis subscriber client
 */
const createSubscriberClient = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    subscriberClient = redis.createClient({
      url: redisUrl,
      ...redisConfig
    });

    // Handle connection events
    subscriberClient.on('error', (error) => {
      logger.error('Redis Subscriber Error', error.message);
    });

    subscriberClient.on('connect', () => {
      logger.info('✓ Redis Subscriber connected');
    });

    // Connect the client
    await subscriberClient.connect();
    logger.info('✓ Redis Subscriber client created and connected');
    return subscriberClient;

  } catch (error) {
    logger.error('Failed to create Redis Subscriber client', error.message);
    throw error;
  }
};

/**
 * Initialize Redis connections
 */
const initializeRedis = async () => {
  try {
    logger.info('Initializing Redis connections...');
    await createPublisherClient();
    await createSubscriberClient();
    logger.info('✓ Redis initialization complete');
  } catch (error) {
    logger.error('Redis initialization failed', error.message);
    throw error;
  }
};

/**
 * Get Redis publisher client
 */
const getPublisherClient = () => {
  if (!publisherClient) {
    throw new Error('Redis Publisher client not initialized');
  }
  return publisherClient;
};

/**
 * Get Redis subscriber client
 */
const getSubscriberClient = () => {
  if (!subscriberClient) {
    throw new Error('Redis Subscriber client not initialized');
  }
  return subscriberClient;
};

/**
 * Close all Redis connections
 */
const closeRedisConnections = async () => {
  try {
    if (publisherClient) {
      await publisherClient.quit();
      logger.info('✓ Redis Publisher disconnected');
    }
    if (subscriberClient) {
      await subscriberClient.quit();
      logger.info('✓ Redis Subscriber disconnected');
    }
  } catch (error) {
    logger.error('Error closing Redis connections', error.message);
  }
};

module.exports = {
  initializeRedis,
  getPublisherClient,
  getSubscriberClient,
  closeRedisConnections
};
