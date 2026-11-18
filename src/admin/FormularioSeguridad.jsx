import { useState } from 'react'
import { inmuebles, rutFormateado, micras, m2 } from './config.js'
import {
  Icon, faCalendarDays, faBuilding, faRulerCombined, faFilm, faCommentDots, faCircleCheck, faTriangleExclamation,
  faPlus, faTrash, faFloppyDisk, faCalculator,
} from './iconos.js'

const Grupo = ({ icono, titulo, extra, children }) => (
  <fieldset className="adm-grupo">
    <legend><Icon icon={icono} /> {titulo}{extra}</legend>
    {children}
  </fieldset>
)

const UBICACIONES = ['Ventanal frontal', 'Vitrina', 'Puerta de acceso', 'Mampara', 'Ventanas de oficina', 'Caseta de vigilancia', 'Tragaluz']
const GARANTIAS = ['1 año', '3 años', '5 años', '10 años']
const MAX_SUPERFICIES = 12
const MAX_CARACT = 10

export const superficieVacia = () => ({ ubicacion: '', m2: '' })

export const faltantesSeguridad = (f) => {
  const faltan = []
  if (!f.fecha) faltan.push('fecha')
  if (!f.instalador) faltan.push('instalador')
  if (!f.razonSocial) faltan.push('razón social')
  if (f.rut && !rutFormateado(f.rut)) faltan.push('RUT válido')
  if (!f.direccion) faltan.push('dirección')
  const sup = f.superficies.filter((s) => s.ubicacion || s.m2)
  if (!sup.length) faltan.push('superficies')
  else if (sup.some((s) => !s.ubicacion || !(Number(s.m2) > 0))) faltan.push('ubicación y m² de cada superficie')
  if (!f.ficha.producto || !f.ficha.marca || !(Number(f.ficha.espesorMil) > 0)) faltan.push('producto, marca y espesor')
  if (f.ficha.caracteristicas.some((c) => (c.k || c.v) && (!c.k || !c.v))) faltan.push('características sin completar')
  return faltan
}

// Fila de superficie con calculadora opcional (ancho × alto × cantidad)
function Superficie({ s, i, onCambio, onQuitar, puedeQuitar }) {
  const [calc, setCalc] = useState(null)
  const calcular = (c) => {
    setCalc(c)
    const v = Number(c.ancho) * Number(c.alto) * (Number(c.cant) || 1)
    if (v > 0) onCambio({ m2: String(Math.round(v * 100) / 100) })
  }
  return (
    <div className="ls-sup">
      <span className="ls-sup-n">{String(i + 1).padStart(2, '0')}</span>
      <input className="ls-sup-ubi" list="ls-ubicaciones" placeholder="Ej: Ventanal frontal" maxLength={80} value={s.ubicacion} onChange={(e) => onCambio({ ubicacion: e.target.value })} />
      <label className="ls-sup-m2">
        <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0" value={s.m2} onChange={(e) => onCambio({ m2: e.target.value })} />
        <span>m²</span>
      </label>
      <button type="button" className={`adm-icon-btn ${calc ? 'is-on' : ''}`} title="Calcular con ancho × alto" onClick={() => setCalc(calc ? null : { ancho: '', alto: '', cant: '1' })}>
        <Icon icon={faCalculator} />
      </button>
      <button type="button" className="adm-icon-btn adm-icon-btn--danger" title="Quitar" disabled={!puedeQuitar} onClick={onQuitar}><Icon icon={faTrash} /></button>
      {calc && (
        <div className="ls-calc">
          <label>Ancho (m)<input type="number" inputMode="decimal" step="0.01" min="0" value={calc.ancho} onChange={(e) => calcular({ ...calc, ancho: e.target.value })} autoFocus /></label>
          <span>×</span>
          <label>Alto (m)<input type="number" inputMode="decimal" step="0.01" min="0" value={calc.alto} onChange={(e) => calcular({ ...calc, alto: e.target.value })} /></label>
          <span>×</span>
          <label>Cantidad<input type="number" inputMode="numeric" min="1" value={calc.cant} onChange={(e) => calcular({ ...calc, cant: e.target.value })} /></label>
        </div>
      )}
    </div>
  )
}

