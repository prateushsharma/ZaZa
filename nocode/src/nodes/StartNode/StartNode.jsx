import { Handle, Position } from 'reactflow';
import { startNodeConfig } from './StartNodeConfig';

export const StartNode = ({ data }) => (
  <div className="start-node">
    <Handle type="source" position={Position.Bottom} />
    <div className="node-header">
      <startNodeConfig.Icon />
      <h4>{startNodeConfig.label}</h4>
    </div>
    <div className="node-content">
      <p>Begin workflow from this node</p>
    </div>
  </div>
);