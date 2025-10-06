export default function PlantAvatar({ size = 120, potColor = '#d1823a', type = 'potus' }) {
  const stemColor = ['cactus','sansevieria'].includes(type) ? '#2e7d32' : '#7c5a2f'
  // Tallo/tronco simple
  const Stem = () => (
    <g>
      {/* línea vertical desde el centro hacia las hojas */}
      <rect x="58" y="34" width="4" height="32" rx="2" fill={stemColor} />
    </g>
  )
  // Degradado para la maceta (bordes y brillo)
  const Pot = () => (
    <g transform="translate(0,8)">
      <defs>
        <linearGradient id="potShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(potColor, -10)} />
          <stop offset="100%" stopColor={shade(potColor, 10)} />
        </linearGradient>
      </defs>
      {/* Borde superior/ala de maceta */}
      <path d="M26 64 h68 c2 0 3 2 2 4 l-2 6 c-1 2-3 3-5 3 H31 c-2 0-4-1-5-3 l-2-6 c-1-2 0-4 2-4z" fill="url(#potShade)" stroke={shade(potColor, -25)} strokeWidth="2"/>
      {/* Cuerpo de maceta redondeado */}
      <path d="M32 74 h56 c2 0 3 1 3 3 v20 c0 6-5 10-11 10 H40 c-6 0-11-4-11-10 V77 c0-2 1-3 3-3z" fill="url(#potShade)" stroke={shade(potColor, -25)} strokeWidth="2"/>
      {/* Suelo */}
      <ellipse cx="60" cy="64" rx="28" ry="6" fill="#6b4f2a" opacity=".6"/>
      {/* Carita */}
      <circle cx="50" cy="92" r="3" fill="#000" />
      <circle cx="70" cy="92" r="3" fill="#000" />
      <path d="M52 98 Q60 102 68 98" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  )

  // Hojas por tipo mejor definidas
  const Leaves = () => {
    const green = '#2e9d5f'
    const greenLight = '#53c27d'
    switch (type) {
      case 'sansevieria':
        return (
          <g>
            <path d="M60 16 c6 18 6 30 0 38" stroke={green} strokeWidth="10" strokeLinecap="round"/>
            <path d="M44 22 c5 14 5 26 0 34" stroke={greenLight} strokeWidth="9" strokeLinecap="round"/>
            <path d="M76 22 c-5 14-5 26 0 34" stroke={greenLight} strokeWidth="9" strokeLinecap="round"/>
          </g>
        )
      case 'suculenta':
        return (
          <g>
            <circle cx="60" cy="48" r="16" fill={greenLight} />
            <circle cx="46" cy="52" r="12" fill={green} />
            <circle cx="74" cy="52" r="12" fill={green} />
          </g>
        )
      case 'cactus':
        return (
          <g>
            <rect x="52" y="28" width="16" height="36" rx="8" fill={green} />
            <rect x="42" y="40" width="10" height="22" rx="5" fill={greenLight} />
          </g>
        )
      case 'ficus':
        return (
          <g>
            <ellipse cx="60" cy="38" rx="24" ry="14" fill={green} />
            <ellipse cx="78" cy="50" rx="12" ry="9" fill={greenLight} />
            <ellipse cx="42" cy="50" rx="12" ry="9" fill={greenLight} />
          </g>
        )
      case 'helecho':
        return (
          <g>
            <path d="M30 50 C45 40, 75 40, 90 50" stroke={greenLight} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M36 54 C48 46, 72 46, 84 54" stroke={green} strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>
        )
      case 'monstera':
        return (
          <g>
            <path d="M44 56 Q60 30 76 56 Q60 68 44 56" fill={greenLight} />
            <rect x="58" y="36" width="4" height="16" fill={green} />
          </g>
        )
      case 'aromaticas':
        return (
          <g>
            <ellipse cx="52" cy="50" rx="10" ry="14" fill={green} />
            <ellipse cx="68" cy="48" rx="10" ry="14" fill={greenLight} />
          </g>
        )
      case 'geranio':
        return (
          <g>
            <circle cx="60" cy="42" r="10" fill="#e53e3e" />
            <circle cx="48" cy="50" r="6" fill="#f56565" />
            <circle cx="72" cy="50" r="6" fill="#f56565" />
          </g>
        )
      default: // potus
        return (
          <g>
            <ellipse cx="60" cy="42" rx="28" ry="16" fill={green} />
            <ellipse cx="40" cy="52" rx="18" ry="12" fill={greenLight} />
            <ellipse cx="80" cy="52" rx="18" ry="12" fill={greenLight} />
          </g>
        )
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }}>
      <Stem />
      <Leaves />
      <Pot />
    </svg>
  )
}

// Utilidad simple para aclarar/oscurecer colores hex
function shade(hex, percent) {
  const num = parseInt(hex.replace('#',''),16)
  let r = (num >> 16) + percent
  let g = ((num >> 8) & 0x00FF) + percent
  let b = (num & 0x0000FF) + percent
  r = Math.max(Math.min(255, r), 0)
  g = Math.max(Math.min(255, g), 0)
  b = Math.max(Math.min(255, b), 0)
  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6,'0')}`
}
