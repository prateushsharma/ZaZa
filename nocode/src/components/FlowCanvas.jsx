// src/components/FlowCanvas.jsx
import { useState, useRef } from 'react';
import StartNode from './nodes/StartNode';
import PaymentNode from './nodes/PaymentNode';
import NotificationNode from './nodes/NotificationNode';
import ConnectionLine from './ConnectionLine';
import '../App.css';

export default function FlowCanvas({
  nodes,
  connections,
  selectedNode,
  onNodeClick,
  onNodeMouseDown,
  onMouseUp,
  onConnectNodes,
  onDeleteConnection,
  onRunFlow,
  isRunning
}) {
  const canvasRef = useRef(null);

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onNodeClick(null);
    }
  };

  const renderNode = (node) => {
    const commonProps = {
      node,
      onClick: () => onNodeClick(node),
      onMouseDown: (e) => onNodeMouseDown(node, e),
      selected: selectedNode?.id === node.id
    };

    switch (node.type) {
      case 'start':
        return <StartNode key={node.id} {...commonProps} />;
      case 'payment':
        return <PaymentNode key={node.id} {...commonProps} />;
      case 'notification':
        return <NotificationNode key={node.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="canvas-container" ref={canvasRef} onClick={handleCanvasClick}>
      <svg className="connection-layer">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
          </marker>
        </defs>
        {connections.map(conn => (
          <ConnectionLine 
            key={`${conn.from}-${conn.to}`}
            connection={conn}
            nodes={nodes}
            onDelete={onDeleteConnection}
          />
        ))}
      </svg>

      {nodes.map(renderNode)}

      {selectedNode && (
        <div className="connection-indicator">
          Click another node to connect from: {selectedNode.type}
        </div>
      )}

      <button 
        className="run-button"
        onClick={onRunFlow}
        disabled={isRunning || nodes.length === 0}
      >
        {isRunning ? 'Running...' : 'Run Flow'}
      </button>
    </div>
  );
}