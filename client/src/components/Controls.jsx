// Controls.jsx - Simulation control component
// Handles starting/stopping simulations with high-premium UI feedback

import React, { useState } from 'react';
import * as api from '../services/api';

const Controls = ({ simState, setSimState }) => {
  const [config, setConfig] = useState({
    publishers: 3,
    subscribers: 10,
    duration: 60000,
    messageRate: 5
  });

  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleStartSimulation = async () => {
    try {
      setFeedback('⚙️ Initializing Cluster...');
      const result = await api.startSimulation(config);

      if (result.success) {
        setIsRunning(true);
        setFeedback(`✓ Simulation Active (${result.simulationId})`);
        setSimState(prev => ({
          ...prev,
          isRunning: true,
          simulationId: result.simulationId
        }));

        setTimeout(() => {
          handleStopSimulation();
        }, config.duration);
      }
    } catch (error) {
      setFeedback(`✗ Fault: ${error.message}`);
    }
  };

  const handleStopSimulation = async () => {
    try {
      if (!simState.simulationId) return;
      setFeedback('⏹️ Halting Services...');
      const result = await api.stopSimulation(simState.simulationId);

      if (result.success) {
        setIsRunning(false);
        setFeedback('✓ Cluster Idle');
        setSimState(prev => ({ ...prev, isRunning: false }));
      }
    } catch (error) {
      setFeedback(`✗ Fault: ${error.message}`);
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <span style={{ fontSize: '18px' }}>⚙️</span>
        CLUSTER MANAGEMENT
      </div>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label>Active Publishers</label>
        <input
          type="number"
          min="1"
          max="20"
          value={config.publishers}
          onChange={(e) => setConfig({ ...config, publishers: parseInt(e.target.value) })}
          disabled={isRunning}
        />

        <label>Subscriber Nodes</label>
        <input
          type="number"
          min="1"
          max="100"
          value={config.subscribers}
          onChange={(e) => setConfig({ ...config, subscribers: parseInt(e.target.value) })}
          disabled={isRunning}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label>Duration (ms)</label>
            <input
              type="number"
              value={config.duration}
              onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
              disabled={isRunning}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Rate (msg/s)</label>
            <input
              type="number"
              value={config.messageRate}
              onChange={(e) => setConfig({ ...config, messageRate: parseInt(e.target.value) })}
              disabled={isRunning}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={handleStartSimulation}
          disabled={isRunning}
          style={{ flex: 1.5 }}
        >
          ▶️ DEPLOY CLUSTER
        </button>
        <button
          onClick={handleStopSimulation}
          disabled={!isRunning}
          className="danger"
          style={{ flex: 1 }}
        >
          ⏹️ HALT
        </button>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status</span>
        <span className={`badge ${isRunning ? 'badge-success' : 'badge-danger'}`}>
          {isRunning ? '● ACTIVE' : '○ IDLE'}
        </span>
      </div>

      {feedback && (
        <div
          className="feedback-pill"
          style={{
            marginTop: '12px',
            fontSize: '11px',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            color: feedback.includes('✗') ? 'var(--danger)' : 'var(--success)',
            textAlign: 'center'
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
};

export default Controls;
