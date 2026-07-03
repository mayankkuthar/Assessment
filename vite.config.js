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
        target: 'https://constrain-magnifier-circling.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api/auth': {
        target: 'https://constrain-magnifier-circling.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api/employees': {
        target: 'https://constrain-magnifier-circling.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api/local-users': {
        target: 'https://constrain-magnifier-circling.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        // Targeted at the live Vercel backend backed by Google Sheets
        target: 'https://constrain-magnifier-circling.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
