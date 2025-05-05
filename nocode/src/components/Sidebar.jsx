// src/components/Sidebar.jsx
import React from 'react';
import '../styles/Sidebar.css';
import { BsLightningCharge, BsCreditCard2Front, BsBell } from 'react-icons/bs';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Sui Flow Nodes</h3>
      </div>
      <div className="sidebar-nodes">
        <div 
          className="node node-start" 
          onDragStart={(event) => onDragStart(event, 'startNode')}
          draggable
        >
          <BsLightningCharge className="node-icon" />
          <div className="node-label">Start</div>
        </div>
        <div 
          className="node node-payment" 
          onDragStart={(event) => onDragStart(event, 'paymentNode')}
          draggable
        >
          <BsCreditCard2Front className="node-icon" />
          <div className="node-label">Payment</div>
        </div>
        <div 
          className="node node-notification" 
          onDragStart={(event) => onDragStart(event, 'notificationNode')}
          draggable
        >
          <BsBell className="node-icon" />
          <div className="node-label">Notification</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;