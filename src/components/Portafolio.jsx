import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { portafolio, categoriasPortafolio, waLink } from '../data.js'
import AntesDespues from './AntesDespues.jsx'
import { Icon, faWhatsapp, faChevronLeft, faChevronRight, faXmark, faImages } from '../icons.js'

gsap.registerPlugin(Flip)

// Portafolio de trabajos reales con filtros por categoría y visor a pantalla completa.
// Las fotos se editan en Mantención → Contenido web → Portafolio.
const CATEGORIAS = categoriasPortafolio
const NOMBRE = Object.fromEntries(CATEGORIAS)
const POR_PAGINA = 12

export default function Portafolio() {
  const root = useRef(null)
  const grilla = useRef(null)
  const estadoFlip = useRef(null)
  const [filtro, setFiltro] = useState('todos')
  const [cuantos, setCuantos] = useState(POR_PAGINA)
  const [abierta, setAbierta] = useState(null) // índice dentro de la lista filtrada

  // Sin memo: el contenido editado desde el panel puede llegar después del primer dibujo
  const lista = filtro === 'todos' ? portafolio : portafolio.filter((x) => x.categoria === filtro)
  const visibles = lista.slice(0, cuantos)
  const categorias = CATEGORIAS.filter(([k]) => portafolio.some((x) => x.categoria === k))

  // Al cambiar de filtro, las fotos se reacomodan con una animación (FLIP)
  const cambiar = (k) => {
    if (k === filtro) return
    estadoFlip.current = Flip.getState(grilla.current.children)
    setFiltro(k)
    setCuantos(POR_PAGINA)
  }
  useLayoutEffect(() => {
    if (!estadoFlip.current) return
    Flip.from(estadoFlip.current, {
      duration: 0.7, ease: 'expo.out', absolute: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.03, ease: 'expo.out' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.3 }),
    })
    estadoFlip.current = null
  }, [filtro])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pf-head > *', { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } })
      gsap.from('.pf-item', { y: 70, opacity: 0, duration: 1, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: '.pf-grilla', start: 'top 85%' } })
    }, root)
    return () => ctx.revert()
  }, [])

  // Visor: teclado, bloqueo del scroll de la página
  useEffect(() => {
    if (abierta == null) return
    window.__lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const tecla = (e) => {
      if (e.key === 'Escape') setAbierta(null)
      if (e.key === 'ArrowRight') setAbierta((i) => (i + 1) % lista.length)
      if (e.key === 'ArrowLeft') setAbierta((i) => (i - 1 + lista.length) % lista.length)
    }
    window.addEventListener('keydown', tecla)
    return () => {
      window.removeEventListener('keydown', tecla)
      document.documentElement.style.overflow = ''
      window.__lenis?.start()
    }
  }, [abierta, lista.length])

  // Deslizar con el dedo en el visor
  const toque = useRef(null)
  const empezar = (e) => { toque.current = e.clientX }
  const terminar = (e) => {
    if (toque.current == null) return
    const dx = e.clientX - toque.current
    toque.current = null
    if (Math.abs(dx) > 50) setAbierta((i) => (i + (dx < 0 ? 1 : -1) + lista.length) % lista.length)
  }

  if (!portafolio.length) return null
  const actual = abierta != null ? lista[abierta] : null

  return (
    <section id="portafolio" className="pf" ref={root}>
      <div className="pf-head">
        <p className="eyebrow">Portafolio</p>
        <h2 className="h2">Trabajos <em>reales</em>.</h2>
        <p className="muted">Arrastra la línea para comparar. Abajo, {portafolio.length} trabajos hechos en nuestro taller y a domicilio.</p>
      </div>

      <AntesDespues />

      <div className="pf-filtros" role="group" aria-label="Filtrar por categoría">
        <button type="button" className={filtro === 'todos' ? 'is-on' : ''} onClick={() => cambiar('todos')}>Todos <small>{portafolio.length}</small></button>
        {categorias.map(([k, t]) => (
          <button type="button" key={k} className={filtro === k ? 'is-on' : ''} onClick={() => cambiar(k)}>
            {t} <small>{portafolio.filter((x) => x.categoria === k).length}</small>
          </button>
        ))}
      </div>

      <ul className="pf-grilla" ref={grilla}>
        {visibles.map((x, i) => (
          <li key={x.id} className={`pf-item ${i % 7 === 0 ? 'pf-item--grande' : ''}`} data-flip-id={x.id}>
            <button type="button" onClick={() => setAbierta(i)} aria-label={`Ver ${x.titulo}`}>
              <img src={x.mini} alt={x.titulo} loading="lazy" />
              <span className="pf-cap"><small>{NOMBRE[x.categoria]}</small>{x.titulo}</span>
            </button>
          </li>
        ))}
      </ul>

      {cuantos < lista.length && (
        <div className="pf-mas">
          <button type="button" className="btn btn--ghost" onClick={() => setCuantos((n) => n + POR_PAGINA)}>
            <Icon icon={faImages} />&nbsp; Ver más trabajos ({lista.length - cuantos})
          </button>
        </div>
      )}

      {actual && (
        <div className="pf-visor" role="dialog" aria-modal="true" aria-label={actual.titulo} onClick={() => setAbierta(null)}>
          <button type="button" className="pf-cerrar" onClick={() => setAbierta(null)} aria-label="Cerrar"><Icon icon={faXmark} /></button>
          <button type="button" className="pf-nav pf-nav--izq" onClick={(e) => { e.stopPropagation(); setAbierta((i) => (i - 1 + lista.length) % lista.length) }} aria-label="Anterior"><Icon icon={faChevronLeft} /></button>
          <figure onClick={(e) => e.stopPropagation()} onPointerDown={empezar} onPointerUp={terminar}>
            <img key={actual.id} src={actual.foto} alt={actual.titulo} draggable="false" />
            <figcaption>
              <div><small>{NOMBRE[actual.categoria]} · {abierta + 1} / {lista.length}</small><b>{actual.titulo}</b></div>
              <a className="btn" href={waLink(`Hola VP Unicars! Vi en su portafolio "${actual.titulo}" y quiero cotizar algo así 🚘`)} target="_blank" rel="noreferrer">
                <Icon icon={faWhatsapp} />&nbsp; Quiero algo así
              </a>
            </figcaption>
          </figure>
          <button type="button" className="pf-nav pf-nav--der" onClick={(e) => { e.stopPropagation(); setAbierta((i) => (i + 1) % lista.length) }} aria-label="Siguiente"><Icon icon={faChevronRight} /></button>
        </div>
      )}
    </section>
  )
}
