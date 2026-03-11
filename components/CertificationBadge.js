'use client'
/**
 * CertificationBadge — SVG seal for each certification level.
 * levels: seed | plantula | arbusto | arbol_joven | arbol | bosque
 */

const LEVELS = {
  seed: {
    en: 'Seed School',
    es: 'Escuela Semilla',
    year: 'Year 1',
    bg: '#f0fdf4',
    ring: '#4ade80',
    accent: '#16a34a',
    dark: '#14532d',
    plant: (
      <>
        {/* Seed */}
        <ellipse cx="60" cy="72" rx="12" ry="8" fill="#86efac" />
        <ellipse cx="60" cy="72" rx="8" ry="5" fill="#4ade80" />
        {/* Sprout */}
        <line x1="60" y1="64" x2="60" y2="44" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
        <path d="M60 52 Q50 44 44 46" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M60 48 Q70 40 76 42" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  plantula: {
    en: 'Seedling School',
    es: 'Escuela Plántula',
    year: 'Year 2',
    bg: '#f0fdf4',
    ring: '#22c55e',
    accent: '#15803d',
    dark: '#14532d',
    plant: (
      <>
        {/* Stem */}
        <line x1="60" y1="76" x2="60" y2="38" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
        {/* Leaves */}
        <path d="M60 60 Q46 50 42 54 Q46 62 60 60Z" fill="#4ade80" />
        <path d="M60 52 Q74 42 78 46 Q74 54 60 52Z" fill="#4ade80" />
        <path d="M60 44 Q50 36 46 40 Q50 46 60 44Z" fill="#86efac" />
        {/* Roots */}
        <path d="M60 76 Q52 82 48 86" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M60 76 Q68 82 72 86" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  arbusto: {
    en: 'Shrub School',
    es: 'Escuela Arbusto',
    year: 'Year 3',
    bg: '#f0fdf4',
    ring: '#16a34a',
    accent: '#15803d',
    dark: '#14532d',
    plant: (
      <>
        {/* Trunk */}
        <rect x="56" y="66" width="8" height="18" rx="3" fill="#92400e" />
        {/* Canopy blobs */}
        <circle cx="60" cy="56" r="20" fill="#4ade80" />
        <circle cx="44" cy="62" r="14" fill="#22c55e" />
        <circle cx="76" cy="62" r="14" fill="#22c55e" />
        <circle cx="60" cy="48" r="14" fill="#86efac" />
      </>
    ),
  },
  arbol_joven: {
    en: 'Young Tree School',
    es: 'Escuela Árbol Joven',
    year: 'Year 4',
    bg: '#f0fdf4',
    ring: '#15803d',
    accent: '#166534',
    dark: '#14532d',
    plant: (
      <>
        {/* Trunk */}
        <rect x="54" y="60" width="12" height="24" rx="4" fill="#78350f" />
        {/* Canopy */}
        <ellipse cx="60" cy="52" rx="22" ry="18" fill="#16a34a" />
        <ellipse cx="60" cy="46" rx="18" ry="14" fill="#22c55e" />
        <ellipse cx="48" cy="54" rx="12" ry="10" fill="#4ade80" opacity="0.6" />
        <ellipse cx="72" cy="54" rx="12" ry="10" fill="#4ade80" opacity="0.5" />
      </>
    ),
  },
  arbol: {
    en: 'Tree School',
    es: 'Escuela Árbol',
    year: 'Year 5',
    bg: '#f0fdf4',
    ring: '#166534',
    accent: '#14532d',
    dark: '#052e16',
    plant: (
      <>
        {/* Trunk */}
        <rect x="53" y="58" width="14" height="26" rx="4" fill="#6b2d00" />
        {/* Canopy layers */}
        <ellipse cx="60" cy="54" rx="26" ry="20" fill="#15803d" />
        <ellipse cx="60" cy="46" rx="20" ry="16" fill="#16a34a" />
        <ellipse cx="60" cy="40" rx="14" ry="11" fill="#22c55e" />
        <ellipse cx="52" cy="50" rx="10" ry="8" fill="#4ade80" opacity="0.5" />
        <ellipse cx="70" cy="50" rx="10" ry="8" fill="#4ade80" opacity="0.4" />
      </>
    ),
  },
  bosque: {
    en: 'Forest School',
    es: 'Escuela Bosque',
    year: 'Year 6+',
    bg: '#fefce8',
    ring: '#ca8a04',
    accent: '#14532d',
    dark: '#052e16',
    plant: (
      <>
        {/* Three trees */}
        {/* Left */}
        <rect x="28" y="68" width="7" height="16" rx="2" fill="#6b2d00" />
        <ellipse cx="31" cy="58" rx="13" ry="12" fill="#15803d" />
        <ellipse cx="31" cy="52" rx="9" ry="8" fill="#22c55e" />
        {/* Center (tallest) */}
        <rect x="56" y="62" width="9" height="22" rx="3" fill="#6b2d00" />
        <ellipse cx="60" cy="50" rx="18" ry="16" fill="#166534" />
        <ellipse cx="60" cy="42" rx="13" ry="11" fill="#16a34a" />
        <ellipse cx="60" cy="36" rx="9" ry="8" fill="#22c55e" />
        {/* Right */}
        <rect x="85" y="68" width="7" height="16" rx="2" fill="#6b2d00" />
        <ellipse cx="89" cy="58" rx="13" ry="12" fill="#15803d" />
        <ellipse cx="89" cy="52" rx="9" ry="8" fill="#22c55e" />
        {/* Gold star on center tree */}
        <polygon points="60,26 62,32 68,32 63,36 65,42 60,38 55,42 57,36 52,32 58,32"
          fill="#fbbf24" opacity="0.9" />
      </>
    ),
  },
}

export function CertificationBadge({ level = 'seed', schoolName, year, size = 200 }) {
  const cfg = LEVELS[level] || LEVELS.seed
  const r = 58   // outer ring radius
  const cx = 60
  const cy = 60
  const circumference = 2 * Math.PI * r

  // Arc text helper — top arc
  const topText = cfg.en.toUpperCase()
  const botText = cfg.es.toUpperCase()

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ fontFamily: 'Georgia, serif' }}
      aria-label={`${cfg.en} certification badge`}
    >
      <defs>
        <path id="topArc" d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} />
        <path id="botArc" d={`M ${cx - r},${cy} A ${r},${r} 0 0,0 ${cx + r},${cy}`} />
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000030" />
        </filter>
      </defs>

      {/* Outer glow ring */}
      <circle cx={cx} cy={cy} r={r + 4} fill={cfg.ring} opacity="0.15" />

      {/* Main circle */}
      <circle cx={cx} cy={cy} r={r} fill={cfg.bg} stroke={cfg.ring} strokeWidth="3" filter="url(#shadow)" />

      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={r - 7} fill="none" stroke={cfg.accent} strokeWidth="0.8" strokeDasharray="3,2" />

      {/* Plant illustration */}
      {cfg.plant}

      {/* Ground line */}
      <line x1="36" y1="84" x2="84" y2="84" stroke={cfg.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Top arc text (English) */}
      <text fontSize="7.5" fontWeight="bold" fill={cfg.dark} letterSpacing="1">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">{topText}</textPath>
      </text>

      {/* Bottom arc text (Spanish) */}
      <text fontSize="6.5" fill={cfg.accent} letterSpacing="0.8">
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">{botText}</textPath>
      </text>

      {/* Year pill */}
      <rect x="42" y="87" width="36" height="10" rx="5" fill={cfg.accent} />
      <text x="60" y="94.5" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle" letterSpacing="0.5">
        {year || cfg.year}
      </text>

      {/* School name (optional, small) */}
      {schoolName && (
        <text x="60" y="108" fontSize="5" fill={cfg.dark} textAnchor="middle" opacity="0.7"
          style={{ fontFamily: 'Arial, sans-serif' }}>
          {schoolName.length > 22 ? schoolName.slice(0, 20) + '…' : schoolName}
        </text>
      )}

      {/* SAF logo mark */}
      <text x="60" y="16" fontSize="5" fill={cfg.accent} textAnchor="middle" opacity="0.6"
        style={{ fontFamily: 'Arial, sans-serif' }}>
        SCHOOLS ARE FORESTS
      </text>
    </svg>
  )
}

export const CERTIFICATION_LEVELS = LEVELS
