// configureTelegram.cjs
// A simple script to configure the Telegram bot for your trading agent server
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Config file path
const configFilePath = path.join(__dirname, 'telegram-config.json');

// Default config
const defaultConfig = {
  botToken: '',
  chatId: '',
  enabled: false,
  logLevel: 'all' // 'all', 'decisions', 'errors'
};

// Load existing config if any
let config = { ...defaultConfig };
try {
  if (fs.existsSync(configFilePath)) {
    config = { ...config, ...JSON.parse(fs.readFileSync(configFilePath, 'utf8')) };
    console.log('Loaded existing configuration.');
  }
} catch (error) {
  console.error('Error loading configuration:', error.message);
}

// Function to ask questions
function askQuestion(question, defaultValue = '') {
  return new Promise((resolve) => {
    rl.question(`${question}${defaultValue ? ` (${defaultValue})` : ''}: `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// Main function
async function configure() {
  console.log('\n===== DeFAI Trading Agent Telegram Bot Configuration =====\n');
  console.log('This script will help you configure the Telegram bot for your trading agent.\n');
  
  // Step 1: Ask for bot token
  console.log('Step 1: Bot Token');
  console.log('You need to create a Telegram bot using @BotFather on Telegram.');
  console.log('Instructions:');
  console.log('1. Open Telegram and search for @BotFather');
  console.log('2. Send /newbot command to BotFather');
  console.log('3. Follow the instructions to create a new bot');
  console.log('4. BotFather will give you a token like "123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ"');
  
  config.botToken = await askQuestion('\nEnter your bot token', config.botToken);
  
  // Step 2: Ask for chat ID
  console.log('\nStep 2: Chat ID');
  console.log('You need to find your chat ID:');
  console.log('1. Start a conversation with your bot');
  console.log('2. Send any message to your bot');
  console.log('3. Open this URL in your browser:');
  console.log(`   https://api.telegram.org/bot${config.botToken}/getUpdates`);
  console.log('4. Look for the "chat" object and find the "id" field');
  console.log('   It will look like: "chat":{"id":123456789}');
  
  config.chatId = await askQuestion('\nEnter your chat ID', config.chatId);
  
  // Step 3: Enable Telegram notifications
  console.log('\nStep 3: Enable Telegram notifications');
  const enabledInput = await askQuestion('Enable Telegram notifications? (yes/no)', config.enabled ? 'yes' : 'no');
  config.enabled = enabledInput.toLowerCase() === 'yes';
  
  // Step 4: Configure log level
  console.log('\nStep 4: Configure log level');
  console.log('Available log levels:');
  console.log('- all: Send all notifications (trading decisions, status updates, errors)');
  console.log('- decisions: Send only trading decisions and errors');
  console.log('- errors: Send only error notifications');
  
  const logLevelInput = await askQuestion('Select log level (all/decisions/errors)', config.logLevel);
  if (['all', 'decisions', 'errors'].includes(logLevelInput.toLowerCase())) {
    config.logLevel = logLevelInput.toLowerCase();
  }
  
  // Save config
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    console.log('\nConfiguration saved successfully!');
    
    if (config.enabled) {
      console.log('\nTelegram notifications are now enabled.');
      console.log('You should receive a welcome message in your Telegram chat when you start the server.');
    } else {
      console.log('\nTelegram notifications are disabled.');
    }
  } catch (error) {
    console.error('\nError saving configuration:', error.message);
  }
  
  // Display how to use
  console.log('\n===== How to Use =====');
  console.log('Your trading agent will now send notifications to your Telegram bot.');
  console.log('Available commands in Telegram:');
  console.log('/status - Check agent status');
  console.log('/stop - Stop the trading agent');
  console.log('/balance - Show current balances');
  console.log('/help - Show help message');
  
  rl.close();
}

// Run the configuration
configure().catch(error => {
  console.error('Error during configuration:', error);
  rl.close();
});