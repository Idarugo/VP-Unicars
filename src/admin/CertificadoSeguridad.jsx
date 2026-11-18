import { forwardRef, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { empresa, folioSeguridad, micras, m2, urlVerificacionSeguridad } from './config.js'

// Certificado de instalación de lámina de seguridad (casas, locales y oficinas).
// Tamaño fijo 794×1123 px = A4 vertical. El mismo componente sirve para la vista previa y para el PDF.

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const fechaPartes = (iso) => {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return { d, mes: MESES[m - 1], y }
}

// Corte de la lámina sobre el vidrio: el vidrio trizado sigue unido gracias a la película
function Corte({ mil }) {
  const um = mil ? micras(mil) : null
  return (
    <svg viewBox="0 0 250 170" className="ls-corte" aria-hidden="true">
      <defs>
        <linearGradient id="ls-vidrio" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cfe3ef" />
          <stop offset="1" stopColor="#e9f3f9" />
        </linearGradient>
      </defs>
      {/* vidrio */}
      <path d="M40 18 L96 6 L96 158 L40 166 Z" fill="url(#ls-vidrio)" stroke="#7aa6c2" strokeWidth="1.2" />
      {/* trizaduras: el vidrio se rompe pero no se desprende */}
      <g stroke="#5b8aa8" strokeWidth="1" fill="none" opacity=".85">
        <path d="M70 82 L52 50 M70 82 L88 40 M70 82 L94 96 M70 82 L48 112 M70 82 L78 140 M70 82 L58 30" />
        <path d="M58 64 L76 58 L86 74 M54 96 L66 104 L84 104 M62 120 L74 116" />
      </g>
      {/* adhesivo */}
      <path d="M96 6 L101 5 L101 157 L96 158 Z" fill="#f6e7a6" />
      {/* lámina */}
      <path d="M101 5 L111 3 L111 155 L101 157 Z" fill="#ffe600" stroke="#111" strokeWidth="1.2" />
      {/* etiquetas */}
      <g fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" fill="#111">
        <path d="M106 30 L150 30" stroke="#111" strokeWidth="1" />
        <text x="154" y="27">Lámina de</text>
        <text x="154" y="40">seguridad</text>
        <text x="154" y="53" fontWeight="600" fill="#666">{mil ? `${String(mil).replace('.', ',')} mil · ${um} µm` : 'Espesor'}</text>
        <path d="M99 86 L150 86" stroke="#111" strokeWidth="1" />
        <text x="154" y="90">Adhesivo</text>
        <path d="M80 132 L150 132" stroke="#111" strokeWidth="1" />
        <text x="154" y="129">Vidrio</text>
        <text x="154" y="142" fontWeight="600" fill="#666">existente</text>
      </g>
    </svg>
  )
}

const Dato = ({ label, valor, ancho }) => (
  <div className="ls-dato" style={ancho ? { gridColumn: `span ${ancho}` } : undefined}>
    <span className="cert-label">{label}</span>
    <b>{valor || '—'}</b>
  </div>
)

const CertificadoSeguridad = forwardRef(function CertificadoSeguridad({ c }, ref) {
  const [qr, setQr] = useState('')

  useEffect(() => {
    if (!c.numero || !c.codigo) { setQr(''); return }
    QRCode.toDataURL(urlVerificacionSeguridad(c), { margin: 0, width: 300, color: { dark: '#0b0b0b', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [c.numero, c.codigo])

  const ficha = c.ficha || {}
  const superficies = (c.superficies || []).filter((s) => s.ubicacion || Number(s.m2))
  const total = superficies.reduce((s, x) => s + Number(x.m2 || 0), 0)
  const f = fechaPartes(c.fecha)
  const espesor = ficha.espesorMil ? `${String(ficha.espesorMil).replace('.', ',')} mil · ${micras(ficha.espesorMil)} micras` : '—'
  const caracteristicas = (ficha.caracteristicas || []).filter((x) => x.k || x.v)
  const lugar = [c.direccion, c.comuna].filter(Boolean).join(', ')
  const denso = superficies.length > 6 || caracteristicas.length > 6

  return (
    <div className={`cert ls ${denso ? 'is-denso' : ''}`} ref={ref}>
      <header className="cert-head ls-head">
        <img className="cert-logo" src="/admin/logo-vp.png" alt="VP Unicars" />
        <div className="cert-titulo">
          <h1>Certificado de instalación</h1>
          <p>Lámina de seguridad</p>
        </div>
        <div className="cert-num">
          <span>N° documento{!c.numero && c.numeroPreview ? ' · borrador' : ''}</span>
          <b>{folioSeguridad(c.numero || c.numeroPreview || 0)}</b>
        </div>
      </header>
      <div className="cert-empresa">
        <span>{empresa.nombre.toUpperCase()} SPA</span><i />
        <span>RUT {empresa.rut}</span><i />
        <span>{empresa.direccion}</span><i />
        <span>{empresa.telefono}</span>
      </div>

      <div className="ls-body">
        <section className="ls-cliente">
          <div className="ls-cliente-datos">
            <span className="cert-label">Cliente</span>
            <p className="ls-razon">{c.razonSocial || '—'}</p>
            <div className="ls-grid">
              <Dato label="RUT" valor={c.rut} />
              <Dato label="Tipo de inmueble" valor={c.inmueble} />
              <Dato label="Dirección de la instalación" valor={lugar} ancho={2} />
              {c.contacto && <Dato label="Contacto" valor={c.contacto} ancho={2} />}
            </div>
          </div>
          <div className="ls-fecha">
            <span className="cert-label">Fecha de instalación</span>
            <b>{f ? f.d : '—'}</b>
            <span>{f ? `${f.mes} ${f.y}` : ''}</span>
            <small>Instalador: <b>{c.instalador || '—'}</b></small>
          </div>
        </section>

        <p className="ls-declara">
          <b>{empresa.nombre.toUpperCase()} SPA</b>, RUT {empresa.rut}, certifica que {f ? <>el día <b>{f.d} de {f.mes} de {f.y}</b></> : 'en la fecha indicada'} realizó
          la instalación de <b>{(ficha.producto || 'lámina de seguridad').toLowerCase()}</b> en las superficies que se detallan,
          {lugar ? <> en <b>{lugar}</b>,</> : ''} de acuerdo con las especificaciones técnicas del fabricante.
        </p>

        <h2 className="ls-h2">Detalle de la instalación</h2>
        <table className="ls-tabla">
          <thead>
            <tr><th>#</th><th>Ubicación</th><th>Lámina</th><th>Espesor</th><th>m²</th></tr>
          </thead>
          <tbody>
            {superficies.length ? superficies.map((s, i) => (
              <tr key={i}>
                <td>{String(i + 1).padStart(2, '0')}</td>
                <td><b>{s.ubicacion || '—'}</b></td>
                <td>{ficha.producto || '—'}</td>
                <td>{ficha.espesorMil ? `${String(ficha.espesorMil).replace('.', ',')} mil · ${micras(ficha.espesorMil)} µm` : '—'}</td>
                <td>{s.m2 ? m2(s.m2) : '—'}</td>
              </tr>
            )) : <tr><td colSpan={5} className="ls-tabla-vacia">Agrega las superficies instaladas</td></tr>}
          </tbody>
          <tfoot>
            <tr><td colSpan={4}>Superficie total instalada</td><td><b>{m2(total)} m²</b></td></tr>
          </tfoot>
        </table>

        <h2 className="ls-h2">Ficha técnica de la lámina</h2>
        <section className="ls-ficha">
          <div className="ls-ficha-dibujo">
            <Corte mil={ficha.espesorMil} />
            <p>Ante un impacto, la lámina mantiene unidos los fragmentos del vidrio.</p>
          </div>
          <dl className="ls-specs">
            <div><dt>Marca</dt><dd>{ficha.marca || '—'}</dd></div>
            <div><dt>Producto</dt><dd>{ficha.producto || '—'}</dd></div>
            <div><dt>Espesor de la película</dt><dd>{espesor}</dd></div>
            {caracteristicas.map((x, i) => (
              <div key={i} className={x.v && x.v.length > 34 ? 'is-largo' : ''}><dt>{x.k || '—'}</dt><dd>{x.v || <span className="ls-falta">Por completar</span>}</dd></div>
            ))}
          </dl>
        </section>

        {(c.garantia || c.observaciones) && (
          <section className="ls-extra">
            {c.garantia && <div className="ls-garantia"><span className="cert-label">Garantía</span><b>{c.garantia}</b></div>}
            {c.observaciones && <div className="ls-obs"><span className="cert-label">Observaciones</span><p>{c.observaciones}</p></div>}
          </section>
        )}
      </div>

      <footer className="ls-foot">
        <p className="ls-sobre">
          {empresa.nombre.toUpperCase()} se especializa en la instalación de láminas de seguridad, control solar y privacidad,
          con un alto nivel de calidad y garantía en todos sus productos y servicios.
        </p>
        <div className="cert-qr">
          {qr ? <img src={qr} alt="" /> : <div className="cert-qr-vacio">QR</div>}
          <span>Escanea para verificar<br />la autenticidad{c.codigo ? <><br /><b>Código {c.codigo}</b></> : null}</span>
        </div>
        <div className="cert-firma">
          <img className="cert-timbre" src="/admin/timbre.png" alt="" />
          <i />
          <b>{empresa.nombre.toUpperCase()} SPA</b>
          <span>RUT {empresa.rut}</span>
        </div>
      </footer>
    </div>
  )
})

export default CertificadoSeguridad
