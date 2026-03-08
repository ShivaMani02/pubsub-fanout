// Dashboard.jsx - Main dashboard page component
// Displays all monitoring panels and controls in a premium grid layout

import React, { useState } from 'react';
import Controls from '../components/Controls';
import StatsBar from '../components/StatsBar';
import EventLog from '../components/EventLog';
import FanoutCanvas from '../components/FanoutCanvas';
import LatencyChart from '../components/LatencyChart';
import PublisherPanel from '../components/PublisherPanel';

const Dashboard = ({ simState, setSimState }) => {
  return (
    <div className="main-content">
      {/* Left Column: Management */}
      <div className="column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Controls simState={simState} setSimState={setSimState} />
        <PublisherPanel simState={simState} />
      </div>

      {/* Center Column: Visualization & High-level Stats */}
      <div className="column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <StatsBar simState={simState} />
        <div className="panel visual-panel" style={{ flex: 1 }}>
          <div className="panel-title">
            <span style={{ fontSize: '18px' }}>📡</span>
            REAL-TIME FANOUT VISUALIZATION
          </div>
          <FanoutCanvas simState={simState} />
        </div>
      </div>

      {/* Right Column: Analytics & Logs */}
      <div className="column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="panel" style={{ flex: 0.6 }}>
          <div className="panel-title">
            <span style={{ fontSize: '18px' }}>📈</span>
            LATENCY ANALYSIS
          </div>
          <LatencyChart simState={simState} />
        </div>
        <div className="panel" style={{ flex: 1.4 }}>
          <div className="panel-title">
            <span style={{ fontSize: '18px' }}>📋</span>
            SYSTEM EVENT LOG
          </div>
          <EventLog simState={simState} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
