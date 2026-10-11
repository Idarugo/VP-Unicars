import { apiClient } from '../lib/api/apiClient.js'

export const estadisticaService = {
  get: (dias) => apiClient.get(`/estadisticas?dias=${dias}`),
}
