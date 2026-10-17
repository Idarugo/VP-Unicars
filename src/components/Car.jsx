import { forwardRef } from 'react'

// Silueta deportiva estilizada. Las partes con clase se animan desde afuera con GSAP.
const Car = forwardRef(function Car({ id = 'car', className = '' }, ref) {
  return (
    <svg ref={ref} className={`car ${className}`} viewBox="0 0 1000 380" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a2e" />
          <stop offset=".45" stopColor="#141416" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--wrap-a, #FFE600)', transition: 'stop-color .8s' }} />
          <stop offset="1" style={{ stopColor: 'var(--wrap-b, #ff8a00)', transition: 'stop-color .8s' }} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bcd7ff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#7aa0d0" stopOpacity=".25" />
          <stop offset="1" stopColor="#dbe9ff" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-beam`} cx="0" cy=".5" r="1">
          <stop offset="0" stopColor="#fff6c8" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-film`} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <rect width="26" height="26" fill="#a8ecff" opacity=".07" />
          <rect width="2" height="26" fill="#d6f8ff" opacity=".12" />
        </pattern>
        <clipPath id={`${id}-bodyclip`}>
          <path d="M60,282 C60,252 82,236 122,229 L262,210 C305,168 365,128 452,121 L604,119 C684,121 744,160 792,204 L882,217 C922,223 946,240 949,265 L951,290 C951,300 943,306 931,306 L861,306 A71 71 0 0 0 719 306 L301,306 A71 71 0 0 0 159 306 L80,306 C66,306 60,299 60,287 Z" />
        </clipPath>
      </defs>

      <ellipse className="car-shadow" cx="505" cy="350" rx="430" ry="18" fill="#000" opacity=".7" />
      <path className="car-beam" d="M946,250 L1000,190 L1000,330 Z" fill={`url(#${id}-beam)`} opacity="0" />

      <g clipPath={`url(#${id}-bodyclip)`}>
        <rect x="0" y="0" width="1000" height="380" fill={`url(#${id}-body)`} />
        <rect className="car-wrap" x="0" y="0" width="1000" height="380" fill={`url(#${id}-paint)`} opacity="0" />
        <g className="car-ppf">
          <rect x="-1000" y="0" width="1000" height="380" fill={`url(#${id}-film)`} />
          <rect x="-1000" y="0" width="3" height="380" fill="#c9f6ff" opacity=".9" />
        </g>
        <rect className="car-shine" x="-300" y="0" width="200" height="380" fill={`url(#${id}-shine)`} opacity=".35" transform="skewX(-20)" />
      </g>

      {/* Ventanas */}
      <path className="car-glass" d="M288,211 C328,174 378,144 452,137 L520,136 L520,211 Z" fill={`url(#${id}-glass)`} />
      <path className="car-glass" d="M536,136 L602,136 C662,139 712,169 762,209 L536,211 Z" fill={`url(#${id}-glass)`} />
      <path className="car-tint" d="M288,211 C328,174 378,144 452,137 L520,136 L520,211 Z" fill="#020203" opacity="0" />
      <path className="car-tint" d="M536,136 L602,136 C662,139 712,169 762,209 L536,211 Z" fill="#020203" opacity="0" />

      {/* Líneas */}
      <path d="M262,212 L800,210" stroke="#3a3a40" strokeWidth="2" fill="none" />
      <path d="M528,136 L528,300" stroke="#2c2c30" strokeWidth="2" />
      <path d="M150,252 C380,240 640,238 930,246" stroke="#4a4a52" strokeWidth="1.5" fill="none" opacity=".7" />
      <path className="car-chrome" d="M290,214 L760,212" stroke="#d9d9de" strokeWidth="3" strokeLinecap="round" />

      {/* Ópticas */}
      <path className="car-headlight" d="M900,232 L944,240 L946,256 L905,252 Z" fill="#fff4b0" />
      <path className="car-taillight" d="M64,250 L96,244 L98,262 L64,266 Z" fill="#ff2d3d" />

      {/* Ruedas */}
      {[230, 790].map((cx) => (
        <g key={cx} className="car-wheel" style={{ transformOrigin: `${cx}px 306px` }}>
          <circle cx={cx} cy="306" r="60" fill="#0a0a0b" />
          <circle cx={cx} cy="306" r="44" fill="#1b1b1e" stroke="#6b6b73" strokeWidth="2" />
          {[0, 72, 144, 216, 288].map((a) => (
            <rect key={a} x={cx - 4} y="266" width="8" height="40" rx="3" fill="#8a8a94" transform={`rotate(${a} ${cx} 306)`} />
          ))}
          <circle cx={cx} cy="306" r="10" fill="#FFE600" />
        </g>
      ))}
    </svg>
  )
})

export default Car
