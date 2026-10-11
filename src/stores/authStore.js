import { create } from 'zustand'
import { authService } from '../services/authService.js'
import { tokenStorage } from '../lib/api/token.js'

const mensaje = (e, def) => (e instanceof Error ? e.message : def)

export const useAuthStore = create((set, get) => ({
  usuario: null,
  initialized: false,
  loading: false,
  error: null,

  // Al abrir el panel: si hay token guardado, se valida con el backend
  init: async () => {
    if (!tokenStorage.get()) return set({ initialized: true })
    try {
      const r = await authService.me()
      set({ usuario: r.usuario, initialized: true })
    } catch {
      tokenStorage.remove()
      set({ usuario: null, initialized: true })
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

  logout: () => {
    tokenStorage.remove()
    set({ usuario: null, error: null })
  },

  cambiarClave: async (actual, nueva) => {
    try {
      await authService.cambiarClave(actual, nueva)
      return { ok: true }
    } catch (e) {
      return { ok: false, message: mensaje(e, 'No se pudo cambiar la clave') }
    }
  },

  puede: (...permisos) => permisos.some((p) => get().usuario?.permisos?.includes(p)),
}))
