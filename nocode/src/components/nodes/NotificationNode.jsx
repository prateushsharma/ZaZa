// src/components/nodes/NotificationNode.jsx
import { ArrowRight } from 'lucide-react';
import "@/styles/nodes.css";


export function NotificationConfig({ config, onChange }) {
  return (
    <div className="config-input">
      <label>Message</label>
      <input
        type="text"
        value={config?.message || ''}
        onChange={(e) => onChange('message', e.target.value)}
      />
    </div>
  );
}

export default function NotificationNode({ node, onClick, onMouseDown, selected }) {
  return (
    <div
      className={`node notification-node ${selected ? 'selected' : ''}`}
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className="node-header">
        <div className="node-title">Notification</div>
        <div className="node-connector">
          <ArrowRight color="#8b5cf6" size={14} />
        </div>
      </div>
      {node.config && (
        <div className="node-content">
          <p>{node.config.message || 'No message'}</p>
        </div>
      )}
    </div>
  );
}