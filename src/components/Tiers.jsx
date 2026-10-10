import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { niveles, waLink } from '../data.js'
import { Icon, faSun, faShieldHalved, faCircleCheck, faStar, faWhatsapp } from '../icons.js'

const metricas = [
  ['calor', 'Rechazo de calor', faSun],
  ['uv', 'Protección UV', faShieldHalved],
  ['claridad', 'Claridad de visión', faCircleCheck],
  ['durabilidad', 'Durabilidad', faStar],
]

export default function Tiers() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.tier', {
        y: 120, rotateX: -30, opacity: 0, duration: 1.4, stagger: 0.15, ease: 'expo.out',
        scrollTrigger: { trigger: '.tiers-grid', start: 'top 80%' },
      })
      gsap.utils.toArray('.tier-bar i').forEach((bar) => {
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: bar.dataset.v / 100, duration: 1.6, ease: 'power3.out',
          scrollTrigger: { trigger: bar, start: 'top 90%' },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const tilt = (e) => {
    const c = e.currentTarget
    const r = c.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(c, { rotateY: x * 16, rotateX: -y * 16, duration: 0.6, ease: 'power3.out' })
    c.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
    c.style.setProperty('--my', `${(y + 0.5) * 100}%`)
  }
  const reset = (e) => gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, .5)' })

  return (
    <section className="tiers" ref={root}>
      <div className="section-head">
        <p className="eyebrow">No todos los polarizados son iguales</p>
        <h2 className="h2">Elige tu <em>nivel</em>.</h2>
        <p className="muted">Opciones que se adaptan a tus necesidades y presupuesto.</p>
      </div>
      <div className="tiers-grid">
        {niveles.map((n) => (
          <article key={n.nombre} className={`tier ${n.destacado ? 'tier--hot' : ''}`} onPointerMove={tilt} onPointerLeave={reset} data-hover>
            {n.destacado && <span className="tier-badge">Más elegido</span>}
            <h3>{n.nombre}</h3>
            <p className="muted">{n.desc}</p>
            <ul className="tier-metrics">
              {metricas.map(([k, label, ico]) => (
                <li key={k}>
                  <div className="tier-row"><span><Icon icon={ico} className="tier-ico" /> {label}</span><b>{k === 'uv' ? `${n[k]}%` : ''}</b></div>
                  <div className="tier-bar"><i data-v={n[k]} /></div>
                </li>
              ))}
            </ul>
            <a className={`btn ${n.destacado ? '' : 'btn--ghost'}`} href={waLink(`Hola! Quiero cotizar polarizado ${n.nombre} 🚘`)} target="_blank" rel="noreferrer">
              <Icon icon={faWhatsapp} />&nbsp; Cotizar {n.nombre}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
