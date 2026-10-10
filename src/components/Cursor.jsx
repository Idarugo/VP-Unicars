import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const dot = useRef(null)
  const glow = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.15, ease: 'power3' })
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.15, ease: 'power3' })
    const xg = gsap.quickTo(glow.current, 'x', { duration: 0.9, ease: 'power3' })
    const yg = gsap.quickTo(glow.current, 'y', { duration: 0.9, ease: 'power3' })
    const move = (e) => { xd(e.clientX); yd(e.clientY); xg(e.clientX); yg(e.clientY) }
    const over = (e) => dot.current.classList.toggle('is-hover', !!e.target.closest('a,button,[data-hover]'))
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    document.documentElement.classList.add('has-cursor')
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [])

  return (
    <>
      <div ref={glow} className="cursor-glow" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
