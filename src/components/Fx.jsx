import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Efectos globales: barra de progreso, inclinación por velocidad, títulos que se descifran, botones magnéticos.
export default function Fx() {
  const bar = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Barra de progreso
    const st = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleX(${s.progress})`),
    })

    // Inclinación según velocidad del scroll
    const skew = { v: 0, prev: 0 }
    const setters = gsap.utils.toArray('.marquee, .manifesto-text').map((el) => gsap.quickSetter(el, 'skewY', 'deg'))
    const vel = () => {
      const v = window.__lenis ? window.__lenis.velocity : 0
      skew.v += (gsap.utils.clamp(-5, 5, v * 0.25) - skew.v) * 0.15
      if (Math.abs(skew.v - skew.prev) < 0.02) return // sin cambios: no tocar el DOM
      skew.prev = skew.v
      const s = skew.v * 0.4
      setters.forEach((set) => set(s))
    }
    gsap.ticker.add(vel)

    // Títulos "eyebrow" que se descifran al aparecer
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&'
    const triggers = gsap.utils.toArray('.eyebrow').map((el) => {
      const final = el.textContent
      return ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => {
          const o = { p: 0 }
          gsap.to(o, {
            p: 1, duration: 1.1, ease: 'power2.out',
            onUpdate: () => {
              const k = Math.floor(o.p * final.length)
              el.textContent = final.slice(0, k) + final.slice(k).replace(/\S/g, () => chars[(Math.random() * chars.length) | 0])
            },
            onComplete: () => (el.textContent = final),
          })
        },
      })
    })

    // Botones magnéticos
    const btns = gsap.utils.toArray('.btn')
    const handlers = btns.map((b) => {
      const move = (e) => {
        const r = b.getBoundingClientRect()
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 })
      }
      const leave = () => gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' })
      b.addEventListener('pointermove', move)
      b.addEventListener('pointerleave', leave)
      return () => { b.removeEventListener('pointermove', move); b.removeEventListener('pointerleave', leave) }
    })

    return () => {
      st.kill()
      triggers.forEach((t) => t.kill())
      gsap.ticker.remove(vel)
      handlers.forEach((h) => h())
    }
  }, [])

  return (
    <>
      <div className="progress" aria-hidden="true"><i ref={bar} /></div>
      <div className="grain" aria-hidden="true" />
    </>
  )
}
