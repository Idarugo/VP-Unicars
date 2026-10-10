import { useMemo, useRef, useState } from 'react'
import Certificado from './Certificado.jsx'
import Vista from './Vista.jsx'
import Formulario from './Formulario.jsx'
import { cargar, guardar, reiniciar, siguienteNumero, vacio, nuevoCodigo } from './store.js'
import { generarPDF, descargar, compartir, nombreArchivo } from './pdf.js'
import { folio, formatoPatente, urlVerificacion } from './config.js'
import {
  Icon, faPlus, faMagnifyingGlass, faFilePdf, faArrowLeft, faRightFromBracket, faCopy, faTrash, faFileSignature,
  faLock, faRotateLeft, faWhatsapp, faEye, faQrcode,
} from './iconos.js'

// DEMO: acceso de prueba. La versión real usa usuarios con contraseña segura (Supabase Auth).
const DEMO = { usuario: 'demo', clave: 'demo' }
const SESION = 'vp-demo-sesion'

const leerSesion = () => { try { return sessionStorage.getItem(SESION) === '1' } catch { return false } }
const fechaCorta = (iso) => iso.split('-').reverse().join('/')

function Login({ onOk }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [error, setError] = useState('')
  const entrar = (e) => {
    e.preventDefault()
    if (u.trim().toLowerCase() === DEMO.usuario && p === DEMO.clave) {
      try { sessionStorage.setItem(SESION, '1') } catch { /* nada */ }
      onOk()
    } else setError('Usuario o clave incorrectos')
  }
  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={entrar}>
        <img src="/admin/logo-vp.png" alt="VP Unicars" />
        <h1>Panel de certificados</h1>
        <p className="adm-muted">Ingresa para emitir y buscar certificados de instalación.</p>
        <label>Usuario<input autoFocus value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" /></label>
        <label>Clave<input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn--big"><Icon icon={faLock} /> Entrar</button>
        <p className="adm-demo-note">Demo · usuario <b>demo</b> · clave <b>demo</b></p>
      </form>
    </div>
  )
}

