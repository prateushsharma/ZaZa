import { useSuiWallet } from '../../hooks/useSuiWallet';

export const PaymentNode = ({ id, data, selected }) => {
  const { account, signTransaction } = useSuiWallet();

  const handlePayment = async () => {
    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(data.amount)]);
    tx.transferObjects([coin], tx.pure(data.toAddress));

    const signedTx = await signTransaction(tx);
    // Send transaction to Sui network
  };

  return (
    <div className="payment-node">
      <input
        placeholder="Recipient Address (0x...)"
        value={data.toAddress}
        onChange={(e) => data.updateNode(id, { toAddress: e.target.value })}
      />
      <input
        type="number"
        placeholder="SUI Amount"
        value={data.amount}
        onChange={(e) => data.updateNode(id, { amount: e.target.value })}
      />
      <button onClick={handlePayment}>Verify Payment</button>
    </div>
  );
};