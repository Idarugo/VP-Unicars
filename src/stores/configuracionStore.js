import { create } from 'zustand'
import { configuracionService } from '../services/ajustesService.js'
import { empresa, certificacion, sistema } from '../admin/config.js'

const mensaje = (e, def) => (e instanceof Error ? e.message : def)

// Copia la configuración del backend en los objetos que usa el certificado
const aplicar = (c) => {
  Object.assign(empresa, c.empresa)
  Object.assign(certificacion, c.certificacion)
  Object.assign(sistema, c.sistema)
}

export const useConfiguracionStore = create((set) => ({
  config: null,
  loading: false,
  saving: false,
  error: null,

  fetchConfiguracion: async () => {
    set({ loading: true, error: null })
    try {
      const r = await configuracionService.get()
      aplicar(r.data)
      set({ config: r.data, loading: false })
    } catch (e) {
      set({ loading: false, error: mensaje(e, 'Error al cargar la configuración') })
    }
  },

  guardarConfiguracion: async (payload) => {
    set({ saving: true, error: null })
    try {
      const r = await configuracionService.update(payload)
      aplicar(r.data)
      set({ config: r.data, saving: false })
      return true
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al guardar la configuración') })
      return false
    }
  },

  restaurarConfiguracion: async () => {
    set({ saving: true, error: null })
    try {
      const r = await configuracionService.restaurar()
      aplicar(r.data)
      set({ config: r.data, saving: false })
      return true
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al restaurar la configuración') })
      return false
    }
  },
}))
