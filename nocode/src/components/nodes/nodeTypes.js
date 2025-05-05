// src/components/nodes/NodeTypes.js
import StartNode from './StartNode';
import PaymentNode from './PaymentNode';
import NotificationNode from './NotificationNode';

// Export node types object for ReactFlow
export const nodeTypes = {
  startNode: StartNode,
  paymentNode: PaymentNode,
  notificationNode: NotificationNode,
};