// simulator.js - Message simulator for testing and demonstration
// Generates test messages and measures performance metrics

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const broker = require('./broker');
const Message = require('../models/Message');
const Session = require('../models/Session');

class MessageSimulator {
  constructor() {
    // Track active simulations
    this.activeSimulations = new Map();
    // Track latency measurements
    this.latencyMetrics = [];
  }

  /**
   * Start a simulation with multiple publishers and subscribers
   */
  async startSimulation(config = {}) {
    try {
      const simulationId = `sim_${uuidv4()}`;
      const {
        publishers = 3,
        subscribers = 10,
        duration = 60000, // 60 seconds
        messageRate = 5, // messages per second
        partitions = 4
      } = config;

      logger.info(`Starting simulation: ${simulationId}`, {
        publishers,
        subscribers,
        duration,
        messageRate,
        partitions
      });

      // Create publisher sessions
      const publisherSessions = [];
      for (let i = 0; i < publishers; i++) {
        const sessionId = `pub_${uuidv4()}`;
        const session = await Session.createSession({
          sessionId,
          type: 'publisher',
          topics: ['orders', 'notifications', 'events']
        });
        publisherSessions.push(session);
      }

      // Create subscriber sessions
      const subscriberSessions = [];
      const topicsToSubscribe = ['orders', 'notifications', 'events'];
      for (let i = 0; i < subscribers; i++) {
        const sessionId = `sub_${uuidv4()}`;
        const topics = [topicsToSubscribe[i % topicsToSubscribe.length]];
        const session = await Session.createSession({
          sessionId,
          type: 'subscriber',
          topics
        });
        subscriberSessions.push(session);
      }

      // Setup message handlers for subscribers
      for (const subscriberSession of subscriberSessions) {
        for (const topic of subscriberSession.topics) {
          await broker.subscribeTopic(topic, async (message) => {
            // Record message as received
            await subscriberSession.updateStats(message.latency, 0, true);
          });
        }
      }

      // Simulation data
      const simulationData = {
        simulationId,
        publisherIds: publisherSessions.map(s => s.sessionId),
        subscriberIds: subscriberSessions.map(s => s.sessionId),
        startTime: Date.now(),
        endTime: Date.now() + duration,
        messageRate,
        partitions,
        isRunning: true,
        messagesSent: 0
      };

      // Store simulation
      this.activeSimulations.set(simulationId, simulationData);

      // Start publishing messages
      this.publishMessages(
        simulationId,
        publisherSessions,
        topicsToSubscribe,
        messageRate,
        duration,
        partitions
      );

      return {
        success: true,
        simulationId,
        publisherCount: publishers,
        subscriberCount: subscribers,
        duration
      };

    } catch (error) {
      logger.error('Error starting simulation', error.message);
      throw new Error(`Failed to start simulation: ${error.message}`);
    }
  }

  /**
   * Publish messages continuously during simulation
   */
  async publishMessages(simulationId, publishers, topics, rate, duration, partitions) {
    try {
      const intervalMs = 1000 / rate; // Convert rate to interval
      const startTime = Date.now();

      const publishLoop = setInterval(async () => {
        const simulationData = this.activeSimulations.get(simulationId);
        const elapsedTime = Date.now() - startTime;

        // Check if simulation should continue
        if (elapsedTime > duration || !simulationData?.isRunning) {
          clearInterval(publishLoop);
          await this.stopSimulation(simulationId);
          return;
        }

        // Select random publisher and topic
        const publisher = publishers[Math.floor(Math.random() * publishers.length)];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const partition = Math.floor(Math.random() * partitions);

        // Create message
        const messageId = `msg_${uuidv4()}`;
        const messageData = {
          messageId,
          topic,
          partition,
          partitionKey: `key_${partition}`,
          publisher: publisher.sessionId,
          message: {
            type: 'test_message',
            timestamp: Date.now(),
            data: {
              value: Math.random() * 1000,
              index: simulationData.messagesSent + 1
            }
          }
        };

        // Publish message
        const publishStartTime = Date.now();
        const fanoutResult = await broker.publishMessage(topic, messageData);
        const latency = Date.now() - publishStartTime;

        // Store message in database
        messageData.latency = latency;
        messageData.fanoutCount = fanoutResult.fanoutCount;
        messageData.processed = true;
        await Message.createMessage(messageData);

        // Update publisher stats
        await publisher.updateStats(latency, JSON.stringify(messageData).length, false);

        // Track latency
        this.latencyMetrics.push({ latency, topic, timestamp: Date.now() });

        // Update simulation counter
        simulationData.messagesSent++;

        if (simulationData.messagesSent % 100 === 0) {
          logger.info(`Simulation progress: ${simulationData.messagesSent} messages sent`);
        }

      }, intervalMs);

    } catch (error) {
      logger.error('Error in message publishing loop', error.message);
    }
  }

  /**
   * Stop a running simulation
   */
  async stopSimulation(simulationId) {
    try {
      const simulationData = this.activeSimulations.get(simulationId);
      
      if (!simulationData) {
        throw new Error(`Simulation not found: ${simulationId}`);
      }

      simulationData.isRunning = false;
      simulationData.endTime = Date.now();

      logger.info(`Simulation stopped: ${simulationId}`, {
        totalMessages: simulationData.messagesSent,
        duration: simulationData.endTime - simulationData.startTime
      });

      return {
        success: true,
        simulationId,
        messagesSent: simulationData.messagesSent
      };

    } catch (error) {
      logger.error('Error stopping simulation', error.message);
      throw new Error(`Failed to stop simulation: ${error.message}`);
    }
  }

  /**
   * Get statistics for a simulation
   */
  getSimulationStats(simulationId) {
    const simulationData = this.activeSimulations.get(simulationId);
    
    if (!simulationData) {
      return null;
    }

    // Calculate average latency
    const relevantMetrics = this.latencyMetrics.filter(
      m => m.timestamp >= simulationData.startTime && m.timestamp <= simulationData.endTime
    );
    const avgLatency = relevantMetrics.length > 0
      ? Math.round(relevantMetrics.reduce((sum, m) => sum + m.latency, 0) / relevantMetrics.length)
      : 0;

    return {
      simulationId,
      isRunning: simulationData.isRunning,
      messagesSent: simulationData.messagesSent,
      averageLatency: avgLatency,
      maxLatency: Math.max(...relevantMetrics.map(m => m.latency), 0),
      duration: simulationData.endTime - simulationData.startTime,
      publisherCount: simulationData.publisherIds.length,
      subscriberCount: simulationData.subscriberIds.length
    };
  }

  /**
   * Get all active simulations
   */
  getAllSimulations() {
    const sims = [];
    this.activeSimulations.forEach((data) => {
      sims.push(this.getSimulationStats(data.simulationId));
    });
    return sims;
  }

  /**
   * Clear simulation data
   */
  clearSimulation(simulationId) {
    this.activeSimulations.delete(simulationId);
    logger.info(`Simulation data cleared: ${simulationId}`);
  }
}

// Export single instance of MessageSimulator
module.exports = new MessageSimulator();
