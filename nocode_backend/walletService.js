// walletService.js
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { fromB64, toB64 } = require('@mysten/sui.js/utils');
const { SuiClient } = require('@mysten/sui.js/client');

// Initialize Sui client if needed for balance checks
const suiClient = new SuiClient({
  url: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
});

/**
 * Generate a new Sui wallet
 * @returns {Object} Object containing wallet address and private key
 */
function generateWallet() {
  try {
    // Generate a new random Ed25519 keypair
    const keypair = new Ed25519Keypair();
    
    // Get the private key (as base64)
    const privateKeyBase64 = toB64(keypair.export().privateKey);
    
    // Get the public address
    const address = keypair.getPublicKey().toSuiAddress();
    
    return {
      address,
      privateKey: privateKeyBase64
    };
  } catch (error) {
    console.error('Error generating Sui wallet:', error);
    throw new Error('Failed to generate wallet: ' + error.message);
  }
}

/**
 * Get the balance of a Sui wallet (placeholder)
 * @param {string} address Wallet address
 * @returns {Object} Balance information
 */
async function getWalletBalance(address) {
  try {
    // In a complete implementation, this would connect to the Sui blockchain
    // and fetch the actual balance.
    
    // Placeholder response
    return {
      address,
      amount: "0" // Placeholder - would be replaced with actual balance fetch
    };
    
    /* 
    // This is how you would implement actual balance fetching:
    const { data: coins } = await suiClient.getCoins({
      owner: address
    });
    
    // Calculate total balance
    let totalBalance = 0;
    for (const coin of coins) {
      totalBalance += parseInt(coin.balance);
    }
    
    return {
      address,
      amount: totalBalance.toString(),
      coins
    };
    */
  } catch (error) {
    console.error('Error fetching Sui balance:', error);
    throw new Error('Failed to fetch balance: ' + error.message);
  }
}

module.exports = {
  generateWallet,
  getWalletBalance
};