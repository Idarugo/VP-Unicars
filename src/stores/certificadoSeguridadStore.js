import { create } from 'zustand'
import { certificadoSeguridadService } from '../services/certificadoSeguridadService.js'

const mensaje = (e, def) => (e instanceof Error ? e.message : def)

// Certificados de lámina de seguridad (casas, locales y oficinas). Mismo flujo que los de autos.
export const useCertificadoSeguridadStore = create((set, get) => ({
  certificados: [],
  meta: { total: 0, pagina: 1, limite: 10, paginas: 1 },
  q: '',
  cargado: false,
  resumen: { total: 0, delMes: 0, ultimo: null, siguiente: null, totalM2: 0 },
  fichas: [],
  loading: false,
  saving: false,
  error: null,

  fetchCertificados: async ({ q = get().q, page = 1, silencioso = false } = {}) => {
    set(silencioso ? { q } : { loading: true, error: null, q })
    try {
      const r = await certificadoSeguridadService.getAll({ q, page, limit: 10 })
      if (!r.data?.length && page > 1) return get().fetchCertificados({ q, page: page - 1, silencioso })
      set({ certificados: r.data || [], meta: r.meta, loading: false, cargado: true })
    } catch (e) {
      set({ loading: false, error: mensaje(e, 'Error al cargar certificados') })
    }
  },

  fetchResumen: async () => {
    try {
      const r = await certificadoSeguridadService.getResumen()
      set({ resumen: r.data })
    } catch (e) {
      set({ error: mensaje(e, 'Error al cargar el resumen') })
    }
  },

  fetchFichas: async () => {
    try {
      const r = await certificadoSeguridadService.getFichas()
      set({ fichas: r.data || [] })
    } catch (e) {
      set({ error: mensaje(e, 'Error al cargar las fichas de láminas') })
    }
  },

  guardarFicha: async (ficha) => {
    set({ saving: true, error: null })
    try {
      const r = await certificadoSeguridadService.guardarFicha(ficha)
      set({ fichas: r.data || [], saving: false })
      return true
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al guardar la ficha') })
      return false
    }
  },

  createCertificado: async (payload) => {
    set({ saving: true, error: null })
    try {
      const r = await certificadoSeguridadService.create(payload)
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
      await certificadoSeguridadService.anular(numero)
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
