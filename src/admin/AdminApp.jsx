import { useEffect, useRef, useState } from 'react'
import Certificado from './Certificado.jsx'
import Vista from './Vista.jsx'
import Formulario from './Formulario.jsx'
import Agenda from './Agenda.jsx'
import Estadisticas from './Estadisticas.jsx'
import Mantencion from './Mantencion.jsx'
import { vacio } from './store.js'
import { generarPDF, descargar, compartir, nombreArchivo } from './pdf.js'
import { exito, info, error as alertaError, confirmar, escapar } from './alertas.js'
import { folio, formatoPatente, urlVerificacion } from './config.js'
import { useAuthStore } from '../stores/authStore.js'
import { useCertificadoStore } from '../stores/certificadoStore.js'
import { useAgendaStore } from '../stores/agendaStore.js'
import { useConfiguracionStore } from '../stores/configuracionStore.js'
import { useTiempoRealStore } from '../stores/tiempoRealStore.js'
import {
  Icon, faPlus, faMagnifyingGlass, faFilePdf, faArrowLeft, faRightFromBracket, faCopy, faTrash, faFileSignature,
  faLock, faWhatsapp, faEye, faQrcode, faCalendarWeek, faBars, faChevronLeft, faChevronRight, faChartLine,
  faScrewdriverWrench, faKey,
} from './iconos.js'

// Números de página con "…" cuando hay muchas: 1 … 4 5 6 … 12
const paginas = (actual, total) => {
  const set = new Set([1, total, actual - 1, actual, actual + 1].filter((n) => n >= 1 && n <= total))
  const lista = [...set].sort((a, b) => a - b)
  return lista.flatMap((n, i) => (i && n - lista[i - 1] > 1 ? ['…', n] : [n]))
}

function Paginacion({ pagina, total, items, porPagina, onCambio }) {
  const desde = (pagina - 1) * porPagina + 1
  const hasta = Math.min(items, pagina * porPagina)
  return (
    <nav className="adm-pag" aria-label="Paginación">
      <span className="adm-pag-info">Mostrando <b>{desde}–{hasta}</b> de <b>{items}</b></span>
      <div className="adm-pag-btns">
        <button className="adm-icon-btn" disabled={pagina === 1} onClick={() => onCambio(pagina - 1)} aria-label="Página anterior"><Icon icon={faChevronLeft} /></button>
        {paginas(pagina, total).map((n, i) => (n === '…'
          ? <span key={`e${i}`} className="adm-pag-dots">…</span>
          : <button key={n} className={`adm-pag-n ${n === pagina ? 'is-on' : ''}`} onClick={() => onCambio(n)} aria-current={n === pagina ? 'page' : undefined}>{n}</button>))}
        <button className="adm-icon-btn" disabled={pagina === total} onClick={() => onCambio(pagina + 1)} aria-label="Página siguiente"><Icon icon={faChevronRight} /></button>
      </div>
    </nav>
  )
}

const fechaCorta = (iso) => iso.split('-').reverse().join('/')

function Login() {
  const { login, loading, error } = useAuthStore()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={(e) => { e.preventDefault(); login(u.trim().toLowerCase(), p) }}>
        <img src="/admin/logo-vp.png" alt="VP Unicars" />
        <h1>Panel VP Unicars</h1>
        <p className="adm-muted">Agenda del equipo y certificados de instalación.</p>
        <label>Usuario<input autoFocus value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required /></label>
        <label>Clave<input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required /></label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn--big" disabled={loading}><Icon icon={faLock} /> {loading ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  )
}

function CambiarClave({ onClose, obligatorio = false }) {
  const cambiarClave = useAuthStore((s) => s.cambiarClave)
  const logout = useAuthStore((s) => s.logout)
  const [f, setF] = useState({ actual: '', nueva: '', repetir: '' })
  const [error, setError] = useState('')
  const enviar = async (e) => {
    e.preventDefault()
    if (f.nueva.length < 8) return setError('La clave nueva debe tener al menos 8 caracteres')
    if (f.nueva !== f.repetir) return setError('Las claves nuevas no coinciden')
    if (f.nueva === f.actual) return setError('La clave nueva debe ser distinta a la actual')
    const r = await cambiarClave(f.actual, f.nueva)
    if (!r.ok) return setError(r.message)
    exito('Clave actualizada'); onClose?.()
  }
  return (
    <div className={obligatorio ? 'adm-login' : 'ag-modal-bg'} onClick={obligatorio ? undefined : onClose}>
      <form className={obligatorio ? 'adm-login-card adm-form' : 'ag-modal adm-form'} onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        {obligatorio && <img src="/admin/logo-vp.png" alt="VP Unicars" />}
        <div className="ag-modal-head"><h2>{obligatorio ? 'Crea tu clave' : 'Cambiar clave'}</h2></div>
        {obligatorio && <p className="adm-muted">Entraste con una clave temporal. Por seguridad, elige una clave personal (mínimo 8 caracteres) para continuar.</p>}
        <label>{obligatorio ? 'Clave temporal' : 'Clave actual'}<input type="password" autoComplete="current-password" required value={f.actual} onChange={(e) => setF({ ...f, actual: e.target.value })} /></label>
        <label>Clave nueva<input type="password" autoComplete="new-password" required value={f.nueva} onChange={(e) => setF({ ...f, nueva: e.target.value })} /></label>
        <label>Repite la clave nueva<input type="password" autoComplete="new-password" required value={f.repetir} onChange={(e) => setF({ ...f, repetir: e.target.value })} /></label>
        {error && <p className="adm-error">{error}</p>}
        <div className="ag-modal-foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={obligatorio ? logout : onClose}>{obligatorio ? 'Salir' : 'Cancelar'}</button>
          <button className="adm-btn"><Icon icon={faKey} /> Guardar clave</button>
        </div>
      </form>
    </div>
  )
}

