// api.js - API routes for messaging and simulation endpoints
// Defines all REST endpoints for the pub/sub system

const express = require('express');
const router = express.Router();
const controller = require('../controllers/simController');

// Message Routes

/**
 * POST /api/messages/publish
 * Publish a message to a topic
 * Body: { topic, partitionKey?, message }
 */
router.post('/messages/publish', controller.publishMessage);

/**
 * GET /api/messages/history
 * Get message history for a topic
 * Query: topic, limit?, skip?
 */
router.get('/messages/history', controller.getMessageHistory);

// Session Routes

/**
 * GET /api/sessions/:sessionId
 * Get statistics for a specific session
 */
router.get('/sessions/:sessionId', controller.getSessionStats);

/**
 * GET /api/sessions
 * Get all active sessions
 * Query: type? (publisher or subscriber)
 */
router.get('/sessions', controller.getAllSessions);

// Simulation Routes

/**
 * POST /api/simulation/start
 * Start a new simulation
 * Body: { publishers?, subscribers?, duration?, messageRate? }
 */
router.post('/simulation/start', controller.startSimulation);

/**
 * POST /api/simulation/stop/:simulationId
 * Stop a running simulation
 */
router.post('/simulation/stop/:simulationId', controller.stopSimulation);

/**
 * GET /api/simulation/stats/:simulationId
 * Get statistics for a simulation
 */
router.get('/simulation/stats/:simulationId', controller.getSimulationStats);

// Stats Routes

/**
 * GET /api/stats/topics
 * Get statistics for all topics
 */
router.get('/stats/topics', controller.getTopicsStats);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
