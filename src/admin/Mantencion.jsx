import { useEffect, useState } from 'react'
import ContenidoWeb from './ContenidoWeb.jsx'
import { exito, error as alertaError, confirmar, mostrarDato, pedirTexto, escapar } from './alertas.js'
import { folio } from './config.js'
import { fechaLocal } from './store.js'
import { useMantencionStore } from '../stores/mantencionStore.js'
import { useConfiguracionStore } from '../stores/configuracionStore.js'
import { useCertificadoStore } from '../stores/certificadoStore.js'
import { useAuthStore } from '../stores/authStore.js'
import {
  Icon, faScrewdriverWrench, faCircleCheck, faTriangleExclamation, faCircleXmark, faGlobe, faServer, faDatabase, faFloppyDisk, faRotateLeft, faPlus, faDownload, faUserPlus, faKey, faMagnifyingGlass, faClockRotateLeft, faUsers, faGear, faPenToSquare, faHeartPulse, faWhatsapp,
} from './iconos.js'

const TABS = [
  ['estado', faHeartPulse, 'Estado'],
  ['contenido', faPenToSquare, 'Contenido web'],
  ['config', faGear, 'Configuración'],
  ['usuarios', faUsers, 'Usuarios'],
  ['respaldos', faDatabase, 'Respaldos'],
  ['historial', faClockRotateLeft, 'Historial'],
]
const fechaHora = (iso) => new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const diasHasta = (iso) => Math.ceil((new Date(`${iso}T00:00:00`) - new Date()) / 864e5)

function bajar(nombre, contenido, tipo) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
// CSV con ";" y BOM para que Excel en español lo abra directo en columnas
function csv(filas, columnas) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return '﻿' + [columnas.map(([, t]) => esc(t)).join(';'), ...filas.map((f) => columnas.map(([k]) => esc(f[k])).join(';'))].join('\r\n')
}

/* ------------------------------------------------------------------ ESTADO */
const LISTA_TAREAS = [
  ['fotos', 'Subir fotos y trabajos nuevos del mes'],
  ['whatsapp', 'Probar todos los botones de WhatsApp'],
  ['contenido', 'Revisar horario, servicios y preguntas frecuentes'],
  ['respaldo', 'Descargar respaldo completo'],
  ['reporte', 'Enviar reporte mensual de estadísticas al cliente'],
]

