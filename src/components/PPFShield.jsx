import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// PPF explicado con un trabajo real: PPF interior en un Mazda CX-30 (piano black de consola,
// botoneras, pantalla y tablero). La sección queda fija y cada paso del scroll muestra su video.
const pasos = [
  { t: 'Preparación', d: 'Limpieza y descontaminación de cada pieza. Cero polvo, cero burbujas.', video: '/clips/ppf-preparacion.mp4' },
  { t: 'Instalación', d: 'Lámina transparente cortada a medida y asentada con espátula, pieza por pieza.', video: '/clips/ppf-instalacion.mp4' },
  { t: 'Protegido', d: 'El piano black queda a salvo de rayas y huellas, con el brillo de fábrica.', video: '/clips/ppf-resultado.mp4' },
]

export default function PPFShield() {
  const root = useRef(null)

  useEffect(() => {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const videos = [...root.current.querySelectorAll('.ppf-video')]
    let actual = -1
    let visible = false

    // Solo se reproduce el video del paso activo, y solo mientras la sección está en pantalla
    const sincronizar = () => {
      videos.forEach((v, i) => {
        if (i === actual && visible && !quieto) v.play().catch(() => {})
        else v.pause()
      })
    }
    const mostrar = (i) => {
      if (i === actual) return
      actual = i
      root.current.dataset.paso = i
      videos.forEach((v, k) => { if (k === i) v.currentTime = 0 })
      sincronizar()
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) videos.forEach((v) => { v.preload = 'auto' })
      sincronizar()
    }, { threshold: 0.2 })
    io.observe(root.current)

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: '+=1600', scrub: 0.3, pin: true,
          onUpdate: (st) => mostrar(Math.min(pasos.length - 1, Math.floor(st.progress * pasos.length))),
        },
      })
        .fromTo('.ppf-marco', { scale: 0.92, rotateY: -8 }, { scale: 1, rotateY: 0, duration: 1, ease: 'none' }, 0)
        .to('.ppf-marco', { rotateY: 6, duration: 2, ease: 'none' }, 1)
    }, root)
    mostrar(0)
    return () => { io.disconnect(); ctx.revert() }
  }, [])

  return (
    <section id="ppf" className="ppf" ref={root} data-paso="0">
      <div className="ppf-copy">
        <p className="eyebrow">Paint Protection Film</p>
        <h2 className="h2">Un escudo<br /><em>invisible.</em></h2>
        <ol className="ppf-steps">
          {pasos.map((p, i) => (
            <li key={p.t} data-i={i}><span>0{i + 1}</span><div><strong>{p.t}</strong><p>{p.d}</p></div></li>
          ))}
        </ol>
      </div>

      <div className="ppf-scene">
        <div className="ppf-marco">
          {pasos.map((p, i) => (
            <video key={p.video} className="ppf-video" data-i={i} src={p.video} poster={p.video.replace(/\.mp4$/, '.jpg')}
              muted loop playsInline preload="none" aria-hidden="true" />
          ))}
          <span className="ppf-tag">Proceso real · PPF interior · Mazda CX-30</span>
        </div>
      </div>
    </section>
  )
}
