// socket.js - Socket.io client setup and event handling
// Manages WebSocket connection to backend server

import io from 'socket.io-client';

let socket = null;

/**
 * Connect to Socket.io server
 */
export const connectSocket = () => {
  if (socket) return socket;

  const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✓ Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('✗ Disconnected from server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

/**
 * Disconnect from Socket.io server
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get Socket.io instance
 */
export const getSocket = () => {
  if (!socket) {
    connectSocket();
  }
  return socket;
};

/**
 * Subscribe to a topic
 */
export const subscribeTopic = (topic) => {
  const socket = getSocket();
  socket.emit('topic:subscribe', { topic });
};

/**
 * Unsubscribe from a topic
 */
export const unsubscribeTopic = (topic) => {
  const socket = getSocket();
  socket.emit('topic:unsubscribe', { topic });
};

/**
 * Publish a custom message
 */
export const publishCustomMessage = (topic, payload) => {
  const socket = getSocket();
  socket.emit('message:publish', { topic, payload });
};

/**
 * Listen for new messages
 */
export const onNewMessage = (handler) => {
  const socket = getSocket();
  socket.on('message:new', handler);
};

/**
 * Listen for stats updates
 */
export const onStatsUpdate = (handler) => {
  const socket = getSocket();
  socket.on('stats:update', handler);
};
