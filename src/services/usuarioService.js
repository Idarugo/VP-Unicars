import { apiClient } from '../lib/api/apiClient.js'

export const usuarioService = {
  getAll: () => apiClient.get('/usuarios'),
  getEquipo: () => apiClient.get('/usuarios/equipo'),
  create: (payload) => apiClient.post('/usuarios', payload),
  update: (id, payload) => apiClient.put(`/usuarios/${id}`, payload),
  setEstado: (id, activo) => apiClient.patch(`/usuarios/${id}/estado`, { activo }),
  resetClave: (id) => apiClient.post(`/usuarios/${id}/reset-clave`),
}
