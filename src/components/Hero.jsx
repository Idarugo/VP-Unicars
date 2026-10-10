import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { waLink } from '../data.js'
import { irA } from './Nav.jsx'

const Split = ({ text }) =>
  text.split('').map((c, i) => <span key={i} className="ch">{c === ' ' ? ' ' : c}</span>)

export default function Hero({ listo }) {
  const root = useRef(null)
  const canvas = useRef(null)
  const escena = useRef(null)

  // Carga Three.js solo para la portada (código separado del resto)
  useEffect(() => {
    let cancelado = false
    const gl = document.createElement('canvas').getContext('webgl2')
    if (!gl) { root.current.classList.add('hero--sin-3d'); return }
    import('../three/heroScene.js').then(({ crearEscena }) => {
      if (cancelado) return
      escena.current = crearEscena(canvas.current, { movil: window.innerWidth < 900 })
      root.current.classList.add('hero--3d')
    })
    return () => { cancelado = true; escena.current?.destruir() }
  }, [])

  useEffect(() => {
    if (!listo) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero-title .ch', { yPercent: 120, rotateX: -80, opacity: 0, duration: 1.4, stagger: 0.035 }, 0.3)
        .from('.hero-kicker, .hero-sub, .hero-ctas > *', { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.6)
        .from('.hero-scroll', { opacity: 0, duration: 1 }, 1.6)
        .fromTo('.hero-canvas', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0)

      // Entrada del logo 3D + la lámina de polarizado que lo cruza
      const espera = () => escena.current?.estado
      const animarEscena = () => {
        const e = espera()
        if (!e) return gsap.delayedCall(0.1, animarEscena)
        if (reduce) { e.intro = 1; return }
        gsap.to(e, { intro: 1, duration: 2.4, ease: 'expo.out' })
        gsap.fromTo(e, { lamina: 0 }, { lamina: 1, duration: 2.2, ease: 'power2.inOut', delay: 1.2 })
      }
      animarEscena()

      gsap.timeline({
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1,
          onUpdate: (st) => { if (escena.current) escena.current.estado.scroll = st.progress },
          onToggle: (st) => { if (escena.current) escena.current.estado.activo = st.isActive },
        },
      })
        .to('.hero-title', { yPercent: -40, scale: 0.9, opacity: 0, ease: 'none' }, 0)
        .to('.hero-copy', { y: -120, opacity: 0, ease: 'none' }, 0)

      // Velocidad del scroll → estelas de luz
      const vel = () => { if (escena.current) escena.current.estado.velocidad = window.__lenis?.velocity || 0 }
      gsap.ticker.add(vel)
      return () => gsap.ticker.remove(vel)
    }, root)
    return () => ctx.revert()
  }, [listo])

  const onMove = (e) => {
    if (!escena.current) return
    const r = root.current.getBoundingClientRect()
    escena.current.estado.mx = ((e.clientX - r.left) / r.width) * 2 - 1
    escena.current.estado.my = ((e.clientY - r.top) / r.height) * 2 - 1
  }
  const onLeave = () => { if (escena.current) { escena.current.estado.mx = 0; escena.current.estado.my = 0 } }

  return (
    <section id="top" className="hero" ref={root} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="hero-floor"><div className="hero-floor-grid" /></div>
      <div className="hero-noise" />

      <h1 className="hero-title" aria-label="VP Unicars">
        <span className="row row--fallback"><Split text="VP" /></span>
        <span className="row row--stroke"><Split text="UNICARS" /></span>
      </h1>

      <canvas ref={canvas} className="hero-canvas" aria-hidden="true" />

      <div className="hero-copy">
        <p className="hero-kicker"><span className="dot" /> Rancagua · Mall Plaza América</p>
      </div>

      <div className="hero-copy hero-copy--bottom">
        <p className="hero-sub">
          Polarizados, PPF, vinilos y láminas de seguridad.<br />
          <strong>Transformamos y protegemos</strong> autos, hogares y oficinas.
        </p>
        <div className="hero-ctas">
          <a className="btn" href={waLink()} target="_blank" rel="noreferrer">Agenda tu hora</a>
          <a className="btn btn--ghost" href="#servicios" onClick={(e) => irA(e, '#servicios')}>Ver servicios</a>
        </div>
      </div>

      <div className="hero-scroll"><span>Desliza</span><i /></div>
    </section>
  )
}
