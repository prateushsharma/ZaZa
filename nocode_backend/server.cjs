// server.cjs - Properly using existing walletService
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const crypto = require('crypto');
const axios = require('axios');
const walletService = require('./walletService.cjs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ----- BALANCE MANAGEMENT -----

// Store balances in memory (in a real app this would be in a database)
let balances = {
  sui: 0,
  usdc: 0
};

// SUI/USDC price management
let currentPrice = 0.95; // Initial price: 1 SUI = 0.95 USDC
let lastPriceUpdate = Date.now();
let isUpdatingPrice = false;

// ----- PRICE SERVICE -----

/**
 * Fetch real SUI/USDC price from cryptocurrency exchanges
 * Tries multiple sources for redundancy: CoinGecko, Binance, and Coinbase
 */
async function updateRealPrice() {
  if (isUpdatingPrice) return; // Prevent concurrent updates
  isUpdatingPrice = true;
  
  try {
    console.log("Fetching SUI/USDC price from external APIs...");
    
    // Try CoinGecko first
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'sui',
          vs_currencies: 'usd'
        }
      });
      
      if (response.data?.sui?.usd) {
        currentPrice = response.data.sui.usd;
        lastPriceUpdate = Date.now();
        console.log(`Updated SUI/USDC price from CoinGecko: $${currentPrice.toFixed(4)}`);
        isUpdatingPrice = false;
        return;
      }
    } catch (coinGeckoError) {
      console.error("CoinGecko price fetch failed:", coinGeckoError.message);
    }
    
    // Try Binance as fallback
    try {
      const binanceResponse = await axios.get('https://api.binance.com/api/v3/ticker/price', {
        params: { symbol: 'SUIUSDT' }
      });
      
      if (binanceResponse.data?.price) {
        currentPrice = parseFloat(binanceResponse.data.price);
        lastPriceUpdate = Date.now();
        console.log(`Updated SUI/USDC price from Binance: $${currentPrice.toFixed(4)}`);
        isUpdatingPrice = false;
        return;
      }
    } catch (binanceError) {
      console.error("Binance price fetch failed:", binanceError.message);
    }
    
    // Try Coinbase as fallback
    try {
      const coinbaseResponse = await axios.get('https://api.coinbase.com/v2/prices/SUI-USD/spot');
      
      if (coinbaseResponse.data?.data?.amount) {
        currentPrice = parseFloat(coinbaseResponse.data.data.amount);
        lastPriceUpdate = Date.now();
        console.log(`Updated SUI/USDC price from Coinbase: $${currentPrice.toFixed(4)}`);
        isUpdatingPrice = false;
        return;
      }
    } catch (coinbaseError) {
      console.error("Coinbase price fetch failed:", coinbaseError.message);
    }
    
    // If all APIs fail, apply a small random change to simulate market movement
    const changePercent = (Math.random() * 0.04) - 0.02; // ±2%
    currentPrice = currentPrice * (1 + changePercent);
    lastPriceUpdate = Date.now();
    console.log(`All price APIs failed. Using simulated price: $${currentPrice.toFixed(4)}`);
    
  } catch (error) {
    console.error('Error updating price:', error);
  } finally {
    isUpdatingPrice = false;
  }
}

// ----- ENDPOINTS -----

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SUI Trading API is running',
    balances: balances,
    currentPrice: currentPrice,
    lastPriceUpdate: new Date(lastPriceUpdate).toISOString()
  });
});

