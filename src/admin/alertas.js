import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './alertas.css'

// Todas las alertas del panel pasan por aquí (SweetAlert2 con los colores de VP Unicars).
const base = Swal.mixin({
  customClass: {
    popup: 'vp-swal', title: 'vp-swal-t', htmlContainer: 'vp-swal-txt',
    confirmButton: 'adm-btn', cancelButton: 'adm-btn adm-btn--ghost', denyButton: 'adm-btn adm-btn--danger',
    actions: 'vp-swal-acciones', input: 'vp-swal-input',
  },
  buttonsStyling: false,
  reverseButtons: true,
  showClass: { popup: 'vp-swal-in' },
})

const toast = Swal.mixin({
  toast: true,
  position: 'bottom',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  customClass: { popup: 'vp-swal vp-swal-toast' },
  didOpen: (t) => { t.addEventListener('mouseenter', Swal.stopTimer); t.addEventListener('mouseleave', Swal.resumeTimer) },
})

// Avisos cortos que se van solos
export const exito = (titulo) => toast.fire({ icon: 'success', title: titulo })
export const info = (titulo) => toast.fire({ icon: 'info', title: titulo })
export const error = (titulo, texto) => base.fire({ icon: 'error', title: titulo, text: texto, confirmButtonText: 'Entendido' })

// Confirmación: devuelve true/false
export async function confirmar({ titulo, texto, text, html, confirmar = 'Sí, continuar', cancelar = 'Cancelar', peligro = false, icono = 'question' }) {
  const r = await base.fire({
    icon: peligro ? 'warning' : icono, title: titulo, text: texto ?? text, html,
    showCancelButton: true, confirmButtonText: confirmar, cancelButtonText: cancelar, focusCancel: peligro,
    customClass: { ...base.params?.customClass, popup: 'vp-swal', confirmButton: peligro ? 'adm-btn adm-btn--danger' : 'adm-btn', cancelButton: 'adm-btn adm-btn--ghost', actions: 'vp-swal-acciones', title: 'vp-swal-t', htmlContainer: 'vp-swal-txt' },
  })
  return r.isConfirmed
}

// Tres opciones (ej: guardar / descartar / seguir editando)
export async function decidir({ titulo, texto, confirmar, negar, cancelar = 'Seguir aquí' }) {
  const r = await base.fire({
    icon: 'warning', title: titulo, text: texto,
    showDenyButton: true, showCancelButton: true, confirmButtonText: confirmar, denyButtonText: negar, cancelButtonText: cancelar,
  })
  return r.isConfirmed ? 'confirmar' : r.isDenied ? 'negar' : 'cancelar'
}

// Muestra un dato importante con botón para copiarlo (ej: clave temporal)
export async function mostrarDato({ titulo, html, copiar }) {
  const r = await base.fire({
    icon: 'success', title: titulo, html,
    showCancelButton: Boolean(copiar), confirmButtonText: 'Listo', cancelButtonText: 'Copiar',
    allowOutsideClick: false,
  })
  if (r.dismiss === Swal.DismissReason.cancel && copiar) {
    await navigator.clipboard?.writeText(copiar).catch(() => {})
    await exito('Copiado')
  }
}

// Pide un texto (ej: motivo)
export async function pedirTexto({ titulo, texto, placeholder, confirmar = 'Aceptar' }) {
  const r = await base.fire({
    title: titulo, text: texto, input: 'text', inputPlaceholder: placeholder,
    showCancelButton: true, confirmButtonText: confirmar, cancelButtonText: 'Cancelar',
  })
  return r.isConfirmed ? r.value : null
}

export const cargando = (titulo = 'Procesando…') =>
  base.fire({ title: titulo, allowOutsideClick: false, showConfirmButton: false, didOpen: () => Swal.showLoading() })
export const cerrar = () => Swal.close()

export const escapar = (t = '') => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
