// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const walletService = require('./walletService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Wallet generation endpoint
app.post('/api/wallet/generate', (req, res) => {
    console.log("Generate Wallet Api called")
  try {
    // Use the wallet service to generate a new wallet
    const wallet = walletService.generateWallet();
    
    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error('Error generating wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate wallet',
      message: error.message
    });
  }
});

// Get wallet balance
/** 
 {
 "address":"0x....." 
 }
 */
app.post('/api/wallet/balance', async (req, res) => {
    
  try {
    const { address } = req.body;
    console.log("Get balance api called for: ",address);
    
    // Use the wallet service to get the balance
    const balance = await walletService.getWalletBalance(address);
    
    res.json({
      success: true,
      message: "This endpoint would connect to Sui RPC to get real balance data. For now, it's a placeholder.",
      balance
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet balance',
      message: error.message
    });
  }
});

// Basic health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sui Wallet API is running'
  });
});

app.listen(PORT, () => {
  console.log(`Wallet Server running on port ${PORT}`);
});