import { apiClient } from '../lib/api/apiClient.js'

export const certificadoSeguridadService = {
  getAll: ({ q = '', page = 1, limit = 10 } = {}) =>
    apiClient.get(`/certificados-seguridad?${new URLSearchParams({ q, page, limit })}`),
  getResumen: () => apiClient.get('/certificados-seguridad/resumen'),
  create: (payload) => apiClient.post('/certificados-seguridad', payload),
  anular: (numero) => apiClient.delete(`/certificados-seguridad/${numero}`),
  getFichas: () => apiClient.get('/certificados-seguridad/fichas'),
  guardarFicha: (ficha) => apiClient.put('/certificados-seguridad/fichas', ficha),
}
