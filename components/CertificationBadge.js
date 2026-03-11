'use client'

// ── Colors ────────────────────────────────────────────────────────────────────
const C      = '#4a5828'   // dark olive — main stroke/text
const CL     = '#7a8c50'   // medium olive
const LF     = '#c8d4a0'   // light leaf fill
const LFD    = '#4a5828'   // dark leaf fill
const BK     = '#d0cdb0'   // book/window fill
const GD     = '#8B6914'   // gold dark
const GM     = '#B8860B'   // gold mid
const GL     = '#DAA520'   // gold light
const GB     = '#f0c030'   // gold bright
const GBG    = '#c9a020'   // gold bg stroke

// ── Shared atoms ──────────────────────────────────────────────────────────────

// Pointed oval leaf with central vein + 2 pairs of side veins
function LeafV({ x, y, rx = 8, ry = 16, angle = 0, fill = LF, stroke = C, sw = 1.2 }) {
  const p = `M 0,${-ry} C ${rx},${-ry*0.45} ${rx},${ry*0.45} 0,${ry} C ${-rx},${ry*0.45} ${-rx},${-ry*0.45} 0,${-ry} Z`
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <path d={p} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <line x1="0" y1={-ry+2} x2="0" y2={ry-3} stroke={stroke} strokeWidth={sw*0.55}/>
      <line x1="0" y1={-ry*0.25} x2={-rx*0.7} y2={-ry*0.55} stroke={stroke} strokeWidth={sw*0.45}/>
      <line x1="0" y1={-ry*0.25} x2={ rx*0.7} y2={-ry*0.55} stroke={stroke} strokeWidth={sw*0.45}/>
      <line x1="0" y1={ ry*0.15} x2={-rx*0.75} y2={-ry*0.1} stroke={stroke} strokeWidth={sw*0.45}/>
      <line x1="0" y1={ ry*0.15} x2={ rx*0.75} y2={-ry*0.1} stroke={stroke} strokeWidth={sw*0.45}/>
    </g>
  )
}

// Small simple oval leaf for dense canopies
function Oval({ x, y, rx = 5, ry = 8, angle = 0, fill = LF, stroke = C, sw = 0.9 }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} transform={`rotate(${angle},${x},${y})`}/>
}

// ── House + roots (shared base) ───────────────────────────────────────────────
function HouseRoots({ c = C, bookFill = BK, big = false }) {
  const w = big ? 2.5 : 2
  const w2 = big ? 2 : 1.5
  const w3 = big ? 1.8 : 1.2
  return (
    <>
      {/* Ground */}
      <path d={`M 46,138 Q 100,${big?131:134} 154,138`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* House */}
      <path d="M 88,140 L 88,124 L 100,114 L 112,124 L 112,140 Z"
        fill="white" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Book inside */}
      <rect x="93" y="126" width="14" height="12" rx="1" fill={bookFill} stroke={c} strokeWidth="1"/>
      <line x1="100" y1="126" x2="100" y2="138" stroke={c} strokeWidth="0.8"/>
      <line x1="93"  y1="130" x2="100" y2="130" stroke={c} strokeWidth="0.6"/>
      <line x1="93"  y1="133" x2="100" y2="133" stroke={c} strokeWidth="0.6"/>
      <line x1="100" y1="130" x2="107" y2="130" stroke={c} strokeWidth="0.6"/>
      <line x1="100" y1="133" x2="107" y2="133" stroke={c} strokeWidth="0.6"/>

      {/* Roots — left */}
      <path d="M 92,140 C 77,142 62,140 48,144"   stroke={c} strokeWidth={w}  fill="none" strokeLinecap="round"/>
      <path d="M 68,141 C 57,149 46,155 34,159"   stroke={c} strokeWidth={w2} fill="none" strokeLinecap="round"/>
      <path d="M 54,143 C 44,151 35,158 24,162"   stroke={c} strokeWidth={w3} fill="none" strokeLinecap="round"/>
      <path d="M 42,145 C 34,153 27,159 18,163"   stroke={c} strokeWidth={big?1.5:1} fill="none" strokeLinecap="round"/>
      {big && <path d="M 58,144 C 48,153 40,161 30,166"  stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
      {big && <path d="M 30,161 C 24,166 18,170 12,173"  stroke={c} strokeWidth="1"   fill="none" strokeLinecap="round"/>}

      {/* Roots — right (mirror) */}
      <path d="M 108,140 C 123,142 138,140 152,144"  stroke={c} strokeWidth={w}  fill="none" strokeLinecap="round"/>
      <path d="M 132,141 C 143,149 154,155 166,159"  stroke={c} strokeWidth={w2} fill="none" strokeLinecap="round"/>
      <path d="M 146,143 C 156,151 165,158 176,162"  stroke={c} strokeWidth={w3} fill="none" strokeLinecap="round"/>
      <path d="M 158,145 C 166,153 173,159 182,163"  stroke={c} strokeWidth={big?1.5:1} fill="none" strokeLinecap="round"/>
      {big && <path d="M 142,144 C 152,153 160,161 170,166" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
      {big && <path d="M 170,161 C 176,166 182,170 188,173" stroke={c} strokeWidth="1"   fill="none" strokeLinecap="round"/>}
    </>
  )
}

// ── Plant illustrations per level ─────────────────────────────────────────────

function PlantSeedling() {
  return (
    <>
      <line x1="100" y1="87" x2="100" y2="114" stroke={C} strokeWidth="2.5" strokeLinecap="round"/>
      <LeafV x={84} y={68} rx={9}  ry={18} angle={-38} fill={LF} stroke={C}/>
      <LeafV x={116} y={68} rx={9} ry={18} angle={ 38} fill={LF} stroke={C}/>
    </>
  )
}

function PlantSapling() {
  return (
    <>
      <line x1="100" y1="70" x2="100" y2="114" stroke={C} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Lower side leaves */}
      <LeafV x={82}  y={97}  rx={7}  ry={13} angle={-62} fill={LF}  stroke={C} sw={1.1}/>
      <LeafV x={118} y={97}  rx={7}  ry={13} angle={ 62} fill={LF}  stroke={C} sw={1.1}/>
      {/* Upper side leaves */}
      <LeafV x={83}  y={76}  rx={8}  ry={16} angle={-38} fill={LFD} stroke={C} sw={1.2}/>
      <LeafV x={117} y={76}  rx={8}  ry={16} angle={ 38} fill={LFD} stroke={C} sw={1.2}/>
      {/* Top leaf */}
      <LeafV x={100} y={55}  rx={8}  ry={17} angle={0}   fill={LFD} stroke={C} sw={1.3}/>
    </>
  )
}