export default function AdminApp() {
  const { usuario, initialized, sinConexion, init, logout, puede } = useAuthStore()
  const certs = useCertificadoStore()
  const { equipo, fetchEquipo } = useAgendaStore()
  const fetchConfiguracion = useConfiguracionStore((s) => s.fetchConfiguracion)
  useConfiguracionStore((s) => s.config) // vuelve a dibujar los certificados cuando llega la configuración
  const { conectado, ultimoCambio, iniciar: iniciarTiempoReal, terminar: terminarTiempoReal } = useTiempoRealStore()

  const [vista, setVista] = useState('agenda') // agenda | lista | nuevo | ver | estadisticas | mantencion
  const [form, setForm] = useState(vacio)
  const [actual, setActual] = useState(null)
  const [q, setQ] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [menu, setMenu] = useState(false)
  const [claveAbierta, setClaveAbierta] = useState(false)
  const exportar = useRef(null)

  const esSoporte = usuario?.rol === 'soporte'

  useEffect(() => { init() }, [init])

  // Sesión vencida en cualquier llamada: volver al login
  useEffect(() => {
    const f = () => { logout(); useAuthStore.setState({ error: 'Tu sesión se cerró (venció o el usuario fue desactivado). Vuelve a entrar.' }) }
    window.addEventListener('vp:sesion-expirada', f)
    return () => window.removeEventListener('vp:sesion-expirada', f)
  }, [logout])

  useEffect(() => {
    if (!usuario || usuario.debeCambiarClave) return
    fetchConfiguracion()
    fetchEquipo()
    certs.fetchResumen()
    setVista(usuario.rol === 'soporte' ? 'mantencion' : 'agenda')
    iniciarTiempoReal()
    return () => terminarTiempoReal()
  }, [usuario?.id, usuario?.debeCambiarClave]) // eslint-disable-line react-hooks/exhaustive-deps

  // Aviso cuando OTRA persona cambia algo (los datos ya se actualizaron solos)
  useEffect(() => {
    if (!ultimoCambio || ultimoCambio.origen === usuario?.id || !ultimoCambio.origen) return
    const textos = { trabajos: 'La agenda se actualizó', certificados: 'Hay cambios en los certificados', usuarios: 'Se actualizó el equipo' }
    const t = textos[ultimoCambio.tipos.find((x) => textos[x])]
    if (t) info(`${t} (cambio de otro usuario)`)
  }, [ultimoCambio]) // eslint-disable-line react-hooks/exhaustive-deps

  // Búsqueda con espera corta para no consultar en cada tecla
  useEffect(() => {
    if (!usuario || vista !== 'lista') return
    const t = setTimeout(() => certs.fetchCertificados({ q, page: 1 }), 250)
    return () => clearTimeout(t)
  }, [q, vista, usuario?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (certs.error) { alertaError('No se pudo completar', certs.error); certs.limpiarError() } }, [certs.error]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialized) return <div className="adm-login"><p className="adm-muted">{sinConexion ? 'Conectando con el servidor…' : 'Cargando…'}</p></div>
  if (!usuario) return <Login />
  if (usuario.debeCambiarClave) return <CambiarClave obligatorio />

  const siguiente = certs.resumen.siguiente
  const nuevoForm = () => ({ ...vacio(), instalador: usuario.nombre })

  const emitir = async () => {
    const c = await certs.createCertificado(form)
    if (!c) return
    setActual(c)
    setVista('ver')
    setForm(nuevoForm())
    exito(`Certificado N° ${folio(c.numero)} emitido`)
  }

  const pdf = async (accion) => {
    if (!actual || ocupado) return
    setOcupado(true)
    try {
      const blob = await generarPDF(exportar.current)
      if (accion === 'descargar') { descargar(blob, nombreArchivo(actual)); exito('PDF descargado') }
      else {
        const r = await compartir(actual, blob)
        if (r === 'descargado') info('PDF descargado: adjúntalo en el chat de WhatsApp')
      }
    } finally { setOcupado(false) }
  }

  const duplicar = (c) => {
    setForm({
      ...nuevoForm(), cliente: c.cliente, direccion: c.direccion || '', telefono: c.telefono || '', instalador: c.instalador,
      tipo: c.tipo, marca: c.marca, modelo: c.modelo, anio: String(c.anio), patente: c.patente,
    })
    setVista('nuevo')
  }

  // Desde la agenda: certificado prellenado con los datos del trabajo
  const certificadoDesdeTrabajo = (t) => {
    setForm({
      ...nuevoForm(), fecha: t.fecha, cliente: t.cliente, telefono: t.telefono || '', direccion: t.direccion || '',
      marca: t.marca || '', modelo: t.modelo || '', patente: t.patente || '', observaciones: t.notas || '',
      instalador: t.encargado || usuario.nombre,
    })
    setVista('nuevo')
    info('Datos del trabajo cargados: completa los % de las láminas')
  }

  const anular = async (c) => {
    const ok = await confirmar({
      titulo: `¿Anular el certificado N° ${folio(c.numero)}?`,
      html: `De <b>${escapar(c.cliente)}</b> · ${escapar(formatoPatente(c.patente))}.<br>Queda registrado en el historial y su número no se vuelve a usar.`,
      confirmar: 'Sí, anular', peligro: true,
    })
    if (!ok) return
    if (await certs.anularCertificado(c.numero)) { exito(`Certificado N° ${folio(c.numero)} anulado`); setVista('lista') }
  }

  const items = [
    ['agenda', faCalendarWeek, 'Agenda', vista === 'agenda', true],
    ['lista', faFileSignature, 'Certificados', ['lista', 'ver', 'nuevo'].includes(vista), puede('certificados.ver')],
    ['estadisticas', faChartLine, 'Estadísticas', vista === 'estadisticas', puede('estadisticas.ver')],
    ['mantencion', faScrewdriverWrench, 'Mantención', vista === 'mantencion', puede('mantencion.ver')],
  ].filter((i) => i[4])

  return (
    <div className="adm">
      <aside className={`adm-side ${menu ? 'is-open' : ''}`}>
        <div className="adm-side-brand">
          <img src="/admin/logo-vp.png" alt="VP Unicars" />
          <span>Panel VP Unicars</span>
        </div>
        <nav className="adm-side-nav">
          {items.map(([v, ico, txt, on]) => (
            <button key={v} className={`adm-side-item ${on ? 'is-on' : ''}`} title={txt} onClick={() => { setVista(v); setMenu(false) }}>
              <Icon icon={ico} /><span>{txt}</span>
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <div className={`adm-vivo ${conectado ? 'is-on' : ''}`} title={conectado ? 'Los cambios del equipo aparecen al instante' : 'Reconectando…'}>
            <i /><span>{conectado ? 'En vivo' : 'Reconectando…'}</span>
          </div>
          <div className="adm-side-user">
            <i className={esSoporte ? 'is-soporte' : ''} style={esSoporte ? undefined : { background: usuario.color }}>{usuario.nombre[0]}</i>
            <span><b>{usuario.nombre}</b><small>{usuario.rolNombre}</small></span>
          </div>
          <button className="adm-side-item" title="Cambiar clave" onClick={() => { setClaveAbierta(true); setMenu(false) }}>
            <Icon icon={faKey} /><span>Cambiar clave</span>
          </button>
          <button className="adm-side-item" title="Salir" onClick={logout}>
            <Icon icon={faRightFromBracket} /><span>Salir</span>
          </button>
        </div>
      </aside>
      {menu && <div className="adm-side-bg" onClick={() => setMenu(false)} />}

      <header className="adm-mobilebar">
        <button className="adm-icon-btn" onClick={() => setMenu(true)} aria-label="Abrir menú"><Icon icon={faBars} /></button>
        <span className="adm-mobilebar-t">{{ agenda: 'Agenda', estadisticas: 'Estadísticas', mantencion: 'Mantención' }[vista] || 'Certificados'}</span>
        <img src="/admin/logo-vp.png" alt="VP Unicars" />
      </header>

      <div className="adm-content">
        {vista === 'agenda' && <Agenda onCertificado={certificadoDesdeTrabajo} />}

        {vista === 'estadisticas' && <Estadisticas />}

        {vista === 'mantencion' && esSoporte && <Mantencion />}

        {vista === 'lista' && (
          <main className="adm-main">
            <div className="adm-list-head">
              <h1 className="adm-h1"><Icon icon={faFileSignature} /> Certificados</h1>
              {puede('certificados.crear') && (
                <button className="adm-btn" onClick={() => { setForm(nuevoForm()); setVista('nuevo') }}><Icon icon={faPlus} /> Nuevo certificado</button>
              )}
            </div>
            <div className="adm-stats">
              <div><span>Total emitidos</span><b>{certs.resumen.total}</b></div>
              <div><span>Este mes</span><b>{certs.resumen.delMes}</b></div>
              <div><span>Próximo N°</span><b>{siguiente ? folio(siguiente) : '—'}</b></div>
            </div>

            <div className="adm-buscar">
              <Icon icon={faMagnifyingGlass} />
              <input placeholder="Buscar por patente, cliente, N° o modelo…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>

            <ul className={`adm-lista ${certs.loading ? 'is-loading' : ''}`}>
              {certs.certificados.map((c) => (
                <li key={c.numero}>
                  <button className="adm-item" onClick={() => { setActual(c); setVista('ver') }}>
                    <span className="adm-item-num">N° {folio(c.numero)}</span>
                    <span className="adm-item-pat">{formatoPatente(c.patente)}</span>
                    <span className="adm-item-cli"><b>{c.cliente}</b><small>{c.marca} {c.modelo} · {c.anio}</small></span>
                    <span className="adm-item-fecha">{fechaCorta(c.fecha)}</span>
                    <Icon icon={faEye} className="adm-item-ico" />
                  </button>
                </li>
              ))}
              {!certs.loading && certs.certificados.length === 0 && (
                <li className="adm-vacio">{q ? `No hay certificados que coincidan con “${q}”.` : 'Todavía no hay certificados emitidos.'}</li>
              )}
            </ul>

            {certs.meta.total > certs.meta.limite && (
              <Paginacion
                pagina={certs.meta.pagina} total={certs.meta.paginas} items={certs.meta.total} porPagina={certs.meta.limite}
                onCambio={(n) => { certs.fetchCertificados({ q, page: n }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            )}
          </main>
        )}

        {vista === 'nuevo' && (
          <main className="adm-main adm-split">
            <div>
              <button className="adm-back" onClick={() => setVista('lista')}><Icon icon={faArrowLeft} /> Certificados</button>
              <h1 className="adm-h1"><Icon icon={faFileSignature} /> Nuevo certificado</h1>
              <Formulario
                f={form} set={setForm} instaladores={equipo.map((p) => p.nombre)} onSubmit={emitir}
                numero={siguiente ? folio(siguiente) : '—'} guardando={certs.saving}
              />
            </div>
            <aside className="adm-preview">
              <p className="adm-preview-t">Vista previa en vivo</p>
              <Vista c={{ ...form, numeroPreview: siguiente }} />
            </aside>
          </main>
        )}

        {vista === 'ver' && actual && (
          <main className="adm-main">
            <button className="adm-back" onClick={() => setVista('lista')}><Icon icon={faArrowLeft} /> Certificados</button>
            <div className="adm-ver-head">
              <h1 className="adm-h1">N° {folio(actual.numero)} · {formatoPatente(actual.patente)}</h1>
              <div className="adm-acciones">
                <button className="adm-btn" disabled={ocupado} onClick={() => pdf('descargar')}><Icon icon={faFilePdf} /> {ocupado ? 'Generando…' : 'Descargar PDF'}</button>
                <button className="adm-btn adm-btn--wa" disabled={ocupado} onClick={() => pdf('compartir')}><Icon icon={faWhatsapp} /> Enviar por WhatsApp</button>
                <a className="adm-btn adm-btn--ghost" href={urlVerificacion(actual)} target="_blank" rel="noreferrer"><Icon icon={faQrcode} /> Verificación</a>
                {puede('certificados.crear') && <button className="adm-btn adm-btn--ghost" onClick={() => duplicar(actual)}><Icon icon={faCopy} /> Usar datos</button>}
                {puede('certificados.anular') && (
                  <button className="adm-icon-btn adm-icon-btn--danger" title="Anular" onClick={() => anular(actual)}><Icon icon={faTrash} /></button>
                )}
              </div>
            </div>
            <Vista c={actual} />
          </main>
        )}
      </div>

      {/* Copia a tamaño real, fuera de pantalla, para generar el PDF */}
      {actual && (
        <div className="adm-export" aria-hidden="true">
          <Certificado c={actual} ref={exportar} />
        </div>
      )}

      {claveAbierta && <CambiarClave onClose={() => setClaveAbierta(false)} />}
    </div>
  )
}
