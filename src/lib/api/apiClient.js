import { tokenStorage } from './token.js'

// En desarrollo Vite redirige /api al backend; en producción se define VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(endpoint, { method = 'GET', body, token, signal } = {}) {
  const authToken = token ?? tokenStorage.get()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    // Sesión vencida: se avisa a la app para que vuelva al login
    if (response.status === 401 && authToken) window.dispatchEvent(new CustomEvent('vp:sesion-expirada'))
    throw new Error(data?.message || `Error ${response.status}`)
  }

  return data
}

export const apiClient = {
  get: (endpoint, opts) => request(endpoint, { ...opts, method: 'GET' }),
  post: (endpoint, body, opts) => request(endpoint, { ...opts, method: 'POST', body }),
  put: (endpoint, body, opts) => request(endpoint, { ...opts, method: 'PUT', body }),
  patch: (endpoint, body, opts) => request(endpoint, { ...opts, method: 'PATCH', body }),
  delete: (endpoint, opts) => request(endpoint, { ...opts, method: 'DELETE' }),
}
