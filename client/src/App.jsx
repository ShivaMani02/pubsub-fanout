// App.jsx - Main React application component
// Displays dashboard with controls, logs, charts, and statistics

import React, { useState, useEffect, createContext, useCallback } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import { connectSocket, disconnectSocket, getSocket } from './services/socket';
import SimContext from './context/SimContext';

function App() {
  // State for global simulation context
  const [simState, setSimState] = useState({
    isRunning: false,
    messageCount: 0,
    subscriberCount: 0,
    publisherCount: 0,
    averageLatency: 0,
    topics: [],
    activeMessages: [],
    stats: {}
  });

  // Initialize Socket.io connection on component mount
  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    // Listen for stats updates
    socket.on('stats:update', (data) => {
      setSimState(prev => ({
        ...prev,
        stats: data.topics || {},
        topics: Object.keys(data.topics || {})
      }));
    });

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SimContext.Provider value={{ simState, setSimState }}>
      <div className="container">
        <div className="header">
          <h1>📡 PubSub Fanout System</h1>
          <p>Real-time message distribution with performance monitoring</p>
        </div>
        <Dashboard simState={simState} setSimState={setSimState} />
      </div>
    </SimContext.Provider>
  );
}

export default App;
