// EventLog.jsx - Real-time event logging component
// Displays incoming messages and events in real-time

import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';

const EventLog = ({ simState }) => {
  // State for event log
  const [events, setEvents] = useState([]);
  const logEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  // Listen for new messages
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      const timestamp = new Date().toLocaleTimeString();
      setEvents(prev => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'message',
          timestamp,
          topic: message.topic,
          message
        },
        ...prev
      ].slice(0, 100)); // Keep only last 100 events
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, []);

  // Clear log function
  const handleClearLog = () => {
    setEvents([]);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with clear button */}
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>
          Total Events: {events.length}
        </span>
        <button
          onClick={handleClearLog}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: '#6c757d'
          }}
        >
          Clear
        </button>
      </div>

      {/* Event log container */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        borderRadius: '6px',
        background: '#f9f9f9',
        border: '1px solid #eee',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}>
        {events.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            Waiting for events...
          </div>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #eee',
                color: '#333',
                wordBreak: 'break-all'
              }}
            >
              <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                [{event.timestamp}]
              </span>
              {' '}
              <span style={{ color: '#764ba2' }}>
                {event.topic}
              </span>
              {' - '}
              {event.message.messageId}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default EventLog;
