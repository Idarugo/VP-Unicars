import { useEffect, useRef, useState } from 'react'
import Certificado from './Certificado.jsx'

// Muestra el certificado escalado al ancho disponible (autos: 1050×742; lámina de seguridad: A4 794×1123).
export default function Vista({ c, Documento = Certificado, ancho = 1050, alto = 742 }) {
  const caja = useRef(null)
  const [k, setK] = useState(0.5)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width / ancho))
    ro.observe(caja.current)
    return () => ro.disconnect()
  }, [ancho])

  return (
    <div className="adm-vista" ref={caja} style={{ height: alto * k }}>
      <div style={{ transform: `scale(${k})`, transformOrigin: '0 0', width: ancho }}>
        <Documento c={c} />
      </div>
    </div>
  )
}
