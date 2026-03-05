// broker.js - Redis-based message broker for pub/sub functionality
// Handles message publishing, subscribing, and fanout distribution

const logger = require('../config/logger');
const { getPublisherClient, getSubscriberClient } = require('../config/redis');

class MessageBroker {
  constructor() {
    // Map to store active subscribers for each topic
    this.subscribers = new Map();
    // Map to store subscription handlers
    this.subscriptionHandlers = new Map();
  }

  /**
   * Publish a message to a topic
   * Fanouts message to all subscribers
   */
  async publishMessage(topic, message) {
    try {
      const publisherClient = getPublisherClient();
      const messageString = JSON.stringify(message);

      // Publish message to Redis channel
      const receivedCount = await publisherClient.publish(topic, messageString);

      logger.debug(`Message published to topic: ${topic}`, {
        receivedCount,
        messageSize: messageString.length
      });

      return {
        success: true,
        fanoutCount: receivedCount,
        messageId: message.messageId,
        topic: topic
      };

    } catch (error) {
      logger.error('Error publishing message', error.message);
      throw new Error(`Failed to publish message: ${error.message}`);
    }
  }

  /**
   * Subscribe to a topic for incoming messages
   */
  async subscribeTopic(topic, handler) {
    try {
      const subscriberClient = getSubscriberClient();

      // If no subscription handler exists for this topic, create one
      if (!this.subscriptionHandlers.has(topic)) {
        // Setup message handler for this topic
        await subscriberClient.subscribe(topic, (message) => {
          try {
            const parsedMessage = JSON.parse(message);
            // Call all registered handlers for this topic
            const handlers = this.subscriptionHandlers.get(topic) || [];
            handlers.forEach(h => h(parsedMessage));
          } catch (error) {
            logger.error(`Error processing message from topic ${topic}`, error.message);
          }
        });

        // Initialize handlers array for this topic
        this.subscriptionHandlers.set(topic, []);
      }

      // Register the handler function
      const handlers = this.subscriptionHandlers.get(topic);
      handlers.push(handler);

      // Track subscribers count
      if (!this.subscribers.has(topic)) {
        this.subscribers.set(topic, 0);
      }
      this.subscribers.set(topic, this.subscribers.get(topic) + 1);

      logger.debug(`Subscribed to topic: ${topic}`, {
        subscriberCount: this.subscribers.get(topic)
      });

      return {
        success: true,
        topic: topic,
        subscriberCount: this.subscribers.get(topic)
      };

    } catch (error) {
      logger.error('Error subscribing to topic', error.message);
      throw new Error(`Failed to subscribe to topic: ${error.message}`);
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeTopic(topic, handler) {
    try {
      if (this.subscriptionHandlers.has(topic)) {
        // Remove specific handler
        const handlers = this.subscriptionHandlers.get(topic);
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }

        logger.debug(`Unsubscribed from topic: ${topic}`);
      }

      return {
        success: true,
        topic: topic
      };

    } catch (error) {
      logger.error('Error unsubscribing from topic', error.message);
      throw new Error(`Failed to unsubscribe from topic: ${error.message}`);
    }
  }

  /**
   * Get current subscriber count for a topic
   */
  getSubscriberCount(topic) {
    return this.subscribers.get(topic) || 0;
  }

  /**
   * Get all topics with active subscribers
   */
  getAllTopics() {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Get statistics for all topics
   */
  getTopicsStats() {
    const stats = {};
    this.subscribers.forEach((count, topic) => {
      stats[topic] = {
        topic: topic,
        subscriberCount: count,
        handlerCount: this.subscriptionHandlers.get(topic)?.length || 0
      };
    });
    return stats;
  }

  /**
   * Clear all subscriptions (for cleanup)
   */
  clearAllSubscriptions() {
    this.subscribers.clear();
    this.subscriptionHandlers.clear();
    logger.info('All subscriptions cleared');
  }
}

// Export single instance of MessageBroker
module.exports = new MessageBroker();
