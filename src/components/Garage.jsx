import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { portafolio, categoriasPortafolio, autos, negocio } from '../data.js'
import { Icon, faInstagram, faStar, faArrowDown } from '../icons.js'

const NOMBRE = Object.fromEntries(categoriasPortafolio)

// Tarjetas que vuelan desde el fondo hacia la cámara mientras haces scroll.
// Muestra los trabajos marcados como "destacados" del Portafolio (si no hay, los primeros 8).
export default function Garage() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.garage-card')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.garage-pin', start: 'top top', end: `+=${cards.length * 360}`, scrub: 0.3, pin: true },
      })
      const k = window.innerWidth < 900 ? 0.25 : 1
      cards.forEach((card, i) => {
        const lado = (i % 2 ? 1 : -1) * k
        tl.fromTo(card,
          { z: -2400, x: `${lado * 18}vw`, y: 60, rotateY: lado * -25, opacity: 0 },
          { z: 0, x: `${lado * 8}vw`, y: 0, rotateY: lado * -8, opacity: 1, duration: 1, ease: 'none' }, i * 0.6)
          .to(card, { z: 900, x: `${lado * 60}vw`, rotateY: lado * -40, opacity: 0, duration: 0.8, ease: 'power1.in' }, i * 0.6 + 1)
      })
      tl.fromTo('.garage-title', { scale: 1 }, { scale: 0.6, opacity: 0.15, duration: 1, ease: 'none' }, 0)
    }, root)
    return () => ctx.revert()
  }, [])

  const destacados = portafolio.filter((x) => x.destacado)
  const tarjetas = (destacados.length ? destacados : portafolio.slice(0, 8)).slice(0, 12)

  return (
    <section id="trabajos" className="garage" ref={root}>
      <div className="garage-pin">
        <h2 className="garage-title">El <em>garage</em></h2>
        <div className="garage-space">
          {tarjetas.map((t) => (
            <article key={t.id} className="garage-card">
              <div className="garage-media"><img src={t.foto} alt={t.titulo} loading="lazy" /></div>
              <div className="garage-info">
                <h3>{t.titulo}</h3>
                <p>{NOMBRE[t.categoria]}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="garage-links">
          <a href="#portafolio"><Icon icon={faArrowDown} /> Ver todos los trabajos</a>
          <a href={negocio.instagram} target="_blank" rel="noreferrer"><Icon icon={faInstagram} /> +1.900 en Instagram</a>
        </div>
      </div>

      <div className="marquee" aria-label="Autos trabajados">
        {[0, 1].map((k) => (
          <div key={k} className="marquee-track" aria-hidden={k === 1}>
            {autos.map((a, i) => <span key={`${a}-${i}`}>{a}<Icon icon={faStar} className="marquee-ico" /></span>)}
          </div>
        ))}
      </div>
    </section>
  )
}
