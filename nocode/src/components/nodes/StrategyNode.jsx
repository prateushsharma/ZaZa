// src/components/nodes/StrategyNode.jsx
import React, { useState } from 'react';
import { Handle } from 'reactflow';
import { BsLightbulb } from 'react-icons/bs';
import '../../styles/Nodes.css';

const StrategyNode = ({ data }) => {
  const [strategyText, setStrategyText] = useState('');
  const [temperature, setTemperature] = useState('0.7');
  
  return (
    <div className="custom-node strategy-node">
      <Handle
        type="target"
        position="left"
        id="strategy-in"
        style={{ background: 'var(--accent-primary)' }}
      />
      <div className="node-header">
        <BsLightbulb className="node-icon" />
        <div className="node-title">Strategy</div>
      </div>
      <div className="node-content">
        <div className="input-group">
          <label>Writing Strategy</label>
          <textarea
            value={strategyText}
            onChange={(e) => setStrategyText(e.target.value)}
            placeholder="Enter writing instructions for the agent..."
            rows={4}
          />
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="strategy-out"
        style={{ background: 'var(--accent-primary)' }}
      />
    </div>
  );
};

export default StrategyNode;