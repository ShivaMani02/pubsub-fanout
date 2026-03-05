// simController.js - Controller for handling simulation and messaging requests
// Manages business logic for publishing, subscribing, and retrieving statistics

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const broker = require('../pubsub/broker');
const simulator = require('../pubsub/simulator');
const Message = require('../models/Message');
const Session = require('../models/Session');

/**
 * Publish a message to a topic
 */
const publishMessage = async (req, res) => {
  try {
    const { topic, partitionKey, message } = req.body;

    // Validate input
    if (!topic || !message) {
      return res.status(400).json({
        success: false,
        error: 'Topic and message are required'
      });
    }

    // Generate message ID and calculate partition
    const messageId = `msg_${uuidv4()}`;
    const partition = partitionKey
      ? Math.abs(hash(partitionKey)) % 4
      : Math.floor(Math.random() * 4);

    // Create message object
    const messageObj = {
      messageId,
      topic,
      partition,
      partitionKey: partitionKey || null,
      publisher: req.sessionId || 'unknown',
      message,
      size: JSON.stringify(message).length
    };

    // Publish via broker (fanout to subscribers)
    const publishStartTime = Date.now();
    const fanoutResult = await broker.publishMessage(topic, messageObj);
    const latency = Date.now() - publishStartTime;

    // Store message in database
    messageObj.latency = latency;
    messageObj.fanoutCount = fanoutResult.fanoutCount;
    messageObj.processed = true;
    await Message.createMessage(messageObj);

    logger.info(`Message published: ${messageId}`, { topic, fanoutCount: fanoutResult.fanoutCount });

    res.json({
      success: true,
      messageId: messageId,
      topic: topic,
      fanoutCount: fanoutResult.fanoutCount,
      latency: latency,
      publishedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error publishing message', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get message history for a topic
 */
const getMessageHistory = async (req, res) => {
  try {
    const { topic, limit = 50, skip = 0 } = req.query;

    // Validate input
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    // Fetch messages from database
    const messages = await Message.findByTopic(topic, parseInt(limit), parseInt(skip));
    const totalCount = await Message.countByTopic(topic);

    logger.debug('Message history retrieved', { topic, count: messages.length });

    res.json({
      success: true,
      topic: topic,
      messages: messages,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: totalCount
      }
    });

  } catch (error) {
    logger.error('Error getting message history', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get statistics for a specific session
 */
const getSessionStats = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Fetch session from database
    const session = await Session.getSessionStats(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    logger.debug('Session stats retrieved', { sessionId });

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        type: session.type,
        messageCount: session.messageCount,
        receivedCount: session.receivedCount,
        averageLatency: session.avgLatency,
        maxLatency: session.maxLatency,
        minLatency: session.minLatency === Number.MAX_VALUE ? 0 : session.minLatency,
        totalBytes: session.totalBytes,
        topics: session.topics,
        isActive: session.isActive,
        uptime: Math.round((Date.now() - new Date(session.createdAt)) / 1000)
      }
    });

  } catch (error) {
    logger.error('Error getting session stats', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all active sessions
 */
const getAllSessions = async (req, res) => {
  try {
    const { type } = req.query;

    // Fetch active sessions
    const sessions = await Session.findActiveSessions(type || null);

    logger.debug('Active sessions retrieved', { count: sessions.length });

    res.json({
      success: true,
      count: sessions.length,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        type: s.type,
        topics: s.topics,
        messageCount: s.messageCount,
        isActive: s.isActive
      }))
    });

  } catch (error) {
    logger.error('Error getting all sessions', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Start a simulation
 */
const startSimulation = async (req, res) => {
  try {
    const config = req.body;

    // Start simulation
    const result = await simulator.startSimulation(config);

    logger.info('Simulation started', result);

    res.json(result);

  } catch (error) {
    logger.error('Error starting simulation', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Stop a simulation
 */
const stopSimulation = async (req, res) => {
  try {
    const { simulationId } = req.params;

    // Stop simulation
    const result = await simulator.stopSimulation(simulationId);

    logger.info('Simulation stopped', result);

    res.json(result);

  } catch (error) {
    logger.error('Error stopping simulation', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get simulation statistics
 */
const getSimulationStats = async (req, res) => {
  try {
    const { simulationId } = req.params;

    // Get simulation stats
    const stats = simulator.getSimulationStats(simulationId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Simulation not found'
      });
    }

    logger.debug('Simulation stats retrieved', { simulationId });

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    logger.error('Error getting simulation stats', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all topics statistics
 */
const getTopicsStats = async (req, res) => {
  try {
    // Get broker stats
    const topicsStats = broker.getTopicsStats();

    logger.debug('Topics stats retrieved', { topicCount: Object.keys(topicsStats).length });

    res.json({
      success: true,
      topics: topicsStats,
      totalTopics: Object.keys(topicsStats).length
    });

  } catch (error) {
    logger.error('Error getting topics stats', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Simple hash function for partition selection
 */
const hash = (str) => {
  let hashCode = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hashCode = ((hashCode << 5) - hashCode) + charCode;
    hashCode = hashCode & hashCode;
  }
  return hashCode;
};

module.exports = {
  publishMessage,
  getMessageHistory,
  getSessionStats,
  getAllSessions,
  startSimulation,
  stopSimulation,
  getSimulationStats,
  getTopicsStats
};
