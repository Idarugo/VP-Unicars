import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const pasos = [
  { t: 'El problema', d: 'Piedras, rayones y micro-rayas. Los pianos black se marcan con solo mirarlos.' },
  { t: 'La lámina', d: 'Instalamos PPF transparente de alto rendimiento, panel por panel, al milímetro.' },
  { t: 'Autorregenerable', d: 'Los rayones superficiales desaparecen con calor. Tu pintura queda como nueva.' },
]

const piedras = Array.from({ length: 9 }, (_, i) => ({
  x: 12 + ((i * 37) % 76), y: 18 + ((i * 53) % 60), d: i * 0.08,
}))

export default function PPFShield() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: '+=2800', scrub: 1, pin: true,
          onUpdate: (st) => root.current && (root.current.dataset.paso = Math.min(2, Math.floor(st.progress * 3))),
        },
      })
      // 1. Impactos sin protección -> rayas
      tl.fromTo('.ppf-rock', { x: () => gsap.utils.random(-400, 400), y: -500, scale: 0.4, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 1, stagger: 0.08, ease: 'power2.in' })
        .to('.ppf-rock', { opacity: 0, scale: 0.2, duration: 0.3, stagger: 0.08 }, 0.9)
        .fromTo('.ppf-scratch', { scaleX: 0 }, { scaleX: 1, duration: 0.4, stagger: 0.06 }, 0.95)
        .to('.ppf-panel', { '--dull': 1, duration: 1 }, 0.8)
        // 2. La lámina recorre el panel
        .fromTo('.ppf-film', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 2, ease: 'power1.inOut' }, 2.3)
        .fromTo('.ppf-squeegee', { left: '0%', opacity: 1 }, { left: '100%', duration: 2, ease: 'power1.inOut' }, 2.3)
        .to('.ppf-squeegee', { opacity: 0, duration: 0.2 }, 4.3)
        // 3. Se regenera y las piedras rebotan
        .to('.ppf-scratch', { opacity: 0, filter: 'blur(6px)', duration: 1.2, stagger: 0.05 }, 4.6)
        .to('.ppf-panel', { '--dull': 0, duration: 1.2 }, 4.6)
        .fromTo('.ppf-heat', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.4, duration: 0.8, yoyo: true, repeat: 1 }, 4.5)
        .fromTo('.ppf-rock2', { y: -500, opacity: 1 }, { y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.in' }, 5.6)
        .to('.ppf-rock2', { y: -300, x: (i) => (i % 2 ? 300 : -300), rotate: 360, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 6.2)
        .fromTo('.ppf-spark', { scale: 0, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.5, stagger: 0.1 }, 6.2)
        .to('.ppf-panel', { rotateX: 18, rotateY: -14, duration: 3, ease: 'none' }, 0)
        .to('.ppf-panel', { rotateX: 4, rotateY: 10, duration: 4, ease: 'none' }, 3)
    }, root)
    return () => ctx.revert()
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
        <div className="ppf-panel">
          <div className="ppf-paint" />
          {piedras.map((p, i) => (
            <span key={i} className="ppf-scratch" style={{ left: `${p.x}%`, top: `${p.y}%`, rotate: `${(i * 47) % 180}deg`, width: `${40 + (i % 4) * 25}px` }} />
          ))}
          <div className="ppf-film"><div className="ppf-film-sheen" /></div>
          <div className="ppf-squeegee" />
          <div className="ppf-heat" />
          {piedras.map((p, i) => (
            <span key={i} className="ppf-rock" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
          ))}
          {[25, 50, 75].map((x) => (
            <span key={x}>
              <span className="ppf-rock ppf-rock2" style={{ left: `${x}%`, top: '40%' }} />
              <span className="ppf-spark" style={{ left: `${x}%`, top: '40%' }} />
            </span>
          ))}
        </div>
        <div className="ppf-labels">
          <span>Pintura</span><span>Lámina PPF</span><span>Capa autorregenerable</span>
        </div>
      </div>
    </section>
  )
}
