import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  // Pre-empaquetar zustand junto a React evita dos copias de React al cargar el panel por primera vez
  optimizeDeps: { include: ['react', 'react-dom', 'zustand'] },
  server: {
    // En desarrollo, /api va al backend local (npm run dev en backend/)
    proxy: { '/api': 'http://localhost:3001' },
  },
  preview: { proxy: { '/api': 'http://localhost:3001' } },
  build: {
    rollupOptions: {
      input: { main: r('./index.html'), admin: r('./admin.html'), verificar: r('./verificar.html') },
    },
  },
})
