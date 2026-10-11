import { useEffect, useState } from 'react'
import { publicService } from '../services/publicService.js'
import { folio } from './config.js'
import { Icon, faShieldHalved, faCircleXmark } from './iconos.js'

// Página pública de verificación (la abre el QR del certificado).
// El backend devuelve solo datos no sensibles: sin nombre ni dirección del cliente y con la patente oculta.
export default function Verificar() {
  const [estado, setEstado] = useState({ cargando: true, c: null, error: '' })

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const n = p.get('n') || ''
    const codigo = (p.get('c') || '').toUpperCase()
    if (!n || !codigo) return setEstado({ cargando: false, c: null, error: '' })
    publicService.verificar(n, codigo)
      .then((r) => setEstado({ cargando: false, c: r.data, error: '' }))
      .catch((e) => setEstado({ cargando: false, c: null, error: e.message }))
  }, [])

  const { cargando, c, error } = estado
  return (
    <div className="adm-login">
      <div className="adm-login-card adm-verif">
        <img src="/admin/logo-vp.png" alt="VP Unicars" />
        {cargando ? <p className="adm-muted">Verificando certificado…</p> : c ? (
          <>
            <div className="adm-verif-ok"><Icon icon={faShieldHalved} /> Certificado válido</div>
            <dl>
              <dt>N° documento</dt><dd>{folio(c.numero)}</dd>
              <dt>Fecha de instalación</dt><dd>{c.fecha.split('-').reverse().join('/')}</dd>
              <dt>Vehículo</dt><dd>{c.marca} {c.modelo} {c.anio}</dd>
              <dt>Patente</dt><dd>{c.patente}</dd>
              <dt>Láminas (VLT)</dt><dd>Delanteros {c.delanteros}% · Traseros {c.traseros}% · Luneta {c.luneta}%</dd>
              <dt>Emitido por</dt><dd>{c.empresa?.nombre}{c.empresa?.rut ? ` · RUT ${c.empresa.rut}` : ''}</dd>
            </dl>
          </>
        ) : (
          <div className="adm-verif-no"><Icon icon={faCircleXmark} /> {error && !/encontr|incomplet/i.test(error) ? 'No pudimos verificar ahora, intenta en un momento' : 'No encontramos este certificado'}</div>
        )}
      </div>
    </div>
  )
}
