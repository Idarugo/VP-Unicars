import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { niveles, polarizado, waLink } from '../data.js'
import { Icon, faSun, faShieldHalved, faCircleCheck, faWhatsapp } from '../icons.js'

// Tipos de polarizado con los datos de los afiches de VP Unicars (UV, rechazo infrarrojo y beneficios).
// Todo se edita en Mantención → Contenido web → Tipos de polarizado.
export default function Tiers() {
  const root = useRef(null)
  const [tono, setTono] = useState(() => polarizado.tonos[Math.floor(polarizado.tonos.length / 2)] || '35')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.tier', {
        y: 120, rotateX: -30, opacity: 0, duration: 1.4, stagger: 0.15, ease: 'expo.out',
        scrollTrigger: { trigger: '.tiers-grid', start: 'top 80%' },
      })
      // Los números suben desde 0 al aparecer
      gsap.utils.toArray('.tier-stat b[data-v]').forEach((el) => {
        const o = { v: 0 }
        gsap.to(o, {
          v: Number(el.dataset.v), duration: 1.6, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%' },
          onUpdate: () => { el.textContent = `${Math.round(o.v)}%` },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const tilt = (e) => {
    const c = e.currentTarget
    const r = c.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(c, { rotateY: x * 12, rotateX: -y * 12, duration: 0.6, ease: 'power3.out' })
    c.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
    c.style.setProperty('--my', `${(y + 0.5) * 100}%`)
  }
  const reset = (e) => gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, .5)' })

  const tonos = polarizado.tonos.map((t) => String(t).replace(/\D/g, '')).filter(Boolean)

  return (
    <section id="polarizados" className="tiers" ref={root}>
      <div className="section-head">
        <p className="eyebrow">No todos los polarizados son iguales</p>
        <h2 className="h2">Elige tu <em>polarizado</em>.</h2>
        <p className="muted">Tres tecnologías, el mismo nivel de terminación. Te asesoramos según tu uso y presupuesto.</p>
      </div>

      <div className="tiers-grid">
        {niveles.map((n) => (
          <article key={n.id} className={`tier ${n.destacado ? 'tier--hot' : ''}`} onPointerMove={tilt} onPointerLeave={reset} data-hover>
            <div className="tier-media">
              {n.foto ? <img src={n.foto} alt={`Polarizado ${n.nombre}`} loading="lazy" /> : <div className="tier-media-vacia" />}
              {n.nivel && <span className="tier-nivel">{n.nivel}</span>}
              {n.destacado && <span className="tier-badge">Más elegido</span>}
            </div>
            <div className="tier-body">
              <h3>{n.nombre}</h3>
              {n.desc && <p className="muted">{n.desc}</p>}

              {(n.uv != null || n.ir != null) && (
                <div className="tier-stats">
                  {n.uv != null && (
                    <div className="tier-stat"><Icon icon={faShieldHalved} /><b data-v={n.uv}>{n.uv}%</b><span>Filtro UV</span></div>
                  )}
                  {n.ir != null && (
                    <div className="tier-stat"><Icon icon={faSun} /><b data-v={n.ir}>{n.ir}%</b><span>Rechazo infrarrojo</span></div>
                  )}
                </div>
              )}

              {n.beneficios.length > 0 && (
                <ul className="tier-list">
                  {n.beneficios.map((b) => <li key={b}><Icon icon={faCircleCheck} /> {b}</li>)}
                </ul>
              )}

              <a className={`btn ${n.destacado ? '' : 'btn--ghost'}`} href={waLink(`Hola! Quiero cotizar polarizado ${n.nombre} 🚘`)} target="_blank" rel="noreferrer">
                <Icon icon={faWhatsapp} />&nbsp; Cotizar {n.nombre}
              </a>
            </div>
          </article>
        ))}
      </div>

      {tonos.length > 0 && (
        <div className="tonos">
          <div className="tonos-head">
            <h3>Tonos disponibles</h3>
            <p className="muted">El % es la luz que deja pasar el vidrio: <b>menor %, más oscuro</b>. Toca un tono para verlo.</p>
          </div>
          <div className="tonos-vista" style={{ '--sombra': 1 - Number(tono) / 100 }} aria-live="polite">
            <span className="tonos-vista-num">{tono}%</span>
          </div>
          <div className="tonos-btns" role="group" aria-label="Tonos de polarizado">
            {tonos.map((t) => (
              <button key={t} type="button" className={`tonos-btn ${t === tono ? 'is-on' : ''}`} onClick={() => setTono(t)} aria-pressed={t === tono}
                style={{ '--sombra': 1 - Number(t) / 100 }}>
                <i /> {t}%
              </button>
            ))}
          </div>
        </div>
      )}

      {polarizado.sellos.length > 0 && (
        <ul className="tier-sellos">
          {polarizado.sellos.map((s) => <li key={s}><Icon icon={faCircleCheck} /> {s}</li>)}
        </ul>
      )}
    </section>
  )
}
