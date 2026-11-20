import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { Capacitor } from '@capacitor/core';
import { checkIsStandaloneAndroid } from './utils/safeArea';

// Apply standalone-android class to root if on Android Standalone / TWA / Capacitor Native
if (checkIsStandaloneAndroid()) {
  document.documentElement.classList.add('standalone-android');
}

// In native iOS/Android Capacitor apps, disable Service Workers to avoid WKWebView fetch hijacking
if (Capacitor.isNativePlatform()) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    });
  }
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
