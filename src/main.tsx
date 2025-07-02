import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import and initialize daily reset scheduler
import { initializeDailyResetScheduler } from './services/dailyReset';

// Initialize the daily reset scheduler when the app starts
initializeDailyResetScheduler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);