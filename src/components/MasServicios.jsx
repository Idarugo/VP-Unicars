import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { masServicios, waLink } from '../data.js'
import { Icon, faVolumeHigh, faPowerOff, faBell, faLightbulb, faBolt, faIdCard, faWhatsapp, faArrowRight, faScrewdriverWrench, faCar, faStar } from '../icons.js'

const iconos = {
  audio: faVolumeHigh, corriente: faPowerOff, seguridad: faBell,
  luces: faLightbulb, electricidad: faBolt, grabado: faIdCard,
  herramienta: faScrewdriverWrench, auto: faCar, estrella: faStar,
}

// Servicios adicionales de VP Unicars (todo se cotiza por el mismo WhatsApp).
export default function MasServicios() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ms-card', {
        y: 60, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out',
        scrollTrigger: { trigger: '.ms-grid', start: 'top 85%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const brillo = (e) => {
    const c = e.currentTarget
    const r = c.getBoundingClientRect()
    c.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    c.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <section id="mas-servicios" className="ms" ref={root}>
      <div className="section-head">
        <p className="eyebrow">Más que polarizado</p>
        <h2 className="h2">Todo para tu auto, <em>en un solo lugar</em>.</h2>
        <p className="muted">Audio, seguridad, iluminación y más. Cotiza y agenda todo por el mismo WhatsApp.</p>
      </div>
      <div className="ms-grid">
        {masServicios.map((s) => (
          <article key={s.id} className="ms-card" onPointerMove={brillo}>
            <div className="ms-media">
              {s.foto ? <img src={s.foto} alt={s.titulo} loading="lazy" /> : <Icon icon={iconos[s.icono] || faScrewdriverWrench} className="ms-ico" />}
            </div>
            <h3>{s.titulo}</h3>
            <p>{s.texto}</p>
            <a className="service-link" href={waLink(`Hola VP Unicars! Quiero cotizar ${s.titulo.toLowerCase()} 🚘`)} target="_blank" rel="noreferrer" aria-label={`Cotizar ${s.titulo} por WhatsApp`}>
              <Icon icon={faWhatsapp} /> Cotizar <span><Icon icon={faArrowRight} /></span>
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
