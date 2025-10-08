import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración Vite con proxy hacia el backend
export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 AÑADE ESTA LÍNEA
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
