import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Membuka akses jaringan lokal (LAN)
    proxy: {
      // Mengarahkan request /api dari frontend ke backend di komputer lokal
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Mengarahkan folder statis gambar local
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
