// PartitionHeatmap.jsx - Partition load heatmap visualization
// Shows load distribution across partitions

import React, { useMemo } from 'react';

const PartitionHeatmap = ({ simState }) => {
  // Calculate partition loads
  const partitionData = useMemo(() => {
    const partitions = [0, 1, 2, 3];
    const topicStats = simState.stats || {};

    return partitions.map(partition => ({
      id: partition,
      load: Math.floor(Math.random() * 100), // Simulate load
      subscribers: Object.values(topicStats).reduce(
        (sum, topic) => sum + (topic.subscriberCount || 0),
        0
      ) / partitions.length
    }));
  }, [simState]);

  return (
    <div className="grid-2">
      {partitionData.map((partition) => (
        <div
          key={partition.id}
          style={{
            padding: '15px',
            borderRadius: '8px',
            background: `rgba(102, 126, 234, ${partition.load / 100})`,
            color: partition.load > 50 ? 'white' : '#333',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '12px', marginBottom: '8px' }}>
            Partition {partition.id}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            {partition.load}%
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {Math.round(partition.subscribers)} subscribers
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartitionHeatmap;
