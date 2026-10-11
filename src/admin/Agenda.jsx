import { useMemo, useState } from 'react'
import {
  equipo, serviciosAgenda, llevaCertificado, lunesDe, fechaLocal, nuevoId, trabajoVacio,
} from './store.js'
import { formatoPatente } from './config.js'
import {
  Icon, faPlus, faChevronLeft, faChevronRight, faHouse, faStore, faClock, faXmark, faCheck, faTrash,
  faWhatsapp, faFileSignature, faCalendarWeek, faRotateLeft,
} from './iconos.js'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DIAS_LARGO = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const ESTADOS = { pendiente: 'Por confirmar', confirmado: 'Confirmado', terminado: 'Terminado' }

const persona = (id) => equipo.find((e) => e.id === id) || equipo[0]
const aFecha = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
const diaTexto = (iso) => {
  const d = aFecha(iso)
  const hoy = fechaLocal()
  const manana = fechaLocal(new Date(Date.now() + 864e5))
  if (iso === hoy) return 'hoy'
  if (iso === manana) return 'mañana'
  return `el ${DIAS_LARGO[(d.getDay() + 6) % 7]} ${d.getDate()}`
}
const telWa = (t = '') => {
  const d = t.replace(/\D/g, '')
  if (d.length === 9 && d.startsWith('9')) return `56${d}`
  if (d.length === 11 && d.startsWith('569')) return d
  return ''
}
const autoTexto = (t) => [t.marca, t.modelo].filter(Boolean).join(' ')

