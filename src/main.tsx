import { Buffer } from 'buffer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Import Solana wallet styles
import '@solana/wallet-adapter-react-ui/styles.css';
// Import app styles
import './index.css';

// Polyfills for WebRTC and wallet compatibility
globalThis.Buffer = Buffer;
globalThis.process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: function(callback: Function) { setTimeout(callback, 0); }
};

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);