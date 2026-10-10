import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon, faArrowDown } from '../icons.js'

// Efecto Apple: un video real que avanza cuadro a cuadro con el scroll.
// Los cuadros se extrajeron de los reels de @vp_unicars a /public/seq/<nombre>/001.webp ...
export default function FrameScroll({ id, carpeta, total, kicker, titulo, beats, lado = 'izq' }) {
  const root = useRef(null)
  const fg = useRef(null)
  const bg = useRef(null)
  const hud = useRef(null)

  useEffect(() => {
    const frames = []
    const src = (i) => `/seq/${carpeta}/${String(i + 1).padStart(3, '0')}.webp`
    const estado = { f: 0 }
    let ultimo = -1

    const pintar = (canvas, img, cover) => {
      const ctx = canvas.getContext('2d')
      const cw = canvas.width, ch = canvas.height
      const r = cover ? Math.max(cw / img.width, ch / img.height) : Math.min(cw / img.width, ch / img.height)
      const w = img.width * r, h = img.height * r
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    }

    const render = () => {
      let i = Math.round(estado.f)
      // Si el cuadro todavía no carga, usa el más cercano ya cargado
      while (i > 0 && !(frames[i] && frames[i].complete && frames[i].naturalWidth)) i--
      const img = frames[i]
      if (!img || !img.complete || i === ultimo) return
      ultimo = i
      pintar(fg.current, img, true)
      pintar(bg.current, img, true)
      if (hud.current) hud.current.textContent = `${String(Math.round(estado.f) + 1).padStart(3, '0')} / ${total}`
    }

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      for (const c of [fg.current, bg.current]) {
        const r = c.getBoundingClientRect()
        // El fondo se dibuja en baja resolución: queda difuminado sin usar filter: blur
        const k = c === bg.current ? 1 / 24 : dpr
        c.width = Math.max(1, Math.round(r.width * k))
        c.height = Math.max(1, Math.round(r.height * k))
      }
      ultimo = -1
      render()
    }

    const cargar = () => {
      if (frames.length) return
      for (let i = 0; i < total; i++) {
        const img = new Image()
        img.decoding = 'async'
        img.src = src(i)
        img.onload = () => { ultimo = -1; render() } // repinta apenas llega un cuadro útil
        frames.push(img)
      }
    }

    const ctx = gsap.context(() => {
      // Precarga cuando la sección se acerca
      ScrollTrigger.create({ trigger: root.current, start: 'top bottom+=3000', once: true, onEnter: cargar })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: `+=${total * 15}`, scrub: 0.25, pin: true },
      })
      tl.to(estado, { f: total - 1, duration: 10, ease: 'none', onUpdate: render }, 0)
        .fromTo('.seq-frame', { scale: 0.55, borderRadius: 40, rotateX: 18, y: 80 },
          { scale: 1, borderRadius: 0, rotateX: 0, y: 0, duration: 2.2, ease: 'power2.inOut' }, 0)
        .fromTo('.seq-bg', { opacity: 0 }, { opacity: 1, duration: 2 }, 0)
        .to('.seq-intro', { opacity: 0, y: -60, duration: 1.4 }, 0.3)
        .to('.seq-frame', { scale: 0.9, borderRadius: 36, duration: 1.2, ease: 'power2.inOut' }, 8.8)

      beats.forEach((b, i) => {
        const sel = `.seq-beat[data-i="${i}"]`
        tl.fromTo(sel, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7 }, b.desde)
          .to(sel, { opacity: 0, y: -50, duration: 0.7 }, b.hasta)
      })
    }, root)

    ajustar()
    window.addEventListener('resize', ajustar)
    return () => {
      ctx.revert()
      window.removeEventListener('resize', ajustar)
    }
  }, [carpeta, total, beats])

  return (
    <section id={id} className={`seq seq--${lado}`} ref={root}>
      <canvas ref={bg} className="seq-bg" aria-hidden="true" />
      <div className="seq-intro">
        <p className="eyebrow">{kicker}</p>
        <h2 className="h2">{titulo}</h2>
        <p className="seq-hint">Desliza para ver el proceso <Icon icon={faArrowDown} /></p>
      </div>
      <div className="seq-stage">
        <div className="seq-frame">
          <canvas ref={fg} className="seq-fg" role="img" aria-label={titulo} />
        </div>
      </div>
      {beats.map((b, i) => (
        <div key={i} className="seq-beat" data-i={i}>
          <span className="seq-beat-n">0{i + 1}</span>
          <h3>{b.t}</h3>
          <p>{b.d}</p>
        </div>
      ))}
      <div className="seq-hud"><i className="dot" /> REC · <span ref={hud}>001 / {total}</span></div>
    </section>
  )
}
