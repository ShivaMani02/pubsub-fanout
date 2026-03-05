// LatencyChart.jsx - Latency performance chart component
// Shows latency metrics over time

import React, { useState, useEffect } from 'react';
import { getSocket } from '../services/socket';

const LatencyChart = ({ simState }) => {
  // State for latency data
  const [latencies, setLatencies] = useState([]);

  // Listen for latency updates
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      const latency = message.latency || 0;
      setLatencies(prev => [...prev, latency].slice(-30)); // Keep last 30 measurements
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, []);

  // Calculate statistics
  const stats = {
    max: latencies.length > 0 ? Math.max(...latencies) : 0,
    min: latencies.length > 0 ? Math.min(...latencies) : 0,
    avg: latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0
  };

  // Create simple bar chart (ASCII-like)
  const maxLatency = Math.max(stats.max, 100);
  const chartHeight = 100;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Statistics */}
      <div className="grid-3" style={{ marginBottom: '15px', gap: '10px' }}>
        <div style={{
          padding: '10px',
          background: '#f0f4ff',
          border: '1px solid #667eea',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#666' }}>Average</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
            {stats.avg}ms
          </div>
        </div>
        <div style={{
          padding: '10px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#666' }}>Maximum</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff9800' }}>
            {stats.max}ms
          </div>
        </div>
        <div style={{
          padding: '10px',
          background: '#d4edda',
          border: '1px solid #28a745',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#666' }}>Minimum</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
            {stats.min}ms
          </div>
        </div>
      </div>

      {/* Simple bar chart */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
        {latencies.map((latency, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: `${(latency / maxLatency) * 100}%`,
              background: latency > stats.avg ? '#ff6b6b' : '#667eea',
              borderRadius: '2px 2px 0 0',
              minHeight: '2px'
            }}
            title={`${latency}ms`}
          />
        ))}
      </div>
    </div>
  );
};

export default LatencyChart;
