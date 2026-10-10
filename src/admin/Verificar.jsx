import { cargar } from './store.js'
import { folio, formatoPatente, empresa } from './config.js'
import { Icon, faShieldHalved, faCircleXmark } from './iconos.js'

// Página pública de verificación (la abre el QR del certificado).
// Muestra solo datos no sensibles: sin nombre ni dirección del cliente.
export default function Verificar() {
  const p = new URLSearchParams(window.location.search)
  const n = Number(p.get('n'))
  const codigo = (p.get('c') || '').toUpperCase()
  const c = cargar().find((x) => x.numero === n && x.codigo === codigo)
  const oculta = (pat) => formatoPatente(pat).replace(/\d(?=\d*$)/g, '•')

  return (
    <div className="adm-login">
      <div className="adm-login-card adm-verif">
        <img src="/admin/logo-vp.png" alt="VP Unicars" />
        {c ? (
          <>
            <div className="adm-verif-ok"><Icon icon={faShieldHalved} /> Certificado válido</div>
            <dl>
              <dt>N° documento</dt><dd>{folio(c.numero)}</dd>
              <dt>Fecha de instalación</dt><dd>{c.fecha.split('-').reverse().join('/')}</dd>
              <dt>Vehículo</dt><dd>{c.marca} {c.modelo} {c.anio}</dd>
              <dt>Patente</dt><dd>{oculta(c.patente)}</dd>
              <dt>Láminas (VLT)</dt><dd>Delanteros {c.delanteros}% · Traseros {c.traseros}% · Luneta {c.luneta}%</dd>
              <dt>Emitido por</dt><dd>{empresa.nombre} · RUT {empresa.rut}</dd>
            </dl>
          </>
        ) : (
          <div className="adm-verif-no"><Icon icon={faCircleXmark} /> No encontramos este certificado</div>
        )}
        <p className="adm-demo-note">Demo: la verificación funciona en el mismo navegador donde se emitió.</p>
      </div>
    </div>
  )
}
