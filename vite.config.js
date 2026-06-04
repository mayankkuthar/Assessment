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
      '/api': {
        target: 'http://65.1.6.81:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
