import { tiposVehiculo, tonos, marcas, patenteValida } from './config.js'
import { Icon, faCalendarDays, faUser, faCar, faFilm, faCommentDots, faCircleCheck, faTriangleExclamation } from './iconos.js'

const Grupo = ({ icono, titulo, children }) => (
  <fieldset className="adm-grupo">
    <legend><Icon icon={icono} /> {titulo}</legend>
    {children}
  </fieldset>
)

function Tono({ label, valor, onChange }) {
  return (
    <div className="adm-tono">
      <label>{label}</label>
      <div className="adm-chips">
        {tonos.map((t) => (
          <button type="button" key={t} className={`adm-chip ${Number(valor) === t ? 'is-on' : ''}`} onClick={() => onChange(t)}>{t}%</button>
        ))}
        <input
          className="adm-chip-input" type="number" min="1" max="100" inputMode="numeric" placeholder="Otro"
          value={tonos.includes(Number(valor)) ? '' : valor}
          onChange={(e) => onChange(e.target.value === '' ? '' : Math.min(100, Math.max(1, Number(e.target.value))))}
        />
      </div>
    </div>
  )
}

export const faltantes = (f) => {
  const req = { fecha: 'fecha', cliente: 'cliente', instalador: 'instalador', marca: 'marca', modelo: 'modelo', anio: 'año', patente: 'patente', delanteros: '% delanteros', traseros: '% traseros', luneta: '% luneta' }
  return Object.entries(req).filter(([k]) => f[k] === '' || f[k] == null).map(([, v]) => v)
}

export default function Formulario({ f, set, instaladores, onSubmit, numero }) {
  const cambiar = (k, v) => set((prev) => ({ ...prev, [k]: v }))
  const campo = (k) => ({ value: f[k], onChange: (e) => cambiar(k, e.target.value) })
  const patOk = !f.patente || patenteValida(f.patente)
  const faltan = faltantes(f)

  return (
    <form className="adm-form" onSubmit={(e) => { e.preventDefault(); if (!faltan.length) onSubmit() }}>
      <Grupo icono={faCalendarDays} titulo="Instalación">
        <div className="adm-row">
          <label>Fecha<input type="date" required {...campo('fecha')} /></label>
          <label>Instalador
            <input list="lista-instaladores" required placeholder="Nombre del instalador" {...campo('instalador')} />
            <datalist id="lista-instaladores">{instaladores.map((i) => <option key={i} value={i} />)}</datalist>
          </label>
        </div>
      </Grupo>

      <Grupo icono={faUser} titulo="Cliente">
        <label>Nombre<input required placeholder="Nombre y apellido" autoComplete="off" {...campo('cliente')} /></label>
        <div className="adm-row">
          <label>Dirección<input placeholder="Calle, número, comuna" autoComplete="off" {...campo('direccion')} /></label>
          <label>WhatsApp <small>(opcional)</small><input type="tel" inputMode="tel" placeholder="9 1234 5678" autoComplete="off" {...campo('telefono')} /></label>
        </div>
      </Grupo>

      <Grupo icono={faCar} titulo="Vehículo">
        <div className="adm-row adm-row--3">
          <label>Tipo<select {...campo('tipo')}>{tiposVehiculo.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label>Marca
            <input list="lista-marcas" required placeholder="Ej: Toyota" autoComplete="off" {...campo('marca')} />
            <datalist id="lista-marcas">{marcas.map((m) => <option key={m} value={m} />)}</datalist>
          </label>
          <label>Modelo<input required placeholder="Ej: Yaris 1.5" autoComplete="off" {...campo('modelo')} /></label>
        </div>
        <div className="adm-row">
          <label>Año<input type="number" required min="1950" max="2100" inputMode="numeric" placeholder="2024" {...campo('anio')} /></label>
          <label>Patente
            <input
              required placeholder="ABCD12" maxLength={7} autoComplete="off" className={`adm-pat ${patOk ? '' : 'is-warn'}`}
              value={f.patente} onChange={(e) => cambiar('patente', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            />
            {!patOk && <span className="adm-warn"><Icon icon={faTriangleExclamation} /> Revisa el formato (ej: ABCD12 o AB1234)</span>}
          </label>
        </div>
      </Grupo>

      <Grupo icono={faFilm} titulo="Láminas (% de luz visible)">
        <Tono label="Vidrios laterales delanteros" valor={f.delanteros} onChange={(v) => cambiar('delanteros', v)} />
        <Tono label="Vidrios laterales traseros" valor={f.traseros} onChange={(v) => cambiar('traseros', v)} />
        <Tono label="Luneta trasera" valor={f.luneta} onChange={(v) => cambiar('luneta', v)} />
      </Grupo>

      <Grupo icono={faCommentDots} titulo="Observaciones">
        <textarea rows={2} maxLength={110} placeholder="Ej: Polarizado nanocerámico" {...campo('observaciones')} />
      </Grupo>

      <div className="adm-submit">
        {faltan.length > 0 && <p className="adm-faltan">Falta: {faltan.join(', ')}</p>}
        <button className="adm-btn adm-btn--big" disabled={faltan.length > 0}>
          <Icon icon={faCircleCheck} /> Emitir certificado N° {numero}
        </button>
      </div>
    </form>
  )
}
