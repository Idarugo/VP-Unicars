import { apiClient } from '../lib/api/apiClient.js'

export const trabajoService = {
  getRango: (desde, hasta, encargado) =>
    apiClient.get(`/trabajos?${new URLSearchParams({ desde, hasta, ...(encargado ? { encargado } : {}) })}`),
  create: (payload) => apiClient.post('/trabajos', payload),
  update: (id, payload) => apiClient.put(`/trabajos/${id}`, payload),
  delete: (id) => apiClient.delete(`/trabajos/${id}`),
}
