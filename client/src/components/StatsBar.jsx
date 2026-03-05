// StatsBar.jsx - Statistics bar component
// Displays key metrics and statistics

import React, { useMemo } from 'react';

const StatsBar = ({ simState }) => {
  // Calculate statistics based on current state
  const stats = useMemo(() => {
    const topicsCount = Object.keys(simState.stats || {}).length;
    const totalSubscribers = Object.values(simState.stats || {}).reduce(
      (sum, topic) => sum + (topic.subscriberCount || 0),
      0
    );

    return {
      topicCount: topicsCount,
      totalSubscribers,
      messageCount: simState.messageCount || 0,
      avgLatency: Math.round(simState.averageLatency || 0)
    };
  }, [simState]);

  return (
    <div className="grid-3" style={{ margin: 0 }}>
      {/* Topics count */}
      <div className="stat-card">
        <div className="stat-card-title">Topics</div>
        <div className="stat-card-value">{stats.topicCount}</div>
      </div>

      {/* Subscribers count */}
      <div className="stat-card">
        <div className="stat-card-title">Subscribers</div>
        <div className="stat-card-value">{stats.totalSubscribers}</div>
      </div>

      {/* Average latency */}
      <div className="stat-card">
        <div className="stat-card-title">Avg Latency</div>
        <div className="stat-card-value">{stats.avgLatency}ms</div>
      </div>
    </div>
  );
};

export default StatsBar;
