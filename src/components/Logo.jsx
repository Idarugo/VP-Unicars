// Monograma VP inspirado en el logo de la marca.
export default function Logo({ className = '', draw = false }) {
  return (
    <svg className={`logo ${draw ? 'logo--draw' : ''} ${className}`} viewBox="0 0 120 72" aria-label="VP Unicars">
      <path className="logo-v" d="M2 8 H20 L32 42 L50 8 H66 L38 64 H26 Z" />
      <path className="logo-p" fillRule="evenodd" d="M70 8 H104 C115 8 120 15 117 25 L115 32 C112 42 105 46 95 46 H80 L73 64 H58 Z M84 21 L79 33 H95 C99 33 101 31 102 28 L103 25 C104 22 102 21 99 21 Z" />
    </svg>
  )
}
