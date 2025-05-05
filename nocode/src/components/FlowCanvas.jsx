// src/components/FlowCanvas.jsx
import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from './nodes/NodeTypes';
import '../styles/FlowCanvas.css';

const FlowCanvas = () => {
  // Initial flow state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  // Handle nodes changes (add, remove, position)
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // Handle edges changes (add, remove)
  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Handle new connections between nodes
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  // Handle dropping new nodes onto the canvas
  const onDrop = useCallback((event) => {
    event.preventDefault();
    
    const nodeType = event.dataTransfer.getData('application/reactflow');
    
    if (!nodeType) return;

    const position = {
      x: event.clientX - event.target.getBoundingClientRect().left,
      y: event.clientY - event.target.getBoundingClientRect().top,
    };

    // Create a new node based on the dropped type
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: { label: nodeType.replace('Node', '') },
    };

    setNodes((nds) => nds.concat(newNode));
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="flow-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        deleteKeyCode="Delete"
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background color="#444" gap={16} />
        <Controls />
        <MiniMap
          nodeStrokeColor="#555"
          nodeColor="#333"
          nodeBorderRadius={2}
        />
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;