// Message.js - MongoDB schema for storing published messages
// Stores message data with metadata like topic, publisher, and timestamp

const mongoose = require('mongoose');

/**
 * Message Schema
 * Stores all published messages with their metadata
 */
const messageSchema = new mongoose.Schema(
  {
    // Unique message identifier
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // Topic on which message was published
    topic: {
      type: String,
      required: true,
      index: true
    },

    // Partition key for routing and load balancing
    partitionKey: {
      type: String,
      default: null,
      index: true
    },

    // Partition number assigned to message
    partition: {
      type: Number,
      default: 0
    },

    // The actual message content/payload
    message: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    // Publisher session identifier
    publisher: {
      type: String,
      required: true,
      index: true
    },

    // Number of subscribers who received this message
    fanoutCount: {
      type: Number,
      default: 0
    },

    // Message delivery latency in milliseconds
    latency: {
      type: Number,
      default: 0
    },

    // Subscriber session IDs who received this message
    subscriberIds: {
      type: [String],
      default: []
    },

    // Message size in bytes
    size: {
      type: Number,
      default: 0
    },

    // Whether message was successfully processed
    processed: {
      type: Boolean,
      default: false
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
    // Specify MongoDB collection name
    collection: 'messages'
  }
);

// Create index for faster queries on createdAt for time-based filtering
messageSchema.index({ createdAt: -1 });

// Create compound index for topic and createdAt
messageSchema.index({ topic: 1, createdAt: -1 });

/**
 * Static method to create a new message
 */
messageSchema.statics.createMessage = async function(messageData) {
  try {
    const message = new this(messageData);
    return await message.save();
  } catch (error) {
    throw new Error(`Failed to create message: ${error.message}`);
  }
};

/**
 * Static method to find messages by topic
 */
messageSchema.statics.findByTopic = async function(topic, limit = 50, skip = 0) {
  try {
    return await this.find({ topic })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  } catch (error) {
    throw new Error(`Failed to find messages by topic: ${error.message}`);
  }
};

/**
 * Static method to get message count by topic
 */
messageSchema.statics.countByTopic = async function(topic) {
  try {
    return await this.countDocuments({ topic });
  } catch (error) {
    throw new Error(`Failed to count messages: ${error.message}`);
  }
};

/**
 * Instance method to update delivery status
 */
messageSchema.methods.updateDelivery = async function(subscriberIds, latency) {
  try {
    this.subscriberIds = subscriberIds;
    this.fanoutCount = subscriberIds.length;
    this.latency = latency;
    this.processed = true;
    return await this.save();
  } catch (error) {
    throw new Error(`Failed to update message delivery: ${error.message}`);
  }
};

// Create and export Message model
module.exports = mongoose.model('Message', messageSchema);