function avisoEncargado(t) {
  const p = persona(t.encargado)
  const auto = autoTexto(t)
  const lugar = t.lugar === 'domicilio' ? `a domicilio${t.direccion ? ` en ${t.direccion}` : ''}` : 'en el local'
  return `Hola ${p.nombre}! ${diaTexto(t.fecha)[0].toUpperCase()}${diaTexto(t.fecha).slice(1)} a las ${t.hora} tienes ${t.servicio}${auto ? ` – ${auto}` : ''}${t.patente ? ` (${formatoPatente(t.patente)})` : ''} de ${t.cliente}, ${lugar}.${t.notas ? ` Nota: ${t.notas}.` : ''} ¿Confirmas? 💪`
}
function avisoCliente(t) {
  const auto = autoTexto(t)
  const lugar = t.lugar === 'domicilio' ? `Vamos a domicilio${t.direccion ? ` (${t.direccion})` : ''}` : '📍 Mall Plaza América, Rancagua'
  return `Hola ${t.cliente.split(' ')[0]}! Te confirmamos tu hora en VP Unicars: ${diaTexto(t.fecha)} a las ${t.hora} para ${t.servicio}${auto ? ` de tu ${auto}` : ''}. ${lugar}. ¡Te esperamos! 🚘`
}
const abrirWa = (tel, texto) => window.open(`https://wa.me/${telWa(tel)}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')

function Tarjeta({ t, onClick }) {
  const p = persona(t.encargado)
  return (
    <button className={`ag-card is-${t.estado}`} style={{ '--c': p.color }} onClick={onClick}>
      <span className="ag-card-top">
        <b><Icon icon={faClock} /> {t.hora}</b>
        <Icon icon={t.lugar === 'domicilio' ? faHouse : faStore} title={t.lugar === 'domicilio' ? 'A domicilio' : 'En el local'} />
      </span>
      <span className="ag-card-serv">{t.servicio}</span>
      <span className="ag-card-cli">{t.cliente}</span>
      {(autoTexto(t) || t.patente) && <span className="ag-card-auto">{autoTexto(t)}{t.patente ? ` · ${formatoPatente(t.patente)}` : ''}</span>}
      <span className="ag-card-foot">
        <i style={{ background: p.color }}>{p.nombre[0]}</i>{p.nombre}
        <em className={`ag-estado is-${t.estado}`}>{ESTADOS[t.estado]}</em>
      </span>
    </button>
  )
}

function Modal({ t, nuevo, onClose, onSave, onDelete, onCertificado }) {
  const [f, setF] = useState(t)
  const campo = (k) => ({ value: f[k], onChange: (e) => setF((x) => ({ ...x, [k]: e.target.value })) })
  const valido = f.cliente.trim() && f.fecha && f.hora

  return (
    <div className="ag-modal-bg" onClick={onClose}>
      <div className="ag-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="ag-modal-head">
          <h2>{nuevo ? 'Agendar trabajo' : 'Trabajo agendado'}</h2>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Cerrar"><Icon icon={faXmark} /></button>
        </div>

        {!nuevo && (
          <div className="ag-acciones">
            <button className="adm-btn adm-btn--wa" onClick={() => abrirWa('', avisoEncargado(f))}><Icon icon={faWhatsapp} /> Avisar a {persona(f.encargado).nombre}</button>
            <button className="adm-btn adm-btn--ghost" onClick={() => abrirWa(f.telefono, avisoCliente(f))}><Icon icon={faWhatsapp} /> Confirmar al cliente</button>
            {f.estado !== 'terminado' && (
              <button className="adm-btn adm-btn--ghost" onClick={() => { const x = { ...f, estado: 'terminado' }; setF(x); onSave(x, false) }}><Icon icon={faCheck} /> Marcar terminado</button>
            )}
            {llevaCertificado(f.servicio) && (
              <button className="adm-btn" onClick={() => onCertificado(f)}><Icon icon={faFileSignature} /> Emitir certificado</button>
            )}
          </div>
        )}

        <form className="adm-form" onSubmit={(e) => { e.preventDefault(); if (valido) onSave(f, true) }}>
          <div className="adm-row adm-row--3">
            <label>Fecha<input type="date" required {...campo('fecha')} /></label>
            <label>Hora<input type="time" required step="900" {...campo('hora')} /></label>
            <label>Estado<select {...campo('estado')}>{Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          </div>
          <div className="adm-row">
            <label>Servicio<select {...campo('servicio')}>{serviciosAgenda.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Encargado<select {...campo('encargado')}>{equipo.map((p) => <option key={p.id} value={p.id}>{p.nombre} · {p.rol}</option>)}</select></label>
          </div>
          <div className="ag-lugar">
            {[['local', faStore, 'En el local'], ['domicilio', faHouse, 'A domicilio']].map(([k, ico, txt]) => (
              <button type="button" key={k} className={`adm-chip ${f.lugar === k ? 'is-on' : ''}`} onClick={() => setF((x) => ({ ...x, lugar: k }))}><Icon icon={ico} /> {txt}</button>
            ))}
          </div>
          {f.lugar === 'domicilio' && <label>Dirección<input placeholder="Calle, número, comuna" autoComplete="off" {...campo('direccion')} /></label>}
          <div className="adm-row">
            <label>Cliente<input required placeholder="Nombre y apellido" autoComplete="off" {...campo('cliente')} /></label>
            <label>WhatsApp del cliente<input type="tel" inputMode="tel" placeholder="9 1234 5678" autoComplete="off" {...campo('telefono')} /></label>
          </div>
          <div className="adm-row adm-row--3">
            <label>Marca<input placeholder="Ej: Kia" autoComplete="off" {...campo('marca')} /></label>
            <label>Modelo<input placeholder="Ej: Morning" autoComplete="off" {...campo('modelo')} /></label>
            <label>Patente<input className="adm-pat" maxLength={7} placeholder="ABCD12" autoComplete="off" value={f.patente}
              onChange={(e) => setF((x) => ({ ...x, patente: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))} /></label>
          </div>
          <label>Notas<textarea rows={2} placeholder="Ej: Nanocarbon 20% traseros" {...campo('notas')} /></label>
          <div className="ag-modal-foot">
            {!nuevo && <button type="button" className="adm-icon-btn adm-icon-btn--danger" title="Eliminar" onClick={() => onDelete(f)}><Icon icon={faTrash} /></button>}
            <button className="adm-btn" disabled={!valido}><Icon icon={faCheck} /> {nuevo ? 'Agendar' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Agenda({ trabajos, setTrabajos, onCertificado, onReiniciar }) {
  const [lunes, setLunes] = useState(() => lunesDe(new Date()))
  const [filtro, setFiltro] = useState('todos')
  const [abierto, setAbierto] = useState(null) // { t, nuevo }
  const [diaMovil, setDiaMovil] = useState(() => fechaLocal())

  const hoy = fechaLocal()
  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes); d.setDate(d.getDate() + i); return d
  }), [lunes])
  const isoDias = dias.map(fechaLocal)

  const visibles = trabajos.filter((t) => filtro === 'todos' || t.encargado === filtro)
  const porDia = (iso) => visibles.filter((t) => t.fecha === iso).sort((a, b) => a.hora.localeCompare(b.hora))
  const semana = visibles.filter((t) => isoDias.includes(t.fecha))
  const domicilio = semana.filter((t) => t.lugar === 'domicilio').length
  const pendientes = semana.filter((t) => t.estado === 'pendiente').length

  const ultimo = dias[6]
  const titulo = `${dias[0].getDate()} ${MESES[dias[0].getMonth()]} – ${ultimo.getDate()} ${MESES[ultimo.getMonth()]}`

  const mover = (n) => {
    const d = new Date(lunes); d.setDate(d.getDate() + n * 7); setLunes(d)
    const m = new Date(d); setDiaMovil(fechaLocal(m))
  }
  const guardar = (t, cerrar) => {
    const existe = trabajos.some((x) => x.id === t.id)
    setTrabajos(existe ? trabajos.map((x) => (x.id === t.id ? t : x)) : [...trabajos, { ...t, id: nuevoId() }])
    if (cerrar) setAbierto(null)
  }
  const eliminar = (t) => {
    if (!window.confirm('¿Eliminar este trabajo de la agenda?')) return
    setTrabajos(trabajos.filter((x) => x.id !== t.id))
    setAbierto(null)
  }
  // Si el día elegido en el celular no está en esta semana, mostrar el lunes
  const diaSel = isoDias.includes(diaMovil) ? diaMovil : isoDias[0]

  return (
    <main className="adm-main ag">
      <div className="ag-head">
        <h1 className="adm-h1"><Icon icon={faCalendarWeek} /> Agenda</h1>
        <div className="ag-nav">
          <button className="adm-icon-btn" onClick={() => mover(-1)} aria-label="Semana anterior"><Icon icon={faChevronLeft} /></button>
          <button className="adm-tab is-on" onClick={() => { setLunes(lunesDe(new Date())); setDiaMovil(hoy) }}>Hoy</button>
          <span className="ag-semana">{titulo}</span>
          <button className="adm-icon-btn" onClick={() => mover(1)} aria-label="Semana siguiente"><Icon icon={faChevronRight} /></button>
          <button className="adm-btn" onClick={() => setAbierto({ t: trabajoVacio(diaSel), nuevo: true })}><Icon icon={faPlus} /> Agendar</button>
        </div>
      </div>

      <div className="ag-barra">
        <div className="ag-filtros">
          <button className={`adm-chip ${filtro === 'todos' ? 'is-on' : ''}`} onClick={() => setFiltro('todos')}>Todo el equipo</button>
          {equipo.map((p) => (
            <button key={p.id} className={`adm-chip ${filtro === p.id ? 'is-on' : ''}`} onClick={() => setFiltro(p.id)} title={p.rol}>
              <i className="ag-dot" style={{ background: p.color }} /> {p.nombre}
            </button>
          ))}
        </div>
        <p className="ag-resumen"><b>{semana.length}</b> trabajos esta semana · <b>{domicilio}</b> a domicilio · <b>{pendientes}</b> por confirmar</p>
      </div>

      {/* Celular: tira de días + lista */}
      <div className="ag-tira">
        {dias.map((d, i) => {
          const iso = isoDias[i]
          const n = porDia(iso).length
          return (
            <button key={iso} className={`ag-pill ${iso === diaSel ? 'is-on' : ''} ${iso === hoy ? 'is-hoy' : ''}`} onClick={() => setDiaMovil(iso)}>
              <span>{DIAS[i]}</span><b>{d.getDate()}</b><i>{n ? '•'.repeat(Math.min(n, 3)) : ' '}</i>
            </button>
          )
        })}
      </div>

      <div className="ag-grid">
        {dias.map((d, i) => {
          const iso = isoDias[i]
          const lista = porDia(iso)
          const fuera = lista.some((t) => t.lugar === 'domicilio')
          return (
            <section key={iso} className={`ag-dia ${iso === hoy ? 'is-hoy' : ''} ${iso === diaSel ? 'is-sel' : ''}`}>
              <header>
                <span>{DIAS[i]} <b>{d.getDate()}</b></span>
                {fuera && <em title="Hay trabajos a domicilio"><Icon icon={faHouse} /> Terreno</em>}
              </header>
              {lista.map((t) => <Tarjeta key={t.id} t={t} onClick={() => setAbierto({ t, nuevo: false })} />)}
              <button className="ag-add" onClick={() => setAbierto({ t: trabajoVacio(iso), nuevo: true })}><Icon icon={faPlus} /> Agendar</button>
            </section>
          )
        })}
      </div>

      <button className="adm-link" onClick={onReiniciar}><Icon icon={faRotateLeft} /> Reiniciar agenda de la demo</button>

      {abierto && (
        <Modal
          key={abierto.t.id || 'nuevo'}
          t={abierto.t} nuevo={abierto.nuevo}
          onClose={() => setAbierto(null)} onSave={guardar} onDelete={eliminar}
          onCertificado={(t) => { setAbierto(null); onCertificado(t) }}
        />
      )}
    </main>
  )
}
