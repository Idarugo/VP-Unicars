import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { waLink } from '../data.js'
import { irA } from './Nav.jsx'
import { Icon, faWhatsapp, faLocationDot, faArrowDown } from '../icons.js'
import { Secuencia, cuandoLibre } from '../cuadros.js'

// Portada: video real del taller (instalación de polarizado en un BMW, oct. 2026), estabilizado.
// Al hacer scroll avanza cuadro a cuadro: la cámara se acerca hasta la espátula sobre el vidrio.
// Hay dos juegos de cuadros: 1600×900 para pantallas horizontales y un recorte vertical 576×1024
// (sacado del video original) para celulares, así nunca se estira una imagen chica.
const TOTAL = 96
const VERTICAL = typeof window !== 'undefined' && window.innerWidth < window.innerHeight
const CARPETA = `portada-real/${VERTICAL ? 'm' : 'd'}`

const Split = ({ text }) =>
  text.split('').map((c, i) => <span key={i} className="ch">{c === ' ' ? ' ' : c}</span>)

export default function HeroVideo({ listo }) {
  const root = useRef(null)
  const canvas = useRef(null)
  const seq = useRef(null)
  const estado = useRef({ f: 0, ultimo: -1 })
  const completarCarga = useRef(() => {})

  const pintar = () => {
    const e = estado.current
    const sq = seq.current
    if (!sq) return
    const pedido = Math.round(e.f)
    sq.mover(pedido)
    const i = sq.cercano(pedido)
    if (i < 0 || i === e.ultimo) return
    e.ultimo = i
    const img = sq.bitmaps[i]
    const c = canvas.current
    const ctx = c.getContext('2d')
    const r = Math.max(c.width / img.width, c.height / img.height)
    const w = img.width * r, h = img.height * r
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h)
  }

  useEffect(() => {
    const urls = Array.from({ length: TOTAL }, (_, i) => `/seq/${CARPETA}/${String(i + 1).padStart(3, '0')}.webp`)
    const sq = new Secuencia(urls, { alListo: () => { estado.current.ultimo = -1; pintar() } })
    seq.current = sq
    // Primero el cuadro inicial y 1 de cada 4 (la portada ya se puede recorrer). Apenas el navegador
    // queda libre se descarga el resto en segundo plano, para que al deslizar ya esté todo.
    sq.descargar([0], 'high')
    sq.descargar(urls.map((_, i) => i).filter((i) => i % 4 === 0))
    completarCarga.current = () => {
      completarCarga.current = () => {}
      sq.descargar(urls.map((_, i) => i))
    }
    const timer = setTimeout(() => cuandoLibre(() => completarCarga.current()), 1200)

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
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
      sq.destruir()
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
      <canvas ref={canvas} className="hv-canvas" role="img" aria-label="Técnico de VP Unicars instalando polarizado en un BMW en el taller" />
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
