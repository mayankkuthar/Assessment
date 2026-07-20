import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (empty prefix) into this Node-side config. The Google
  // Translate key is read from GOOGLE_TRANSLATE_API_KEY — note there is NO VITE_
  // prefix, so Vite never bundles it into the client. It lives only in the dev
  // server (Node) process and is used solely by the proxy rewrite below.
  const env = loadEnv(mode, process.cwd(), '')
  const GOOGLE_TRANSLATE_API_KEY = env.GOOGLE_TRANSLATE_API_KEY || ''

  // Proxy all /api requests to the backend. The rewrite rule converts
  // /api/* paths to /new_api/* for the new backend URL structure.
  const apiProxy = {
    target: 'https://happimynd.com',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api/, '/new_api')
  }

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5175,
      strictPort: false,
      allowedHosts: ['proxy-yamaha-tricks-summaries.trycloudflare.com'],
      proxy: {
        // Translation. The browser calls /api/translate with just { q, target,
        // format } and NO key. This proxy forwards the request to Google's v2
        // endpoint and injects the key server-side (in the rewritten URL, sent
        // from Node -> Google only). The key is never in a request the browser
        // can see — not in a header, payload, or query param on the client side.
        // Keep this first so it is matched before the general '/api' rule.
        '/api/translate': {
          target: 'https://translation.googleapis.com',
          changeOrigin: true,
          secure: false,
          rewrite: () =>
            `/language/translate/v2?key=${encodeURIComponent(GOOGLE_TRANSLATE_API_KEY)}`
        },
        // All other API traffic targets the live backend. The granular rules and
        // the general '/api' fallback must stay in sync so relative fetch('/api/…')
        // calls (e.g. QuizAttempt, PDFTemplateConfig) reach the real backend.
        '/api/organizations': { ...apiProxy },
        '/api/auth': { ...apiProxy },
        '/api/employees': { ...apiProxy },
        '/api/local-users': { ...apiProxy },
        '/api': { ...apiProxy }
      }
    }
  }
})
