import { Handle, Position } from 'reactflow';
import './StartNode.css';

export default function StartNode() {
  return (
    <div className="start-node">
      <Handle type="source" position={Position.Bottom} />
      <div className="node-content">
        <div className="node-icon">▶</div>
        <h4>Start Workflow</h4>
      </div>
    </div>
  );
}