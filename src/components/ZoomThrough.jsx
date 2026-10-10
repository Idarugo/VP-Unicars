import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// "VP" gigante relleno con una foto real. Al hacer scroll entras por dentro de las letras.
export default function ZoomThrough() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=2400', scrub: 1, pin: true },
      })
      tl.fromTo('.zt-word', { scale: 1, backgroundPosition: '50% 30%' }, { scale: 42, backgroundPosition: '50% 60%', duration: 3, ease: 'power2.in' })
        .to('.zt-kicker', { opacity: 0, y: -40, duration: 0.6 }, 0)
        .fromTo('.zt-full', { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 2.2)
        .to('.zt-word', { opacity: 0, duration: 0.4 }, 2.8)
        .fromTo('.zt-caption .line > span', { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.15, ease: 'expo.out' }, 3)
        .to('.zt-full img', { scale: 1.12, duration: 2, ease: 'none' }, 3)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="zt" ref={root}>
      <p className="zt-kicker eyebrow">Entra al taller</p>
      <div className="zt-word" aria-hidden="true">VP</div>
      <div className="zt-full">
        <img src="/fotos/personalizacion.jpg" alt="Trabajo de personalización VP Unicars" />
        <div className="zt-caption">
          <p className="line"><span>+1.900 autos</span></p>
          <p className="line"><span><em>transformados</em></span></p>
          <p className="line small-line"><span>Mall Plaza América · Rancagua</span></p>
        </div>
      </div>
    </section>
  )
}
