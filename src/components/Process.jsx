import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { pasos } from '../data.js'
import { Icon, faComments, faUserCheck, faScrewdriverWrench, faKey } from '../icons.js'

const iconos = [faComments, faUserCheck, faScrewdriverWrench, faKey]

export default function Process() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.process-line i', { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.process-grid', start: 'top 75%', end: 'bottom 55%', scrub: true },
      })
      gsap.from('.process-step', {
        y: 50, opacity: 0, stagger: 0.15, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '.process-grid', start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="process" ref={root}>
      <div className="section-head">
        <p className="eyebrow">Cómo trabajamos</p>
        <h2 className="h2">Simple. <em>Rápido.</em> Perfecto.</h2>
      </div>
      <div className="process-line"><i /></div>
      <ol className="process-grid">
        {pasos.map((p, i) => (
          <li key={p.id} className="process-step">
            <span className="process-n"><Icon icon={iconos[i % iconos.length]} /></span>
            <strong>{p.t}</strong>
            <p>{p.d}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