// Generate wallet endpoint - using your existing walletService
app.post('/api/wallet/generate', (req, res) => {
  console.log("Generate Wallet API called");
  try {
    // Use the wallet service from walletService.cjs
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

// Set initial balances (called when agent starts)
app.post('/set_swap', (req, res) => {
  try {
    const { sui, usdc, address } = req.body;
    
    // Update balances
    if (sui !== undefined) balances.sui = parseFloat(sui);
    if (usdc !== undefined) balances.usdc = parseFloat(usdc);
    
    console.log(`Set initial balances: SUI=${balances.sui}, USDC=${balances.usdc}`);
    
    res.json({
      success: true,
      message: "Balances updated successfully",
      balances: balances
    });
  } catch (error) {
    console.error('Error setting balances:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Check balances
app.post('/check-balances', (req, res) => {
  try {
    // Ignore address parameter for testing
    console.log('Checking balances:', balances);
    
    res.json({
      success: true,
      balances: balances
    });
  } catch (error) {
    console.error('Error checking balances:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Fetch pair info
app.post('/api/wallet/fetch_pair', (req, res) => {
  try {
    console.log('Fetching pair info');
    
    // Check if price needs updating (older than 10 minutes)
    if (Date.now() - lastPriceUpdate > 600000) {
      updateRealPrice(); // Don't await, just trigger the update
    }
    
    res.json({
      success: true,
      sui: balances.sui,
      usdc: balances.usdc,
      currentPrice: currentPrice
    });
  } catch (error) {
    console.error('Error fetching pair:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get wallet balance using walletService for real addresses
app.post('/api/wallet/balance', async (req, res) => {
  try {
    const { address } = req.body;
    console.log("Get balance API called for:", address);

    try {
      // First try to get real balance from chain using walletService
      const chainBalance = await walletService.getWalletBalance(address);
      console.log("Got balance from chain:", chainBalance);
      
      res.json({
        success: true,
        balance: chainBalance
      });
    } catch (chainError) {
      console.log("Falling back to local balances due to:", chainError.message);
      
      // Fall back to local balances if chain lookup fails
      res.json({
        success: true,
        balance: {
          sui: balances.sui,
          usdc: balances.usdc
        }
      });
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet balance',
      message: error.message
    });
  }
});

// Swap API endpoint - simplified for testing
app.post('/swap', (req, res) => {
  try {
    // Extract basic parameters, ignore network, wallet, slippage
    const { fromCoin, toCoin, amount } = req.body;
    
    if (!fromCoin || !toCoin) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: fromCoin and toCoin"
      });
    }
    
    // Normalize coins to uppercase
    const from = fromCoin.toUpperCase();
    const to = toCoin.toUpperCase();
    
    // Validate coin types
    if ((from !== 'SUI' && from !== 'USDC') || (to !== 'SUI' && to !== 'USDC')) {
      return res.status(400).json({
        success: false,
        error: "Invalid coins. Only SUI and USDC are supported."
      });
    }
    
    // Ensure we're not trying to swap the same coin
    if (from === to) {
      return res.status(400).json({
        success: false,
        error: "Cannot swap a coin for itself"
      });
    }
    
    let amountToSwap;
    let receivedAmount;
    
    // Handle SUI to USDC
    if (from === 'SUI') {
      // If no amount specified, use all SUI
      amountToSwap = amount ? parseFloat(amount) : balances.sui;
      
      // Ensure we have enough balance
      if (amountToSwap > balances.sui) {
        return res.status(400).json({
          success: false,
          error: "Insufficient SUI balance"
        });
      }
      
      // Calculate USDC to receive (SUI * price)
      receivedAmount = amountToSwap * currentPrice;
      
      // Update balances
      balances.sui -= amountToSwap;
      balances.usdc += receivedAmount;
    } 
    // Handle USDC to SUI
    else if (from === 'USDC') {
      // If no amount specified, use all USDC
      amountToSwap = amount ? parseFloat(amount) : balances.usdc;
      
      // Ensure we have enough balance
      if (amountToSwap > balances.usdc) {
        return res.status(400).json({
          success: false,
          error: "Insufficient USDC balance"
        });
      }
      
      // Calculate SUI to receive (USDC / price)
      receivedAmount = amountToSwap / currentPrice;
      
      // Update balances
      balances.usdc -= amountToSwap;
      balances.sui += receivedAmount;
    }
    
    console.log(`Swap: ${amountToSwap} ${from} -> ${receivedAmount.toFixed(6)} ${to}`);
    console.log(`New balances: SUI=${balances.sui.toFixed(6)}, USDC=${balances.usdc.toFixed(6)}`);
    
    // Generate a mock transaction hash
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    
    // Return response in exactly the format the agent expects
    res.json({
      success: true,
      txHash: txHash,       // Mock transaction hash
      amountIn: amountToSwap.toString(),  // Input amount as string
      amountOut: receivedAmount.toString() // Output amount as string
    });
    
  } catch (error) {
    console.error('Error performing swap:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Initialize price on startup, then update periodically
updateRealPrice();
// Try to update price every 5 minutes
setInterval(updateRealPrice, 1000);

// Start the server
app.listen(PORT, () => {
  console.log(`SUI Trading API Server running on port ${PORT}`);
  console.log(`Initial balances: SUI=${balances.sui}, USDC=${balances.usdc}`);
  console.log(`Initial price: 1 SUI = ${currentPrice} USDC`);
});