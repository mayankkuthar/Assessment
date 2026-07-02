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
    let url = typeof input === 'string' ? input : (input && input.url);
    if (typeof url === 'string' && (url.startsWith('/api') || url.includes('assessment-api-two.vercel.app/api'))) {
      const targetUrl = url.startsWith('/api')
        ? `https://assessment-api-two.vercel.app${url}`
        : url;
        
      if (typeof input === 'string') {
        return originalFetch(targetUrl, {
          ...init,
          credentials: 'omit'
        });
      } else {
        const newRequest = new Request(targetUrl, {
          ...init,
          credentials: 'omit'
        });
        return originalFetch(newRequest);
      }
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

