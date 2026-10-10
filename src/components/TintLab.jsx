import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Car from './Car.jsx'

const etapas = [
  { vlt: 70, nombre: 'Sin lámina', nota: 'Calor, reflejos y cero privacidad.' },
  { vlt: 50, nombre: 'Parabrisas 50%', nota: 'Filtro UV y menos encandilamiento.' },
  { vlt: 20, nombre: 'Intermedio', nota: 'El equilibrio perfecto entre estilo y visibilidad.' },
  { vlt: 5, nombre: 'Limo · Infiel', nota: 'Privacidad total. Nadie ve hacia adentro.' },
]

export default function TintLab() {
  const root = useRef(null)
  const vlt = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const estado = { v: 70 }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: '+=2600', scrub: 1, pin: true,
        },
      })
      tl.from('.tint-car-wrap', { scale: 0.7, rotateY: -25, opacity: 0.2, duration: 1 })
        .to(estado, { v: 5, duration: 4, ease: 'none', onUpdate: () => {
          if (!vlt.current) return
          vlt.current.textContent = Math.round(estado.v)
          // Etapa más cercana al VLT actual
          const i = etapas.reduce((m, e, k) => (Math.abs(e.vlt - estado.v) < Math.abs(etapas[m].vlt - estado.v) ? k : m), 0)
          root.current.dataset.etapa = i
        } }, 1)
        .to('.tint-car .car-tint', { opacity: 0.94, duration: 4, ease: 'none' }, 1)
        .to('.tint-car .car-glass', { opacity: 0.3, duration: 4, ease: 'none' }, 1)
        .to('.tint-heat i', { scaleY: 0.08, duration: 4, ease: 'none' }, 1)
        .to('.tint-ray', { opacity: 0.05, x: -60, duration: 4, ease: 'none', stagger: 0.1 }, 1)
          .to('.tint-car-wrap', { rotateY: 18, scale: 1.08, duration: 5, ease: 'none' }, 0)
        .to('.tint-car .car-shine', { x: 1400, duration: 5, ease: 'none' }, 0)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="polarizados" className="tint" ref={root} data-etapa="0">
      <div className="tint-head">
        <p className="eyebrow">Laboratorio de polarizado</p>
        <h2 className="h2">Desliza y <em>oscurece</em>.</h2>
      </div>

      <div className="tint-stage">
        <div className="tint-sun" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className="tint-ray" style={{ top: `${10 + i * 18}%` }} />)}
        </div>
        <div className="tint-car-wrap"><Car id="tint" className="tint-car" /></div>
      </div>

      <div className="tint-hud">
        <div className="tint-vlt">
          <span className="tint-vlt-num"><b ref={vlt}>70</b>%</span>
          <span className="tint-vlt-label">VLT · luz visible</span>
        </div>
        <ul className="tint-steps">
          {etapas.map((e, i) => (
            <li key={e.vlt} data-i={i}>
              <b>{e.vlt}%</b>
              <div><strong>{e.nombre}</strong><span>{e.nota}</span></div>
            </li>
          ))}
        </ul>
        <div className="tint-heat" aria-label="Calor dentro del auto">
          <span>Calor interior</span>
          <div className="tint-heat-bar"><i /></div>
        </div>
      </div>
    </section>
  )
}
