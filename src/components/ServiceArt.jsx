import { Icon, faShieldHalved, faSun, faLock, faLightbulb, faFillDrip, faBuilding, faWandMagicSparkles } from '../icons.js'

// Ícono grande por servicio (se usa cuando el servicio no tiene foto).
const iconos = {
  shield: faShieldHalved, tint: faSun, lock: faLock, light: faLightbulb,
  wrap: faFillDrip, building: faBuilding, stars: faWandMagicSparkles,
}

export default function ServiceArt({ art }) {
  return <Icon icon={iconos[art]} className="service-art" />
}
