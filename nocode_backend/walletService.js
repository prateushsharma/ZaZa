const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { fromB64, toB64 } = require('@mysten/sui.js/utils');
const { SuiClient } = require('@mysten/sui.js/client');
const { GraphQLClient, gql } = require('graphql-request');

// Initialize Sui RPC client (optional, can still use for other endpoints)
const suiClient = new SuiClient({
  url: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
});

// GraphQL endpoint (you should replace with actual endpoint if it's different)
const GRAPHQL_ENDPOINT = 'https://sui-testnet.mystenlabs.com/graphql'; // example endpoint
const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);

/**
 * Generate a new Sui wallet
 * @returns {Object} Object containing wallet address and private key
 */
function generateWallet() {
  try {
    const keypair = new Ed25519Keypair();
    const privateKeyBase64 = toB64(keypair.export().privateKey);
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
 * Get the balance of a Sui wallet using GraphQL
 * @param {string} address Wallet address
 * @returns {Object} Balance information
 */
async function getWalletBalance(address) {
    console.log("Address is: ",address);
  try {
    const query = gql`
      query GetWalletBalance($addr: String!) {
        address(address: $addr) {
          address
          balance {
            coinType {
              repr
            }
            coinObjectCount
            totalBalance
          }
          coins {
            nodes {
              contents {
                type {
                  repr
                }
              }
            }
          }
        }
      }
    `;

    const variables = { addr: address };
    const data = await gqlClient.request(query, variables);

    return {
      address: data.address.address,
      balance: data.address.balance.totalBalance,
      coinType: data.address.balance.coinType.repr,
      coinObjectCount: data.address.balance.coinObjectCount,
      raw: data // full GraphQL response for reference
    };
  } catch (error) {
    console.error('Error fetching wallet balance via GraphQL:', error);
    throw new Error('Failed to fetch wallet balance: ' + error.message);
  }
}

module.exports = {
  generateWallet,
  getWalletBalance
};
