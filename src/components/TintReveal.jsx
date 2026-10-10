import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Video generado con Google Flow (Veo): el auto pasa de vidrios claros a polarizado.
// Se reproduce cuadro a cuadro con el scroll, a pantalla completa.
export default function TintReveal({
  id = 'polarizados', carpeta = 'flow-tint', total = 96,
  linea1 = 'Mira cómo', linea2 = <><em>desaparece</em> el interior.</>,
  kicker = 'Polarizado nanocerámico', cierre = 'Privacidad total. Calor fuera.', vltHud = true,
}) {
  const root = useRef(null)
  const canvas = useRef(null)
  const vlt = useRef(null)

  useEffect(() => {
    const frames = []
    const estado = { f: 0 }
    let ultimo = -1

    const pintar = () => {
      let i = Math.round(estado.f)
      while (i > 0 && !(frames[i]?.complete && frames[i].naturalWidth)) i--
      const img = frames[i]
      if (!img?.complete || i === ultimo) return
      ultimo = i
      const c = canvas.current
      const ctx = c.getContext('2d')
      const r = Math.max(c.width / img.width, c.height / img.height)
      const w = img.width * r, h = img.height * r
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h)
      // VLT simulado: de 70% (claro) a 5% (limo)
      if (vlt.current) vlt.current.textContent = Math.round(70 - (estado.f / (total - 1)) * 65)
    }

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.current.width = canvas.current.clientWidth * dpr
      canvas.current.height = canvas.current.clientHeight * dpr
      ultimo = -1
      pintar()
    }

    const cargar = () => {
      if (frames.length) return
      for (let i = 0; i < total; i++) {
        const img = new Image()
        img.src = `/seq/${carpeta}/${String(i + 1).padStart(3, '0')}.webp`
        if (i === 0) img.onload = () => { ultimo = -1; pintar() }
        frames.push(img)
      }
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: 'top bottom+=1500', once: true, onEnter: cargar })
      const tl = gsap.timeline({ defaults: {},
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=3200', scrub: 0.5, pin: true },
      })
      tl.to(estado, { f: total - 1, duration: 10, ease: 'none', onUpdate: pintar }, 0)
        .fromTo('.tr-media', { clipPath: 'inset(18% 14% 18% 14% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 2.4, ease: 'power2.inOut' }, 0)
        .fromTo('.tr-title .line > span', { yPercent: 110 }, { yPercent: 0, stagger: 0.2, duration: 1.2, ease: 'expo.out' }, 0.4)
        .to('.tr-title', { opacity: 0, y: -40, filter: 'blur(10px)', duration: 1 }, 3.2)
        .fromTo(root.current.querySelector('.tr-hud') || {}, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 2.4)
        .fromTo('.tr-end', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2 }, 8.4)
    }, root)

    ajustar()
    window.addEventListener('resize', ajustar)
    return () => { ctx.revert(); window.removeEventListener('resize', ajustar) }
  }, [carpeta, total]) // eslint-disable-line

  return (
    <section id={id} className="tr" ref={root}>
      <div className="tr-media"><canvas ref={canvas} className="tr-canvas" role="img" aria-label="Auto pasando de vidrios claros a polarizado" /></div>
      <div className="tr-shade" />
      <h2 className="tr-title">
        <span className="line"><span>{linea1}</span></span>
        <span className="line"><span>{linea2}</span></span>
      </h2>
      {vltHud && (
        <div className="tr-hud">
          <span className="tr-vlt"><b ref={vlt}>70</b>%</span>
          <span className="tr-label">VLT · luz visible</span>
        </div>
      )}
      <div className="tr-end">
        <p className="eyebrow">{kicker}</p>
        <p className="tr-end-t">{cierre}</p>
      </div>
    </section>
  )
}
