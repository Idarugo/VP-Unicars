import { create } from 'zustand'
import { authService } from '../services/authService.js'
import { tokenStorage } from '../lib/api/token.js'

const mensaje = (e, def) => (e instanceof Error ? e.message : def)

export const useAuthStore = create((set, get) => ({
  usuario: null,
  initialized: false,
  sinConexion: false,
  loading: false,
  error: null,

  // Al abrir el panel: si hay token guardado, se valida con el backend
  init: async () => {
    if (!tokenStorage.get()) return set({ initialized: true })
    try {
      const r = await authService.me()
      set({ usuario: r.usuario, initialized: true, sinConexion: false })
    } catch (e) {
      if (e.status === 401) {
        tokenStorage.remove()
        return set({ usuario: null, initialized: true, sinConexion: false })
      }
      // Servidor caído o reiniciándose: no se cierra la sesión, se reintenta
      set({ sinConexion: true })
      setTimeout(() => get().init(), 3000)
    }
  },

  login: async (usuario, clave) => {
    set({ loading: true, error: null })
    try {
      const r = await authService.login(usuario, clave)
      tokenStorage.set(r.token)
      set({ usuario: r.usuario, loading: false })
      return true
    } catch (e) {
      set({ loading: false, error: mensaje(e, 'No se pudo iniciar sesión') })
      return false
    }
  },

  // Vuelve a leer mis datos (rol, permisos) cuando soporte cambia usuarios
  refrescarSesion: async () => {
    if (!get().usuario) return
    try {
      const r = await authService.me()
      set({ usuario: r.usuario })
    } catch { /* si la sesión ya no vale, apiClient avisa y se cierra */ }
  },

  logout: () => {
    tokenStorage.remove()
    set({ usuario: null, error: null })
  },

  cambiarClave: async (actual, nueva) => {
    try {
      // El backend cierra las otras sesiones y entrega un token nuevo para esta
      const r = await authService.cambiarClave(actual, nueva)
      if (r?.token) tokenStorage.set(r.token)
      if (r?.usuario) set({ usuario: r.usuario })
      return { ok: true }
    } catch (e) {
      return { ok: false, message: mensaje(e, 'No se pudo cambiar la clave') }
    }
  },

  puede: (...permisos) => permisos.some((p) => get().usuario?.permisos?.includes(p)),
}))