function PlantYoungTree() {
  return (
    <>
      {/* Trunk */}
      <path d="M 96,114 C 95,95 94,80 96,62" stroke={C} strokeWidth="3"   fill="none" strokeLinecap="round"/>
      <path d="M 104,114 C 105,95 106,80 104,62" stroke={C} strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Main left branch */}
      <path d="M 97,72 C 88,62 76,52 62,44"  stroke={C} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* Main right branch */}
      <path d="M 103,72 C 112,62 124,52 138,44" stroke={C} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* Sub left */}
      <path d="M 76,57 C 68,48 58,42 48,38"   stroke={C} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M 66,50 C 60,42 54,36 48,30"   stroke={C} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Sub right */}
      <path d="M 124,57 C 132,48 142,42 152,38"  stroke={C} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M 134,50 C 140,42 146,36 152,30"  stroke={C} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Top branch */}
      <path d="M 100,64 C 100,56 100,48 100,38" stroke={C} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Leaf clusters */}
      <Oval x={62}  y={40} rx={7} ry={10} angle={-30} fill={LF}  stroke={C}/>
      <Oval x={52}  y={32} rx={6} ry={9}  angle={-20} fill={LFD} stroke={C}/>
      <Oval x={74}  y={34} rx={6} ry={9}  angle={-40} fill={LF}  stroke={C}/>
      <Oval x={100} y={32} rx={6} ry={9}  angle={0}   fill={LFD} stroke={C}/>
      <Oval x={90}  y={24} rx={5} ry={8}  angle={-10} fill={LF}  stroke={C}/>
      <Oval x={110} y={24} rx={5} ry={8}  angle={ 10} fill={LF}  stroke={C}/>
      <Oval x={138} y={40} rx={7} ry={10} angle={ 30} fill={LF}  stroke={C}/>
      <Oval x={148} y={32} rx={6} ry={9}  angle={ 20} fill={LFD} stroke={C}/>
      <Oval x={126} y={34} rx={6} ry={9}  angle={ 40} fill={LF}  stroke={C}/>
    </>
  )
}

