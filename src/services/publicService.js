import { apiClient } from '../lib/api/apiClient.js'

// Rutas públicas: no envían token
export const publicService = {
  getContenido: (signal) => apiClient.get('/public/contenido', { token: null, signal }),
  getResenas: () => apiClient.get('/public/resenas', { token: null }),
  verificar: (n, c) => apiClient.get(`/public/certificados/verificar?${new URLSearchParams({ n, c })}`, { token: null }),
  // sendBeacon no bloquea la navegación al abrir WhatsApp
  evento: (payload) => {
    const url = `${import.meta.env.VITE_API_URL || '/api'}/public/eventos`
    const body = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    if (navigator.sendBeacon?.(url, body)) return
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {})
  },
}
