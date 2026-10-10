import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Icon, faCar, faHouse, faBuilding } from '../icons.js'

const espacios = [
  { ico: faCar, t: 'Autos', d: 'Polarizado, PPF, vinilos, láminas de seguridad y personalización completa.' },
  { ico: faHouse, t: 'Hogar', d: 'Privacidad tipo espejo y control solar. Menos calor, más confort, sin cortinas.' },
  { ico: faBuilding, t: 'Oficinas', d: 'Polarizado arquitectónico espejo, bronce y vinilos con publicidad para tu marca.' },
]

export default function Spaces() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 40%', scrub: 0.3 },
      })
      tl.to('.facade-win', {
        rotateY: 180, duration: 1,
        stagger: { each: 0.03, grid: [6, 8], from: 'start' },
      })
      gsap.from('.space', {
        x: -60, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.spaces-list', start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="spaces" ref={root}>
      <div className="spaces-copy">
        <p className="eyebrow">Autos · Hogar · Oficinas</p>
        <h2 className="h2">Más allá<br />del <em>auto</em>.</h2>
        <ul className="spaces-list">
          {espacios.map((e, i) => (
            <li key={e.t} className="space"><span className="space-ico"><Icon icon={e.ico} /></span><div><strong>{e.t}</strong><p>{e.d}</p></div></li>
          ))}
        </ul>
      </div>
      <div className="facade" aria-hidden="true">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="facade-win">
            <i className="front" />
            <i className="back" style={{ backgroundPosition: `${((i % 8) * 100) / 7}% ${(Math.floor(i / 8) * 100) / 5}%` }} />
          </div>
        ))}
      </div>
    </section>
  )
}