function PlantMatureTree({ c = C, lf = LF, lfd = LFD }) {
  return (
    <>
      {/* Wide trunk */}
      <path d="M 92,114 C 90,95 88,78 86,62 C 84,50 80,40 76,32" stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M 108,114 C 110,95 112,78 114,62 C 116,50 120,40 124,32" stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Center top branch */}
      <path d="M 100,62 C 100,52 100,40 100,28" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Left main branch */}
      <path d="M 88,70 C 78,60 64,50 50,42" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 68,55 C 58,44 46,38 34,34" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M 56,47 C 46,38 36,30 26,26" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M 42,38 C 36,30 30,22 26,16" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M 62,44 C 54,34 48,24 44,16" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M 76,34 C 70,24 66,16 62,10" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Right main branch */}
      <path d="M 112,70 C 122,60 136,50 150,42" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 132,55 C 142,44 154,38 166,34" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M 144,47 C 154,38 164,30 174,26" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M 158,38 C 164,30 170,22 174,16" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M 138,44 C 146,34 152,24 156,16" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M 124,34 C 130,24 134,16 138,10" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Top sub-branches */}
      <path d="M 100,40 C 90,32 82,24 76,16"  stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 100,40 C 110,32 118,24 124,16" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Left canopy leaves */}
      <Oval x={28}  y={24} rx={6} ry={9}  angle={-20} fill={lfd} stroke={c} sw={0.9}/>
      <Oval x={36}  y={16} rx={5} ry={8}  angle={-10} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={42}  y={30} rx={6} ry={9}  angle={-35} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={22}  y={32} rx={5} ry={8}  angle={-15} fill={lfd} stroke={c} sw={0.8}/>
      <Oval x={50}  y={22} rx={6} ry={9}  angle={-25} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={56}  y={14} rx={5} ry={8}  angle={-5}  fill={lfd} stroke={c} sw={0.9}/>
      <Oval x={64}  y={24} rx={6} ry={9}  angle={-30} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={72}  y={14} rx={5} ry={8}  angle={-15} fill={lfd} stroke={c} sw={0.9}/>
      <Oval x={76}  y={28} rx={6} ry={9}  angle={-40} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={36}  y={36} rx={6} ry={9}  angle={-20} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={48}  y={34} rx={6} ry={9}  angle={-30} fill={lfd} stroke={c} sw={0.9}/>
      {/* Center top leaves */}
      <Oval x={88}  y={14} rx={6} ry={9}  angle={-10} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={100} y={10} rx={6} ry={9}  angle={0}   fill={lfd} stroke={c} sw={0.9}/>
      <Oval x={112} y={14} rx={6} ry={9}  angle={ 10} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={80}  y={22} rx={5} ry={8}  angle={-15} fill={lfd} stroke={c} sw={0.8}/>
      <Oval x={120} y={22} rx={5} ry={8}  angle={ 15} fill={lfd} stroke={c} sw={0.8}/>
      {/* Right canopy leaves (mirror) */}
      <Oval x={172} y={24} rx={6} ry={9}  angle={ 20} fill={lfd} stroke={c} sw={0.9}/>
      <Oval x={164} y={16} rx={5} ry={8}  angle={ 10} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={158} y={30} rx={6} ry={9}  angle={ 35} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={178} y={32} rx={5} ry={8}  angle={ 15} fill={lfd} stroke={c} sw={0.8}/>
      <Oval x={150} y={22} rx={6} ry={9}  angle={ 25} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={144} y={14} rx={5} ry={8}  angle={  5} fill={lfd} stroke={c} sw={0.9}/>
      <Oval x={136} y={24} rx={6} ry={9}  angle={ 30} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={128} y={14} rx={5} ry={8}  angle={ 15} fill={lfd} stroke={c} sw={0.9}/>
      <Oval x={124} y={28} rx={6} ry={9}  angle={ 40} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={164} y={36} rx={6} ry={9}  angle={ 20} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={152} y={34} rx={6} ry={9}  angle={ 30} fill={lfd} stroke={c} sw={0.9}/>
      {/* Mid canopy fill */}
      <Oval x={64}  y={36} rx={6} ry={9}  angle={-20} fill={lfd} stroke={c} sw={0.9}/>
      <Oval x={88}  y={26} rx={6} ry={9}  angle={-10} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={112} y={26} rx={6} ry={9}  angle={ 10} fill={lf}  stroke={c} sw={0.9}/>
      <Oval x={136} y={36} rx={6} ry={9}  angle={ 20} fill={lfd} stroke={c} sw={0.9}/>
    </>
  )
}

function PlantForest() {
  // Same as Mature Tree but gold tones + fruits
  return (
    <>
      <PlantMatureTree c={GD} lf={GM} lfd={GL}/>
      {/* Fruits (apples) */}
      <circle cx={52}  cy={38} r={6} fill={GD} stroke={GBG} strokeWidth="1"/>
      <circle cx={148} cy={38} r={6} fill={GD} stroke={GBG} strokeWidth="1"/>
      <circle cx={78}  cy={26} r={5} fill={GD} stroke={GBG} strokeWidth="1"/>
      <circle cx={122} cy={26} r={5} fill={GD} stroke={GBG} strokeWidth="1"/>
      <circle cx={100} cy={20} r={5} fill={GD} stroke={GBG} strokeWidth="1"/>
      {/* Glow dots */}
      <circle cx={52}  cy={38} r={2.5} fill={GB} opacity="0.9"/>
      <circle cx={148} cy={38} r={2.5} fill={GB} opacity="0.9"/>
      <circle cx={78}  cy={26} r={2}   fill={GB} opacity="0.9"/>
      <circle cx={122} cy={26} r={2}   fill={GB} opacity="0.9"/>
      <circle cx={100} cy={20} r={2}   fill={GB} opacity="0.9"/>
      <circle cx={36}  cy={32} r={2}   fill={GB} opacity="0.7"/>
      <circle cx={164} cy={32} r={2}   fill={GB} opacity="0.7"/>
    </>
  )
}

