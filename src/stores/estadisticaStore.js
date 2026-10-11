import { create } from 'zustand'
import { estadisticaService } from '../services/estadisticaService.js'

export const useEstadisticaStore = create((set) => ({
  datos: null,
  dias: 30,
  loading: false,
  error: null,

  fetchEstadisticas: async (dias) => {
    set({ loading: true, error: null, dias })
    try {
      const r = await estadisticaService.get(dias)
      set({ datos: r.data, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Error al cargar estadísticas' })
    }
  },
}))
