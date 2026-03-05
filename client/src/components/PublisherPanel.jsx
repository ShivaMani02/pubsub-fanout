// PublisherPanel.jsx - Publisher message panel component
// Allows manual message publishing to topics

import React, { useState } from 'react';
import * as api from '../services/api';

const PublisherPanel = ({ simState }) => {
  // State for publisher form
  const [formData, setFormData] = useState({
    topic: 'test-topic',
    message: JSON.stringify({ type: 'test', message: 'Hello World' }, null, 2),
    partitionKey: ''
  });

  const [feedback, setFeedback] = useState('');

  /**
   * Handle message publishing
   */
  const handlePublishMessage = async () => {
    try {
      if (!formData.topic || !formData.message) {
        setFeedback('✗ Topic and message are required');
        return;
      }

      setFeedback('Publishing...');

      // Parse JSON message
      let messageParsed;
      try {
        messageParsed = JSON.parse(formData.message);
      } catch (e) {
        setFeedback('✗ Invalid JSON in message');
        return;
      }

      // Publish via API
      const result = await api.publishMessage(
        formData.topic,
        messageParsed,
        formData.partitionKey || undefined
      );

      if (result.success) {
        setFeedback(`✓ Message published (ID: ${result.messageId})`);
        // Clear form after success
        setTimeout(() => {
          setFormData({
            topic: 'test-topic',
            message: JSON.stringify({ type: 'test', message: 'Hello World' }, null, 2),
            partitionKey: ''
          });
          setFeedback('');
        }, 2000);
      }
    } catch (error) {
      setFeedback(`✗ Error: ${error.message}`);
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">📤 Publish Message</div>

      {/* Form inputs */}
      <div style={{ marginBottom: '15px' }}>
        <label>Topic Name</label>
        <input
          type="text"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          placeholder="e.g., orders, notifications"
        />

        <label>Partition Key (Optional)</label>
        <input
          type="text"
          value={formData.partitionKey}
          onChange={(e) => setFormData({ ...formData, partitionKey: e.target.value })}
          placeholder="e.g., user123"
        />

        <label>Message (JSON)</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows="6"
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
          placeholder='{"type": "example", "data": "value"}'
        />
      </div>

      {/* Publish button */}
      <button
        onClick={handlePublishMessage}
        style={{ width: '100%', marginBottom: '10px' }}
      >
        🚀 Publish Message
      </button>

      {/* Feedback message */}
      {feedback && (
        <div className={`message ${feedback.includes('✗') ? 'message-error' : 'message-success'}`}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default PublisherPanel;
