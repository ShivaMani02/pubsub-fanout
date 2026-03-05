// Dashboard.jsx - Main dashboard page component
// Displays all monitoring panels and controls

import React, { useEffect, useState } from 'react';
import Controls from '../components/Controls';
import StatsBar from '../components/StatsBar';
import EventLog from '../components/EventLog';
import FanoutCanvas from '../components/FanoutCanvas';
import LatencyChart from '../components/LatencyChart';
import PublisherPanel from '../components/PublisherPanel';
import PartitionHeatmap from '../components/PartitionHeatmap';

const Dashboard = ({ simState, setSimState }) => {
  // State for UI
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      {/* Left Panel - Controls and Publisher */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Controls simState={simState} setSimState={setSimState} />
        <PublisherPanel simState={simState} />
      </div>

      {/* Center Panel - Visualization and Logs */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <StatsBar simState={simState} />
        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-title">📊 Message Flow Visualization</div>
          <FanoutCanvas simState={simState} />
        </div>
      </div>

      {/* Right Panel - Charts and Logs */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-title">📈 Latency Analysis</div>
          <LatencyChart simState={simState} />
        </div>
        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-title">📋 Event Log</div>
          <EventLog simState={simState} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
