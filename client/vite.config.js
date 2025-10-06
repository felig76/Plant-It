import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración Vite con proxy hacia el backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Puerto arbitrario para el backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
