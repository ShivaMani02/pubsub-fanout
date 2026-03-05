// Controls.jsx - Simulation control component
// Handles starting/stopping simulations and configuration

import React, { useState } from 'react';
import * as api from '../services/api';

const Controls = ({ simState, setSimState }) => {
  // State for simulation configuration
  const [config, setConfig] = useState({
    publishers: 3,
    subscribers: 10,
    duration: 60000,
    messageRate: 5
  });

  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState('');

  /**
   * Start simulation
   */
  const handleStartSimulation = async () => {
    try {
      setFeedback('Starting simulation...');
      const result = await api.startSimulation(config);

      if (result.success) {
        setIsRunning(true);
        setFeedback(`✓ Simulation started (ID: ${result.simulationId})`);
        setSimState(prev => ({
          ...prev,
          isRunning: true,
          simulationId: result.simulationId
        }));

        // Auto-stop after duration
        setTimeout(() => {
          handleStopSimulation();
        }, config.duration);
      }
    } catch (error) {
      setFeedback(`✗ Error: ${error.message}`);
    }
  };

  /**
   * Stop simulation
   */
  const handleStopSimulation = async () => {
    try {
      if (!simState.simulationId) {
        setFeedback('No active simulation');
        return;
      }

      setFeedback('Stopping simulation...');
      const result = await api.stopSimulation(simState.simulationId);

      if (result.success) {
        setIsRunning(false);
        setFeedback(`✓ Simulation stopped`);
        setSimState(prev => ({
          ...prev,
          isRunning: false
        }));
      }
    } catch (error) {
      setFeedback(`✗ Error: ${error.message}`);
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">⚙️ Simulation Controls</div>

      {/* Configuration inputs */}
      <div style={{ marginBottom: '15px' }}>
        <label>Publishers</label>
        <input
          type="number"
          min="1"
          max="20"
          value={config.publishers}
          onChange={(e) => setConfig({ ...config, publishers: parseInt(e.target.value) })}
          disabled={isRunning}
        />

        <label>Subscribers</label>
        <input
          type="number"
          min="1"
          max="100"
          value={config.subscribers}
          onChange={(e) => setConfig({ ...config, subscribers: parseInt(e.target.value) })}
          disabled={isRunning}
        />

        <label>Duration (ms)</label>
        <input
          type="number"
          min="5000"
          max="600000"
          value={config.duration}
          onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
          disabled={isRunning}
        />

        <label>Message Rate (msg/s)</label>
        <input
          type="number"
          min="1"
          max="100"
          value={config.messageRate}
          onChange={(e) => setConfig({ ...config, messageRate: parseInt(e.target.value) })}
          disabled={isRunning}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={handleStartSimulation}
          disabled={isRunning}
          style={{ flex: 1 }}
        >
          ▶️ Start Simulation
        </button>
        <button
          onClick={handleStopSimulation}
          disabled={!isRunning}
          style={{ flex: 1, background: '#dc3545' }}
        >
          ⏹️ Stop Simulation
        </button>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className={`message ${feedback.includes('✗') ? 'message-error' : 'message-success'}`}>
          {feedback}
        </div>
      )}

      {/* Status indicator */}
      <div style={{ padding: '10px', background: '#f0f4ff', borderRadius: '6px', textAlign: 'center' }}>
        <span style={{ marginRight: '8px' }}>Status:</span>
        <span className={`badge ${isRunning ? 'badge-success' : 'badge-danger'}`}>
          {isRunning ? '🟢 Running' : '🔴 Stopped'}
        </span>
      </div>
    </div>
  );
};

export default Controls;
