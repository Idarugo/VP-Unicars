import { create } from 'zustand'
import { certificadoService } from '../services/certificadoService.js'

const mensaje = (e, def) => (e instanceof Error ? e.message : def)

export const useCertificadoStore = create((set, get) => ({
  certificados: [],
  meta: { total: 0, pagina: 1, limite: 10, paginas: 1 },
  q: '',
  resumen: { total: 0, delMes: 0, ultimo: null, siguiente: null },
  loading: false,
  saving: false,
  error: null,

  fetchCertificados: async ({ q = get().q, page = 1 } = {}) => {
    set({ loading: true, error: null, q })
    try {
      const r = await certificadoService.getAll({ q, page, limit: 10 })
      set({ certificados: r.data || [], meta: r.meta, loading: false })
    } catch (e) {
      set({ loading: false, error: mensaje(e, 'Error al cargar certificados') })
    }
  },

  fetchResumen: async () => {
    try {
      const r = await certificadoService.getResumen()
      set({ resumen: r.data })
    } catch (e) {
      set({ error: mensaje(e, 'Error al cargar el resumen') })
    }
  },

  createCertificado: async (payload) => {
    set({ saving: true, error: null })
    try {
      const r = await certificadoService.create(payload)
      set({ saving: false })
      get().fetchResumen()
      return r.data
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al emitir el certificado') })
      return null
    }
  },

  anularCertificado: async (numero) => {
    set({ saving: true, error: null })
    try {
      await certificadoService.anular(numero)
      set({ saving: false })
      await Promise.all([get().fetchCertificados({ page: get().meta.pagina }), get().fetchResumen()])
      return true
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al anular el certificado') })
      return false
    }
  },

  limpiarError: () => set({ error: null }),
}))
