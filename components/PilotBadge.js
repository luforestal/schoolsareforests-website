'use client'

// ── Pilot Badge Colors (warm walnut / bronze) ──────────────────────────────
const PD = '#3D2205'   // dark walnut — strokes, text
const PM = '#7A4818'   // medium brown — fills
const PL = '#B8722A'   // light warm brown
const PA = '#D4A060'   // pale amber accent
const PH = '#EDD4A0'   // highlight / lightest

// ── Star with P ────────────────────────────────────────────────────────────
function PilotStar() {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 14 : 6
    const a = (i * 36 - 90) * Math.PI / 180
    return `${100 + r * Math.cos(a)},${36 + r * Math.sin(a)}`
  }).join(' ')
  return (
    <g>
      <polygon points={pts} fill={PM} stroke={PD} strokeWidth="1.5"/>
      <text x="100" y="33" textAnchor="middle" fontSize="9" fontWeight="bold" fill={PH}>P</text>
      <text x="100" y="41" textAnchor="middle" fontSize="4.8" fontWeight="bold" fill={PH} letterSpacing="0.8">PILOT</text>
    </g>
  )
}

// ── Leaf ───────────────────────────────────────────────────────────────────
function PLeaf({ x, y, rx = 6, ry = 11, angle = 0 }) {
  return (
    <ellipse cx={x} cy={y} rx={rx} ry={ry}
      fill={PL} stroke={PD} strokeWidth="0.9"
      transform={`rotate(${angle},${x},${y})`}
    />
  )
}

// ── Open book ──────────────────────────────────────────────────────────────
function PBook({ x, y, s = 7 }) {
  return (
    <g>
      <rect x={x - s} y={y - s * 0.7} width={s} height={s * 1.4} rx="1" fill={PA} stroke={PD} strokeWidth="0.8"/>
      <rect x={x}     y={y - s * 0.7} width={s} height={s * 1.4} rx="1" fill={PA} stroke={PD} strokeWidth="0.8"/>
      <line x1={x} y1={y - s * 0.7} x2={x} y2={y + s * 0.7} stroke={PD} strokeWidth="0.9"/>
    </g>
  )
}

// ── Compass ─────────────────────────────────────────────────────────────────
function PCompass({ x, y, r = 6 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={PD} strokeWidth="1"/>
      <line x1={x} y1={y - r * 0.8} x2={x} y2={y + r * 0.8} stroke={PD} strokeWidth="0.6"/>
      <line x1={x - r * 0.8} y1={y} x2={x + r * 0.8} y2={y} stroke={PD} strokeWidth="0.6"/>
      <polygon points={`${x},${y - r * 0.8} ${x - 2},${y} ${x + 2},${y}`} fill={PD}/>
      <polygon points={`${x},${y + r * 0.8} ${x - 2},${y} ${x + 2},${y}`} fill={PA}/>
      <circle cx={x} cy={y} r="1.6" fill={PA} stroke={PD} strokeWidth="0.6"/>
    </g>
  )
}

