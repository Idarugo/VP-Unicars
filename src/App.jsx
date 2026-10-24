import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Loader from './components/Loader.jsx'
import Cursor from './components/Cursor.jsx'
import Nav from './components/Nav.jsx'
import HeroVideo from './components/HeroVideo.jsx'
import Manifesto from './components/Manifesto.jsx'
import TintReveal from './components/TintReveal.jsx'
import Services from './components/Services.jsx'
import MasServicios from './components/MasServicios.jsx'
import PPFShield from './components/PPFShield.jsx'
import Tiers from './components/Tiers.jsx'
import Stats from './components/Stats.jsx'
import Garage from './components/Garage.jsx'
import Spaces from './components/Spaces.jsx'
import Competition from './components/Competition.jsx'
import Process from './components/Process.jsx'
import Faq from './components/Faq.jsx'
import Resenas from './components/Resenas.jsx'
import Portafolio from './components/Portafolio.jsx'
import Contact from './components/Contact.jsx'
import WhatsAppFab from './components/WhatsAppFab.jsx'
import ZoomThrough from './components/ZoomThrough.jsx'
import Ring from './components/Ring.jsx'
import Fx from './components/Fx.jsx'
import FrameScroll from './components/FrameScroll.jsx'

const beatsPorsche = [
  { t: 'Preparación', d: 'Limpieza profunda y descontaminación del cristal. Cero polvo, cero burbujas.', desde: 2.2, hasta: 4 },
  { t: 'Corte a medida', d: 'La lámina se ajusta al milímetro a la curvatura del parabrisas.', desde: 4.4, hasta: 6.2 },
  { t: 'Termoformado', d: 'Con calor, el PPF toma la forma exacta del cristal. Invisible.', desde: 6.6, hasta: 8.4 },
  { t: 'Protegido.', d: 'Porsche 911 Turbo S listo contra piedras y rayones.', desde: 8.9, hasta: 10.5 },
]
const beatsCromos = [
  { t: 'Adiós cromo', d: 'Marcos de ventanas y molduras pasan de cromado a negro brillante.', desde: 2.2, hasta: 4.3 },
  { t: 'Espejos en negro', d: 'Detalles que cambian por completo la personalidad del auto.', desde: 4.7, hasta: 6.8 },
  { t: 'BMW 420i', d: 'Más deportivo, más agresivo. Sin pintar, sin perforar.', desde: 7.2, hasta: 10.5 },
]
const beatsBmw = [
  { t: 'Cada vidrio', d: 'Láminas instaladas desde afuera y desde adentro, con precisión de taller.', desde: 2.2, hasta: 4.4 },
  { t: 'Con cuidado', d: 'Desmontamos con cuidado solo lo necesario para un acabado perfecto.', desde: 4.8, hasta: 7 },
  { t: 'Acabado limpio', d: 'Espátula, calor y paciencia. Así se ve un trabajo bien hecho.', desde: 7.4, hasta: 10.5 },
]

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.13, wheelMultiplier: 1.15, touchMultiplier: 1.4 })
    window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', !listo)
    if (listo) {
      window.__lenis?.start()
      // La portada crea su pin después del resto: ordenar por posición en la página y recalcular
      requestAnimationFrame(() => { ScrollTrigger.sort(); ScrollTrigger.refresh() })
      // Solo desarrollo: ?shot=.selector:offset salta a una sección (para capturas)
      const shot = import.meta.env.DEV && new URLSearchParams(location.search).get('shot')
      if (shot) {
        const [sel, off] = shot.split(':')
        setTimeout(() => {
          const el = document.querySelector(sel)
          const base = (el.closest('.pin-spacer') || el).getBoundingClientRect().top + window.scrollY
          window.__lenis ? window.__lenis.scrollTo(base + Number(off || 0), { immediate: true }) : window.scrollTo(0, base + Number(off || 0))
        }, 400)
      }
    } else window.__lenis?.stop()
  }, [listo])

  return (
    <>
      {!listo && <Loader onDone={() => setListo(true)} />}
      <Cursor />
      {listo && <Fx />}
      <Nav />
      <main>
        <HeroVideo listo={listo} />
        <Manifesto />
        <ZoomThrough />
        <TintReveal />
        <Services />
        <MasServicios />
        <PPFShield />
        <FrameScroll id="proceso-ppf" carpeta="porsche" total={120} kicker="Proceso real · PPF en parabrisas" titulo={<>Así se protege<br />un <em>911 Turbo S</em>.</>} beats={beatsPorsche} />
        <Tiers />
        <Stats />
        <FrameScroll id="proceso-cromos" carpeta="cromos" total={150} kicker="Antes y después · Kill chrome" titulo={<>Del cromo<br />al <em>negro</em>.</>} beats={beatsCromos} lado="der" />
        <Garage />
        <Ring />
        <FrameScroll id="proceso-bmw" carpeta="bmw" total={90} kicker="Proceso real · BMW" titulo={<>Precisión en<br /><em>cada vidrio</em>.</>} beats={beatsBmw} lado="der" />
        <Spaces />
        <Portafolio />
        <Competition />
        <Process />
        <Resenas />
        <Faq />
        <Contact />
      </main>
      <WhatsAppFab />
    </>
  )
}
