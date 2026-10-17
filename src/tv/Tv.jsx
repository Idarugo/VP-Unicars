import { useCallback, useEffect, useRef, useState } from 'react'
import { aplicarContenido, videosTv } from '../data.js'
import { publicService } from '../services/publicService.js'

// Pantalla para la TV del local (vpunicars.cl/videos): solo los videos, uno tras otro, sin parar.
// La lista se edita en Mantención → Contenido web → Videos de la TV y se revisa cada 10 minutos.
const REVISAR_CADA = 10 * 60 * 1000

async function leerLista() {
  try {
    const r = await publicService.getContenido()
    aplicarContenido(r?.data || {})
  } catch { /* sin conexión: se mantiene la lista anterior */ }
  return videosTv.map((v) => v.video)
}

export default function Tv() {
  const video = useRef(null)
  const [lista, setLista] = useState(() => videosTv.map((v) => v.video))
  const [i, setI] = useState(0)
  const [conSonido, setConSonido] = useState(false)
  const [controles, setControles] = useState(true)
  const pendiente = useRef(null) // lista nueva: se aplica al terminar el video actual
  const timerControles = useRef(null)

  // Lista desde la base de datos y revisión periódica
  useEffect(() => {
    leerLista().then(setLista)
    // Con un solo video (en bucle) la lista nueva se aplica al tiro; con varios, al terminar el video actual
    const t = setInterval(() => leerLista().then((l) => setLista((prev) => {
      if (prev.length <= 1) return l
      pendiente.current = l
      return prev
    })), REVISAR_CADA)
    return () => clearInterval(t)
  }, [])

  const siguiente = useCallback(() => {
    if (pendiente.current) { setLista(pendiente.current); pendiente.current = null; setI(0); return }
    setI((n) => (lista.length ? (n + 1) % lista.length : 0))
  }, [lista.length])

  // Con un solo video se repite en bucle; con varios, al terminar pasa al siguiente
  useEffect(() => {
    const v = video.current
    if (!v || !lista.length) return
    v.muted = !conSonido
    v.play().catch(() => {})
  }, [i, lista, conSonido])

  // Vigilante: una TV queda sola todo el día; si el video se detiene (red, ahorro de energía), se reanuda
  useEffect(() => {
    const t = setInterval(() => {
      const v = video.current
      if (v && v.paused && !v.ended) v.play().catch(() => {})
    }, 4000)
    return () => clearInterval(t)
  }, [])

  // La pantalla no se apaga mientras corre (si el navegador lo permite)
  useEffect(() => {
    let bloqueo
    const pedir = () => navigator.wakeLock?.request('screen').then((b) => { bloqueo = b }).catch(() => {})
    pedir()
    const alVolver = () => { if (document.visibilityState === 'visible') pedir() }
    document.addEventListener('visibilitychange', alVolver)
    return () => { document.removeEventListener('visibilitychange', alVolver); bloqueo?.release?.() }
  }, [])

  // Los botones aparecen al mover el mouse o tocar, y se esconden solos (también el cursor)
  const mostrarControles = () => {
    setControles(true)
    clearTimeout(timerControles.current)
    timerControles.current = setTimeout(() => setControles(false), 3500)
  }
  useEffect(() => { mostrarControles(); return () => clearTimeout(timerControles.current) }, [])

  const pantallaCompleta = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  if (!lista.length) return <div className="tv tv--vacia"><p>No hay videos cargados para la TV.</p></div>

  return (
    <div className={`tv ${controles ? '' : 'tv--quieta'}`} onPointerMove={mostrarControles} onClick={mostrarControles}>
      <video
        key={`${i}-${lista[i]}`}
        ref={video}
        className="tv-video"
        src={lista[i]}
        autoPlay
        muted={!conSonido}
        playsInline
        loop={lista.length === 1}
        preload="auto"
        onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
        onEnded={siguiente}
        onError={() => setTimeout(siguiente, 1500)}
      />
      <div className="tv-controles">
        <button type="button" onClick={(e) => { e.stopPropagation(); setConSonido((s) => !s) }}>{conSonido ? '🔊 Sonido' : '🔇 Sin sonido'}</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); pantallaCompleta() }}>⛶ Pantalla completa</button>
        {lista.length > 1 && <span>{i + 1} / {lista.length}</span>}
      </div>
    </div>
  )
}
