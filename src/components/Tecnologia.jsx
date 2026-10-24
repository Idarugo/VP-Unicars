import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { tecnologia, waLink } from '../data.js'
import { Icon, faWhatsapp, faChevronLeft, faChevronRight } from '../icons.js'

// Tecnología y seguridad: tarjetas verticales con videos reales del taller, estilo "reels".
// Cada video se reproduce solo mientras está en pantalla (y nunca si el usuario pidió menos movimiento).
// Se editan en Mantención → Contenido web → Tecnología y seguridad.
export default function Tecnologia() {
  const root = useRef(null)
  const riel = useRef(null)

  useEffect(() => {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const videos = [...root.current.querySelectorAll('video')]
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting && !quieto) v.play().catch(() => {})
        else v.pause()
      })
    }, { threshold: 0.35 })
    videos.forEach((v) => io.observe(v))

    const ctx = gsap.context(() => {
      gsap.from('.tec-head > *', { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } })
      gsap.from('.tec-card', { x: 120, opacity: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: riel.current, start: 'top 85%' } })
    }, root)
    return () => { io.disconnect(); ctx.revert() }
  }, [])

  const mover = (dir) => {
    const r = riel.current
    const paso = r.querySelector('.tec-card')?.offsetWidth || 300
    r.scrollBy({ left: dir * (paso + 16) * 2, behavior: 'smooth' })
  }

  if (!tecnologia.length) return null

  return (
    <section id="tecnologia" className="tec" ref={root}>
      <div className="tec-head">
        <div>
          <p className="eyebrow">Tecnología y seguridad</p>
          <h2 className="h2">Tu auto, <em>más inteligente</em>.</h2>
          <p className="muted">Pantallas, cámaras, inmovilizadores, luces y audio. Videos reales de nuestro taller.</p>
        </div>
        <div className="tec-flechas">
          <button type="button" onClick={() => mover(-1)} aria-label="Anteriores"><Icon icon={faChevronLeft} /></button>
          <button type="button" onClick={() => mover(1)} aria-label="Siguientes"><Icon icon={faChevronRight} /></button>
        </div>
      </div>

      <ul className="tec-riel" ref={riel}>
        {tecnologia.map((x) => (
          <li key={x.id} className="tec-card">
            <video src={x.video} poster={x.poster} muted loop playsInline preload="none" aria-hidden="true" />
            <div className="tec-info">
              {x.etiqueta && <span className="tec-chip">{x.etiqueta}</span>}
              <h3>{x.titulo}</h3>
              {x.texto && <p>{x.texto}</p>}
              <a href={waLink(`Hola VP Unicars! Quiero cotizar ${x.titulo.toLowerCase()} 🚘`)} target="_blank" rel="noreferrer" aria-label={`Cotizar ${x.titulo} por WhatsApp`}>
                <Icon icon={faWhatsapp} /> Cotizar
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
