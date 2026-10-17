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
  getEsquema: () => apiClient.get('/contenido/esquema'),
  getVersiones: () => apiClient.get('/contenido/versiones'),
  restaurarVersion: (id) => apiClient.post(`/contenido/versiones/${id}/restaurar`),
  getFotos: () => apiClient.get('/contenido/fotos'),
  subirFoto: (archivo) => apiClient.upload('/contenido/fotos', archivo),
  eliminarFoto: (nombre) => apiClient.delete(`/contenido/fotos/${encodeURIComponent(nombre)}`),
  getVideos: () => apiClient.get('/contenido/videos'),
  subirVideo: (archivo) => apiClient.upload('/contenido/videos', archivo),
  eliminarVideo: (nombre) => apiClient.delete(`/contenido/videos/${encodeURIComponent(nombre)}`),
}
