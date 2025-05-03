import { 
    createWalletKitCore, 
    SuiChainId 
  } from '@mysten/wallet-adapter-react';
  
  export function useSuiWallet() {
    const walletKit = createWalletKitCore({
      chains: [SuiChainId.MAINNET],
    });
  
    return {
      connect: walletKit.connect,
      disconnect: walletKit.disconnect,
      signTransaction: walletKit.signTransaction,
      account: walletKit.currentAccount,
      connected: walletKit.connected,
    };
  }