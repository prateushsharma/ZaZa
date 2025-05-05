// src/components/nodes/AgentNode.jsx
import React, { useState } from 'react';
import { Handle } from 'reactflow';
import { BsRobot } from 'react-icons/bs';
import '../../styles/Nodes.css';

const AgentNode = ({ data }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  return (
    <div className="custom-node agent-node">
      <Handle
        type="target"
        position="left"
        id="agent-in"
        style={{ background: 'var(--accent-primary)' }}
      />
      <div className="node-header">
        <BsRobot className="node-icon" />
        <div className="node-title">AI Agent</div>
      </div>
      <div className="node-content">
        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter agent name"
          />
        </div>
        <div className="input-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter agent description"
            rows={3}
          />
        </div>
      </div>
      
      {/* Connection points at the bottom with no labels */}
      <div className="connection-points">
        {/* Left connection point */}
        <Handle
          type="source"
          position="bottom"
          id="model-connect"
          style={{ 
            left: '25%',
            background: 'var(--accent-primary)' 
          }}
        />
        
        {/* Middle connection point */}
        <Handle
          type="source"
          position="bottom"
          id="memory-connect"
          style={{ 
            left: '50%',
            background: 'var(--accent-primary)' 
          }}
        />
        
        {/* Right connection point */}
        <Handle
          type="source"
          position="bottom"
          id="tool-connect"
          style={{ 
            left: '75%',
            background: 'var(--accent-primary)' 
          }}
        />
      </div>
      
      <Handle
        type="source"
        position="right"
        id="agent-out"
        style={{ background: 'var(--accent-primary)' }}
      />
    </div>
  );
};

export default AgentNode;