import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['proxy-yamaha-tricks-summaries.trycloudflare.com'],
    proxy: {
      '/api/organizations': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/employees': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/local-users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        // LOCAL TESTING: pointed at the local server so quiz-attempts use the
        // fixed answer/progress persistence. For production this targets the
        // remote backend — restore to 'http://65.1.6.81:3001' before deploying.
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
