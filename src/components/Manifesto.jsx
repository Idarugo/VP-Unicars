import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const texto = 'No todos los daños se pueden evitar. Pero sí se pueden prevenir. Cada auto que entra a nuestro taller sale protegido, con más estilo y listo para destacar.'

export default function Manifesto() {
  const root = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.manifesto .w', { opacity: 0.45 }, {
        opacity: 1, stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 60%', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="manifesto" ref={root}>
      <p className="eyebrow">Expertos en transformación y protección</p>
      <p className="manifesto-text">
        {texto.split(' ').map((w, i) => (
          <span key={i} className={`w ${/prevenir|protegido|destacar/.test(w) ? 'hl' : ''}`}>{w} </span>
        ))}
      </p>
    </section>
  )
}
