// src/components/nodes/StartNode.jsx
import { Play } from 'lucide-react';
import "@/styles/nodes.css";


export default function StartNode({ node, onClick, onMouseDown, selected }) {
  return (
    <div
      className={`node start-node ${selected ? 'selected' : ''}`}
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className="node-header">
        <div className="node-title">Start</div>
        <div className="node-connector">
          <Play color="#10b981" size={14} />
        </div>
      </div>
    </div>
  );
}