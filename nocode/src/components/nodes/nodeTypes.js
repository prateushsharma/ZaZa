// src/components/nodes/nodeTypes.js
export const NodeType = {
    START: 'start',
    PAYMENT: 'payment',
    NOTIFICATION: 'notification'
  };
  
  export const NodeConfig = {
    [NodeType.START]: {},
    [NodeType.PAYMENT]: {
      address: '',
      amount: ''
    },
    [NodeType.NOTIFICATION]: {
      message: ''
    }
  };