function Estado({ onTab }) {
  const { estado, tareas, fetchEstado, fetchTareas, toggleTarea } = useMantencionStore()
  const [web, setWeb] = useState({ estado: 'cargando' })
  const mes = fechaLocal().slice(0, 7)

  useEffect(() => {
    fetchEstado(); fetchTareas(mes)
    const t0 = performance.now()
    fetch(`/?ping=${Date.now()}`, { method: 'HEAD', cache: 'no-store' })
      .then((r) => setWeb({ estado: r.ok ? 'ok' : 'error', ms: Math.round(performance.now() - t0) }))
      .catch(() => setWeb({ estado: 'error' }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sis = estado?.sistema
  const dias = sis?.venceDominio ? diasHasta(sis.venceDominio) : null
  const checks = [
    { ico: faGlobe, t: 'Página web', ok: web.estado === 'ok' ? 'ok' : web.estado === 'cargando' ? 'info' : 'error',
      d: web.estado === 'ok' ? `En línea · responde en ${web.ms} ms` : web.estado === 'cargando' ? 'Comprobando…' : 'No responde' },
    { ico: faDatabase, t: 'Base de datos', ok: estado ? 'ok' : 'info', d: estado ? `Conectada · responde en ${estado.baseDatos.ms} ms` : 'Comprobando…' },
    { ico: faUsers, t: 'Tiempo real', ok: estado ? 'ok' : 'info', d: estado ? `${estado.conectados} ${estado.conectados === 1 ? 'persona conectada' : 'personas conectadas'} al panel ahora` : 'Comprobando…' },
    { ico: faGlobe, t: `Dominio ${sis?.dominio || ''}`, ok: dias == null ? 'info' : dias > 60 ? 'ok' : dias > 0 ? 'warn' : 'error',
      d: dias == null ? 'Comprobando…' : dias > 0 ? `Vence el ${sis.venceDominio.split('-').reverse().join('/')} (en ${dias} días)` : 'Vencido: renovar en NIC Chile' },
    { ico: faServer, t: 'Hosting', ok: sis?.hosting && !/definir/i.test(sis.hosting) ? 'ok' : 'warn', d: sis?.hosting || '—' },
    { ico: faFloppyDisk, t: 'Último respaldo', ok: sis?.ultimoRespaldo && diasHasta(sis.ultimoRespaldo.slice(0, 10)) > -35 ? 'ok' : 'warn',
      d: sis?.ultimoRespaldo ? fechaHora(sis.ultimoRespaldo) : 'Nunca', accion: () => onTab('respaldos') },
  ]
  const hechas = LISTA_TAREAS.filter(([k]) => tareas[k]).length
  const ico = { ok: faCircleCheck, warn: faTriangleExclamation, error: faCircleXmark, info: faCircleCheck }
  const c = estado?.conteos

  return (
    <div className="mt-grid">
      <section className="st-card mt-span">
        <header><h2>Estado del servicio</h2><span>Se revisa al abrir esta pantalla</span></header>
        <ul className="mt-checks">
          {checks.map((x) => (
            <li key={x.t} className={`is-${x.ok}`} onClick={x.accion} role={x.accion ? 'button' : undefined}>
              <Icon icon={ico[x.ok]} className="mt-check-ico" />
              <div><b>{x.t}</b><span>{x.d}</span></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="st-card">
        <header><h2>Tareas de mantención</h2><span>{hechas}/{LISTA_TAREAS.length} este mes</span></header>
        <div className="mt-progreso"><i style={{ width: `${(hechas / LISTA_TAREAS.length) * 100}%` }} /></div>
        <ul className="mt-tareas">
          {LISTA_TAREAS.map(([k, t]) => (
            <li key={k}>
              <label><input type="checkbox" checked={!!tareas[k]} onChange={() => toggleTarea(mes, k)} /> <span>{t}</span></label>
            </li>
          ))}
        </ul>
      </section>

      <section className="st-card">
        <header><h2>Resumen de datos</h2><span>Lo que guarda la base de datos</span></header>
        <dl className="mt-dl">
          <dt>Certificados vigentes</dt><dd>{c ? c.certificados : '—'}</dd>
          <dt>Último N°</dt><dd>{c?.ultimoNumero ? folio(c.ultimoNumero) : '—'}</dd>
          <dt>Trabajos en agenda</dt><dd>{c ? c.trabajos : '—'}</dd>
          <dt>Usuarios activos</dt><dd>{c ? c.usuariosActivos : '—'}</dd>
        </dl>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------ CONFIGURACIÓN */
function Configuracion() {
  const { config, saving, fetchConfiguracion, guardarConfiguracion, restaurarConfiguracion } = useConfiguracionStore()
  const siguiente = useCertificadoStore((x) => x.resumen.siguiente)
  const fetchResumen = useCertificadoStore((x) => x.fetchResumen)
  useEffect(() => { fetchConfiguracion() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!config) return <p className="adm-muted">Cargando configuración…</p>
  return <FormConfig key={JSON.stringify(config)} config={config} siguiente={siguiente} saving={saving}
    onGuardar={async (p) => { if (await guardarConfiguracion(p)) { fetchResumen(); exito('Configuración guardada: ya se usa en los certificados nuevos') } }}
    onRestaurar={async () => { if (await restaurarConfiguracion()) { fetchResumen(); exito('Configuración original restaurada') } }} />
}

function FormConfig({ config, siguiente, saving, onGuardar, onRestaurar }) {
  const [e, setE] = useState({ ...config.empresa })
  const [c, setC] = useState({ ...config.certificacion })
  const [s, setS] = useState({ ...config.sistema })
  const f = (obj, set, k, tipo) => ({ value: obj[k] ?? '', type: tipo, onChange: (ev) => set({ ...obj, [k]: tipo === 'number' ? Number(ev.target.value) : ev.target.value }) })

  return (
    <form className="mt-contenido" onSubmit={(ev) => { ev.preventDefault(); onGuardar({ empresa: e, certificacion: c, sistema: s }) }}>
      <section className="st-card adm-form">
        <header><h2>Empresa</h2><span>Aparece en el encabezado de cada certificado</span></header>
        <div className="adm-row"><label>Nombre<input {...f(e, setE, 'nombre')} /></label><label>RUT<input {...f(e, setE, 'rut')} /></label></div>
        <div className="adm-row"><label>Dirección<input {...f(e, setE, 'direccion')} /></label><label>Correo<input {...f(e, setE, 'correo')} /></label></div>
        <label>Teléfono<input {...f(e, setE, 'telefono')} /></label>
      </section>
      <section className="st-card adm-form">
        <header><h2>Certificación de las láminas</h2><span>Texto legal del certificado</span></header>
        <div className="adm-row"><label>Filtro UV<input {...f(c, setC, 'uv')} /></label><label>Documento de certificación<input {...f(c, setC, 'documento')} /></label></div>
        <label>Norma<input {...f(c, setC, 'norma')} /></label>
        <label>Declaración legal<textarea rows={3} {...f(c, setC, 'decreto')} /></label>
      </section>
      <section className="st-card adm-form">
        <header><h2>Sistema</h2><span>Numeración, dominio y hosting</span></header>
        <div className="adm-row adm-row--3">
          <label>N° mínimo del próximo certificado<input min="1" {...f(s, setS, 'folioInicial', 'number')} /><small>Próximo: {siguiente ? folio(siguiente) : '—'}</small></label>
          <label>Dominio<input {...f(s, setS, 'dominio')} /></label>
          <label>Vencimiento del dominio<input {...f(s, setS, 'venceDominio', 'date')} /></label>
        </div>
        <label>Hosting<input {...f(s, setS, 'hosting')} /></label>
      </section>
      <div className="mt-barra-btns">
        <button type="button" className="adm-btn adm-btn--ghost" onClick={async () => { if (await confirmar({ titulo: '¿Volver a la configuración original?', text: 'Datos de empresa, texto legal y numeración vuelven a los valores iniciales.', confirmar: 'Sí, restaurar', peligro: true })) onRestaurar() }}><Icon icon={faRotateLeft} /> Original</button>
        <button className="adm-btn" disabled={saving}><Icon icon={faFloppyDisk} /> {saving ? 'Guardando…' : 'Guardar configuración'}</button>
      </div>
    </form>
  )
}

/* ----------------------------------------------------------------- USUARIOS */
const ROLES = {
  admin: { nombre: 'Administrador', permisos: ['Agenda de todo el equipo', 'Certificados (emitir y anular)', 'Estadísticas'] },
  tecnico: { nombre: 'Técnico', permisos: ['Solo su agenda', 'Ver y emitir certificados'] },
  soporte: { nombre: 'Soporte técnico', permisos: ['Todo lo anterior', 'Mantención', 'Usuarios', 'Respaldos'] },
}
const COLORES = ['#ffc800', '#38bdf8', '#c084fc', '#34d399', '#fb7185', '#f97316']

function Usuarios() {
  const { usuarios, saving, fetchUsuarios, crearUsuario, actualizarUsuario, setEstadoUsuario, resetClave } = useMantencionStore()
  const yo = useAuthStore((x) => x.usuario)
  const [nuevo, setNuevo] = useState(null)
  useEffect(() => { fetchUsuarios() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resultado = (r, ok) => { if (r.ok) exito(ok || r.message); else alertaError('No se pudo completar', r.message); return r.ok }
  const verClave = (nombre, usuario, clave) => mostrarDato({
    titulo: `Clave temporal de ${nombre}`,
    html: `Entrégale estos datos. La clave se muestra <b>solo esta vez</b>; después puede cambiarla desde “Cambiar clave”.<br><br>Usuario: <b>${escapar(usuario)}</b><br><code class="vp-clave">${escapar(clave)}</code>`,
    copiar: `Usuario: ${usuario}\nClave: ${clave}`,
  })
  const crear = async (ev) => {
    ev.preventDefault()
    const r = await crearUsuario(nuevo)
    if (r.ok) { setNuevo(null); await verClave(r.data.nombre, r.data.usuario, r.data.claveTemporal) } else resultado(r)
  }
  const restablecer = async (u) => {
    if (!await confirmar({ titulo: `¿Generar una clave nueva para ${u.nombre}?`, text: 'La clave actual dejará de funcionar.', confirmar: 'Sí, generar' })) return
    const r = await resetClave(u.id)
    if (r.ok) await verClave(u.nombre, u.usuario, r.data.claveTemporal); else resultado(r)
  }
  const editarTelefono = async (u) => {
    const tel = await pedirTexto({ titulo: `WhatsApp de ${u.nombre}`, texto: 'Se usa en la agenda para avisarle sus trabajos. Déjalo vacío para quitarlo.', placeholder: '9 1234 5678', valor: u.telefono || '', tipo: 'tel', confirmar: 'Guardar' })
    if (tel !== null) resultado(await actualizarUsuario(u.id, { telefono: tel }), `WhatsApp de ${u.nombre} actualizado`)
  }

  return (
    <div className="mt-contenido">
      <section className="st-card">
        <header>
          <h2>Usuarios del panel</h2>
          <button className="adm-btn" onClick={() => setNuevo({ nombre: '', usuario: '', rol: 'tecnico', descripcion: '', telefono: '', color: COLORES[1] })}><Icon icon={faUserPlus} /> Nuevo usuario</button>
        </header>
        {nuevo && (
          <form className="adm-form mt-nuevo" onSubmit={crear}>
            <div className="adm-row adm-row--3">
              <label>Nombre<input required value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} /></label>
              <label>Usuario<input required value={nuevo.usuario} onChange={(e) => setNuevo({ ...nuevo, usuario: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })} /></label>
              <label>Rol<select value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}>
                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.nombre}</option>)}
              </select></label>
            </div>
            <div className="adm-row">
              <label>Especialidad <small>(se ve en la agenda)</small><input placeholder="Ej: Audio e iluminación" value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} /></label>
              <label>WhatsApp <small>(para avisarle sus trabajos)</small><input type="tel" placeholder="9 1234 5678" value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} /></label>
            </div>
            <div className="adm-row">
              <label>Color en la agenda
                <span className="mt-colores">{COLORES.map((c) => (
                  <button type="button" key={c} className={`mt-color ${nuevo.color === c ? 'is-on' : ''}`} style={{ background: c }} onClick={() => setNuevo({ ...nuevo, color: c })} aria-label={c} />
                ))}</span>
              </label>
            </div>
            <div className="mt-barra-btns">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setNuevo(null)}>Cancelar</button>
              <button className="adm-btn" disabled={saving}><Icon icon={faPlus} /> Crear</button>
            </div>
          </form>
        )}
        <ul className="mt-usuarios">
          {usuarios.map((u) => (
            <li key={u.id} className={u.activo ? '' : 'is-off'}>
              <i className={`mt-av is-${u.rol}`} style={u.rol === 'soporte' ? undefined : { background: u.color }}>{u.nombre[0]}</i>
              <div className="mt-u-info"><b>{u.nombre}</b><small>@{u.usuario}{u.descripcion ? ` · ${u.descripcion}` : ''}{u.telefono ? ` · ${u.telefono}` : ''} · {u.ultimoAcceso ? `último acceso ${fechaHora(u.ultimoAcceso.replace(' ', 'T'))}` : 'sin acceso aún'}</small></div>
              <select value={u.rol} disabled={saving} onChange={async (e) => resultado(await actualizarUsuario(u.id, { rol: e.target.value }), `Rol de ${u.nombre} actualizado`)}>
                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.nombre}</option>)}
              </select>
              <button className="adm-icon-btn" title={u.telefono ? 'Cambiar WhatsApp' : 'Agregar WhatsApp'} aria-label={u.telefono ? 'Cambiar WhatsApp' : 'Agregar WhatsApp'} disabled={saving} onClick={() => editarTelefono(u)}><Icon icon={faWhatsapp} /></button>
              <button className="adm-icon-btn" title="Generar clave nueva" disabled={saving} onClick={() => restablecer(u)}><Icon icon={faKey} /></button>
              <label className="mt-switch" title={u.id === yo?.id ? 'No puedes desactivarte a ti mismo' : u.activo ? 'Desactivar' : 'Activar'}>
                <input type="checkbox" checked={u.activo} disabled={saving || u.id === yo?.id} onChange={async () => resultado(await setEstadoUsuario(u.id, !u.activo))} />
                <span />
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section className="st-card">
        <header><h2>Qué puede hacer cada rol</h2></header>
        <div className="mt-roles">
          {Object.entries(ROLES).map(([k, r]) => (
            <div key={k}><b><i className={`mt-av is-${k}`}>{r.nombre[0]}</i> {r.nombre}</b><ul>{r.permisos.map((p) => <li key={p}>{p}</li>)}</ul></div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------- RESPALDOS */
const COLS_CERT = [
  ['numero', 'N°'], ['fecha', 'Fecha'], ['cliente', 'Cliente'], ['direccion', 'Dirección'], ['telefono', 'Teléfono'], ['instalador', 'Instalador'],
  ['tipo', 'Tipo'], ['marca', 'Marca'], ['modelo', 'Modelo'], ['anio', 'Año'], ['patente', 'Patente'], ['delanteros', '% Delanteros'],
  ['traseros', '% Traseros'], ['luneta', '% Luneta'], ['observaciones', 'Observaciones'], ['codigo', 'Código verificación'],
]
const COLS_AGENDA = [
  ['fecha', 'Fecha'], ['hora', 'Hora'], ['servicio', 'Servicio'], ['encargado', 'Encargado'], ['lugar', 'Lugar'], ['cliente', 'Cliente'],
  ['telefono', 'Teléfono'], ['marca', 'Marca'], ['modelo', 'Modelo'], ['patente', 'Patente'], ['estado', 'Estado'], ['notas', 'Notas'],
]

function Respaldos() {
  const { estado, saving, fetchEstado, descargarRespaldo } = useMantencionStore()
  const hoy = fechaLocal()
  useEffect(() => { fetchEstado() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exportar = async (tipo) => {
    const r = await descargarRespaldo()
    if (!r) return
    if (tipo === 'certificados') { bajar(`certificados-vp-${hoy}.csv`, csv(r.certificados, COLS_CERT), 'text/csv;charset=utf-8'); exito('Certificados exportados para Excel') }
    if (tipo === 'agenda') { bajar(`agenda-vp-${hoy}.csv`, csv(r.trabajos, COLS_AGENDA), 'text/csv;charset=utf-8'); exito('Agenda exportada para Excel') }
    if (tipo === 'completo') { bajar(`respaldo-vp-unicars-${hoy}.json`, JSON.stringify(r, null, 2), 'application/json'); exito('Respaldo completo descargado') }
  }
  const c = estado?.conteos
  const ultimo = estado?.sistema?.ultimoRespaldo

  return (
    <div className="mt-grid">
      <section className="st-card">
        <header><h2>Exportar a Excel</h2><span>Para revisar o entregar al cliente</span></header>
        <div className="mt-acciones">
          <button className="adm-btn adm-btn--ghost" disabled={saving} onClick={() => exportar('certificados')}><Icon icon={faDownload} /> Certificados{c ? ` (${c.certificados})` : ''}</button>
          <button className="adm-btn adm-btn--ghost" disabled={saving} onClick={() => exportar('agenda')}><Icon icon={faDownload} /> Agenda{c ? ` (${c.trabajos})` : ''}</button>
        </div>
      </section>
      <section className="st-card">
        <header><h2>Respaldo completo</h2><span>{ultimo ? `Último: ${fechaHora(ultimo)}` : 'Aún no se descarga ninguno'}</span></header>
        <p className="adm-muted">Certificados, agenda, usuarios (sin claves), configuración, contenido e historial en un archivo JSON. Guárdalo fuera del servidor.</p>
        <div className="mt-acciones">
          <button className="adm-btn" disabled={saving} onClick={() => exportar('completo')}><Icon icon={faDownload} /> {saving ? 'Generando…' : 'Descargar respaldo'}</button>
        </div>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------- HISTORIAL */
function Historial() {
  const { historial, loading, fetchHistorial } = useMantencionStore()
  const [q, setQ] = useState('')
  useEffect(() => {
    const t = setTimeout(() => fetchHistorial(q), 250)
    return () => clearTimeout(t)
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="st-card">
      <header><h2>Historial de cambios</h2><span>Quién hizo qué y cuándo · últimos {historial.length} registros</span></header>
      <div className="adm-buscar"><Icon icon={faMagnifyingGlass} /><input placeholder="Buscar por usuario, acción o detalle…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className={`mt-tabla-wrap ${loading ? 'is-loading' : ''}`}>
        <table className="mt-tabla">
          <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.id}><td>{fechaHora(h.fecha.replace(' ', 'T'))}</td><td>{h.usuario}</td><td><b>{h.accion}</b></td><td>{h.detalle}</td></tr>
            ))}
            {!loading && !historial.length && <tr><td colSpan={4} className="adm-vacio">Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function Mantencion() {
  const [tab, setTab] = useState('estado')
  const [contenidoSucio, setContenidoSucio] = useState(false)
  // Salir de Contenido web con cambios sin publicar los pierde: se pregunta antes
  const irA = async (k) => {
    if (tab === 'contenido' && k !== 'contenido' && contenidoSucio) {
      const ok = await confirmar({ titulo: 'Tienes cambios sin publicar', text: 'Si sales de Contenido web se pierden. ¿Salir igual?', confirmar: 'Salir sin publicar', cancelar: 'Seguir editando', peligro: true })
      if (!ok) return
      setContenidoSucio(false)
    }
    setTab(k)
  }
  const { error, limpiarError } = useMantencionStore()
  const errorConfig = useConfiguracionStore((x) => x.error)
  useEffect(() => { if (error) { alertaError('No se pudo completar', error); limpiarError() } }, [error]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (errorConfig) alertaError('Configuración', errorConfig) }, [errorConfig]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <main className="adm-main mt">
      <div className="adm-list-head">
        <h1 className="adm-h1"><Icon icon={faScrewdriverWrench} /> Mantención</h1>
        <span className="mt-solo">Solo visible para soporte</span>
      </div>
      <nav className="mt-tabs">
        {TABS.map(([k, ico, t]) => (
          <button key={k} className={`adm-chip ${tab === k ? 'is-on' : ''}`} onClick={() => irA(k)}><Icon icon={ico} /> {t}</button>
        ))}
      </nav>
      {tab === 'estado' && <Estado onTab={irA} />}
      {tab === 'contenido' && <ContenidoWeb onSucio={setContenidoSucio} />}
      {tab === 'config' && <Configuracion />}
      {tab === 'usuarios' && <Usuarios />}
      {tab === 'respaldos' && <Respaldos />}
      {tab === 'historial' && <Historial />}
    </main>
  )
}
