import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { negocio, waLink } from '../data.js'
import Logo from './Logo.jsx'
import { Icon, faLocationDot, faWhatsapp, faInstagram } from '../icons.js'

export default function Contact() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-big .ch', {
        yPercent: 110, duration: 1.2, stagger: 0.03, ease: 'expo.out',
        scrollTrigger: { trigger: '.contact-big', start: 'top 85%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // Botón magnético
  const mag = (e) => {
    const b = e.currentTarget
    const r = b.getBoundingClientRect()
    gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5 })
  }
  const unmag = (e) => gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, .4)' })

  return (
    <section id="contacto" className="contact" ref={root}>
      <p className="eyebrow">Agenda por DM o WhatsApp</p>
      <h2 className="contact-big">
        {'¿HACEMOS'.split('').map((c, i) => <span key={i} className="ch">{c}</span>)}
        <br />
        <em>{'MAGIA?'.split('').map((c, i) => <span key={i} className="ch">{c}</span>)}</em>
      </h2>

      <a className="contact-cta" href={waLink()} target="_blank" rel="noreferrer" onPointerMove={mag} onPointerLeave={unmag}>
        <Icon icon={faWhatsapp} className="contact-cta-ico" />
        <span>Escríbenos por WhatsApp</span>
        <small>+56 9 3023 5194</small>
      </a>

      <div className="contact-grid">
        <div className="contact-info">
          <div><span className="muted">Dónde</span><a href={negocio.mapaLink} target="_blank" rel="noreferrer"><Icon icon={faLocationDot} className="ico" /> {negocio.direccion}</a></div>
          <div><span className="muted">WhatsApp</span><a href={waLink()} target="_blank" rel="noreferrer"><Icon icon={faWhatsapp} className="ico" /> +56 9 3023 5194</a></div>
          <div><span className="muted">Instagram</span><a href={negocio.instagram} target="_blank" rel="noreferrer"><Icon icon={faInstagram} className="ico" /> @vp_unicars</a></div>
        </div>
        <div className="contact-map">
          <iframe title="Mapa VP Unicars" src={negocio.mapa} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>

      <footer className="footer">
        <div className="footer-brand"><Logo /> <span>VP UNICARS</span></div>
        <div className="footer-social">
          <a href={negocio.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon icon={faInstagram} /></a>
          <a href={waLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon icon={faWhatsapp} /></a>
          <a href={negocio.mapaLink} target="_blank" rel="noreferrer" aria-label="Ubicación"><Icon icon={faLocationDot} /></a>
        </div>
        <p className="muted">Polarizados • PPF • Vinilos • Láminas de Seguridad — Rancagua, Chile</p>
        <p className="muted small">© {new Date().getFullYear()} VP Unicars</p>
      </footer>
    </section>
  )
}
