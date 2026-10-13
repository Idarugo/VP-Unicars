import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

// Las mismas cabeceras de seguridad de producción (nginx) en `npm run preview`, para probarlas en local
const nginx = readFileSync(r('./deploy/seguridad-headers.conf'), 'utf8')
const cabeceras = Object.fromEntries([...nginx.matchAll(/^add_header\s+(\S+)\s+"([^"]*)"/gm)]
  .filter(([, k]) => k !== 'Strict-Transport-Security')
  .map(([, k, v]) => [k, v.replace('; upgrade-insecure-requests', '')]))

export default defineConfig({
  plugins: [react()],
  // Pre-empaquetar zustand junto a React evita dos copias de React al cargar el panel por primera vez
  optimizeDeps: { include: ['react', 'react-dom', 'zustand'] },
  server: {
    // En desarrollo, /api va al backend local (npm run dev en backend/)
    proxy: { '/api': 'http://localhost:3001', '/uploads': 'http://localhost:3001' },
  },
  preview: { headers: cabeceras, proxy: { '/api': 'http://localhost:3001', '/uploads': 'http://localhost:3001' } },
  build: {
    rollupOptions: {
      input: { main: r('./index.html'), admin: r('./admin.html'), verificar: r('./verificar.html') },
    },
  },
})
