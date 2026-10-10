import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import { waLink } from '../data.js'
import { Icon, faWhatsapp } from '../icons.js'

const links = [
  ['#servicios', 'Servicios'],
  ['#polarizados', 'Polarizados'],
  ['#ppf', 'PPF'],
  ['#trabajos', 'Trabajos'],
  ['#contacto', 'Contacto'],
]

export const irA = (e, href) => {
  e.preventDefault()
  if (window.__lenis) window.__lenis.scrollTo(href, { duration: 1.6 })
  else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Nav() {
  const [solido, setSolido] = useState(false)
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    const f = () => setSolido(window.scrollY > 60)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <header className={`nav ${solido ? 'nav--solid' : ''} ${abierto ? 'nav--open' : ''}`}>
      <a href="#top" className="nav-brand" onClick={(e) => irA(e, '#top')}>
        <Logo /> <span>VP UNICARS</span>
      </a>
      <nav className="nav-links">
        {links.map(([h, t]) => (
          <a key={h} href={h} onClick={(e) => { irA(e, h); setAbierto(false) }}>{t}</a>
        ))}
      </nav>
      <a className="btn btn--small" href={waLink()} target="_blank" rel="noreferrer"><Icon icon={faWhatsapp} />&nbsp; Cotizar</a>
      <button className="nav-burger" aria-label="Menú" onClick={() => setAbierto(!abierto)}><i /><i /></button>
    </header>
  )
}
