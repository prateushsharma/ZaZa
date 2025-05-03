import { Handle, Position } from 'reactflow';

export default function PaymentNode({ id, data, selected }) {
  return (
    <div className={`payment-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-header">
        <h4>💰 Payment</h4>
      </div>
      
      <div className="node-content">
        <div className="form-group">
          <label>Recipient Address</label>
          <input
            value={data.address || ''}
            onChange={(e) => data.onChange(id, 'address', e.target.value)}
            placeholder="0x..."
          />
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={data.amount || ''}
            onChange={(e) => data.onChange(id, 'amount', e.target.value)}
            placeholder="0.00"
            step="0.01"
          />
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}