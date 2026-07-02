import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { DatabaseProvider } from './hooks/useDatabase'

// In production (Vercel), forward all relative /api requests to the live backend
if (import.meta.env.PROD) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string' && input.startsWith('/api')) {
      return originalFetch(`https://assessment-api-two.vercel.app${input}`, {
        ...init,
        credentials: 'omit'
      });
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DatabaseProvider>
        <App />
      </DatabaseProvider>
    </BrowserRouter>
  </StrictMode>,
)

