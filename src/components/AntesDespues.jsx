import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { comparaciones, waLink } from '../data.js'
import { Icon, faWhatsapp, faChevronLeft, faChevronRight } from '../icons.js'

// Comparador antes / después (dentro del Portafolio) con fotos reales alineadas: se arrastra la línea (mouse, dedo o teclado).
// Al llegar a la sección, la línea hace un barrido solo para mostrar que se puede mover.
// Se edita en Mantención → Contenido web → Antes y después.
export default function AntesDespues() {
  const root = useRef(null)
  const marco = useRef(null)
  const [i, setI] = useState(0)
  const [pos, setPos] = useState(50)
  const arrastrando = useRef(false)
  const barrido = useRef(null)

  useEffect(() => {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      gsap.from(marco.current, { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 80%' } })
      if (quieto) return
      const p = { v: 100 }
      barrido.current = gsap.timeline({ scrollTrigger: { trigger: marco.current, start: 'top 70%', once: true } })
        .to(p, { v: 6, duration: 1.4, ease: 'power2.inOut', onUpdate: () => setPos(p.v) })
        .to(p, { v: 50, duration: 1.1, ease: 'expo.out', onUpdate: () => setPos(p.v) })
    }, root)
    return () => ctx.revert()
  }, [])

  const mover = (e) => {
    const r = marco.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }
  const bajar = (e) => {
    barrido.current?.kill()
    arrastrando.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    mover(e)
  }
  const tecla = (e) => {
    const d = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[e.key]
    if (d == null) return
    e.preventDefault(); barrido.current?.kill()
    setPos((v) => Math.min(100, Math.max(0, v + d)))
  }

  if (!comparaciones.length) return null
  const x = comparaciones[Math.min(i, comparaciones.length - 1)]
  const cambiar = (d) => { setI((v) => (v + d + comparaciones.length) % comparaciones.length); setPos(50) }

  return (
    <div id="antes-despues" className="ad" ref={root}>

      <div
        className="ad-marco" ref={marco}
        onPointerDown={bajar}
        onPointerMove={(e) => arrastrando.current && mover(e)}
        onPointerUp={() => { arrastrando.current = false }}
        onPointerCancel={() => { arrastrando.current = false }}
        style={{ '--pos': `${pos}%` }}
      >
        <img src={x.antes} alt={`${x.titulo}: ${x.etiquetaAntes || 'antes'}`} draggable="false" />
        <img className="ad-despues" src={x.despues} alt={`${x.titulo}: ${x.etiquetaDespues || 'después'}`} draggable="false" />
        <span className="ad-tag ad-tag--antes">{x.etiquetaAntes || 'Antes'}</span>
        <span className="ad-tag ad-tag--despues">{x.etiquetaDespues || 'Después'}</span>
        <div
          className="ad-linea" role="slider" tabIndex={0} onKeyDown={tecla}
          aria-label="Mover para comparar antes y después" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)}
        >
          <span className="ad-mango"><Icon icon={faChevronLeft} /><Icon icon={faChevronRight} /></span>
        </div>
      </div>

      <div className="ad-pie">
        <div>
          <b>{x.titulo}</b>
          {x.detalle && <small className="ad-detalle">{x.detalle}</small>}
          {comparaciones.length > 1 && (
            <span className="ad-nav">
              <button type="button" onClick={() => cambiar(-1)} aria-label="Comparación anterior"><Icon icon={faChevronLeft} /></button>
              {i + 1} / {comparaciones.length}
              <button type="button" onClick={() => cambiar(1)} aria-label="Comparación siguiente"><Icon icon={faChevronRight} /></button>
            </span>
          )}
        </div>
        <a className="btn" href={waLink(`Hola VP Unicars! Vi el antes y después del ${x.titulo} y quiero cotizar 🚘`)} target="_blank" rel="noreferrer">
          <Icon icon={faWhatsapp} />&nbsp; Quiero este cambio
        </a>
      </div>
    </div>
  )
}
