// src/components/nodes/MemoryNode.jsx
import React, { useState } from 'react';
import { Handle } from 'reactflow';
import { BsDatabase } from 'react-icons/bs';
import '../../styles/Nodes.css';

const MemoryNode = ({ data }) => {
  const memoryTypes = [
    { id: 'postgres', name: 'PostgreSQL' },
    { id: 'redis', name: 'Redis' },
    { id: 'pinecone', name: 'Pinecone' },
    { id: 'mongodb', name: 'MongoDB' }
  ];
  
  const [selectedType, setSelectedType] = useState('');
  
  return (
    <div className="custom-node memory-node">
      <Handle
        type="target"
        position="left"
        id="memory-in"
        style={{ background: 'var(--accent-primary)' }}
      />
      <div className="node-header">
        <BsDatabase className="node-icon" />
        <div className="node-title">Memory</div>
      </div>
      <div className="node-content">
        <div className="input-group">
          <label>Memory Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="select-input"
          >
            <option value="">Select a memory type</option>
            {memoryTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="memory-out"
        style={{ background: 'var(--accent-primary)' }}
      />
    </div>
  );
};

export default MemoryNode;