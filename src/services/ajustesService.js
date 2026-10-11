import { apiClient } from '../lib/api/apiClient.js'

export const configuracionService = {
  get: () => apiClient.get('/configuracion'),
  update: (payload) => apiClient.put('/configuracion', payload),
  restaurar: () => apiClient.delete('/configuracion'),
}

export const contenidoService = {
  get: () => apiClient.get('/contenido'),
  update: (payload) => apiClient.put('/contenido', payload),
  restaurar: () => apiClient.delete('/contenido'),
}
