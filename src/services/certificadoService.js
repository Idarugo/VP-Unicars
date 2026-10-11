import { apiClient } from '../lib/api/apiClient.js'

export const certificadoService = {
  getAll: ({ q = '', page = 1, limit = 10 } = {}) =>
    apiClient.get(`/certificados?${new URLSearchParams({ q, page, limit })}`),
  getResumen: () => apiClient.get('/certificados/resumen'),
  getByNumero: (numero) => apiClient.get(`/certificados/${numero}`),
  create: (payload) => apiClient.post('/certificados', payload),
  anular: (numero) => apiClient.delete(`/certificados/${numero}`),
}
