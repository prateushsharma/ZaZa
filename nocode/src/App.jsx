// src/App.jsx
import React from 'react';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <div className="app-container">
        <Sidebar />
        <FlowCanvas />
      </div>
    </div>
  );
}

export default App;