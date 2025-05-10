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
import { 
  BsPlay, 
  BsSave, 
  BsTrash, 
  BsZoomIn, 
  BsZoomOut,
  BsArrowsFullscreen,
  BsCodeSlash
} from 'react-icons/bs';
import '../styles/FlowCanvas.css';
import { useAgentStore } from '../store/agentStore';

const FlowCanvas = ({ onDeploy }) => {
  // Initial flow state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { createAgent } = useAgentStore();
  
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

  // Function to handle deployment of the flow
  const handleDeploy = async () => {
    // First, check if there are nodes in the flow
    if (nodes.length === 0) {
      alert('Cannot deploy an empty flow. Please add some nodes first.');
      return;
    }
    
    // Check if there's an agent node
    const hasAgentNode = nodes.some(node => node.type === 'agentNode');
    if (!hasAgentNode) {
      alert('Your flow must include at least one Agent node to deploy.');
      return;
    }

    // Prompt for a name if not already set
    if (!flowName) {
      setShowNamePrompt(true);
      return;
    }
    
    // Start deployment process
    setIsDeploying(true);
    
    try {
      // Create a new agent based on the flow
      const flow = { nodes, edges };
      await createAgent({
        name: flowName,
        flowData: flow
      });
      
      // Wait a moment to show the deploying state
      setTimeout(() => {
        setIsDeploying(false);
        // Navigate to dashboard
        onDeploy();
      }, 2000);
    } catch (error) {
      console.error('Error deploying flow:', error);
      alert('Failed to deploy the flow. Please try again.');
      setIsDeploying(false);
    }
  };

  // Handle saving the flow
  const handleSave = () => {
    if (nodes.length === 0) {
      alert('There is nothing to save. Please add some nodes first.');
      return;
    }
    
    // If no name is set, prompt for one
    if (!flowName) {
      setShowNamePrompt(true);
      return;
    }
    
    // Save flow to localStorage
    const flow = { nodes, edges, name: flowName };
    const savedFlows = JSON.parse(localStorage.getItem('savedFlows') || '[]');
    
    // Check if a flow with this name already exists
    const existingIndex = savedFlows.findIndex(f => f.name === flowName);
    
    if (existingIndex >= 0) {
      // Update existing flow
      savedFlows[existingIndex] = flow;
    } else {
      // Add new flow
      savedFlows.push(flow);
    }
    
    localStorage.setItem('savedFlows', JSON.stringify(savedFlows));
    alert('Flow saved successfully!');
  };

  // Handle clearing the canvas
  const handleClear = () => {
    if (nodes.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear the canvas? All unsaved work will be lost.')) {
      setNodes([]);
      setEdges([]);
      setFlowName('');
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  };

  return (
    <div className="flow-canvas" ref={reactFlowWrapper}>
      {showNamePrompt && (
        <div className="name-prompt-overlay">
          <div className="name-prompt">
            <h3>Name Your Flow</h3>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Enter a name for your flow"
            />
            <div className="name-prompt-buttons">
              <button 
                onClick={() => setShowNamePrompt(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (flowName.trim() === '') {
                    alert('Please enter a valid name.');
                    return;
                  }
                  setShowNamePrompt(false);
                }}
                className="save-btn"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flow-toolbar">
        <div className="flow-name">
          {flowName ? (
            <span>{flowName}</span>
          ) : (
            <button onClick={() => setShowNamePrompt(true)}>Name Flow</button>
          )}
        </div>
        <div className="tool-buttons">
          <button onClick={handleSave} title="Save Flow">
            <BsSave /> Save
          </button>
          <button onClick={handleClear} title="Clear Canvas">
            <BsTrash /> Clear
          </button>
          <button onClick={handleZoomIn} title="Zoom In">
            <BsZoomIn />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out">
            <BsZoomOut />
          </button>
          <button onClick={handleFitView} title="Fit View">
            <BsArrowsFullscreen />
          </button>
          <button 
            className="deploy-btn"
            onClick={handleDeploy}
            disabled={isDeploying}
            title="Deploy Flow"
          >
            {isDeploying ? (
              <span className="deploying">Deploying...</span>
            ) : (
              <>
                <BsPlay /> Deploy
              </>
            )}
          </button>
        </div>
      </div>
      
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