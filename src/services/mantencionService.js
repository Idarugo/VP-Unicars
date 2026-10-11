import { apiClient } from '../lib/api/apiClient.js'

export const mantencionService = {
  getEstado: () => apiClient.get('/mantencion/estado'),
  getTareas: (mes) => apiClient.get(`/mantencion/tareas?mes=${mes}`),
  setTarea: (mes, clave, hecho) => apiClient.put('/mantencion/tareas', { mes, clave, hecho }),
  getRespaldo: () => apiClient.get('/mantencion/respaldo'),
  getHistorial: (q = '', limit = 200) => apiClient.get(`/historial?${new URLSearchParams({ q, limit })}`),
}