// ── Tree with hands ────────────────────────────────────────────────────────
function PilotTreeWithHands() {
  return (
    <>
      {/* Subtle map grid */}
      {[72, 84, 96, 108, 120, 132].map(yy => (
        <line key={`h${yy}`} x1="40" y1={yy} x2="160" y2={yy} stroke={PM} strokeWidth="0.4" opacity="0.18"/>
      ))}
      {[52, 68, 84, 100, 116, 132, 148].map(xx => (
        <line key={`v${xx}`} x1={xx} y1="60" x2={xx} y2="148" stroke={PM} strokeWidth="0.4" opacity="0.18"/>
      ))}

      {/* Compass rose */}
      <g opacity="0.45">
        <line x1="100" y1="145" x2="100" y2="160" stroke={PD} strokeWidth="0.9"/>
        <line x1="92"  y1="152" x2="108" y2="152" stroke={PD} strokeWidth="0.9"/>
        <polygon points="100,145 97.5,152 102.5,152" fill={PD}/>
        <polygon points="100,160 97.5,153 102.5,153" fill={PM}/>
        <polygon points="92,152 99,149.5 99,154.5"   fill={PM}/>
        <polygon points="108,152 101,149.5 101,154.5" fill={PD}/>
        <circle cx="100" cy="152" r="2.2" fill={PA} stroke={PD} strokeWidth="0.7"/>
      </g>

      {/* Left hand — upturned palm */}
      <path d="M 65,157 C 58,147 55,133 60,121 C 63,113 68,107 71,103 C 73,100 77,100 78,103 L 77,93 C 76,88 80,87 83,90 L 84,104 C 86,98 89,96 91,99 L 91,114 C 91,122 91,132 91,142 L 91,157 Z"
        fill={PL} stroke={PD} strokeWidth="1.2"/>
      {/* Left palm crease */}
      <path d="M 70,140 C 74,130 78,122 82,118" stroke={PM} strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* Right hand — mirror */}
      <path d="M 135,157 C 142,147 145,133 140,121 C 137,113 132,107 129,103 C 127,100 123,100 122,103 L 123,93 C 124,88 120,87 117,90 L 116,104 C 114,98 111,96 109,99 L 109,114 C 109,122 109,132 109,142 L 109,157 Z"
        fill={PL} stroke={PD} strokeWidth="1.2"/>
      {/* Right palm crease */}
      <path d="M 130,140 C 126,130 122,122 118,118" stroke={PM} strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* Trunk (filled shape between two curves) */}
      <path d="M 93,134 C 91,117 88,98 86,80 C 84,65 84,53 88,47 C 93,51 107,51 112,47 C 116,53 116,65 114,80 C 112,98 109,117 107,134 Z"
        fill={PM} stroke={PD} strokeWidth="1.2"/>
      {/* Trunk highlight */}
      <path d="M 97,130 C 96,115 94,98 93,82 C 92,68 92,56 95,50"
        stroke={PL} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.4"/>

      {/* Left branches */}
      <path d="M 90,104 C 78,92 63,79 48,70"  stroke={PD} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M 88,86  C 74,74 58,63 42,55"  stroke={PD} strokeWidth="2"   fill="none" strokeLinecap="round"/>
      <path d="M 87,70  C 74,59 59,49 44,41"  stroke={PD} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Right branches */}
      <path d="M 110,104 C 122,92 137,79 152,70" stroke={PD} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M 112,86  C 126,74 142,63 158,55" stroke={PD} strokeWidth="2"   fill="none" strokeLinecap="round"/>
      <path d="M 113,70  C 126,59 141,49 156,41" stroke={PD} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Top sub-branches */}
      <path d="M 100,63 C 96,52 92,42 90,33" stroke={PD} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M 100,63 C 104,52 108,42 110,33" stroke={PD} strokeWidth="1.6" fill="none" strokeLinecap="round"/>

      {/* Leaves — left */}
      <PLeaf x={50}  y={66} rx={6} ry={10} angle={-30}/>
      <PLeaf x={40}  y={58} rx={5} ry={9}  angle={-20}/>
      <PLeaf x={62}  y={74} rx={5} ry={9}  angle={-45}/>
      <PLeaf x={44}  y={50} rx={5} ry={8}  angle={-28}/>
      <PLeaf x={56}  y={44} rx={5} ry={8}  angle={-38}/>
      <PLeaf x={36}  y={66} rx={4} ry={7}  angle={-15}/>
      <PLeaf x={48}  y={36} rx={4} ry={7}  angle={-25}/>

      {/* Leaves — right */}
      <PLeaf x={150} y={66} rx={6} ry={10} angle={ 30}/>
      <PLeaf x={160} y={58} rx={5} ry={9}  angle={ 20}/>
      <PLeaf x={138} y={74} rx={5} ry={9}  angle={ 45}/>
      <PLeaf x={156} y={50} rx={5} ry={8}  angle={ 28}/>
      <PLeaf x={144} y={44} rx={5} ry={8}  angle={ 38}/>
      <PLeaf x={164} y={66} rx={4} ry={7}  angle={ 15}/>
      <PLeaf x={152} y={36} rx={4} ry={7}  angle={ 25}/>

      {/* Leaves — center top (behind star) */}
      <PLeaf x={90}  y={32} rx={4} ry={8} angle={-12}/>
      <PLeaf x={110} y={32} rx={4} ry={8} angle={ 12}/>

      {/* Books on branches */}
      <PBook x={46} y={62} s={7}/>
      <PBook x={66} y={80} s={6}/>
      <PBook x={154} y={62} s={7}/>
      <PBook x={134} y={80} s={6}/>

      {/* Compasses */}
      <PCompass x={50} y={50} r={6}/>
      <PCompass x={100} y={77} r={5}/>
      <PCompass x={150} y={50} r={6}/>

      {/* Sparkle / glow dots */}
      {[[50,66],[68,76],[88,87],[100,75],[112,87],[132,76],[150,66],[46,48],[154,48],[86,95],[114,95]].map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r="2" fill={PA} opacity="0.65"/>
      ))}
    </>
  )
}

// ── Public badge component ─────────────────────────────────────────────────
export function PilotBadge({ schoolName, size = 200 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ fontFamily: 'Arial, sans-serif' }}>
      <defs>
        <path id="pilotTopArc" d="M 12,100 A 88,88 0 0,1 188,100"/>
        <path id="pilotBotArc" d="M 22,100 A 78,78 0 0,0 178,100"/>
        <radialGradient id="pilotGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#EDD4A0"/>
          <stop offset="45%"  stopColor="#B8722A"/>
          <stop offset="100%" stopColor="#3D2205"/>
        </radialGradient>
      </defs>

      {/* Background */}
      <circle cx="100" cy="100" r="97" fill="url(#pilotGrad)"/>

      {/* Rings */}
      <circle cx="100" cy="100" r="93" fill="none" stroke={PD} strokeWidth="2.5"/>
      <circle cx="100" cy="100" r="80" fill="none" stroke={PD} strokeWidth="1.2"/>

      {/* Top arc text */}
      <text fontSize="10.5" fontWeight="bold" fill={PD} letterSpacing="1.8">
        <textPath href="#pilotTopArc" startOffset="50%" textAnchor="middle">
          PILOT SCHOOL CERTIFIED
        </textPath>
      </text>

      {/* Bottom arc text */}
      <text fontSize="7.5" fontWeight="bold" fill={PD} letterSpacing="1">
        <textPath href="#pilotBotArc" startOffset="50%" textAnchor="middle">
          FOUNDING MEMBER &amp; TRAILBLAZER
        </textPath>
      </text>

      {/* Tick marks */}
      <line x1="22"  y1="100" x2="28"  y2="100" stroke={PD} strokeWidth="2" strokeLinecap="round"/>
      <line x1="172" y1="100" x2="178" y2="100" stroke={PD} strokeWidth="2" strokeLinecap="round"/>

      {/* Illustration */}
      <PilotTreeWithHands/>

      {/* Star on top */}
      <PilotStar/>

      {/* School name */}
      {schoolName && (
        <text x="100" y="172" fontSize="5.5" fill={PD} textAnchor="middle" opacity="0.8">
          {schoolName.length > 24 ? schoolName.slice(0, 22) + '…' : schoolName}
        </text>
      )}
    </svg>
  )
}
