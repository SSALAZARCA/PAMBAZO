// 🛡️ ESCUDO ANTI-ERRORES EXTERNOS
try {
  const _originalDefine = customElements.define;
  customElements.define = function (name, constructor, options) {
    if (!customElements.get(name)) {
      _originalDefine.call(this, name, constructor, options);
    }
  };
} catch (e) { }

console.log('🚀 PAMBAZO: Sistema Iniciando...');
console.log('🔗 API Base URL:', import.meta.env['VITE_API_URL']);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './globals.css';

// Hide loading screen when React mounts
function AppWrapper() {
  React.useEffect(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Mount React application
const root = document.getElementById('root');
if (root) {
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    <AppWrapper />
  );
} else {
  console.error('Root element not found!');
}