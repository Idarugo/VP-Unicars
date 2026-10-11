import { create } from 'zustand'
import { mantencionService } from '../services/mantencionService.js'
import { usuarioService } from '../services/usuarioService.js'
import { contenidoService } from '../services/ajustesService.js'

const mensaje = (e, def) => (e instanceof Error ? e.message : def)

export const useMantencionStore = create((set, get) => ({
  estado: null,
  tareas: {},
  historial: [],
  usuarios: [],
  contenido: null,
  loading: false,
  saving: false,
  error: null,

  fetchEstado: async () => {
    try {
      const r = await mantencionService.getEstado()
      set({ estado: r.data })
    } catch (e) {
      set({ error: mensaje(e, 'Error al cargar el estado') })
    }
  },

  fetchTareas: async (mes) => {
    try {
      const r = await mantencionService.getTareas(mes)
      set({ tareas: r.data || {} })
    } catch (e) {
      set({ error: mensaje(e, 'Error al cargar tareas') })
    }
  },

  toggleTarea: async (mes, clave) => {
    const hecho = !get().tareas[clave]
    set((s) => ({ tareas: { ...s.tareas, [clave]: hecho } }))
    try {
      await mantencionService.setTarea(mes, clave, hecho)
    } catch (e) {
      set((s) => ({ tareas: { ...s.tareas, [clave]: !hecho }, error: mensaje(e, 'No se pudo guardar la tarea') }))
    }
  },

  fetchHistorial: async (q = '') => {
    set({ loading: true })
    try {
      const r = await mantencionService.getHistorial(q)
      set({ historial: r.data || [], loading: false })
    } catch (e) {
      set({ loading: false, error: mensaje(e, 'Error al cargar el historial') })
    }
  },

  descargarRespaldo: async () => {
    set({ saving: true, error: null })
    try {
      const r = await mantencionService.getRespaldo()
      set({ saving: false })
      get().fetchEstado()
      return r.data
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al generar el respaldo') })
      return null
    }
  },

  /* Usuarios */
  fetchUsuarios: async () => {
    set({ loading: true })
    try {
      const r = await usuarioService.getAll()
      set({ usuarios: r.data || [], loading: false })
    } catch (e) {
      set({ loading: false, error: mensaje(e, 'Error al cargar usuarios') })
    }
  },

  // Las acciones de usuarios devuelven { ok, message, data } para mostrar la clave temporal
  accionUsuario: async (fn) => {
    set({ saving: true, error: null })
    try {
      const r = await fn()
      await get().fetchUsuarios()
      set({ saving: false })
      return { ok: true, message: r?.message, data: r?.data }
    } catch (e) {
      set({ saving: false })
      return { ok: false, message: mensaje(e, 'No se pudo completar la acción') }
    }
  },
  crearUsuario: (payload) => get().accionUsuario(() => usuarioService.create(payload)),
  actualizarUsuario: (id, payload) => get().accionUsuario(() => usuarioService.update(id, payload)),
  setEstadoUsuario: (id, activo) => get().accionUsuario(() => usuarioService.setEstado(id, activo)),
  resetClave: (id) => get().accionUsuario(() => usuarioService.resetClave(id)),

  /* Contenido web */
  fetchContenido: async () => {
    try {
      const r = await contenidoService.get()
      set({ contenido: r.data || {} })
    } catch (e) {
      set({ error: mensaje(e, 'Error al cargar el contenido') })
    }
  },
  guardarContenido: async (payload) => {
    set({ saving: true, error: null })
    try {
      const r = await contenidoService.update(payload)
      set({ contenido: r.data, saving: false })
      return true
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al guardar el contenido') })
      return false
    }
  },
  restaurarContenido: async () => {
    set({ saving: true, error: null })
    try {
      await contenidoService.restaurar()
      set({ contenido: {}, saving: false })
      return true
    } catch (e) {
      set({ saving: false, error: mensaje(e, 'Error al restaurar el contenido') })
      return false
    }
  },

  limpiarError: () => set({ error: null }),
}))
