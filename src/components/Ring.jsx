import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { negocio } from '../data.js'
import { Icon, faInstagram } from '../icons.js'

const fotos = [
  'porsche-ppf.jpg', 'tornasol.webp', 'bmw-520i.jpg', 'ahumado-focos.webp', 'nanocarbon.jpg', 'arquitectonico-bronce.webp',
  'kill-chrome.jpg', 'fibra-carbono.webp', 'territory-ppf.jpg', 'polarizado-5.webp', 'pilares-carbono.jpg', 'ppf-moto.webp',
  'nanoceramico.jpg', 'laminas-seguridad.webp', 'privacidad.jpg', 'pilares-ppf.webp', 'arquitectonico.webp', 'piano-black.jpg',
  'hogar-espejo-patio.webp', 'hogar-instalacion.webp', 'hogar-espejo-ladrillo.webp', 'hogar-espejo-madera.webp',
]

// Anillo 3D de fotos: gira con el scroll y se puede arrastrar.
export default function Ring() {
  const root = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const n = fotos.length
    const estado = { scroll: 0, drag: 0, inercia: 0 }
    const ctx = gsap.context(() => {
      gsap.from('.ring-item', {
        opacity: 0, y: 200, rotateX: -60, stagger: 0.04, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      })
      gsap.to(estado, {
        scroll: -220, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.3 },
      })
      gsap.fromTo('.ring-stage', { rotateX: 14 }, {
        rotateX: -8, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.3 },
      })
    }, root)

    // Arrastre con inercia
    let arrastrando = false, ultimoX = 0
    const el = root.current
    const down = (e) => { arrastrando = true; ultimoX = e.clientX; el.classList.add('is-drag') }
    const move = (e) => {
      if (!arrastrando) return
      const dx = e.clientX - ultimoX
      ultimoX = e.clientX
      estado.drag += dx * 0.25
      estado.inercia = dx * 0.25
    }
    const up = () => { arrastrando = false; el.classList.remove('is-drag') }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)

    // Solo anima cuando la galería está en pantalla
    let visible = false
    const vis = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (st) => (visible = st.isActive) })

    const tick = () => {
      if (!visible) return
      if (!arrastrando) {
        estado.drag += estado.inercia
        estado.inercia *= 0.94
        estado.drag -= 0.04 // giro lento constante
      }
      const rot = estado.scroll + estado.drag
      ring.current.style.transform = `translateZ(calc(var(--r) * -1)) rotateY(${rot}deg)`
      // Opacidad según qué tan de frente está cada foto
      ring.current.childNodes.forEach((item, i) => {
        const a = ((((i * 360) / n + rot) % 360) + 360) % 360
        const frente = Math.cos((a * Math.PI) / 180)
        item.style.opacity = 0.25 + Math.max(0, frente) * 0.75
      })
    }
    gsap.ticker.add(tick)

    return () => {
      ctx.revert()
      gsap.ticker.remove(tick)
      vis.kill()
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <section className="ring" ref={root}>
      <div className="section-head">
        <p className="eyebrow">Galería 360°</p>
        <h2 className="h2">Arrastra. <em>Gira.</em> Mira.</h2>
      </div>
      <div className="ring-stage">
        <div className="ring-track" ref={ring} style={{ '--n': fotos.length }}>
          {fotos.map((f, i) => (
            <figure key={f} className="ring-item" style={{ '--i': i }}>
              <img src={`/fotos/${f}`} alt="" draggable="false" loading="lazy" />
            </figure>
          ))}
        </div>
        <div className="ring-floor" />
      </div>
      <a className="ring-ig" href={negocio.instagram} target="_blank" rel="noreferrer"><Icon icon={faInstagram} /> Ver todo en @vp_unicars</a>
    </section>
  )
}
