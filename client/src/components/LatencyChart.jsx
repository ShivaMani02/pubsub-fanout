// LatencyChart.jsx - Latency performance chart component
// Visualizes message processing time using a high-premium, animated bar chart

import React, { useState, useEffect } from 'react';
import { getSocket } from '../services/socket';

const LatencyChart = ({ simState }) => {
  const [latencies, setLatencies] = useState([]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      const latency = message.latency || Math.floor(Math.random() * 20 + 10); // Simulated if not present
      setLatencies(prev => [...prev, latency].slice(-24)); // Keep last 24 measurements
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, []);

  const stats = {
    max: latencies.length > 0 ? Math.max(...latencies) : 0,
    avg: latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0
  };

  const maxChartValue = Math.max(stats.max, 100);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Quick stats overlay */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PEAK:</span>
          <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 'bold' }}>{stats.max}ms</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AVG:</span>
          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>{stats.avg}ms</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {latencies.map((latency, idx) => {
          const height = (latency / maxChartValue) * 100;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: `${height}%`,
                background: latency > stats.avg * 1.5 ? 'var(--danger)' : 'linear-gradient(to top, var(--primary), var(--secondary))',
                borderRadius: '4px 4px 0 0',
                opacity: 0.6 + (idx / latencies.length) * 0.4,
                boxShadow: latency > stats.avg * 1.5 ? '0 0 10px rgba(244, 63, 94, 0.4)' : 'none',
                transition: 'height 0.3s ease-out'
              }}
              title={`${latency}ms`}
            />
          );
        })}
        {latencies.length === 0 && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '10px', letterSpacing: '0.2em' }}>
            NO DATA STREAM
          </div>
        )}
      </div>

      {/* Axis Info */}
      <div style={{ marginTop: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.2)', textAlign: 'right' }}>
        T_WINDOW: 24_MEASUREMENTS
      </div>
    </div>
  );
};

export default LatencyChart;
