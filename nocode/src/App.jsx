// src/App.jsx
import React, { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { BsRobot, BsDiagram3 } from 'react-icons/bs';
import './styles/App.css';

function App() {
  const [view, setView] = useState('flowBuilder'); // 'flowBuilder' or 'dashboard'
  
  return (
    <div className="app">
      <div className="app-header">
        <div className="app-title">DeFAI Agent Deployer ⚡</div>
        <div className="view-switcher">
          <button 
            className={`view-btn ${view === 'flowBuilder' ? 'active' : ''}`}
            onClick={() => setView('flowBuilder')}
          >
            <BsDiagram3 /> Flow Builder
          </button>
          <button 
            className={`view-btn ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <BsRobot /> Dashboard
          </button>
        </div>
      </div>
      
      <div className="app-container">
        {view === 'flowBuilder' ? (
          <>
            <Sidebar />
            <FlowCanvas onDeploy={() => setView('dashboard')} />
          </>
        ) : (
          <Dashboard onSwitchToBuilder={() => setView('flowBuilder')} />
        )}
      </div>
    </div>
  );
}

export default App;