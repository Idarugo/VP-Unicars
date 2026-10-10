import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { folio, formatoPatente } from './config.js'

export const nombreArchivo = (c) =>
  `Certificado VP ${folio(c.numero)} - ${formatoPatente(c.patente).replace(/·/g, '')}.pdf`

// Convierte el certificado (nodo a tamaño real) en un PDF A5 apaisado.
export async function generarPDF(nodo) {
  await document.fonts.ready
  await Promise.all([...nodo.querySelectorAll('img')].map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r }))))
  const canvas = await html2canvas(nodo, { scale: 3, backgroundColor: '#ffffff', useCORS: true, logging: false })
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [210, 148.4] })
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 148.4)
  return pdf.output('blob')
}

export function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const telefonoWa = (t = '') => {
  const d = t.replace(/\D/g, '')
  if (d.length === 9 && d.startsWith('9')) return `56${d}`
  if (d.length === 11 && d.startsWith('569')) return d
  return ''
}

// En el celular abre "Compartir" con el PDF adjunto (WhatsApp incluido).
// En el computador descarga el PDF y abre el chat del cliente para adjuntarlo.
export async function compartir(c, blob) {
  const nombre = nombreArchivo(c)
  const texto = `Hola ${c.cliente.split(' ')[0] || ''}! Te enviamos el certificado de instalación N° ${folio(c.numero)} de tu ${c.marca} ${c.modelo}. Gracias por preferir VP Unicars 🚘`
  const archivo = new File([blob], nombre, { type: 'application/pdf' })
  if (navigator.canShare?.({ files: [archivo] })) {
    try { await navigator.share({ files: [archivo], title: nombre, text: texto }); return 'compartido' } catch { return 'cancelado' }
  }
  descargar(blob, nombre)
  const tel = telefonoWa(c.telefono)
  window.open(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  return 'descargado'
}