// ── Badge shell ───────────────────────────────────────────────────────────────

const LEVELS = {
  seedling:    { label: 'LEVEL 1: SEEDLING',    plant: <PlantSeedling/>,  house: { c: C,  bookFill: BK,  big: false }, bg: 'white', ringFill: 'white', ringStroke: C,  textFill: C,  innerStroke: C  },
  sapling:     { label: 'LEVEL 2: SAPLING',     plant: <PlantSapling/>,   house: { c: C,  bookFill: BK,  big: false }, bg: 'white', ringFill: 'white', ringStroke: C,  textFill: C,  innerStroke: C  },
  young_tree:  { label: 'LEVEL 3: YOUNG TREE',  plant: <PlantYoungTree/>, house: { c: C,  bookFill: BK,  big: false }, bg: 'white', ringFill: 'white', ringStroke: C,  textFill: C,  innerStroke: C  },
  mature_tree: { label: 'LEVEL 4: MATURE TREE', plant: <PlantMatureTree/>,house: { c: C,  bookFill: BK,  big: true  }, bg: 'white', ringFill: 'white', ringStroke: C,  textFill: C,  innerStroke: C  },
  forest:      { label: 'LEVEL 5: SCHOOL FORESTS', plant: <PlantForest/>,  house: { c: GD, bookFill: GM,  big: true  }, bg: GL,     ringFill: GL,      ringStroke: GD, textFill: GD, innerStroke: GD },
}

export function CertificationBadge({ level = 'seedling', schoolName, size = 200 }) {
  const cfg = LEVELS[level] || LEVELS.seedling
  const isGold = level === 'forest'

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ fontFamily: 'Arial, sans-serif' }}>
      <defs>
        <path id={`topArc-${level}`} d="M 12,100 A 88,88 0 0,1 188,100"/>
        <path id={`botArc-${level}`} d="M 22,100 A 78,78 0 0,0 178,100"/>
        {isGold && (
          <radialGradient id="goldGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#f5e060"/>
            <stop offset="60%"  stopColor="#c9a020"/>
            <stop offset="100%" stopColor="#8B6914"/>
          </radialGradient>
        )}
      </defs>

      {/* Background */}
      <circle cx="100" cy="100" r="97" fill={isGold ? 'url(#goldGrad)' : 'white'}/>

      {/* Outer ring */}
      <circle cx="100" cy="100" r="93" fill="none" stroke={cfg.ringStroke} strokeWidth="2.5"/>
      {/* Inner ring */}
      <circle cx="100" cy="100" r="80" fill="none" stroke={cfg.innerStroke} strokeWidth="1.2"/>

      {/* Top arc text */}
      <text fontSize="10.5" fontWeight="bold" fill={cfg.textFill} letterSpacing="1.8">
        <textPath href={`#topArc-${level}`} startOffset="50%" textAnchor="middle">
          SCHOOLS ARE FORESTS CERTIFIED
        </textPath>
      </text>

      {/* Bottom arc text */}
      <text fontSize="9.5" fontWeight="bold" fill={cfg.textFill} letterSpacing="1.5">
        <textPath href={`#botArc-${level}`} startOffset="50%" textAnchor="middle">
          {cfg.label}
        </textPath>
      </text>

      {/* Tick marks flanking bottom text */}
      <line x1="22" y1="100" x2="28" y2="100" stroke={cfg.ringStroke} strokeWidth="2" strokeLinecap="round"/>
      <line x1="172" y1="100" x2="178" y2="100" stroke={cfg.ringStroke} strokeWidth="2" strokeLinecap="round"/>

      {/* Plant illustration */}
      {cfg.plant}

      {/* House + roots */}
      <HouseRoots c={cfg.house.c} bookFill={cfg.house.bookFill} big={cfg.house.big}/>

      {/* School name */}
      {schoolName && (
        <text x="100" y="155" fontSize="5.5" fill={cfg.textFill} textAnchor="middle" opacity="0.6">
          {schoolName.length > 24 ? schoolName.slice(0, 22) + '…' : schoolName}
        </text>
      )}
    </svg>
  )
}

export const CERTIFICATION_LEVELS = Object.keys(LEVELS)
