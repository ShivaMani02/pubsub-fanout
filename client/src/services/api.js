// api.js - HTTP API client for REST endpoints
// Handles communication with backend via HTTP

import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include session ID
apiClient.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}`;
  localStorage.setItem('sessionId', sessionId);
  config.headers['X-Session-ID'] = sessionId;
  return config;
});

// ========== Message Endpoints ==========

/**
 * Publish a message to a topic
 */
export const publishMessage = async (topic, message, partitionKey) => {
  try {
    const response = await apiClient.post('/messages/publish', {
      topic,
      message,
      partitionKey
    });
    return response.data;
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
};

/**
 * Get message history for a topic
 */
export const getMessageHistory = async (topic, limit = 50, skip = 0) => {
  try {
    const response = await apiClient.get('/messages/history', {
      params: { topic, limit, skip }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching message history:', error);
    throw error;
  }
};

// ========== Session Endpoints ==========

/**
 * Get statistics for a session
 */
export const getSessionStats = async (sessionId) => {
  try {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching session stats:', error);
    throw error;
  }
};

/**
 * Get all active sessions
 */
export const getAllSessions = async (type) => {
  try {
    const response = await apiClient.get('/sessions', {
      params: { type }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// ========== Simulation Endpoints ==========

/**
 * Start a simulation
 */
export const startSimulation = async (config = {}) => {
  try {
    const response = await apiClient.post('/simulation/start', {
      publishers: config.publishers || 3,
      subscribers: config.subscribers || 10,
      duration: config.duration || 60000,
      messageRate: config.messageRate || 5
    });
    return response.data;
  } catch (error) {
    console.error('Error starting simulation:', error);
    throw error;
  }
};

/**
 * Stop a simulation
 */
export const stopSimulation = async (simulationId) => {
  try {
    const response = await apiClient.post(`/simulation/stop/${simulationId}`);
    return response.data;
  } catch (error) {
    console.error('Error stopping simulation:', error);
    throw error;
  }
};

/**
 * Get simulation statistics
 */
export const getSimulationStats = async (simulationId) => {
  try {
    const response = await apiClient.get(`/simulation/stats/${simulationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching simulation stats:', error);
    throw error;
  }
};

// ========== Stats Endpoints ==========

/**
 * Get statistics for all topics
 */
export const getTopicsStats = async () => {
  try {
    const response = await apiClient.get('/stats/topics');
    return response.data;
  } catch (error) {
    console.error('Error fetching topics stats:', error);
    throw error;
  }
};

export default apiClient;
