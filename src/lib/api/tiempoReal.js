import { tokenStorage } from './token.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Conexión al canal en tiempo real del backend (Server-Sent Events leídos con fetch,
// para mandar el token en el header y no en la URL). Se reconecta sola si se corta.
export function conectarTiempoReal({ onCambio, onEstado }) {
  let control = null
  let detenido = false
  let espera = 1000
  let timer = null
  let vigilante = null

  // El servidor manda un ping cada 15 s: si pasan 35 s sin nada, la conexión quedó colgada
  const vigilar = () => {
    clearTimeout(vigilante)
    vigilante = setTimeout(() => control?.abort(), 35000)
  }

  const reintentar = () => {
    if (detenido) return
    onEstado?.(false)
    timer = setTimeout(abrir, espera)
    espera = Math.min(espera * 2, 30000)
  }

  async function abrir() {
    const token = tokenStorage.get()
    if (!token || detenido) return
    control = new AbortController()
    try {
      const res = await fetch(`${API_BASE_URL}/tiempo-real`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
        signal: control.signal,
        cache: 'no-store',
      })
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('vp:sesion-expirada'))
        return
      }
      if (!res.ok || !res.body) throw new Error(`Error ${res.status}`)

      onEstado?.(true)
      espera = 1000
      vigilar()
      const lector = res.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      for (;;) {
        const { value, done } = await lector.read()
        if (done) break
        vigilar()
        buffer += value
        const bloques = buffer.split('\n\n')
        buffer = bloques.pop()
        for (const bloque of bloques) {
          const evento = bloque.match(/^event: (.+)$/m)?.[1]
          const data = bloque.match(/^data: (.+)$/m)?.[1]
          if (evento === 'cambio' && data) {
            try { onCambio(JSON.parse(data)) } catch { /* mensaje inválido */ }
          }
        }
      }
      clearTimeout(vigilante)
      reintentar()
    } catch {
      clearTimeout(vigilante)
      if (!detenido) reintentar()
    }
  }

  abrir()
  return () => {
    detenido = true
    clearTimeout(timer)
    clearTimeout(vigilante)
    control?.abort()
    onEstado?.(false)
  }
}
