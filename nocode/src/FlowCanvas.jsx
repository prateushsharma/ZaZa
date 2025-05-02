// src/FlowCanvas.jsx
import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'editableNode',
    data: { label: 'Start Node' },
    position: { x: 250, y: 5 },
  },
];

const initialEdges = [];

function EditableNode({ id, data, selected, setNodes }) {
  const handleChange = (e) => {
    const newLabel = e.target.value;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
  };

  return (
    <div style={{ padding: 10, background: selected ? '#e6f7ff' : '#fff', border: '1px solid #ccc', borderRadius: 5 }}>
      <Handle type="target" position={Position.Top} />
      <input
        value={data.label}
        onChange={handleChange}
        style={{ width: '120px', border: '1px solid #ddd', borderRadius: '3px', padding: '2px 5px', textAlign: 'center' }}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  useEffect(() => {
    if (selectedNodeId && !nodes.some(node => node.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId]);

  const addNewNode = useCallback(() => {
    const id = (nodes.length + 1).toString();
    const newNode = {
      id,
      type: 'editableNode',
      data: { label: `Node ${id}` },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
    };
    setNodes((nds) => [...nds, newNode]);

    if (nodes.length > 0) {
      setEdges((eds) => [
        ...eds,
        { id: `e${nodes[nodes.length - 1].id}-${id}`, source: nodes[nodes.length - 1].id, target: id },
      ]);
    }
  }, [nodes, setNodes, setEdges]);

  const nodeTypes = {
    editableNode: (props) => <EditableNode {...props} setNodes={setNodes} />,
  };

  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <button onClick={addNewNode}>Add Node</button>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
            onSelectionChange={({ nodes: selectedNodes }) => {
              setSelectedNodeId(selectedNodes.length > 0 ? selectedNodes[0].id : null);
            }}
            fitView
            nodeTypes={nodeTypes}
          >
            <MiniMap />
            <Controls />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
      
      {selectedNodeId && (
        <div style={{
          width: '300px',
          borderLeft: '1px solid #ddd',
          padding: '20px',
          background: '#fff',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginTop: 0 }}>Node Settings</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Node Label:</label>
            <input
  type="text"
  value={selectedNode?.data.label || ''}
  onChange={(e) => {
    const newLabel = e.target.value;
    setNodes(nds => nds.map(node => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          data: { ...node.data, label: newLabel }
        };
      }
      return node;
    }));
  }}
  style={{
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  }}
/>
          </div>
          {/* Add more node settings here */}
        </div>
      )}
    </div>
  );
}

export default FlowCanvas;