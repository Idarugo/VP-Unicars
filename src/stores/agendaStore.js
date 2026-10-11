import { create } from 'zustand'
import { trabajoService } from '../services/trabajoService.js'
import { usuarioService } from '../services/usuarioService.js'

const mensaje = (e, def) => (e instanceof Error ? e.message : def)

export const useAgendaStore = create((set, get) => ({
  trabajos: [],
  equipo: [],
  rango: null, // { desde, hasta }
  loading: false,
  saving: false,
  error: null,

  fetchEquipo: async () => {
    try {
      const r = await usuarioService.getEquipo()
      set({ equipo: r.data || [] })
    } catch (e) {
      set({ error: mensaje(e, 'Error al cargar el equipo') })
    }
  },

  fetchTrabajos: async (desde, hasta) => {
    set({ loading: true, error: null, rango: { desde, hasta } })
    try {
      const r = await trabajoService.getRango(desde, hasta)
      set({ trabajos: r.data || [], loading: false })
    } catch (e) {
      set({ loading: false, error: mensaje(e, 'Error al cargar la agenda') })
    }
  },

  guardarTrabajo: async (trabajo) => {
    set({ saving: true, error: null })
    try {
      const r = trabajo.id ? await trabajoService.update(trabajo.id, trabajo) : await trabajoService.create(trabajo)
      const { rango } = get()
      if (rango) await get().fetchTrabajos(rango.desde, rango.hasta)
      set({ saving: false })
      return r.data
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al guardar el trabajo') })
      return null
    }
  },

  eliminarTrabajo: async (id) => {
    set({ saving: true, error: null })
    try {
      await trabajoService.delete(id)
      set((s) => ({ trabajos: s.trabajos.filter((t) => t.id !== id), saving: false }))
      return true
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al eliminar el trabajo') })
      return false
    }
  },

  limpiarError: () => set({ error: null }),
}))
