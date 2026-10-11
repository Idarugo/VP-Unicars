import { useEffect, useMemo, useRef, useState } from 'react'
import { base } from '../data.js'
import { leerContenido, guardarContenido, borrarContenido } from '../contenido.js'
import {
  empresa, certificacion, sistema, guardarConfig, restaurarConfig, folio,
} from './config.js'
import {
  leerHistorial, registrar, leerUsuarios, guardarUsuarios, ROLES, fechaLocal, nuevoId,
} from './store.js'
import {
  Icon, faScrewdriverWrench, faCircleCheck, faTriangleExclamation, faCircleXmark, faGlobe, faServer, faDatabase,
  faFloppyDisk, faRotateLeft, faArrowUp, faArrowDown, faTrash, faPlus, faEye, faEyeSlash, faDownload, faUpload,
  faUserPlus, faKey, faMagnifyingGlass, faClockRotateLeft, faUsers, faGear, faPenToSquare, faHeartPulse, faArrowUpRightFromSquare,
} from './iconos.js'

const FOTOS = [
  'ahumado-focos.webp', 'arquitectonico-bronce.webp', 'arquitectonico.webp', 'bmw-520i.jpg', 'fibra-carbono.webp', 'kill-chrome.jpg',
  'laminas-seguridad.webp', 'nanocarbon.jpg', 'nanoceramico.jpg', 'personalizacion.jpg', 'piano-black.jpg', 'pilares-carbono.jpg',
  'pilares-ppf.webp', 'polarizado-5.webp', 'porsche-ppf.jpg', 'ppf-moto.webp', 'ppf-trabajos.webp', 'privacidad.jpg', 'tecnica.webp',
  'territory-ppf.jpg', 'tornasol.webp',
]
const TABS = [
  ['estado', faHeartPulse, 'Estado'],
  ['contenido', faPenToSquare, 'Contenido web'],
  ['config', faGear, 'Configuración'],
  ['usuarios', faUsers, 'Usuarios'],
  ['respaldos', faDatabase, 'Respaldos'],
  ['historial', faClockRotateLeft, 'Historial'],
]
const KEY_TAREAS = 'vp-demo-tareas'
const KEY_RESPALDO = 'vp-demo-ultimo-respaldo'
const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* nada */ } }
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
function Estado({ certificados, trabajos, onTab }) {
  const [web, setWeb] = useState({ estado: 'cargando' })
  const [tareas, setTareas] = useState(() => leer(KEY_TAREAS, {}))
  const mes = fechaLocal().slice(0, 7)
  const ultimoRespaldo = leer(KEY_RESPALDO, null)

  useEffect(() => {
    const t0 = performance.now()
    fetch(`/?ping=${Date.now()}`, { method: 'HEAD', cache: 'no-store' })
      .then((r) => setWeb({ estado: r.ok ? 'ok' : 'error', ms: Math.round(performance.now() - t0) }))
      .catch(() => setWeb({ estado: 'error' }))
  }, [])

  const dias = diasHasta(sistema.venceDominio)
  const checks = [
    { ico: faGlobe, t: 'Página web', ok: web.estado === 'ok' ? 'ok' : web.estado === 'cargando' ? 'info' : 'error',
      d: web.estado === 'ok' ? `En línea · responde en ${web.ms} ms` : web.estado === 'cargando' ? 'Comprobando…' : 'No responde' },
    { ico: faGlobe, t: `Dominio ${sistema.dominio}`, ok: dias > 60 ? 'ok' : dias > 0 ? 'warn' : 'error',
      d: dias > 0 ? `Vence el ${sistema.venceDominio.split('-').reverse().join('/')} (en ${dias} días)` : 'Vencido: renovar en NIC Chile' },
    { ico: faServer, t: 'Hosting', ok: 'warn', d: `${sistema.hosting}: el plan gratuito no permite uso comercial. Migrar a Cloudflare Pages o Vercel Pro.` },
    { ico: faDatabase, t: 'Base de datos', ok: 'warn', d: 'Demo: los datos viven en este navegador. Conectar Supabase para producción.' },
    { ico: faFloppyDisk, t: 'Último respaldo', ok: ultimoRespaldo ? 'ok' : 'warn',
      d: ultimoRespaldo ? fechaHora(ultimoRespaldo) : 'Nunca en este navegador', accion: () => onTab('respaldos') },
  ]
  const listaTareas = [
    ['fotos', 'Subir fotos y trabajos nuevos del mes'],
    ['whatsapp', 'Probar todos los botones de WhatsApp'],
    ['contenido', 'Revisar horario, servicios y preguntas frecuentes'],
    ['respaldo', 'Descargar respaldo completo'],
    ['reporte', 'Enviar reporte mensual de estadísticas al cliente'],
  ]
  const hechas = listaTareas.filter(([k]) => tareas[`${mes}:${k}`]).length
  const marcar = (k) => {
    const n = { ...tareas, [`${mes}:${k}`]: !tareas[`${mes}:${k}`] }
    setTareas(n); escribir(KEY_TAREAS, n)
  }
  const ico = { ok: faCircleCheck, warn: faTriangleExclamation, error: faCircleXmark, info: faCircleCheck }

  return (
    <div className="mt-grid">
      <section className="st-card mt-span">
        <header><h2>Estado del servicio</h2><span>Se revisa al abrir esta pantalla</span></header>
        <ul className="mt-checks">
          {checks.map((c) => (
            <li key={c.t} className={`is-${c.ok}`} onClick={c.accion} role={c.accion ? 'button' : undefined}>
              <Icon icon={ico[c.ok]} className="mt-check-ico" />
              <div><b>{c.t}</b><span>{c.d}</span></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="st-card">
        <header><h2>Tareas de mantención</h2><span>{hechas}/{listaTareas.length} este mes</span></header>
        <div className="mt-progreso"><i style={{ width: `${(hechas / listaTareas.length) * 100}%` }} /></div>
        <ul className="mt-tareas">
          {listaTareas.map(([k, t]) => (
            <li key={k}>
              <label><input type="checkbox" checked={!!tareas[`${mes}:${k}`]} onChange={() => marcar(k)} /> <span>{t}</span></label>
            </li>
          ))}
        </ul>
      </section>

      <section className="st-card">
        <header><h2>Resumen de datos</h2><span>Lo que guarda el panel</span></header>
        <dl className="mt-dl">
          <dt>Certificados emitidos</dt><dd>{certificados.length}</dd>
          <dt>Último N°</dt><dd>{folio(Math.max(0, ...certificados.map((c) => c.numero)))}</dd>
          <dt>Trabajos en agenda</dt><dd>{trabajos.length}</dd>
          <dt>Usuarios activos</dt><dd>{leerUsuarios().filter((u) => u.activo).length}</dd>
        </dl>
      </section>
    </div>
  )
}

/* --------------------------------------------------------------- CONTENIDO */
function EditorLista({ titulo, items, conFoto, onChange }) {
  const [abierto, setAbierto] = useState(null)
  return (
    <section className="st-card">
      <header><h2>{titulo}</h2><span>{items.filter((s) => !s.oculto).length} visibles</span></header>
      <ul className="mt-items">
        {items.map((s) => (
          <li key={s.id} className={s.oculto ? 'is-oculto' : ''}>
            <div className="mt-item-head">
              {conFoto && (s.foto ? <img src={s.foto} alt="" /> : <span className="mt-item-sinfoto" />)}
              <button type="button" className="mt-item-t" onClick={() => setAbierto(abierto === s.id ? null : s.id)}>
                <b>{s.titulo}</b><small>{s.oculto ? 'Oculto en la página' : 'Visible'}</small>
              </button>
              <button type="button" className="adm-icon-btn" title={s.oculto ? 'Mostrar' : 'Ocultar'} onClick={() => onChange(s.id, { oculto: !s.oculto })}>
                <Icon icon={s.oculto ? faEyeSlash : faEye} />
              </button>
            </div>
            {abierto === s.id && (
              <div className="adm-form mt-item-form">
                <label>Título<input value={s.titulo} onChange={(e) => onChange(s.id, { titulo: e.target.value })} /></label>
                <label>Descripción<textarea rows={3} value={s.texto} onChange={(e) => onChange(s.id, { texto: e.target.value })} /></label>
                {conFoto !== undefined && (
                  <div>
                    <span className="mt-sub">Foto</span>
                    <div className="mt-fotos">
                      <button type="button" className={`mt-foto mt-foto--none ${!s.foto ? 'is-on' : ''}`} onClick={() => onChange(s.id, { foto: '' })}>Sin foto</button>
                      {FOTOS.map((f) => (
                        <button type="button" key={f} className={`mt-foto ${s.foto === `/fotos/${f}` ? 'is-on' : ''}`} onClick={() => onChange(s.id, { foto: `/fotos/${f}` })}>
                          <img src={`/fotos/${f}`} alt={f} loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Contenido({ usuario, avisar }) {
  const inicial = () => {
    const c = leerContenido()
    const mezclar = (lista, extra = {}) => lista.map((s) => ({ ...s, ...(extra[s.id] || {}) }))
    return {
      negocio: { ...base.negocio, ...(c.negocio || {}) },
      servicios: mezclar(base.servicios, c.servicios),
      masServicios: mezclar(base.masServicios, c.masServicios),
      faqs: c.faqs?.length ? c.faqs : base.faqs,
    }
  }
  const [d, setD] = useState(inicial)
  const [sucio, setSucio] = useState(false)
  const cambiar = (fn) => { setD((x) => fn(structuredClone(x))); setSucio(true) }
  const campoNeg = (k) => ({ value: d.negocio[k] || '', onChange: (e) => cambiar((x) => { x.negocio[k] = e.target.value; return x }) })
  const editarItem = (lista) => (id, cambios) => cambiar((x) => { x[lista] = x[lista].map((s) => (s.id === id ? { ...s, ...cambios } : s)); return x })

  const guardar = () => {
    // Solo se guardan las diferencias con el contenido original
    const difs = (lista, orig) => Object.fromEntries(lista.map((s) => {
      const o = orig.find((x) => x.id === s.id) || {}
      const cam = Object.fromEntries(['titulo', 'texto', 'foto', 'oculto'].filter((k) => (s[k] ?? '') !== (o[k] ?? '')).map((k) => [k, s[k]]))
      return [s.id, cam]
    }).filter(([, c]) => Object.keys(c).length))
    const neg = Object.fromEntries(['whatsapp', 'direccion', 'horario', 'horarioNota'].filter((k) => d.negocio[k] !== base.negocio[k]).map((k) => [k, d.negocio[k]]))
    guardarContenido({
      negocio: neg, servicios: difs(d.servicios, base.servicios), masServicios: difs(d.masServicios, base.masServicios),
      faqs: JSON.stringify(d.faqs) === JSON.stringify(base.faqs) ? undefined : d.faqs,
    })
    registrar(usuario, 'Editó contenido web', 'Textos, fotos u horario de la página')
    setSucio(false)
    avisar('Cambios guardados. Ábrelos en la página para verlos.')
  }
  const restaurar = () => {
    if (!window.confirm('¿Volver todo el contenido de la página a como estaba originalmente?')) return
    borrarContenido(); setD(inicial()); setSucio(false)
    registrar(usuario, 'Restauró contenido web', 'Contenido original')
    avisar('Contenido original restaurado')
  }
  const faq = (i, k, v) => cambiar((x) => { x.faqs[i] = { ...x.faqs[i], [k]: v }; return x })
  const moverFaq = (i, dir) => cambiar((x) => { const j = i + dir; if (j < 0 || j >= x.faqs.length) return x; [x.faqs[i], x.faqs[j]] = [x.faqs[j], x.faqs[i]]; return x })

  return (
    <div className="mt-contenido">
      <div className="mt-barra">
        <p className="st-aviso"><Icon icon={faTriangleExclamation} /> Demo: los cambios se ven en la página solo en este navegador. En la versión real se publican para todos.</p>
        <div className="mt-barra-btns">
          <button className="adm-btn adm-btn--ghost" onClick={restaurar}><Icon icon={faRotateLeft} /> Original</button>
          <a className="adm-btn adm-btn--ghost" href="/" target="_blank" rel="noreferrer"><Icon icon={faArrowUpRightFromSquare} /> Ver página</a>
          <button className="adm-btn" onClick={guardar} disabled={!sucio}><Icon icon={faFloppyDisk} /> {sucio ? 'Guardar cambios' : 'Guardado'}</button>
        </div>
      </div>

      <section className="st-card">
        <header><h2>Datos del negocio</h2><span>Contacto y horario que muestra la página</span></header>
        <div className="adm-form">
          <div className="adm-row">
            <label>WhatsApp (con 56)<input inputMode="numeric" {...campoNeg('whatsapp')} /></label>
            <label>Dirección<input {...campoNeg('direccion')} /></label>
          </div>
          <div className="adm-row">
            <label>Horario<input {...campoNeg('horario')} /></label>
            <label>Nota del horario<input {...campoNeg('horarioNota')} /></label>
          </div>
        </div>
      </section>

      <EditorLista titulo="Servicios principales" items={d.servicios} conFoto onChange={editarItem('servicios')} />
      <EditorLista titulo="Más servicios (audio, seguridad…)" items={d.masServicios} conFoto onChange={editarItem('masServicios')} />

      <section className="st-card">
        <header><h2>Preguntas frecuentes</h2><span>{d.faqs.length} preguntas</span></header>
        <ul className="mt-faqs">
          {d.faqs.map((f, i) => (
            <li key={i} className="adm-form">
              <div className="mt-faq-head">
                <span className="mt-sub">Pregunta {i + 1}</span>
                <div>
                  <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => moverFaq(i, -1)} aria-label="Subir"><Icon icon={faArrowUp} /></button>
                  <button type="button" className="adm-icon-btn" disabled={i === d.faqs.length - 1} onClick={() => moverFaq(i, 1)} aria-label="Bajar"><Icon icon={faArrowDown} /></button>
                  <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => cambiar((x) => { x.faqs.splice(i, 1); return x })} aria-label="Eliminar"><Icon icon={faTrash} /></button>
                </div>
              </div>
              <input value={f.q} placeholder="Pregunta" onChange={(e) => faq(i, 'q', e.target.value)} />
              <textarea rows={2} value={f.a} placeholder="Respuesta" onChange={(e) => faq(i, 'a', e.target.value)} />
            </li>
          ))}
        </ul>
        <button className="adm-btn adm-btn--ghost" onClick={() => cambiar((x) => { x.faqs.push({ q: '', a: '' }); return x })}><Icon icon={faPlus} /> Agregar pregunta</button>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------ CONFIGURACIÓN */
function Configuracion({ usuario, avisar, siguiente }) {
  const [e, setE] = useState({ ...empresa })
  const [c, setC] = useState({ ...certificacion })
  const [s, setS] = useState({ ...sistema })
  const f = (obj, set, k, tipo) => ({ value: obj[k], type: tipo, onChange: (ev) => set({ ...obj, [k]: tipo === 'number' ? Number(ev.target.value) : ev.target.value }) })

  const guardar = (ev) => {
    ev.preventDefault()
    guardarConfig({ empresa: e, certificacion: c, sistema: s })
    registrar(usuario, 'Cambió configuración', 'Datos de empresa, certificación o sistema')
    avisar('Configuración guardada: ya se usa en los certificados nuevos')
  }
  return (
    <form className="mt-contenido" onSubmit={guardar}>
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
          <label>N° mínimo del próximo certificado<input min="1" {...f(s, setS, 'folioInicial', 'number')} /><small>Próximo: {folio(siguiente)}</small></label>
          <label>Dominio<input {...f(s, setS, 'dominio')} /></label>
          <label>Vencimiento del dominio<input {...f(s, setS, 'venceDominio', 'date')} /></label>
        </div>
        <label>Hosting<input {...f(s, setS, 'hosting')} /></label>
      </section>
      <div className="mt-barra-btns">
        <button type="button" className="adm-btn adm-btn--ghost" onClick={() => {
          if (!window.confirm('¿Volver a la configuración original?')) return
          restaurarConfig(); setE({ ...empresa }); setC({ ...certificacion }); setS({ ...sistema })
          registrar(usuario, 'Restauró configuración'); avisar('Configuración original restaurada')
        }}><Icon icon={faRotateLeft} /> Original</button>
        <button className="adm-btn"><Icon icon={faFloppyDisk} /> Guardar configuración</button>
      </div>
    </form>
  )
}

/* ----------------------------------------------------------------- USUARIOS */
function Usuarios({ usuario, avisar }) {
  const [lista, setLista] = useState(leerUsuarios)
  const [nuevo, setNuevo] = useState(null)
  const actualizar = (l, accion, detalle) => { setLista(l); guardarUsuarios(l); registrar(usuario, accion, detalle) }
  const cambiar = (u, cambios, accion) => actualizar(lista.map((x) => (x.id === u.id ? { ...x, ...cambios } : x)), accion, u.nombre)

  return (
    <div className="mt-contenido">
      <section className="st-card">
        <header>
          <h2>Usuarios del panel</h2>
          <button className="adm-btn" onClick={() => setNuevo({ nombre: '', usuario: '', rol: 'tecnico' })}><Icon icon={faUserPlus} /> Nuevo usuario</button>
        </header>
        {nuevo && (
          <form className="adm-form mt-nuevo" onSubmit={(ev) => {
            ev.preventDefault()
            actualizar([...lista, { ...nuevo, id: nuevoId(), activo: true, acceso: null }], 'Creó usuario', `${nuevo.nombre} · ${ROLES[nuevo.rol].nombre}`)
            setNuevo(null); avisar('Usuario creado: se le enviaría un link para crear su clave')
          }}>
            <div className="adm-row adm-row--3">
              <label>Nombre<input required value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} /></label>
              <label>Usuario<input required value={nuevo.usuario} onChange={(e) => setNuevo({ ...nuevo, usuario: e.target.value.toLowerCase().replace(/\s/g, '') })} /></label>
              <label>Rol<select value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}>
                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.nombre}</option>)}
              </select></label>
            </div>
            <div className="mt-barra-btns">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setNuevo(null)}>Cancelar</button>
              <button className="adm-btn"><Icon icon={faPlus} /> Crear</button>
            </div>
          </form>
        )}
        <ul className="mt-usuarios">
          {lista.map((u) => (
            <li key={u.id} className={u.activo ? '' : 'is-off'}>
              <i className={`mt-av is-${u.rol}`}>{u.nombre[0]}</i>
              <div className="mt-u-info"><b>{u.nombre}</b><small>@{u.usuario} · {u.acceso ? `último acceso ${fechaHora(u.acceso)}` : 'sin acceso aún'}</small></div>
              <select value={u.rol} disabled={u.rol === 'soporte'} onChange={(e) => cambiar(u, { rol: e.target.value }, `Cambió rol a ${ROLES[e.target.value].nombre}`)}>
                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.nombre}</option>)}
              </select>
              <button className="adm-icon-btn" title="Restablecer clave" onClick={() => { registrar(usuario, 'Restableció clave', u.nombre); avisar(`Se enviaría a ${u.nombre} un link para crear una clave nueva`) }}><Icon icon={faKey} /></button>
              <label className="mt-switch" title={u.activo ? 'Desactivar' : 'Activar'}>
                <input type="checkbox" checked={u.activo} disabled={u.rol === 'soporte'} onChange={() => cambiar(u, { activo: !u.activo }, u.activo ? 'Desactivó usuario' : 'Activó usuario')} />
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
function Respaldos({ usuario, avisar, certificados, trabajos }) {
  const archivo = useRef(null)
  const hoy = fechaLocal()
  const automaticos = useMemo(() => Array.from({ length: 4 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() - i * 7); d.setHours(3, 0, 0, 0); return d.toISOString()
  }), [])
  const marcar = (tipo) => { escribir(KEY_RESPALDO, new Date().toISOString()); registrar(usuario, 'Descargó respaldo', tipo) }

  const exportarCertificados = () => {
    bajar(`certificados-vp-${hoy}.csv`, csv([...certificados].sort((a, b) => a.numero - b.numero), [
      ['numero', 'N°'], ['fecha', 'Fecha'], ['cliente', 'Cliente'], ['direccion', 'Dirección'], ['telefono', 'Teléfono'], ['instalador', 'Instalador'],
      ['tipo', 'Tipo'], ['marca', 'Marca'], ['modelo', 'Modelo'], ['anio', 'Año'], ['patente', 'Patente'], ['delanteros', '% Delanteros'],
      ['traseros', '% Traseros'], ['luneta', '% Luneta'], ['observaciones', 'Observaciones'], ['codigo', 'Código verificación'],
    ]), 'text/csv;charset=utf-8')
    marcar('Certificados (Excel)'); avisar('Certificados exportados para Excel')
  }
  const exportarAgenda = () => {
    bajar(`agenda-vp-${hoy}.csv`, csv([...trabajos].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)), [
      ['fecha', 'Fecha'], ['hora', 'Hora'], ['servicio', 'Servicio'], ['encargado', 'Encargado'], ['lugar', 'Lugar'], ['cliente', 'Cliente'],
      ['telefono', 'Teléfono'], ['marca', 'Marca'], ['modelo', 'Modelo'], ['patente', 'Patente'], ['estado', 'Estado'], ['notas', 'Notas'],
    ]), 'text/csv;charset=utf-8')
    marcar('Agenda (Excel)'); avisar('Agenda exportada para Excel')
  }
  const completo = () => {
    const datos = {}
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('vp-demo-')) datos[k] = localStorage.getItem(k) } } catch { /* nada */ }
    datos['vp-demo-certificados'] = JSON.stringify(certificados)
    datos['vp-demo-agenda'] = JSON.stringify(trabajos)
    bajar(`respaldo-vp-unicars-${hoy}.json`, JSON.stringify({ app: 'vp-unicars-panel', version: 1, fecha: new Date().toISOString(), datos }, null, 2), 'application/json')
    marcar('Respaldo completo'); avisar('Respaldo completo descargado')
  }
  const restaurar = async (ev) => {
    const f = ev.target.files?.[0]
    ev.target.value = ''
    if (!f) return
    try {
      const r = JSON.parse(await f.text())
      if (r.app !== 'vp-unicars-panel' || !r.datos) throw new Error('formato')
      if (!window.confirm(`¿Restaurar el respaldo del ${fechaHora(r.fecha)}? Se reemplazan los datos actuales.`)) return
      Object.entries(r.datos).forEach(([k, v]) => { if (k.startsWith('vp-demo-')) localStorage.setItem(k, v) })
      registrar(usuario, 'Restauró respaldo', fechaHora(r.fecha))
      avisar('Respaldo restaurado: recargando…')
      setTimeout(() => window.location.reload(), 900)
    } catch { avisar('Ese archivo no es un respaldo válido del panel') }
  }

  return (
    <div className="mt-grid">
      <section className="st-card">
        <header><h2>Exportar a Excel</h2><span>Para revisar o entregar al cliente</span></header>
        <div className="mt-acciones">
          <button className="adm-btn adm-btn--ghost" onClick={exportarCertificados}><Icon icon={faDownload} /> Certificados ({certificados.length})</button>
          <button className="adm-btn adm-btn--ghost" onClick={exportarAgenda}><Icon icon={faDownload} /> Agenda ({trabajos.length})</button>
        </div>
      </section>
      <section className="st-card">
        <header><h2>Respaldo completo</h2><span>Todo el panel en un archivo</span></header>
        <div className="mt-acciones">
          <button className="adm-btn" onClick={completo}><Icon icon={faDownload} /> Descargar respaldo</button>
          <button className="adm-btn adm-btn--ghost" onClick={() => archivo.current.click()}><Icon icon={faUpload} /> Restaurar</button>
          <input ref={archivo} type="file" accept="application/json,.json" hidden onChange={restaurar} />
        </div>
      </section>
      <section className="st-card mt-span">
        <header><h2>Respaldos automáticos</h2><span>Cada domingo a las 03:00 (versión real)</span></header>
        <ul className="mt-checks">
          {automaticos.map((f) => (
            <li key={f} className="is-ok"><Icon icon={faCircleCheck} className="mt-check-ico" /><div><b>{fechaHora(f)}</b><span>Automático · correcto</span></div></li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------- HISTORIAL */
function Historial() {
  const [lista] = useState(leerHistorial)
  const [q, setQ] = useState('')
  const filtrada = lista.filter((h) => `${h.usuario} ${h.accion} ${h.detalle}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <section className="st-card">
      <header><h2>Historial de cambios</h2><span>Quién hizo qué y cuándo · últimos {lista.length} registros</span></header>
      <div className="adm-buscar"><Icon icon={faMagnifyingGlass} /><input placeholder="Buscar por usuario, acción o detalle…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="mt-tabla-wrap">
        <table className="mt-tabla">
          <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead>
          <tbody>
            {filtrada.map((h, i) => (
              <tr key={i}><td>{fechaHora(h.fecha)}</td><td>{h.usuario}</td><td><b>{h.accion}</b></td><td>{h.detalle}</td></tr>
            ))}
            {!filtrada.length && <tr><td colSpan={4} className="adm-vacio">Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function Mantencion({ usuario, certificados, trabajos, siguiente, avisar }) {
  const [tab, setTab] = useState('estado')
  return (
    <main className="adm-main mt">
      <div className="adm-list-head">
        <h1 className="adm-h1"><Icon icon={faScrewdriverWrench} /> Mantención</h1>
        <span className="mt-solo">Solo visible para soporte</span>
      </div>
      <nav className="mt-tabs">
        {TABS.map(([k, ico, t]) => (
          <button key={k} className={`adm-chip ${tab === k ? 'is-on' : ''}`} onClick={() => setTab(k)}><Icon icon={ico} /> {t}</button>
        ))}
      </nav>
      {tab === 'estado' && <Estado certificados={certificados} trabajos={trabajos} onTab={setTab} />}
      {tab === 'contenido' && <Contenido usuario={usuario} avisar={avisar} />}
      {tab === 'config' && <Configuracion usuario={usuario} avisar={avisar} siguiente={siguiente} />}
      {tab === 'usuarios' && <Usuarios usuario={usuario} avisar={avisar} />}
      {tab === 'respaldos' && <Respaldos usuario={usuario} avisar={avisar} certificados={certificados} trabajos={trabajos} />}
      {tab === 'historial' && <Historial />}
    </main>
  )
}
