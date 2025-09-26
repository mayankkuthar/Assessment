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
        target: 'https://gnome-clarity-reality-calculate.trycloudflare.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
