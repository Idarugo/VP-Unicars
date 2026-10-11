import { apiClient } from '../lib/api/apiClient.js'

export const authService = {
  login: (usuario, clave) => apiClient.post('/auth/login', { usuario, clave }, { token: null }),
  me: () => apiClient.get('/auth/me'),
  cambiarClave: (claveActual, claveNueva) => apiClient.post('/auth/cambiar-clave', { claveActual, claveNueva }),
}
