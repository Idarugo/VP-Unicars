import { useEffect, useState } from 'react'
import { base } from '../data.js'
import { folio } from './config.js'
import { fechaLocal } from './store.js'
import { useMantencionStore } from '../stores/mantencionStore.js'
import { useConfiguracionStore } from '../stores/configuracionStore.js'
import { useCertificadoStore } from '../stores/certificadoStore.js'
import { useAuthStore } from '../stores/authStore.js'
import {
  Icon, faScrewdriverWrench, faCircleCheck, faTriangleExclamation, faCircleXmark, faGlobe, faServer, faDatabase,
  faFloppyDisk, faRotateLeft, faArrowUp, faArrowDown, faTrash, faPlus, faEye, faEyeSlash, faDownload,
  faUserPlus, faKey, faMagnifyingGlass, faClockRotateLeft, faUsers, faGear, faPenToSquare, faHeartPulse, faArrowUpRightFromSquare, faCopy,
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

function Contenido({ avisar }) {
  const { contenido, saving, fetchContenido, guardarContenido, restaurarContenido } = useMantencionStore()
  useEffect(() => { fetchContenido() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!contenido) return <p className="adm-muted">Cargando contenido…</p>
  return <EditorContenido key={JSON.stringify(contenido)} c={contenido} saving={saving} avisar={avisar} guardarContenido={guardarContenido} restaurarContenido={restaurarContenido} />
}

function EditorContenido({ c, saving, avisar, guardarContenido, restaurarContenido }) {
  const inicial = () => {
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

  const guardar = async () => {
    // Solo se guardan las diferencias con el contenido original
    const difs = (lista, orig) => Object.fromEntries(lista.map((s) => {
      const o = orig.find((x) => x.id === s.id) || {}
      const cam = Object.fromEntries(['titulo', 'texto', 'foto', 'oculto'].filter((k) => (s[k] ?? '') !== (o[k] ?? '')).map((k) => [k, s[k]]))
      return [s.id, cam]
    }).filter(([, c]) => Object.keys(c).length))
    const neg = Object.fromEntries(['whatsapp', 'direccion', 'horario', 'horarioNota'].filter((k) => d.negocio[k] !== base.negocio[k]).map((k) => [k, d.negocio[k]]))
    const ok = await guardarContenido({
      negocio: neg, servicios: difs(d.servicios, base.servicios), masServicios: difs(d.masServicios, base.masServicios),
      faqs: JSON.stringify(d.faqs) === JSON.stringify(base.faqs) ? undefined : d.faqs.filter((f) => f.q.trim()),
    })
    if (ok) avisar('Cambios publicados: ya los ven todos los visitantes')
  }
  const restaurar = async () => {
    if (!window.confirm('¿Volver todo el contenido de la página a como estaba originalmente?')) return
    if (await restaurarContenido()) avisar('Contenido original restaurado')
  }
  const faq = (i, k, v) => cambiar((x) => { x.faqs[i] = { ...x.faqs[i], [k]: v }; return x })
  const moverFaq = (i, dir) => cambiar((x) => { const j = i + dir; if (j < 0 || j >= x.faqs.length) return x; [x.faqs[i], x.faqs[j]] = [x.faqs[j], x.faqs[i]]; return x })

  return (
    <div className="mt-contenido">
      <div className="mt-barra">
        <p className="st-aviso"><Icon icon={faTriangleExclamation} /> Al guardar, los cambios se publican en la página para todos los visitantes.</p>
        <div className="mt-barra-btns">
          <button className="adm-btn adm-btn--ghost" onClick={restaurar}><Icon icon={faRotateLeft} /> Original</button>
          <a className="adm-btn adm-btn--ghost" href="/" target="_blank" rel="noreferrer"><Icon icon={faArrowUpRightFromSquare} /> Ver página</a>
          <button className="adm-btn" onClick={guardar} disabled={!sucio || saving}><Icon icon={faFloppyDisk} /> {saving ? 'Guardando…' : sucio ? 'Guardar y publicar' : 'Guardado'}</button>
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
function Configuracion({ avisar }) {
  const { config, saving, fetchConfiguracion, guardarConfiguracion, restaurarConfiguracion } = useConfiguracionStore()
  const siguiente = useCertificadoStore((x) => x.resumen.siguiente)
  const fetchResumen = useCertificadoStore((x) => x.fetchResumen)
  useEffect(() => { fetchConfiguracion() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!config) return <p className="adm-muted">Cargando configuración…</p>
  return <FormConfig key={JSON.stringify(config)} config={config} siguiente={siguiente} saving={saving} avisar={avisar}
    onGuardar={async (p) => { if (await guardarConfiguracion(p)) { fetchResumen(); avisar('Configuración guardada: ya se usa en los certificados nuevos') } }}
    onRestaurar={async () => { if (await restaurarConfiguracion()) { fetchResumen(); avisar('Configuración original restaurada') } }} />
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
        <button type="button" className="adm-btn adm-btn--ghost" onClick={() => { if (window.confirm('¿Volver a la configuración original?')) onRestaurar() }}><Icon icon={faRotateLeft} /> Original</button>
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

// La clave temporal se muestra una sola vez: hay que entregársela a la persona
function ClaveTemporal({ dato, onClose }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <div className="ag-modal-bg" onClick={onClose}>
      <div className="ag-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="ag-modal-head"><h2>Clave temporal de {dato.nombre}</h2></div>
        <p className="adm-muted">Entrégale estos datos. La clave se muestra <b>solo esta vez</b>; después puede cambiarla desde “Cambiar clave”.</p>
        <dl className="mt-dl">
          <dt>Usuario</dt><dd>{dato.usuario}</dd>
          <dt>Clave</dt><dd><code className="mt-clave">{dato.clave}</code></dd>
        </dl>
        <div className="ag-modal-foot">
          <button className="adm-btn adm-btn--ghost" onClick={() => navigator.clipboard?.writeText(`Usuario: ${dato.usuario}\nClave: ${dato.clave}`).then(() => setCopiado(true))}>
            <Icon icon={faCopy} /> {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button className="adm-btn" onClick={onClose}>Listo</button>
        </div>
      </div>
    </div>
  )
}

function Usuarios({ avisar }) {
  const { usuarios, saving, fetchUsuarios, crearUsuario, actualizarUsuario, setEstadoUsuario, resetClave } = useMantencionStore()
  const yo = useAuthStore((x) => x.usuario)
  const [nuevo, setNuevo] = useState(null)
  const [clave, setClave] = useState(null)
  useEffect(() => { fetchUsuarios() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resultado = (r, ok) => { avisar(r.ok ? ok || r.message : r.message); return r.ok }
  const crear = async (ev) => {
    ev.preventDefault()
    const r = await crearUsuario(nuevo)
    if (resultado(r, 'Usuario creado')) { setClave({ nombre: r.data.nombre, usuario: r.data.usuario, clave: r.data.claveTemporal }); setNuevo(null) }
  }
  const restablecer = async (u) => {
    if (!window.confirm(`¿Generar una clave nueva para ${u.nombre}? La actual dejará de funcionar.`)) return
    const r = await resetClave(u.id)
    if (resultado(r)) setClave({ nombre: u.nombre, usuario: u.usuario, clave: r.data.claveTemporal })
  }

  return (
    <div className="mt-contenido">
      <section className="st-card">
        <header>
          <h2>Usuarios del panel</h2>
          <button className="adm-btn" onClick={() => setNuevo({ nombre: '', usuario: '', rol: 'tecnico', descripcion: '', color: COLORES[1] })}><Icon icon={faUserPlus} /> Nuevo usuario</button>
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
              <div className="mt-u-info"><b>{u.nombre}</b><small>@{u.usuario}{u.descripcion ? ` · ${u.descripcion}` : ''} · {u.ultimoAcceso ? `último acceso ${fechaHora(u.ultimoAcceso.replace(' ', 'T'))}` : 'sin acceso aún'}</small></div>
              <select value={u.rol} disabled={saving} onChange={async (e) => resultado(await actualizarUsuario(u.id, { rol: e.target.value }), `Rol de ${u.nombre} actualizado`)}>
                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.nombre}</option>)}
              </select>
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
      {clave && <ClaveTemporal dato={clave} onClose={() => setClave(null)} />}
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

function Respaldos({ avisar }) {
  const { estado, saving, fetchEstado, descargarRespaldo } = useMantencionStore()
  const hoy = fechaLocal()
  useEffect(() => { fetchEstado() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exportar = async (tipo) => {
    const r = await descargarRespaldo()
    if (!r) return
    if (tipo === 'certificados') { bajar(`certificados-vp-${hoy}.csv`, csv(r.certificados, COLS_CERT), 'text/csv;charset=utf-8'); avisar('Certificados exportados para Excel') }
    if (tipo === 'agenda') { bajar(`agenda-vp-${hoy}.csv`, csv(r.trabajos, COLS_AGENDA), 'text/csv;charset=utf-8'); avisar('Agenda exportada para Excel') }
    if (tipo === 'completo') { bajar(`respaldo-vp-unicars-${hoy}.json`, JSON.stringify(r, null, 2), 'application/json'); avisar('Respaldo completo descargado') }
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

export default function Mantencion({ avisar }) {
  const [tab, setTab] = useState('estado')
  const { error, limpiarError } = useMantencionStore()
  const errorConfig = useConfiguracionStore((x) => x.error)
  useEffect(() => { if (error) { avisar(error); limpiarError() } }, [error]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (errorConfig) avisar(errorConfig) }, [errorConfig]) // eslint-disable-line react-hooks/exhaustive-deps
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
      {tab === 'estado' && <Estado onTab={setTab} />}
      {tab === 'contenido' && <Contenido avisar={avisar} />}
      {tab === 'config' && <Configuracion avisar={avisar} />}
      {tab === 'usuarios' && <Usuarios avisar={avisar} />}
      {tab === 'respaldos' && <Respaldos avisar={avisar} />}
      {tab === 'historial' && <Historial />}
    </main>
  )
}
