import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for standalone PWA capabilities
registerSW({
  onNeedRefresh() {
    console.log('NouRivo update available');
  },
  onOfflineReady() {
    console.log('NouRivo is ready for offline standalone operation');
  },
  immediate: true,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
