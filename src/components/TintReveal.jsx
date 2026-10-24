import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Antes y después real (Audi A4 en nuestro taller): al hacer scroll, la lámina "avanza" por los vidrios
// de adelante hacia atrás y el interior desaparece. No es un video: el navegador compone en vivo
// la foto con polarizado, la foto sin polarizado y una máscara de los vidrios (≈200 KB en total).
const FOTOS = {
  antes: '/fotos/comparar/audi-a4-antes.webp',
  despues: '/fotos/comparar/audi-a4-despues.webp',
  vidrios: '/fotos/comparar/audi-a4-vidrios.png',
}

export default function TintReveal({
  id = 'polarizados',
  linea1 = 'Mira cómo', linea2 = <><em>desaparece</em> el interior.</>,
  kicker = 'Foto real · Audi A4', cierre = 'Privacidad total. Calor fuera.',
}) {
  const root = useRef(null)
  const canvas = useRef(null)
  const estadoTxt = useRef(null)

  useEffect(() => {
    const img = {}
    const estado = { p: 0 }
    const capa = document.createElement('canvas') // vidrios "sin polarizado" que se van borrando
    let listo = false

    const pintar = () => {
      if (!listo) return
      const c = canvas.current
      const ctx = c.getContext('2d')
      const { antes, despues, vidrios } = img
      const r = Math.max(c.width / despues.width, c.height / despues.height)
      // En pantallas angostas el recorte se centra en los vidrios (≈55% del ancho de la foto)
      const w = despues.width * r, h = despues.height * r, y = (c.height - h) / 2
      const x = Math.min(0, Math.max(c.width - w, c.width / 2 - w * 0.55))
      ctx.drawImage(despues, x, y, w, h)

      // Dentro de los vidrios se ve el "antes", y la lámina lo va cubriendo de adelante (izq.) hacia atrás
      if (capa.width !== c.width || capa.height !== c.height) { capa.width = c.width; capa.height = c.height }
      const k = capa.getContext('2d')
      k.globalCompositeOperation = 'source-over'
      k.clearRect(0, 0, capa.width, capa.height)
      k.drawImage(antes, x, y, w, h)
      k.globalCompositeOperation = 'destination-in'
      k.drawImage(vidrios, x, y, w, h)
      const g = k.createLinearGradient(x, 0, x + w, 0)
      for (let i = 0; i <= 10; i++) {
        const s = Math.min(1, Math.max(0, estado.p * 1.5 - (i / 10) * 0.5))
        g.addColorStop(i / 10, `rgba(0,0,0,${1 - s * s * (3 - 2 * s)})`)
      }
      k.fillStyle = g
      k.fillRect(0, 0, capa.width, capa.height)
      ctx.drawImage(capa, 0, 0)
      if (estadoTxt.current) estadoTxt.current.textContent = estado.p < 0.5 ? 'Sin polarizado' : 'Con polarizado'
    }

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.current.width = canvas.current.clientWidth * dpr
      canvas.current.height = canvas.current.clientHeight * dpr
      pintar()
    }

    const cargar = () => {
      if (Object.keys(img).length) return
      Promise.all(Object.entries(FOTOS).map(([k, src]) => new Promise((ok) => {
        const i = new Image(); i.onload = ok; i.onerror = ok; i.src = src; img[k] = i
      }))).then(() => { listo = Object.values(img).every((i) => i.naturalWidth); pintar() })
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: 'top bottom+=2000', once: true, onEnter: cargar })
      const tl = gsap.timeline({ defaults: {},
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=1700', scrub: 0.25, pin: true },
      })
      tl.fromTo(estado, { p: 0 }, { p: 1, duration: 6.4, ease: 'none', onUpdate: pintar }, 2)
        .fromTo('.tr-media', { scale: 0.7, borderRadius: 32 }, { scale: 1, borderRadius: 0, duration: 2.4, ease: 'power2.inOut' }, 0)
        .fromTo('.tr-title .line > span', { yPercent: 110 }, { yPercent: 0, stagger: 0.2, duration: 1.2, ease: 'expo.out' }, 0.4)
        .to('.tr-title', { opacity: 0, y: -40, duration: 1 }, 3.2)
        .fromTo('.tr-hud', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 2.4)
        .fromTo('.tr-end', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2 }, 8.4)
        .to({}, { duration: 1.6 }, 8.4)
    }, root)

    ajustar()
    window.addEventListener('resize', ajustar)
    return () => { ctx.revert(); window.removeEventListener('resize', ajustar) }
  }, [])

  return (
    <section id={id} className="tr" ref={root}>
      <div className="tr-media"><canvas ref={canvas} className="tr-canvas" role="img" aria-label="Audi A4 real: los vidrios pasan de claros a polarizados" /></div>
      <div className="tr-shade" />
      <h2 className="tr-title">
        <span className="line"><span>{linea1}</span></span>
        <span className="line"><span>{linea2}</span></span>
      </h2>
      <div className="tr-hud">
        <span className="tr-label">{kicker}</span>
        <span className="tr-estado" ref={estadoTxt}>Sin polarizado</span>
      </div>
      <div className="tr-end">
        <p className="eyebrow">Polarizado VP Unicars</p>
        <p className="tr-end-t">{cierre}</p>
      </div>
    </section>
  )
}