export default function FormularioSeguridad({ f, set, instaladores, fichas, onGuardarFicha, onSubmit, numero, guardando = false }) {
  const cambiar = (k, v) => set((prev) => ({ ...prev, [k]: v }))
  const campo = (k) => ({ value: f[k], onChange: (e) => cambiar(k, e.target.value) })
  const ficha = f.ficha
  const cambiarFicha = (cambios) => set((prev) => ({ ...prev, ficha: { ...prev.ficha, ...cambios } }))
  const cambiarSup = (i, cambios) => set((prev) => ({ ...prev, superficies: prev.superficies.map((s, k) => (k === i ? { ...s, ...cambios } : s)) }))
  const cambiarCar = (i, cambios) => cambiarFicha({ caracteristicas: ficha.caracteristicas.map((c, k) => (k === i ? { ...c, ...cambios } : c)) })

  const rutOk = !f.rut || rutFormateado(f.rut)
  const total = f.superficies.reduce((s, x) => s + (Number(x.m2) || 0), 0)
  const faltan = faltantesSeguridad(f)
  const fichaBase = fichas.find((x) => x.id === ficha.id)
  const fichaEditada = fichaBase && JSON.stringify({ ...fichaBase, nombre: '' }) !== JSON.stringify({ ...ficha, nombre: '' })

  return (
    <form className="adm-form" onSubmit={(e) => { e.preventDefault(); if (!faltan.length && !guardando) onSubmit() }}>
      <datalist id="ls-ubicaciones">{UBICACIONES.map((u) => <option key={u} value={u} />)}</datalist>

      <Grupo icono={faCalendarDays} titulo="Instalación">
        <div className="adm-row">
          <label>Fecha<input type="date" required {...campo('fecha')} /></label>
          <label>Instalador
            <input list="ls-instaladores" required placeholder="Nombre del instalador" {...campo('instalador')} />
            <datalist id="ls-instaladores">{instaladores.map((i) => <option key={i} value={i} />)}</datalist>
          </label>
        </div>
      </Grupo>

      <Grupo icono={faBuilding} titulo="Cliente">
        <div className="adm-row">
          <label>Razón social o nombre<input required placeholder="Ej: Comercial Los Andes SpA" maxLength={140} autoComplete="off" {...campo('razonSocial')} /></label>
          <label>RUT <small>(opcional)</small>
            <input
              placeholder="77.429.138-5" maxLength={12} autoComplete="off" className={rutOk ? '' : 'is-warn'} value={f.rut}
              onChange={(e) => cambiar('rut', e.target.value.toUpperCase().replace(/[^0-9K.-]/g, ''))}
              onBlur={() => { const r = rutFormateado(f.rut); if (r) cambiar('rut', r) }}
            />
            {!rutOk && <span className="adm-warn"><Icon icon={faTriangleExclamation} /> El dígito verificador no coincide</span>}
          </label>
        </div>
        <div className="adm-tono">
          <label>Tipo de inmueble</label>
          <div className="adm-chips">
            {inmuebles.map((t) => (
              <button type="button" key={t} className={`adm-chip ${f.inmueble === t ? 'is-on' : ''}`} onClick={() => cambiar('inmueble', t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="adm-row">
          <label>Dirección de la instalación<input required placeholder="Calle y número" maxLength={160} autoComplete="off" {...campo('direccion')} /></label>
          <label>Comuna<input placeholder="Ej: Rancagua" maxLength={60} autoComplete="off" {...campo('comuna')} /></label>
        </div>
        <div className="adm-row">
          <label>Contacto <small>(opcional)</small><input placeholder="Nombre de quien recibe" maxLength={100} autoComplete="off" {...campo('contacto')} /></label>
          <label>WhatsApp <small>(opcional)</small><input type="tel" inputMode="tel" placeholder="9 1234 5678" autoComplete="off" {...campo('telefono')} /></label>
        </div>
      </Grupo>

      <Grupo icono={faRulerCombined} titulo="Superficies instaladas" extra={<span className="ls-total">{m2(total)} m²</span>}>
        <div className="ls-sups">
          {f.superficies.map((s, i) => (
            <Superficie
              key={i} s={s} i={i} puedeQuitar={f.superficies.length > 1}
              onCambio={(c) => cambiarSup(i, c)}
              onQuitar={() => cambiar('superficies', f.superficies.filter((_, k) => k !== i))}
            />
          ))}
        </div>
        {f.superficies.length < MAX_SUPERFICIES && (
          <button type="button" className="adm-btn adm-btn--ghost ls-agregar" onClick={() => cambiar('superficies', [...f.superficies, superficieVacia()])}>
            <Icon icon={faPlus} /> Agregar superficie
          </button>
        )}
      </Grupo>

      <Grupo icono={faFilm} titulo="Lámina instalada">
        <div className="adm-tono">
          <label>Ficha técnica</label>
          <div className="adm-chips">
            {fichas.map((x) => (
              <button type="button" key={x.id} className={`adm-chip ${ficha.id === x.id ? 'is-on' : ''}`}
                onClick={() => cambiar('ficha', structuredClone(x))}>{x.nombre}</button>
            ))}
          </div>
        </div>
        <div className="adm-row adm-row--3">
          <label>Producto<input required placeholder="Lámina de seguridad transparente" maxLength={80} value={ficha.producto} onChange={(e) => cambiarFicha({ producto: e.target.value })} /></label>
          <label>Marca<input required placeholder="Ej: American Films" maxLength={60} value={ficha.marca} onChange={(e) => cambiarFicha({ marca: e.target.value })} /></label>
          <label>Espesor (mil)
            <input type="number" inputMode="decimal" step="0.5" min="1" max="40" required value={ficha.espesorMil} onChange={(e) => cambiarFicha({ espesorMil: e.target.value })} />
            {Number(ficha.espesorMil) > 0 && <small>= {micras(ficha.espesorMil)} micras</small>}
          </label>
        </div>
        <div className="ls-cars">
          <span className="ls-cars-t">Características</span>
          {ficha.caracteristicas.map((c, i) => (
            <div key={i} className={`ls-car ${(c.k || c.v) && (!c.k || !c.v) ? 'is-falta' : ''}`}>
              <input placeholder="Característica" maxLength={40} value={c.k} onChange={(e) => cambiarCar(i, { k: e.target.value })} />
              <input placeholder="Valor (ej: 32.700 psi)" maxLength={160} value={c.v} onChange={(e) => cambiarCar(i, { v: e.target.value })} />
              <button type="button" className="adm-icon-btn adm-icon-btn--danger" title="Quitar" onClick={() => cambiarFicha({ caracteristicas: ficha.caracteristicas.filter((_, k) => k !== i) })}><Icon icon={faTrash} /></button>
            </div>
          ))}
          <div className="ls-cars-acc">
            {ficha.caracteristicas.length < MAX_CARACT && (
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => cambiarFicha({ caracteristicas: [...ficha.caracteristicas, { k: '', v: '' }] })}>
                <Icon icon={faPlus} /> Característica
              </button>
            )}
            {onGuardarFicha && (
              <button type="button" className="adm-btn adm-btn--ghost" onClick={onGuardarFicha} title="Deja esta ficha lista para los próximos certificados">
                <Icon icon={faFloppyDisk} /> {fichaEditada ? 'Guardar cambios de la ficha' : 'Guardar como ficha'}
              </button>
            )}
          </div>
          {ficha.caracteristicas.some((c) => c.k && !c.v) && (
            <p className="adm-warn"><Icon icon={faTriangleExclamation} /> Completa los valores vacíos con los datos del fabricante, o quita esas filas.</p>
          )}
        </div>
      </Grupo>

      <Grupo icono={faCommentDots} titulo="Garantía y observaciones">
        <div className="adm-tono">
          <label>Garantía <small>(opcional)</small></label>
          <div className="adm-chips">
            {GARANTIAS.map((g) => (
              <button type="button" key={g} className={`adm-chip ${f.garantia === g ? 'is-on' : ''}`} onClick={() => cambiar('garantia', f.garantia === g ? '' : g)}>{g}</button>
            ))}
            <input className="adm-chip-input ls-garantia-input" placeholder="Otra" maxLength={60} value={GARANTIAS.includes(f.garantia) ? '' : f.garantia} onChange={(e) => cambiar('garantia', e.target.value)} />
          </div>
        </div>
        <textarea rows={2} maxLength={200} placeholder="Ej: Instalación en vidrios templados de 6 mm, sellado perimetral" {...campo('observaciones')} />
      </Grupo>

      <div className="adm-submit">
        {faltan.length > 0 && <p className="adm-faltan">Falta: {faltan.join(', ')}</p>}
        <button className="adm-btn adm-btn--big" disabled={faltan.length > 0 || guardando}>
          <Icon icon={faCircleCheck} /> {guardando ? 'Emitiendo…' : `Emitir certificado N° ${numero}`}
        </button>
      </div>
    </form>
  )
}
