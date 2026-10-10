import { waLink } from '../data.js'
import { Icon, faWhatsapp } from '../icons.js'

export default function WhatsAppFab() {
  return (
    <a className="wa-fab" href={waLink()} target="_blank" rel="noreferrer" aria-label="Escríbenos por WhatsApp">
      <Icon icon={faWhatsapp} className="wa-fab-ico" />
      <span>¿Cotizamos?</span>
    </a>
  )
}
