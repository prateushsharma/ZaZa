// src/components/FlowCanvas.jsx
import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from './nodes/NodeTypes';
import '../styles/FlowCanvas.css';

const FlowCanvas = () => {
  // Initial flow state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Initialize React Flow
  const onInit = (instance) => {
    setReactFlowInstance(instance);
  };
  
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
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }, eds));
  }, []);

  // Function to add a child node to an agent node
// Update the onAddChildNode function in FlowCanvas.jsx

const onAddChildNode = useCallback((parentId, childType) => {
  // Find parent node
  const parentNode = nodes.find(node => node.id === parentId);
  if (!parentNode) return;
  
  // Get parent position
  const parentX = parentNode.position.x;
  const parentY = parentNode.position.y;
  const parentWidth = 500; // Width of agent node
  
  // Determine offset for child node based on type
  let offsetX = 0;
  if (childType === 'modelNode') offsetX = -parentWidth/3;
  else if (childType === 'memoryNode') offsetX = 0;
  else if (childType === 'toolNode') offsetX = parentWidth/3;
  
  // Calculate position for child node (directly below parent)
  const childX = parentX + offsetX;
  const childY = parentY + 250; // Position below the parent node
  
  // Create new child node
  const newChildNode = {
    id: `${childType}-${Date.now()}`,
    type: childType,
    position: { x: childX, y: childY },
    data: { 
      label: childType.replace('Node', ''),
      parentId: parentId
    },
  };
  
  // Create edge connecting parent to child with dashed line
  const newEdge = {
    id: `e-${parentId}-${newChildNode.id}`,
    source: parentId,
    sourceHandle: childType.replace('Node', '-out'), // Match the handle ID in AgentNode
    target: newChildNode.id,
    targetHandle: childType.replace('Node', '-in'), // Match the handle ID in child node
    type: 'smoothstep',
    style: { 
      strokeWidth: 2, 
      stroke: '#8C9EFF',
      strokeDasharray: '5,5' // Creates dashed line
    }
  };
  
  // Update nodes and edges
  setNodes((nds) => [...nds, newChildNode]);
  setEdges((eds) => [...eds, newEdge]);
}, [nodes]);

  // Handle dropping new nodes onto the canvas
  const onDrop = useCallback((event) => {
    event.preventDefault();
    
    if (!reactFlowInstance) return;
    
    const nodeType = event.dataTransfer.getData('application/reactflow');
    
    if (!nodeType) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Create a new node based on the dropped type
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: { 
        label: nodeType.replace('Node', ''),
        onAddChildNode: nodeType === 'agentNode' ? onAddChildNode : undefined,
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, onAddChildNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="flow-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        deleteKeyCode="Delete"
        snapToGrid={true}
        snapGrid={[15, 15]}
        fitView
      >
        <Background color="#444" gap={16} variant="dots" />
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