export default function AdminApp() {
  const [sesion, setSesion] = useState(leerSesion)
  const [lista, setLista] = useState(cargar)
  const [vista, setVista] = useState('lista') // lista | nuevo | ver
  const [form, setForm] = useState(vacio)
  const [actual, setActual] = useState(null)
  const [q, setQ] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')
  const exportar = useRef(null)

  const actualizar = (l) => { setLista(l); guardar(l) }
  const numero = siguienteNumero(lista)
  const instaladores = useMemo(() => [...new Set(lista.map((c) => c.instalador).filter(Boolean))], [lista])

  const filtrada = useMemo(() => {
    const t = q.trim().toUpperCase().replace(/[·\s-]/g, '')
    const orden = [...lista].sort((a, b) => b.numero - a.numero)
    if (!t) return orden
    return orden.filter((c) =>
      String(c.numero).includes(t) || c.patente.includes(t) || c.cliente.toUpperCase().replace(/\s/g, '').includes(t) ||
      `${c.marca}${c.modelo}`.toUpperCase().replace(/\s/g, '').includes(t))
  }, [lista, q])

  const mes = new Date().toISOString().slice(0, 7)
  const delMes = lista.filter((c) => c.fecha.startsWith(mes)).length

  const mostrarAviso = (t) => { setAviso(t); setTimeout(() => setAviso(''), 3200) }

  const emitir = () => {
    const c = { ...form, numero, codigo: nuevoCodigo(), creado: new Date().toISOString() }
    actualizar([...lista, c])
    setActual(c)
    setVista('ver')
    setForm(vacio())
    mostrarAviso(`Certificado N° ${folio(c.numero)} emitido`)
  }

  const pdf = async (accion) => {
    if (!actual || ocupado) return
    setOcupado(true)
    try {
      const blob = await generarPDF(exportar.current)
      if (accion === 'descargar') { descargar(blob, nombreArchivo(actual)); mostrarAviso('PDF descargado') }
      else {
        const r = await compartir(actual, blob)
        if (r === 'descargado') mostrarAviso('PDF descargado: adjúntalo en el chat de WhatsApp')
      }
    } finally { setOcupado(false) }
  }

  const duplicar = (c) => {
    const { numero: _n, codigo: _c, creado: _cr, ...datos } = c
    setForm({ ...datos, fecha: vacio().fecha })
    setVista('nuevo')
  }

  const eliminar = (c) => {
    if (!window.confirm(`¿Eliminar el certificado N° ${folio(c.numero)}? (solo en la demo)`)) return
    actualizar(lista.filter((x) => x.numero !== c.numero))
    setVista('lista')
  }

  if (!sesion) return <Login onOk={() => setSesion(true)} />

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-brand">
          <img src="/admin/logo-vp.png" alt="VP Unicars" />
          <span>Panel de certificados</span>
          <em className="adm-badge">DEMO</em>
        </div>
        <nav>
          <button className={`adm-tab ${vista === 'lista' ? 'is-on' : ''}`} onClick={() => setVista('lista')}>Certificados</button>
          <button className="adm-btn" onClick={() => { setVista('nuevo'); setForm(vacio()) }}><Icon icon={faPlus} /> Nuevo</button>
          <button className="adm-icon-btn" title="Salir" onClick={() => { try { sessionStorage.removeItem(SESION) } catch { /* nada */ } setSesion(false) }}>
            <Icon icon={faRightFromBracket} />
          </button>
        </nav>
      </header>

      {vista === 'lista' && (
        <main className="adm-main">
          <div className="adm-stats">
            <div><span>Total emitidos</span><b>{lista.length}</b></div>
            <div><span>Este mes</span><b>{delMes}</b></div>
            <div><span>Próximo N°</span><b>{folio(numero)}</b></div>
          </div>

          <div className="adm-buscar">
            <Icon icon={faMagnifyingGlass} />
            <input placeholder="Buscar por patente, cliente, N° o modelo…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <ul className="adm-lista">
            {filtrada.map((c) => (
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
            {filtrada.length === 0 && <li className="adm-vacio">No hay certificados que coincidan con “{q}”.</li>}
          </ul>

          <button className="adm-link" onClick={() => { if (window.confirm('¿Volver a los datos de ejemplo de la demo?')) { setLista(reiniciar()) } }}>
            <Icon icon={faRotateLeft} /> Reiniciar datos de la demo
          </button>
        </main>
      )}

      {vista === 'nuevo' && (
        <main className="adm-main adm-split">
          <div>
            <button className="adm-back" onClick={() => setVista('lista')}><Icon icon={faArrowLeft} /> Volver</button>
            <h1 className="adm-h1"><Icon icon={faFileSignature} /> Nuevo certificado</h1>
            <Formulario f={form} set={setForm} instaladores={instaladores} onSubmit={emitir} numero={folio(numero)} />
          </div>
          <aside className="adm-preview">
            <p className="adm-preview-t">Vista previa en vivo</p>
            <Vista c={{ ...form, numeroPreview: numero }} />
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
              <button className="adm-btn adm-btn--ghost" onClick={() => duplicar(actual)}><Icon icon={faCopy} /> Usar datos</button>
              <button className="adm-icon-btn adm-icon-btn--danger" title="Eliminar" onClick={() => eliminar(actual)}><Icon icon={faTrash} /></button>
            </div>
          </div>
          <Vista c={actual} />
        </main>
      )}

      {/* Copia a tamaño real, fuera de pantalla, para generar el PDF */}
      {actual && (
        <div className="adm-export" aria-hidden="true">
          <Certificado c={actual} ref={exportar} />
        </div>
      )}

      {aviso && <div className="adm-toast">{aviso}</div>}
    </div>
  )
}
