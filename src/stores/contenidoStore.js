import { create } from 'zustand'
import { contenidoService } from '../services/ajustesService.js'

const mensaje = (e, def) => (e instanceof Error ? e.message : def)

// Contenido editable de la página (Mantención → Contenido web)
export const useContenidoStore = create((set, get) => ({
  esquema: [],
  guardado: null, // lo que está en la BD (solo las secciones cambiadas)
  versiones: [],
  fotos: [],
  loading: false,
  saving: false,
  subiendo: false,
  error: null,

  fetchTodo: async () => {
    set({ loading: true, error: null })
    try {
      const [e, c, v, f] = await Promise.all([
        contenidoService.getEsquema(), contenidoService.get(), contenidoService.getVersiones(), contenidoService.getFotos(),
      ])
      set({ esquema: e.data || [], guardado: c.data || {}, versiones: v.data || [], fotos: f.data || [], loading: false })
    } catch (e) {
      set({ loading: false, error: mensaje(e, 'Error al cargar el contenido') })
    }
  },

  // Solo vuelve a leer lo guardado (cuando otro usuario cambia el contenido)
  refrescar: async () => {
    try {
      const [c, v, f] = await Promise.all([contenidoService.get(), contenidoService.getVersiones(), contenidoService.getFotos()])
      set({ guardado: c.data || {}, versiones: v.data || [], fotos: f.data || [] })
    } catch { /* se reintenta en el próximo aviso */ }
  },

  accion: async (fn, def) => {
    set({ saving: true, error: null })
    try {
      const r = await fn()
      await get().refrescar()
      set({ saving: false })
      return { ok: true, message: r?.message }
    } catch (e) {
      set({ saving: false })
      return { ok: false, message: mensaje(e, def) }
    }
  },
  guardar: (contenido) => get().accion(() => contenidoService.update(contenido), 'No se pudo guardar el contenido'),
  restaurarOriginal: () => get().accion(() => contenidoService.restaurar(), 'No se pudo restaurar el contenido'),
  restaurarVersion: (id) => get().accion(() => contenidoService.restaurarVersion(id), 'No se pudo restaurar la versión'),

  subirFoto: async (archivo) => {
    set({ subiendo: true })
    try {
      const r = await contenidoService.subirFoto(archivo)
      const f = await contenidoService.getFotos()
      set({ fotos: f.data || [], subiendo: false })
      return { ok: true, url: r.data.url }
    } catch (e) {
      set({ subiendo: false })
      return { ok: false, message: mensaje(e, 'No se pudo subir la foto') }
    }
  },
  eliminarFoto: (nombre) => get().accion(() => contenidoService.eliminarFoto(nombre), 'No se pudo eliminar la foto'),
}))
