import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { FirebaseService } from './services/firebaseService';

// --- Robust Deployment Sync ---
// Handle "ChunkLoadError" or "Failed to fetch dynamically imported module" 
// which happens when a new version is deployed while the app is open.
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || '';
  const name = event.reason?.name || '';
  if (message.includes('Failed to fetch dynamically imported module') ||
    message.includes('loading chunk') ||
    name === 'ChunkLoadError') {
    console.warn('[Deployment Sync] Version mismatch detected. Reloading in 1s...');
    setTimeout(() => window.location.reload(), 1000);
  }
});

window.addEventListener('error', (event) => {
  const message = event.message || '';
  if (message.includes('Failed to fetch dynamically imported module') ||
    message.includes('loading chunk')) {
    console.warn('[Deployment Sync] Module fetch error. Reloading in 1s...');
    setTimeout(() => window.location.reload(), 1000);
  }
}, true);

// Admin console tools
(window as any).runMigration = () => FirebaseService.migrateActivityTypes().then(r => {
  console.log(`✅ ${r.updated} corrigés, ${r.skipped} conformes`);
  r.details.forEach(d => console.log(d));
  alert(`Migration terminée !\n${r.updated} types corrigés\n${r.skipped} déjà conformes`);
  return r;
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);