import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import StartNode from '../../nodes/StartNode/StartNode';
import PaymentNode from '../../nodes/PaymentNode/PaymentNode';
import NotificationNode from '../../nodes/NotificationNode/NotificationNode';
import './FlowCanvas.css';

const nodeTypes = {
  startNode: StartNode,
  paymentNode: PaymentNode,
  notificationNode: NotificationNode,
};

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = {
      x: event.clientX - 200, // Adjust for sidebar width
      y: event.clientY - 50  // Adjust for header height
    };

    const newNode = {
      id: `${nodes.length + 1}-${Date.now()}`,
      type,
      position,
      data: { 
        address: '',
        amount: '',
        onChange: (nodeId, field, value) => {
          setNodes(ns => ns.map(n => 
            n.id === nodeId ? { ...n, data: { ...n.data, [field]: value } } : n
          ));
        }
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes]);

  return (
    <div className="flow-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}