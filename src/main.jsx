import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { DatabaseProvider } from './hooks/useDatabase'
import { LanguageProvider } from './contexts/LanguageContext'

// In production (Vercel), forward all relative /api requests to the live backend
if (import.meta.env.PROD) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    let url = typeof input === 'string' ? input : (input && input.url);
    // Translation is served same-origin by the Vercel serverless function
    // (api/translate.js), which injects the Google key server-side. Never forward
    // it to the data backend, which has no /api/translate route.
    if (typeof url === 'string' && url.includes('/api/translate')) {
      return originalFetch(input, init);
    }
    if (typeof url === 'string' && (url.startsWith('/api') || url.includes('happimynd.com/new_api'))) {
      const targetUrl = url.startsWith('/api')
        ? `https://happimynd.com/new_api${url.replace(/^\/api/, '')}`
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
      <LanguageProvider>
        <DatabaseProvider>
          <App />
        </DatabaseProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)

