import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { negocio, resenas as resenasBase } from '../data.js'
import { publicService } from '../services/publicService.js'
import { Icon, faStar, faGoogle, faChevronLeft, faChevronRight, faPen, faQuoteLeft } from '../icons.js'

// Reseñas de Google en carrusel + botón para dejar la propia en la ficha de Google del negocio.
// Si el backend tiene conectada la API de Google Places, la nota, la cantidad y las reseñas más recientes
// llegan solas; si no, se usan las cargadas en Mantención → Contenido web → Reseñas.
const Estrellas = ({ n = 5, className = '' }) => (
  <span className={`rs-estrellas ${className}`} aria-label={`${n} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((i) => <Icon key={i} icon={faStar} className={i <= Math.round(n) ? 'is-on' : ''} />)}
  </span>
)
const inicial = (nombre = '') => nombre.trim().charAt(0).toUpperCase() || '★'

export default function Resenas() {
  const root = useRef(null)
  const pista = useRef(null)
  const [lista, setLista] = useState(resenasBase)
  const [resumen, setResumen] = useState({ calificacion: negocio.calificacion, total: negocio.totalResenas })
  const [actual, setActual] = useState(0)
  const pausa = useRef(false)
  const actualRef = useRef(0) // el avance automático lee la posición sin depender del render

  // Reseñas en vivo desde Google (si está configurado en el servidor)
  useEffect(() => {
    publicService.getResenas?.().then((r) => {
      const g = r?.data
      if (!g) return
      if (g.calificacion) setResumen({ calificacion: g.calificacion, total: g.total })
      if (g.resenas?.length) {
        const nombres = new Set(g.resenas.map((x) => x.autor.toLowerCase()))
        setLista([...g.resenas, ...resenasBase.filter((x) => !nombres.has(x.autor.toLowerCase()))])
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.rs-head > *', { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } })
      gsap.from('.rs-card', { y: 60, opacity: 0, duration: 1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: '.rs-pista', start: 'top 85%' } })
    }, root)
    return () => ctx.revert()
  }, [])

  // Avance automático cada 5 s (se detiene al pasar el mouse, tocar o con "reducir movimiento")
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => { if (!pausa.current && document.visibilityState === 'visible') mover(1) }, 5000)
    return () => clearInterval(t)
  }, [lista.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const tarjetas = () => [...(pista.current?.children || [])]
  const ir = (i) => {
    const t = tarjetas()
    if (!t.length) return
    const n = (i + t.length) % t.length
    pista.current.scrollTo({ left: t[n].offsetLeft - pista.current.offsetLeft, behavior: 'smooth' })
  }
  const mover = (d) => {
    const p = pista.current
    if (!p) return
    const fin = p.scrollLeft + p.clientWidth >= p.scrollWidth - 8
    ir(d > 0 && fin ? 0 : actualRef.current + d)
  }
  // Tarjeta actual según la posición del scroll (también cuando se desliza con el dedo)
  const alDeslizar = () => {
    const p = pista.current
    const t = tarjetas()
    let mejor = 0
    t.forEach((c, i) => { if (Math.abs(c.offsetLeft - p.offsetLeft - p.scrollLeft) < Math.abs(t[mejor].offsetLeft - p.offsetLeft - p.scrollLeft)) mejor = i })
    actualRef.current = mejor
    setActual(mejor)
  }

  if (!lista.length) return null

  return (
    <section id="resenas" className="rs" ref={root}>
      <div className="rs-head">
        <p className="eyebrow">Lo que dicen nuestros clientes</p>
        <h2 className="h2">Reseñas <em>reales</em>.</h2>
        {resumen.calificacion > 0 && (
          <div className="rs-resumen">
            <span className="rs-google"><Icon icon={faGoogle} /></span>
            <b className="rs-nota">{resumen.calificacion.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</b>
            <div>
              <Estrellas n={resumen.calificacion} />
              {resumen.total > 0 && <small>{resumen.total} reseñas en Google</small>}
            </div>
          </div>
        )}
      </div>

      <div className="rs-carrusel"
        onPointerEnter={() => { pausa.current = true }} onPointerLeave={() => { pausa.current = false }}
        onFocus={() => { pausa.current = true }} onBlur={() => { pausa.current = false }} onTouchStart={() => { pausa.current = true }}>
        <button type="button" className="rs-flecha rs-flecha--izq" onClick={() => mover(-1)} aria-label="Reseña anterior"><Icon icon={faChevronLeft} /></button>
        <ul className="rs-pista" ref={pista} onScroll={alDeslizar} aria-label="Reseñas de clientes">
          {lista.map((r, i) => (
            <li key={r.id || `${r.autor}-${i}`} className="rs-card">
              <Icon icon={faQuoteLeft} className="rs-comilla" />
              <Estrellas n={r.estrellas} />
              <p className="rs-texto">{r.texto}</p>
              <div className="rs-autor">
                {r.foto ? <img src={r.foto} alt="" referrerPolicy="no-referrer" loading="lazy" /> : <i>{inicial(r.autor)}</i>}
                <span><b>{r.autor}</b><small>{r.fecha ? `${r.fecha} · ` : ''}Google</small></span>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="rs-flecha rs-flecha--der" onClick={() => mover(1)} aria-label="Reseña siguiente"><Icon icon={faChevronRight} /></button>
      </div>

      <div className="rs-puntos" aria-hidden="true">
        {lista.map((r, i) => <button key={i} type="button" tabIndex={-1} className={i === actual ? 'is-on' : ''} onClick={() => ir(i)} />)}
      </div>

      <div className="rs-cta">
        <p>¿Ya te atendimos? Tu opinión nos ayuda muchísimo.</p>
        <div className="rs-cta-btns">
          {negocio.resenaUrl && <a className="btn" href={negocio.resenaUrl} target="_blank" rel="noreferrer"><Icon icon={faPen} />&nbsp; Dejar mi reseña</a>}
          {negocio.googleUrl && <a className="btn btn--ghost" href={negocio.googleUrl} target="_blank" rel="noreferrer"><Icon icon={faGoogle} />&nbsp; Ver todas en Google</a>}
        </div>
      </div>
    </section>
  )
}
