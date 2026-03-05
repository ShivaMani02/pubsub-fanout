// index.js - Main server entry point
// Initializes Express server, Socket.io, and all connections

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');

const logger = require('./config/logger');
const { connectMongoDB, disconnectMongoDB } = require('./config/mongo');
const { initializeRedis, closeRedisConnections } = require('./config/redis');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const broker = require('./pubsub/broker');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// ========== Middleware Setup ==========

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Session ID middleware - Add session ID to request
app.use((req, res, next) => {
  req.sessionId = req.get('X-Session-ID') || `session_${Date.now()}`;
  next();
});

// ========== Routes ==========

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PubSub Fanout Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Error handler (must be last)
app.use(errorHandler);

// ========== Socket.io Events ==========

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Send welcome message
  socket.emit('connect:success', {
    socketId: socket.id,
    message: 'Connected to PubSub server',
    timestamp: new Date().toISOString()
  });

  /**
   * Subscribe to a topic
   * Receives: { topic }
   */
  socket.on('topic:subscribe', async (data) => {
    try {
      const { topic } = data;

      // Subscribe to topic via broker
      await broker.subscribeTopic(topic, (message) => {
        // Send message to this socket
        socket.emit('message:new', {
          ...message,
          receivedAt: new Date().toISOString()
        });
      });

      socket.join(topic);
      logger.debug(`Socket ${socket.id} subscribed to topic: ${topic}`);

      // Emit subscription confirmation
      socket.emit('topic:subscribed', {
        topic,
        message: `Successfully subscribed to ${topic}`,
        subscriberCount: broker.getSubscriberCount(topic)
      });

    } catch (error) {
      logger.error('Error subscribing to topic', error.message);
      socket.emit('error:subscription', {
        error: error.message
      });
    }
  });

  /**
   * Unsubscribe from a topic
   * Receives: { topic }
   */
  socket.on('topic:unsubscribe', (data) => {
    try {
      const { topic } = data;
      socket.leave(topic);
      logger.debug(`Socket ${socket.id} unsubscribed from topic: ${topic}`);

      socket.emit('topic:unsubscribed', {
        topic,
        message: `Successfully unsubscribed from ${topic}`
      });

    } catch (error) {
      logger.error('Error unsubscribing from topic', error.message);
      socket.emit('error:unsubscription', {
        error: error.message
      });
    }
  });

  /**
   * Publish custom message
   * Receives: { topic, payload }
   */
  socket.on('message:publish', async (data) => {
    try {
      const { topic, payload } = data;

      // Publish through broker
      const result = await broker.publishMessage(topic, {
        messageId: `msg_${Date.now()}`,
        topic,
        message: payload,
        publisher: socket.id,
        timestamp: Date.now()
      });

      socket.emit('message:published', result);
      logger.debug(`Custom message published via socket: ${socket.id}`);

    } catch (error) {
      logger.error('Error publishing custom message', error.message);
      socket.emit('error:publish', {
        error: error.message
      });
    }
  });

  /**
   * Ping/Pong for connection health check
   */
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  /**
   * Handle socket disconnection
   */
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });

  /**
   * Handle socket errors
   */
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}`, error);
  });
});

// Broadcast helper - send stats to all connected clients
const broadcastStats = () => {
  const stats = {
    topics: broker.getTopicsStats(),
    timestamp: Date.now()
  };
  io.emit('stats:update', stats);
};

// Broadcast stats periodically (every 5 seconds)
setInterval(broadcastStats, 5000);

// ========== Server Initialization ==========

/**
 * Start the server
 */
const startServer = async () => {
  try {
    const port = process.env.PORT || 5000;
    const host = process.env.HOST || '0.0.0.0';

    logger.info('Initializing server...');

    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectMongoDB();

    // Initialize Redis
    logger.info('Initializing Redis...');
    await initializeRedis();

    // Start HTTP/WebSocket server
    server.listen(port, host, () => {
      logger.info(`✓ Server running on http://${host}:${port}`);
      logger.info(`✓ API: http://${host}:${port}/api`);
      logger.info(`✓ WebSocket: ws://${host}:${port}`);
    });

  } catch (error) {
    logger.error('Failed to start server', error.message);
    process.exit(1);
  }
};

// ========== Graceful Shutdown ==========

/**
 * Handle graceful shutdown
 */
const shutdown = async () => {
  logger.info('Shutting down server...');

  try {
    // Close HTTP server
    server.close(() => {
      logger.info('✓ HTTP server closed');
    });

    // Close WebSocket connections
    io.close();
    logger.info('✓ WebSocket connections closed');

    // Close database connections
    await disconnectMongoDB();
    await closeRedisConnections();

    logger.info('✓ Server shutdown complete');
    process.exit(0);

  } catch (error) {
    logger.error('Error during shutdown', error.message);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  shutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', reason);
});

// ========== Start Server ==========

// Only start if this is the main module
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };
