// Session.js - MongoDB schema for tracking publisher and subscriber sessions
// Maintains session information and statistics

const mongoose = require('mongoose');

/**
 * Session Schema
 * Tracks active sessions for publishers and subscribers
 */
const sessionSchema = new mongoose.Schema(
  {
    // Unique session identifier
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // Type of session: 'publisher' or 'subscriber'
    type: {
      type: String,
      enum: ['publisher', 'subscriber'],
      required: true,
      index: true
    },

    // IP address of the session
    ipAddress: {
      type: String,
      default: null
    },

    // User agent or client information
    userAgent: {
      type: String,
      default: null
    },

    // Topics this session is interested in
    topics: {
      type: [String],
      default: []
    },

    // Total messages published by this session
    messageCount: {
      type: Number,
      default: 0
    },

    // Total messages received by this session (for subscribers)
    receivedCount: {
      type: Number,
      default: 0
    },

    // Average latency for this session in milliseconds
    avgLatency: {
      type: Number,
      default: 0
    },

    // Maximum recorded latency in milliseconds
    maxLatency: {
      type: Number,
      default: 0
    },

    // Minimum recorded latency in milliseconds
    minLatency: {
      type: Number,
      default: Number.MAX_VALUE
    },

    // Total bytes processed in this session
    totalBytes: {
      type: Number,
      default: 0
    },

    // Whether session is currently active
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    // Session metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
    // Specify MongoDB collection name
    collection: 'sessions'
  }
);

// Create index for finding active sessions
sessionSchema.index({ isActive: 1, type: 1 });

// Create index for session type queries
sessionSchema.index({ type: 1, createdAt: -1 });

/**
 * Static method to create a new session
 */
sessionSchema.statics.createSession = async function(sessionData) {
  try {
    const session = new this(sessionData);
    return await session.save();
  } catch (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }
};

/**
 * Static method to find active sessions by type
 */
sessionSchema.statics.findActiveSessions = async function(type = null) {
  try {
    const query = { isActive: true };
    if (type) {
      query.type = type;
    }
    return await this.find(query).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Failed to find active sessions: ${error.message}`);
  }
};

/**
 * Static method to get session statistics
 */
sessionSchema.statics.getSessionStats = async function(sessionId) {
  try {
    return await this.findOne({ sessionId });
  } catch (error) {
    throw new Error(`Failed to get session stats: ${error.message}`);
  }
};

/**
 * Instance method to add a topic to session
 */
sessionSchema.methods.addTopic = async function(topic) {
  try {
    if (!this.topics.includes(topic)) {
      this.topics.push(topic);
    }
    return await this.save();
  } catch (error) {
    throw new Error(`Failed to add topic: ${error.message}`);
  }
};

/**
 * Instance method to remove a topic from session
 */
sessionSchema.methods.removeTopic = async function(topic) {
  try {
    this.topics = this.topics.filter(t => t !== topic);
    return await this.save();
  } catch (error) {
    throw new Error(`Failed to remove topic: ${error.message}`);
  }
};

/**
 * Instance method to update message statistics
 */
sessionSchema.methods.updateStats = async function(latency, messageSize, isReceive = false) {
  try {
    // Update message counters
    if (isReceive) {
      this.receivedCount += 1;
    } else {
      this.messageCount += 1;
    }

    // Update latency statistics
    this.maxLatency = Math.max(this.maxLatency, latency);
    this.minLatency = Math.min(this.minLatency, latency);

    // Recalculate average latency
    const totalMessages = this.messageCount + this.receivedCount;
    const totalLatency = this.avgLatency * totalMessages + latency;
    this.avgLatency = Math.round(totalLatency / (totalMessages + 1));

    // Update total bytes
    this.totalBytes += messageSize;

    return await this.save();
  } catch (error) {
    throw new Error(`Failed to update stats: ${error.message}`);
  }
};

/**
 * Instance method to mark session as inactive
 */
sessionSchema.methods.deactivate = async function() {
  try {
    this.isActive = false;
    return await this.save();
  } catch (error) {
    throw new Error(`Failed to deactivate session: ${error.message}`);
  }
};

// Create and export Session model
module.exports = mongoose.model('Session', sessionSchema);
