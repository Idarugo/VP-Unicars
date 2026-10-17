import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Logo from './Logo.jsx'

export default function Loader({ onDone }) {
  const root = useRef(null)
  const num = useRef(null)

  useEffect(() => {
    // La presentación completa solo la primera vez en la visita; al volver a la página es casi instantánea
    let vista = false
    try { vista = sessionStorage.getItem('vp-intro') === '1'; sessionStorage.setItem('vp-intro', '1') } catch { /* sin almacenamiento */ }
    const k = vista ? 0.3 : 0.5
    const ctx = gsap.context(() => {
      const contador = { v: 0 }
      const tl = gsap.timeline({ onComplete: onDone })
      tl.fromTo('.logo path', { strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: 1.4 * k, ease: 'power2.inOut', stagger: 0.15 * k })
        .to(contador, {
          v: 100, duration: 1.6 * k, ease: 'power3.inOut',
          onUpdate: () => num.current && (num.current.textContent = String(Math.round(contador.v)).padStart(3, '0')),
        }, 0)
        .to('.logo path', { fill: '#FFE600', duration: 0.4 * k }, 1.3 * k)
        .to('.loader-bar i', { scaleX: 1, duration: 1.6 * k, ease: 'power3.inOut' }, 0)
        .to('.loader-inner', { y: -40, opacity: 0, duration: 0.5 * k, ease: 'power2.in' }, 1.9 * k)
        .to('.loader-panel', { yPercent: -100, duration: 0.9 * k, ease: 'expo.inOut', stagger: 0.06 * k }, 2.2 * k)
    }, root)
    return () => ctx.revert()
  }, [onDone])

  return (
    <div className="loader" ref={root}>
      {[0, 1, 2, 3, 4].map((i) => <div key={i} className="loader-panel" style={{ left: `${i * 20}%` }} />)}
      <div className="loader-inner">
        <Logo draw />
        <div className="loader-bar"><i /></div>
        <div className="loader-meta"><span>VP UNICARS</span><span ref={num}>000</span></div>
      </div>
    </div>
  )
}
