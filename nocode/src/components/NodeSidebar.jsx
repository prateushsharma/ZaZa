// src/components/NodeSidebar.jsx
import { Play, ArrowRight } from 'lucide-react';
import { PaymentConfig } from './nodes/PaymentNode';
import { NotificationConfig } from './nodes/NotificationNode';
import "@/styles/sidebar.css";


export default function NodeSidebar({ onAddNode, selectedNode, onConfigChange }) {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Nodes</h2>
      <div>
        <button className="node-button" onClick={() => onAddNode('start')}>
          <Play size={16} color="#10b981" /> Start Node
        </button>
        <button className="node-button" onClick={() => onAddNode('payment')}>
          <ArrowRight size={16} color="#3b82f6" /> Payment Node
        </button>
        <button className="node-button" onClick={() => onAddNode('notification')}>
          <ArrowRight size={16} color="#8b5cf6" /> Notification Node
        </button>
      </div>

      {selectedNode && (
        <div className="config-panel">
          <div className="config-header">
            {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Configuration
          </div>
          <div className="config-content">
            {selectedNode.type === 'payment' && (
              <PaymentConfig 
                config={selectedNode.config || {}} 
                onChange={onConfigChange} 
              />
            )}
            {selectedNode.type === 'notification' && (
              <NotificationConfig 
                config={selectedNode.config || {}} 
                onChange={onConfigChange} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}