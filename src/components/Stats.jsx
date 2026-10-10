import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { stats } from '../data.js'
import { Icon, faTrophy, faInstagram, faImages, faSun } from '../icons.js'

const iconos = [faTrophy, faInstagram, faImages, faSun]

export default function Stats() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.stat').forEach((el, i) => {
        const s = stats[i]
        const n = el.querySelector('.stat-n')
        const o = { v: 0 }
        gsap.to(o, {
          v: s.valor, duration: 2.2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => (n.textContent = o.v.toLocaleString('es-CL', { minimumFractionDigits: s.decimales || 0, maximumFractionDigits: s.decimales || 0 })),
        })
        gsap.from(el, { y: 60, opacity: 0, duration: 1.2, delay: i * 0.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } })
      })
      gsap.to('.stats-bg', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="stats" ref={root}>
      <div className="stats-bg" aria-hidden="true">+1.900 TRABAJOS · +1.900 TRABAJOS ·</div>
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={s.label} className="stat">
            <Icon icon={iconos[i]} className="stat-ico" />
            <div className="stat-v">{s.prefijo}<span className="stat-n">0</span>{s.sufijo}</div>
            <div className="stat-l">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
