// StatsBar.jsx - Real-time statistics display
// Displays system metrics in beautiful stats cards

import React, { useMemo } from 'react';

const StatsBar = ({ simState }) => {
  const stats = useMemo(() => {
    const topicStats = simState.stats || {};
    const topicsCount = Object.keys(topicStats).length;
    const totalSubscribers = Object.values(topicStats).reduce(
      (sum, topic) => sum + (topic.subscriberCount || 0),
      0
    );

    return {
      topicCount: topicsCount || 0,
      totalSubscribers: totalSubscribers || 0,
      messageCount: simState.messageCount || 0,
      avgLatency: Math.round(simState.averageLatency || 0)
    };
  }, [simState]);

  return (
    <div className="grid-3" style={{ margin: 0, gap: '20px' }}>
      {/* Topics count */}
      <div className="stat-card">
        <div className="stat-card-title">Active Topics</div>
        <div className="stat-card-value" style={{ borderBottom: '2px solid var(--primary)', width: 'fit-content', paddingBottom: '4px' }}>
          {stats.topicCount}
        </div>
      </div>

      {/* Subscribers count */}
      <div className="stat-card">
        <div className="stat-card-title">Global Subscribers</div>
        <div className="stat-card-value" style={{ borderBottom: '2px solid var(--secondary)', width: 'fit-content', paddingBottom: '4px' }}>
          {stats.totalSubscribers}
        </div>
      </div>

      {/* Average latency */}
      <div className="stat-card">
        <div className="stat-card-title">System Latency</div>
        <div className="stat-card-value" style={{ borderBottom: '2px solid var(--accent)', width: 'fit-content', paddingBottom: '4px' }}>
          {stats.avgLatency}<span style={{ fontSize: '12px', opacity: 0.5, marginLeft: '4px' }}>ms</span>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
