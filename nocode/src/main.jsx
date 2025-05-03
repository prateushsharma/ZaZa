// src/main.jsx
import { createRoot } from 'react-dom/client';
import App from './App';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';

// Global styles (if using)
import './index.css';

// Create root instance
const root = createRoot(document.getElementById('root'));

// Render application
root.render(
  <SuiClientProvider>
  <WalletProvider>
    <App />
  </WalletProvider>
</SuiClientProvider>
);