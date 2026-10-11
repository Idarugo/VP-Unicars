import { publicService } from '../services/publicService.js'
import { servicios, masServicios } from '../data.js'

// Medición propia y anónima: visitas (con su origen) y clics en botones de WhatsApp.
// No usa cookies ni guarda datos personales.

const origenVisita = () => {
  const utm = new URLSearchParams(window.location.search).get('utm_source')?.toLowerCase() || ''
  let ref = ''
  try { ref = document.referrer ? new URL(document.referrer).hostname : '' } catch { /* referrer inválido */ }
  const fuente = `${utm} ${ref}`
  if (/instagram|^ig\b/.test(fuente)) return 'Instagram'
  if (/google/.test(fuente)) return 'Google'
  if (/facebook|fb\./.test(fuente)) return 'Facebook'
  if (/whatsapp|wa\.me/.test(fuente)) return 'WhatsApp'
  if (!fuente.trim() || ref === window.location.hostname) return 'Directo'
  return 'Otro'
}

// Servicio del botón: data-servicio en el botón o en su sección; si no, se busca en el texto del mensaje
const servicioDelClic = (a) => {
  const marcado = a.closest('[data-servicio]')?.dataset.servicio
  if (marcado) return marcado
  let texto = ''
  try { texto = (new URL(a.href).searchParams.get('text') || '').toLowerCase() } catch { /* nada */ }
  const s = [...servicios, ...masServicios].find((x) => texto.includes(x.titulo.toLowerCase()))
  return s ? s.titulo : 'General'
}

export function iniciarMedicion() {
  // Una visita por sesión del navegador, no por cada recarga
  try {
    if (!sessionStorage.getItem('vp-visita')) {
      sessionStorage.setItem('vp-visita', '1')
      publicService.evento({ tipo: 'visita', origen: origenVisita() })
    }
  } catch {
    publicService.evento({ tipo: 'visita', origen: origenVisita() })
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href*="wa.me/"]')
    if (a) publicService.evento({ tipo: 'whatsapp', servicio: servicioDelClic(a) })
  }, { capture: true })
}
