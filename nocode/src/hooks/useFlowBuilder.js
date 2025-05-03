// src/hooks/useFlowBuilder.js
import { useState } from 'react';
import { NodeType } from '../components/nodes/nodeTypes';

export default function useFlowBuilder() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const addNode = (type) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      x: 200,
      y: 200 + nodes.length * 100,
      config: {}
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeClick = (node) => {
    if (node && selectedNode && node.id !== selectedNode.id) {
      handleConnectNodes(selectedNode.id, node.id);
    }
    setSelectedNode(node);
  };

  const handleNodeMouseDown = (node, e) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = node.x;
    const startPosY = node.y;

    const handleMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setNodes(nodes.map(n => 
        n.id === node.id ? { ...n, x: startPosX + dx, y: startPosY + dy } : n
      ));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleConnectNodes = (fromId, toId) => {
    if (fromId === toId) return;
    
    const existingConnection = connections.find(
      conn => conn.from === fromId && conn.to === toId
    );
    
    if (!existingConnection) {
      setConnections([...connections, { from: fromId, to: toId }]);
    }
  };

  const handleDeleteConnection = (fromId, toId) => {
    setConnections(connections.filter(
      conn => !(conn.from === fromId && conn.to === toId)
    ));
  };

  const handleConfigChange = (key, value) => {
    if (!selectedNode) return;
    
    setNodes(nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          config: {
            ...node.config,
            [key]: value
          }
        };
      }
      return node;
    }));
  };

  const runFlow = () => {
    if (nodes.length === 0) return;
    
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      alert('Flow executed successfully!');
    }, 2000);
  };

  return {
    nodes,
    connections,
    selectedNode,
    isRunning,
    addNode,
    handleNodeClick,
    handleNodeMouseDown,
    handleDeleteConnection,
    handleConfigChange,
    runFlow
  };
}