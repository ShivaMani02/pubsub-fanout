// PublisherPanel.jsx - Manual message publishing interface
// Allows users to send custom JSON payloads via a premium, easy-to-use form

import React, { useState } from 'react';
import * as api from '../services/api';

const PublisherPanel = ({ simState }) => {
  const [formData, setFormData] = useState({
    topic: 'orders',
    payload: '{\n  "orderId": "ORD-123",\n  "amount": 99.99,\n  "status": "pending"\n}',
    partitionKey: ''
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handlePublish = async () => {
    setLoading(true);
    setFeedback('📡 Relaying data...');

    try {
      const payloadObj = JSON.parse(formData.payload);
      const result = await api.publishMessage(formData.topic, payloadObj, formData.partitionKey);

      if (result.success) {
        setFeedback(`✓ Relayed: ${result.messageId.split('_')[1]} (Fanout: ${result.fanoutCount}x)`);
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (error) {
      setFeedback(`✗ Payload Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-title">
        <span style={{ fontSize: '18px' }}>📡</span>
        MANUAL DATA RELAY
      </div>

      <div className="form-group">
        <label>Target Topic</label>
        <input
          type="text"
          placeholder="e.g. telemetry, logs, orders"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
        />

        <label>Message Content (JSON)</label>
        <textarea
          rows="5"
          style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px' }}
          value={formData.payload}
          onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
        />

        <label>Partition Key (Optional)</label>
        <input
          type="text"
          placeholder="e.g. user_id, session_id"
          value={formData.partitionKey}
          onChange={(e) => setFormData({ ...formData, partitionKey: e.target.value })}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handlePublish}
          disabled={loading}
          style={{ width: '100%', background: 'linear-gradient(to right, var(--secondary), var(--accent))' }}
        >
          {loading ? 'TRANSMITTING...' : '🚀 PUSH TO CLUSTER'}
        </button>
      </div>

      {feedback && (
        <div style={{
          marginTop: '12px',
          fontSize: '11px',
          color: feedback.includes('✗') ? 'var(--danger)' : 'var(--success)',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default PublisherPanel;
