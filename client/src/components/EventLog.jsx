// EventLog.jsx - Real-time system log component
// Displays incoming messages and events in a sleek terminal-style interface

import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';

const EventLog = ({ simState }) => {
  const [events, setEvents] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      setEvents(prev => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'message',
          timestamp,
          topic: message.topic,
          message
        },
        ...prev
      ].slice(0, 50)); // Keep only last 50 for performance
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, []);

  const handleClearLog = () => {
    setEvents([]);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with clear button */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          BUFFER: {events.length}/50
        </span>
        <button
          onClick={handleClearLog}
          style={{
            padding: '6px 14px',
            fontSize: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'none',
            color: 'var(--text-muted)'
          }}
        >
          FLUSH DATA
        </button>
      </div>

      {/* Terminal container */}
      <div className="event-log-container">
        {events.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.3, fontStyle: 'italic' }}>
            _ System idle. Waiting for incoming data streams...
          </div>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className="log-entry"
            >
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginRight: '8px' }}>
                [{event.timestamp}]
              </span>
              <span style={{ color: 'var(--secondary)', marginRight: '8px' }}>
                {event.topic.toUpperCase()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                {event.message.messageId.split('_')[1]}
              </span>
              <div style={{ marginLeft: '12px', marginTop: '4px', color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                ↳ Latency: {event.message.latency}ms | Fanout: {event.message.fanoutCount}x
              </div>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default EventLog;
