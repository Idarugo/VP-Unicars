import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { servicios, waLink } from '../data.js'
import ServiceArt from './ServiceArt.jsx'
import { Icon, faArrowRight, faWhatsapp } from '../icons.js'

export default function Services() {
  const root = useRef(null)
  const track = useRef(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const distancia = () => track.current.scrollWidth - window.innerWidth
      const scroll = gsap.to(track.current, {
        x: () => -distancia(), ease: 'none',
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: () => `+=${distancia()}`,
          scrub: 1, pin: true, invalidateOnRefresh: true,
        },
      })
      // Cada tarjeta gira en 3D según su posición en pantalla (efecto carrusel Apple)
      gsap.utils.toArray('.service-card').forEach((card) => {
        gsap.fromTo(card, { rotateY: -38, z: -220, opacity: 0.35 }, {
          rotateY: 0, z: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: scroll, start: 'left right', end: 'center center', scrub: true },
        })
        gsap.to(card, {
          rotateY: 32, z: -180, opacity: 0.4, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: scroll, start: 'center 35%', end: 'right left', scrub: true },
        })
      })
      gsap.to('.services-progress i', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distancia()}`, scrub: true },
      })
    })
    mm.add('(max-width: 899px)', () => {
      gsap.utils.toArray('.service-card').forEach((card) => {
        gsap.from(card, { y: 80, rotateX: -25, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%' } })
      })
    })
    return () => mm.revert()
  }, [])

  const tilt = (e) => {
    const c = e.currentTarget
    const r = c.getBoundingClientRect()
    c.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    c.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <section id="servicios" className="services" ref={root}>
      <div className="services-track" ref={track}>
        <div className="services-intro">
          <p className="eyebrow">Lo que hacemos</p>
          <h2 className="h2">Siete formas de<br /><em>transformar</em><br />tu auto.</h2>
          <p className="muted">Cada servicio, con un clic para cotizar por WhatsApp.</p>
        </div>
        {servicios.map((s) => (
          <article key={s.id} className="service-card" onPointerMove={tilt} data-hover>
            <div className="service-card-inner">
              <div className="service-top">
                <span className="service-num">{s.num}</span>
                <span className="service-sub">{s.sub}</span>
              </div>
              <div className="service-media">
                {s.foto ? <img src={s.foto} alt={s.titulo} loading="lazy" /> : <ServiceArt art={s.art} />}
              </div>
              <h3>{s.titulo}</h3>
              <p>{s.texto}</p>
              <ul className="tags">{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              <a className="service-link" href={waLink(`Hola! Quiero cotizar ${s.titulo} 🚘`)} target="_blank" rel="noreferrer">
                <Icon icon={faWhatsapp} /> Cotizar {s.titulo} <span><Icon icon={faArrowRight} /></span>
              </a>
            </div>
          </article>
        ))}
        <div className="services-end">
          <p className="h2">¿Tienes un<br />proyecto <em>único</em>?</p>
          <a className="btn" href={waLink('Hola! Tengo un proyecto especial para mi auto 🔥')} target="_blank" rel="noreferrer"><Icon icon={faWhatsapp} />&nbsp; Conversemos</a>
        </div>
      </div>
      <div className="services-progress"><i /></div>
    </section>
  )
}
