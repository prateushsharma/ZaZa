import { FiPlay, FiDollarSign, FiBell } from 'react-icons/fi';
import './NodePanel.css';

export default function NodePanel() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-panel">
      <div className="panel-header">Blockchain Nodes</div>
      <div className="node-list">
        <div 
          className="node-item" 
          draggable
          onDragStart={(e) => onDragStart(e, 'startNode')}
        >
          <FiPlay className="node-icon" />
          Start Node
        </div>
        <div 
          className="node-item" 
          draggable
          onDragStart={(e) => onDragStart(e, 'paymentNode')}
        >
          <FiDollarSign className="node-icon" />
          Payment
        </div>
        <div 
          className="node-item" 
          draggable
          onDragStart={(e) => onDragStart(e, 'notificationNode')}
        >
          <FiBell className="node-icon" />
          Notification
        </div>
      </div>
    </div>
  );
}