import { create } from 'zustand'
import { conectarTiempoReal } from '../lib/api/tiempoReal.js'
import { useAuthStore } from './authStore.js'
import { useCertificadoStore } from './certificadoStore.js'
import { useAgendaStore } from './agendaStore.js'
import { useConfiguracionStore } from './configuracionStore.js'
import { useEstadisticaStore } from './estadisticaStore.js'
import { useMantencionStore } from './mantencionStore.js'
import { useContenidoStore } from './contenidoStore.js'

// Cuando otro usuario cambia algo, el backend avisa el tipo de dato y aquí se vuelve a pedir
// en silencio (sin parpadeos) solo lo que esta pantalla ya tenía cargado.
const refrescar = {
  certificados: () => {
    const c = useCertificadoStore.getState()
    c.fetchResumen()
    if (c.cargado) c.fetchCertificados({ page: c.meta.pagina, silencioso: true })
  },
  trabajos: () => {
    const a = useAgendaStore.getState()
    if (a.rango) a.fetchTrabajos(a.rango.desde, a.rango.hasta, { silencioso: true })
  },
  usuarios: () => {
    useAuthStore.getState().refrescarSesion() // por si cambiaron mi rol o me desactivaron
    useAgendaStore.getState().fetchEquipo()
    const m = useMantencionStore.getState()
    if (m.usuarios.length) m.fetchUsuarios({ silencioso: true })
  },
  configuracion: () => useConfiguracionStore.getState().fetchConfiguracion({ silencioso: true }),
  contenido: () => {
    const c = useContenidoStore.getState()
    if (c.guardado) c.refrescar()
  },
  estadisticas: () => {
    const e = useEstadisticaStore.getState()
    if (e.datos) e.fetchEstadisticas(e.dias, { silencioso: true })
  },
  mantencion: () => {
    const m = useMantencionStore.getState()
    if (!useAuthStore.getState().puede('mantencion.ver')) return
    if (m.estado) m.fetchEstado()
    if (m.mes) m.fetchTareas(m.mes)
    if (m.historialCargado) m.fetchHistorial(m.q, { silencioso: true })
  },
}

export const useTiempoRealStore = create((set, get) => ({
  conectado: false,
  huboCorte: false,
  ultimoCambio: null,
  detener: null,

  iniciar: () => {
    if (get().detener) return
    const detener = conectarTiempoReal({
      onEstado: (conectado) => {
        // Al volver después de un corte, pedir todo de nuevo por si algo cambió mientras tanto
        if (conectado && get().huboCorte) Object.values(refrescar).forEach((fn) => fn())
        set({ conectado, huboCorte: get().huboCorte || (!conectado && get().conectado) })
      },
      onCambio: ({ tipos = [], origen }) => {
        set({ ultimoCambio: { tipos, origen, fecha: Date.now() } })
        tipos.forEach((t) => refrescar[t]?.())
      },
    })
    set({ detener })
  },

  terminar: () => {
    get().detener?.()
    set({ detener: null, conectado: false, huboCorte: false })
  },
}))
