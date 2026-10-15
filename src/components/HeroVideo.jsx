import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { waLink } from '../data.js'
import { irA } from './Nav.jsx'
import { Icon, faWhatsapp, faLocationDot, faArrowDown } from '../icons.js'

// Portada: video generado con Google Flow (Veo) al estilo de los reels de VP Unicars.
// Al hacer scroll avanza cuadro a cuadro: la cámara se acerca mientras se instala el polarizado.
const CARPETA = 'flow-taller'
const TOTAL = 90

const Split = ({ text }) =>
  text.split('').map((c, i) => <span key={i} className="ch">{c === ' ' ? ' ' : c}</span>)

export default function HeroVideo({ listo }) {
  const root = useRef(null)
  const canvas = useRef(null)
  const frames = useRef([])
  const estado = useRef({ f: 0, ultimo: -1 })
  const completarCarga = useRef(() => {})

  const pintar = () => {
    const e = estado.current
    let i = Math.round(e.f)
    const fr = frames.current
    while (i > 0 && !(fr[i]?.complete && fr[i]?.naturalWidth)) i--
    const img = fr[i]
    if (!img?.complete || !img.naturalWidth || i === e.ultimo) return
    e.ultimo = i
    const c = canvas.current
    const ctx = c.getContext('2d')
    const movil = c.width < c.height
    const r = Math.max(c.width / img.width, c.height / img.height)
    const w = img.width * r, h = img.height * r
    // En celular se centra en el vidrio y la espátula
    const x = movil ? (c.width - w) * 0.45 : (c.width - w) / 2
    ctx.drawImage(img, x, (c.height - h) / 2, w, h)
  }

  useEffect(() => {
    frames.current = Array(TOTAL)
    const cargar = (i) => {
      if (frames.current[i]) return
      const img = new Image()
      img.decoding = 'async'
      if (i === 0) img.fetchPriority = 'high'
      img.onload = () => { estado.current.ultimo = -1; pintar() } // repinta apenas llega un cuadro útil
      img.src = `/seq/${CARPETA}/${String(i + 1).padStart(3, '0')}.webp`
      frames.current[i] = img
    }
    // Al entrar: 1 de cada 4 cuadros (ya se puede recorrer completo, con 1/4 del peso).
    // El resto se descarga apenas la persona empieza a deslizar la portada (o a los pocos segundos).
    for (let i = 0; i < TOTAL; i += 4) cargar(i)
    const timer = setTimeout(() => completarCarga.current(), 12000)
    completarCarga.current = () => {
      clearTimeout(timer)
      completarCarga.current = () => {}
      for (let i = 0; i < TOTAL; i++) cargar(i)
    }

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.current.width = canvas.current.clientWidth * dpr
      canvas.current.height = canvas.current.clientHeight * dpr
      estado.current.ultimo = -1
      pintar()
    }
    ajustar()
    window.addEventListener('resize', ajustar)
    return () => {
      window.removeEventListener('resize', ajustar)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!listo) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.hv-canvas', { scale: 1.15, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 1.4 }, 0)
        .from('.hv-title .ch', { yPercent: 120, opacity: 0, duration: 1.3, stagger: 0.04 }, 0.4)
        .from('.hv-kicker, .hv-ctas > *, .hv-scroll', { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.8)
        .from('.hv-sub', { y: 24, duration: 1 }, 0.85) // solo se desliza: sin desaparecer, para que se pinte desde el primer momento

      gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=1500', scrub: 0.25, pin: true, refreshPriority: 1 },
      })
        .to(estado.current, {
          f: TOTAL - 1, duration: 10, ease: 'none',
          onUpdate: () => { if (estado.current.f > 0.5) completarCarga.current(); pintar() },
        }, 0)
        .to('.hv-copy', { opacity: 0, y: -60, duration: 2 }, 0.3)
        .to('.hv-scroll', { opacity: 0, duration: 0.5 }, 0)
        .fromTo('.hv-end', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2 }, 7.6)
    }, root)
    return () => ctx.revert()
  }, [listo])

  return (
    <section id="top" className="hv" ref={root}>
      <canvas ref={canvas} className="hv-canvas" role="img" aria-label="Técnico de VP Unicars instalando polarizado en un BMW negro" />
      <div className="hv-shade" />

      <div className="hv-copy">
        <p className="hv-kicker"><Icon icon={faLocationDot} className="hv-pin" /> Rancagua · Mall Plaza América</p>
        <h1 className="hv-title" aria-label="VP Unicars">
          <span className="row"><Split text="VP" /> <span className="hv-stroke"><Split text="UNICARS" /></span></span>
        </h1>
        <p className="hv-sub">
          <strong>Protección y estilo</strong> en un solo lugar.<br />
          Polarizados, PPF, vinilos, audio y sistemas de seguridad para autos, hogares y oficinas.
        </p>
        <div className="hv-ctas">
          <a className="btn" href={waLink()} target="_blank" rel="noreferrer"><Icon icon={faWhatsapp} />&nbsp; Agenda tu hora</a>
          <a className="btn btn--ghost" href="#servicios" onClick={(e) => irA(e, '#servicios')}>Ver servicios</a>
        </div>
      </div>

      <div className="hv-end">
        <p className="eyebrow">Así trabajamos · Mall Plaza América</p>
        <p className="hv-end-t">Precisión de competencia, en cada vidrio.</p>
      </div>

      <div className="hv-scroll"><span>Desliza</span><Icon icon={faArrowDown} className="hv-arrow" /></div>
    </section>
  )
}
