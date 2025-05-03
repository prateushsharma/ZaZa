// src/components/nodes/PaymentNode.jsx
import { ArrowRight } from 'lucide-react';
import "@/styles/nodes.css";


export function PaymentConfig({ config, onChange }) {
  return (
    <>
    <div className="config-input">
      <label>Recipient Address</label>
      <input
        type="text"
        value={config?.address || ''}
        onChange={(e) => onChange('address', e.target.value)}
      />
    </div>
    <div className="config-input">
      <label>Amount</label>
      <input
        type="number"
        value={config?.amount || ''}
        onChange={(e) => onChange('amount', e.target.value)}
      />
    </div>
    </>
  );
}

export default function PaymentNode({ node, onClick, onMouseDown, selected }) {
  return (
    <div
      className={`node payment-node ${selected ? 'selected' : ''}`}
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className="node-header">
        <div className="node-title">Payment</div>
        <div className="node-connector">
          <ArrowRight color="#3b82f6" size={14} />
        </div>
      </div>
      {node.config && (
        <div className="node-content">
          <p>To: {node.config.address || 'Not set'}</p>
          <p>Amount: {node.config.amount || '0'}</p>
        </div>
      )}
    </div>
  );
}