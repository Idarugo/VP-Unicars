import { useEffect, useRef, useState } from 'react'
import Certificado from './Certificado.jsx'

// Muestra el certificado escalado al ancho disponible.
export default function Vista({ c }) {
  const caja = useRef(null)
  const [k, setK] = useState(0.5)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width / 1050))
    ro.observe(caja.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="adm-vista" ref={caja} style={{ height: 742 * k }}>
      <div style={{ transform: `scale(${k})`, transformOrigin: '0 0', width: 1050 }}>
        <Certificado c={c} />
      </div>
    </div>
  )
}
