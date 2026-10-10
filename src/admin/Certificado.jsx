import { forwardRef, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { empresa, certificacion, formatoPatente, folio, urlVerificacion } from './config.js'

// Certificado rediseñado (tamaño fijo 1050×742 px = proporción A5 apaisado).
// El mismo componente se usa para la vista previa (escalado) y para generar el PDF.

const fechaLarga = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// Oscuridad de la lámina según VLT: 70% casi claro, 5% casi negro
const tinte = (vlt) => {
  if (vlt === '' || vlt == null) return 'rgba(140, 170, 200, 0.35)'
  const v = Number(vlt)
  return `rgba(8, 10, 14, ${Math.min(0.97, Math.max(0.18, 1.04 - v / 100))})`
}

function AutoVidrios({ d, t, l }) {
  // Vista superior: el frente apunta a la derecha
  return (
    <svg viewBox="0 0 320 150" className="cert-car" aria-hidden="true">
      <defs>
        <linearGradient id="carbody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2b30" />
          <stop offset="0.5" stopColor="#141417" />
          <stop offset="1" stopColor="#2b2b30" />
        </linearGradient>
      </defs>
      <rect x="10" y="14" width="300" height="122" rx="46" fill="url(#carbody)" />
      {/* parabrisas */}
      <path d="M212 30 Q238 75 212 120 L190 112 Q204 75 190 38 Z" fill="rgba(150,185,215,.55)" />
      {/* luneta */}
      <path d="M78 34 Q60 75 78 116 L96 108 Q86 75 96 42 Z" fill={tinte(l)} stroke="#ffc800" strokeWidth="1.5" />
      {/* laterales delanteros */}
      <path d="M150 22 L196 26 L186 38 L150 36 Z" fill={tinte(d)} stroke="#ffc800" strokeWidth="1.5" />
      <path d="M150 128 L196 124 L186 112 L150 114 Z" fill={tinte(d)} stroke="#ffc800" strokeWidth="1.5" />
      {/* laterales traseros */}
      <path d="M100 26 L146 22 L146 36 L106 38 Z" fill={tinte(t)} stroke="#ffc800" strokeWidth="1.5" />
      <path d="M100 124 L146 128 L146 114 L106 112 Z" fill={tinte(t)} stroke="#ffc800" strokeWidth="1.5" />
      {/* techo */}
      <rect x="98" y="42" width="90" height="66" rx="10" fill="#1b1b1f" />
      {/* espejos y focos */}
      <rect x="186" y="6" width="12" height="10" rx="3" fill="#2b2b30" />
      <rect x="186" y="134" width="12" height="10" rx="3" fill="#2b2b30" />
      <rect x="296" y="30" width="8" height="20" rx="3" fill="#fff4b0" />
      <rect x="296" y="100" width="8" height="20" rx="3" fill="#fff4b0" />
      <rect x="14" y="30" width="7" height="20" rx="3" fill="#ff3b3b" />
      <rect x="14" y="100" width="7" height="20" rx="3" fill="#ff3b3b" />
    </svg>
  )
}

const Timbre = () => <img className="cert-timbre" src="/admin/timbre.png" alt="" />

const Campo = ({ label, valor, ancho }) => (
  <div className="cert-campo" style={ancho ? { gridColumn: `span ${ancho}` } : undefined}>
    <span className="cert-label">{label}</span>
    <span className="cert-valor">{valor || '—'}</span>
  </div>
)

const Lamina = ({ nombre, vlt }) => (
  <div className="cert-lamina">
    <i style={{ background: tinte(vlt) }} />
    <div>
      <span className="cert-label">{nombre}</span>
      <b>{vlt !== '' && vlt != null ? `${vlt}%` : '—'}</b>
    </div>
  </div>
)

const Certificado = forwardRef(function Certificado({ c }, ref) {
  const [qr, setQr] = useState('')

  useEffect(() => {
    if (!c.numero || !c.codigo) { setQr(''); return }
    QRCode.toDataURL(urlVerificacion(c), { margin: 0, width: 300, color: { dark: '#0b0b0b', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [c.numero, c.codigo])

  const may = (s) => (s || '').toUpperCase()

  return (
    <div className="cert" ref={ref}>
      <header className="cert-head">
        <img className="cert-logo" src="/admin/logo-vp.png" alt="VP Unicars" />
        <div className="cert-titulo">
          <h1>Certificado de instalación</h1>
          <p>Láminas de seguridad y control solar</p>
        </div>
        <div className="cert-num">
          <span>N° documento{!c.numero && c.numeroPreview ? ' · borrador' : ''}</span>
          <b>{folio(c.numero || c.numeroPreview || 0)}</b>
        </div>
      </header>
      <div className="cert-empresa">
        <span>RUT {empresa.rut}</span><i />
        <span>{empresa.direccion}</span><i />
        <span>{empresa.correo}</span><i />
        <span>{empresa.telefono}</span>
      </div>

      <div className="cert-body">
        <section className="cert-col">
          <h2>Datos de la instalación</h2>
          <div className="cert-grid">
            <Campo label="Fecha de instalación" valor={fechaLarga(c.fecha)} />
            <Campo label="Instalador" valor={may(c.instalador)} />
            <Campo label="Cliente" valor={may(c.cliente)} ancho={2} />
            <Campo label="Dirección" valor={may(c.direccion)} ancho={2} />
          </div>

          <h2>Vehículo</h2>
          <div className="cert-vehiculo">
            <div className="cert-grid cert-grid--4">
              <Campo label="Tipo" valor={may(c.tipo)} />
              <Campo label="Marca" valor={may(c.marca)} />
              <Campo label="Modelo" valor={may(c.modelo)} />
              <Campo label="Año" valor={c.anio} />
            </div>
            <div className="cert-patente">
              <span>CHILE</span>
              <b>{formatoPatente(c.patente) || '—'}</b>
            </div>
          </div>
        </section>

        <section className="cert-col">
          <h2>Láminas instaladas <small>% de luz visible (VLT)</small></h2>
          <div className="cert-laminas">
            <AutoVidrios d={c.delanteros} t={c.traseros} l={c.luneta} />
            <div className="cert-laminas-lista">
              <Lamina nombre="Vidrios laterales delanteros" vlt={c.delanteros} />
              <Lamina nombre="Vidrios laterales traseros" vlt={c.traseros} />
              <Lamina nombre="Luneta trasera" vlt={c.luneta} />
            </div>
          </div>
          <div className="cert-certif">
            <b>Láminas con {certificacion.uv} y certificación de fiabilidad</b>
            <span>{certificacion.documento}</span>
            <span>{certificacion.norma}</span>
          </div>
        </section>
      </div>

      <div className="cert-obs">
        <span className="cert-label">Observaciones</span>
        <span className="cert-valor">{may(c.observaciones) || ' '}</span>
      </div>

      <footer className="cert-foot">
        <p className="cert-decreto">{certificacion.decreto}</p>
        <div className="cert-qr">
          {qr ? <img src={qr} alt="" /> : <div className="cert-qr-vacio">QR</div>}
          <span>Escanea para verificar<br />la autenticidad{c.codigo ? <><br /><b>Código {c.codigo}</b></> : null}</span>
        </div>
        <div className="cert-firma">
          <Timbre />
          <i />
          <b>{empresa.nombre.toUpperCase()}</b>
          <span>RUT {empresa.rut}</span>
        </div>
      </footer>
    </div>
  )
})

export default Certificado
