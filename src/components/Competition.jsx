import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Icon, faTrophy } from '../icons.js'

export default function Competition() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.comp-line--a', { xPercent: -35, ease: 'none', scrollTrigger: { trigger: root.current, scrub: true } })
      gsap.fromTo('.comp-line--b', { xPercent: -35 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, scrub: true } })
      gsap.from('.comp-card', {
        y: 100, rotateX: 40, opacity: 0, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: '.comp-card', start: 'top 85%' },
      })
      gsap.to('.comp-trophy', { rotateY: 360, ease: 'none', scrollTrigger: { trigger: root.current, scrub: 0.3 } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="comp" ref={root}>
      <div className="comp-line comp-line--a">CLAP 2025 · RÍO DE JANEIRO · CLAP 2025 · RÍO DE JANEIRO ·</div>
      <div className="comp-card">
        <div className="comp-trophy" aria-hidden="true"><Icon icon={faTrophy} /></div>
        <div>
          <p className="eyebrow">Nivel internacional</p>
          <h2 className="h3">Competimos con los mejores de Latinoamérica.</h2>
          <p className="muted">
            Participamos en la <strong>4ta Competencia Latinoamericana de Polarizados y PPF</strong> en Río de Janeiro, Brasil.
            La misma precisión de competencia, aplicada a tu auto en Rancagua.
          </p>
        </div>
      </div>
      <div className="comp-line comp-line--b">POLARIZADOS · PPF · VINILOS · LÁMINAS · POLARIZADOS · PPF ·</div>
    </section>
  )
}
