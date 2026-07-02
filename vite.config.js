import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175,
    strictPort: false,
    allowedHosts: ['proxy-yamaha-tricks-summaries.trycloudflare.com'],
    proxy: {
      '/api/organizations': {
        target: 'http://65.0.236.150:8090',
        changeOrigin: true,
        secure: false
      },
      '/api/auth': {
        target: 'http://65.0.236.150:8090',
        changeOrigin: true,
        secure: false
      },
      '/api/employees': {
        target: 'http://65.0.236.150:8090',
        changeOrigin: true,
        secure: false
      },
      '/api/local-users': {
        target: 'http://65.0.236.150:8090',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        // Targeted at the live Vercel backend backed by Google Sheets
        target: 'http://65.0.236.150:8090',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
