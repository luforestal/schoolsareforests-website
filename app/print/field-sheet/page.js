'use client'
import Image from 'next/image'

const TREES_PER_SHEET = 8

export default function FieldSheetPage() {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .page { box-shadow: none !important; margin: 0 !important; padding: 20px !important; min-height: 0 !important; }
          .page-break { page-break-before: always; }
          @page { margin: 1.2cm; size: A4; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .page { animation: fadeIn 0.3s ease; }
      `}</style>

      {/* Screen-only print button */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Schools Are Forests" width={32} height={32} className="rounded" />
          <span className="font-semibold text-gray-800 text-sm">Printable Field Sheet</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Tip: Use "Save as PDF" in your browser print dialog</span>
          <button
            onClick={() => window.print()}
            className="bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-green-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* PAGE 1 — Tree measurement table */}
      <div className="page bg-white max-w-[860px] mx-auto mt-20 mb-8 no-print:shadow-xl rounded-lg p-10" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-5 border-b-2 border-green-700">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="" width={52} height={52} className="rounded-lg" />
            <div>
              <div className="text-green-800 font-black text-xl leading-tight">Schools Are Forests</div>
              <div className="text-green-600 text-xs tracking-widest uppercase mt-0.5">schoolsareforests.org</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-700 font-bold text-lg">Tree Inventory</div>
            <div className="text-gray-400 text-xs uppercase tracking-wide">Field Data Sheet</div>
          </div>
        </div>

        {/* Session info */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-3 mb-7">
          {[
            { label: 'School', wide: true },
            { label: 'Date' },
            { label: 'Session code', note: '6 characters' },
            { label: 'Zone', note: 'letter' },
            { label: 'Group number' },
            { label: 'Student name(s)', wide: true },
          ].map(({ label, wide, note }) => (
            <div key={label} className={wide ? 'col-span-2' : ''}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {label}{note && <span className="font-normal text-gray-300 ml-1">({note})</span>}
              </div>
              <div className="border-b-2 border-gray-300 h-7" />
            </div>
          ))}
        </div>

        {/* Instructions strip */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-6 flex items-start gap-3">
          <span className="text-green-700 text-xl mt-0.5">📋</span>
          <p className="text-xs text-green-800 leading-relaxed">
            Fill in one row per tree. Use the <strong>cardboard clinometer</strong> (back of this sheet) to measure height.
            Measure trunk at <strong>1.3 m from the ground</strong> (diameter tape reads diameter directly; regular tape: divide cm by π = 3.14).
            For crown, measure the <strong>widest point end-to-end</strong>.
            Health: <strong>H</strong> = healthy, <strong>S</strong> = stressed, <strong>D</strong> = dead/dying.
            {' '}<strong>Multi-stem tree?</strong> Fill in the first stem in the tree's row, then use the rows immediately below for the extra stems — write only the trunk Ø and leave all other columns blank. Mark those extra rows with <em>"↑ stem"</em> in the Notes column.
          </p>
        </div>

        {/* Tree table */}
        <table className="w-full border-collapse text-sm mb-2">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="px-2 py-2.5 text-center text-xs font-bold w-8 rounded-tl-lg">#</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold" style={{ width: '22%' }}>Species<br /><span className="font-normal text-green-200 text-[10px]">Latin or common</span></th>
              <th className="px-3 py-2.5 text-center text-xs font-bold" style={{ width: '11%' }}>Height<br /><span className="font-normal text-green-200 text-[10px]">(m)</span></th>
              <th className="px-3 py-2.5 text-center text-xs font-bold" style={{ width: '12%' }}>Crown Ø<br /><span className="font-normal text-green-200 text-[10px]">(m)</span></th>
              <th className="px-3 py-2.5 text-center text-xs font-bold" style={{ width: '12%' }}>Trunk Ø<br /><span className="font-normal text-green-200 text-[10px]">(cm at 1.3m)</span></th>
              <th className="px-3 py-2.5 text-center text-xs font-bold" style={{ width: '9%' }}>Health<br /><span className="font-normal text-green-200 text-[10px]">H / S / D</span></th>
              <th className="px-3 py-2.5 text-center text-xs font-bold w-10">📷<br /><span className="font-normal text-green-200 text-[10px]">Photo</span></th>
              <th className="px-3 py-2.5 text-left text-xs font-bold rounded-tr-lg">Notes</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: TREES_PER_SHEET }, (_, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50/40'}>
                <td className="px-2 py-4 text-center font-bold text-green-700 text-sm border-b border-gray-200">{i + 1}</td>
                <td className="px-3 py-4 border-b border-gray-200">
                  <div className="border-b border-gray-300 mb-2 h-5" />
                  <div className="border-b border-gray-300 h-5" />
                </td>
                <td className="px-3 py-4 text-center border-b border-gray-200">
                  <div className="border-b border-gray-300 h-5 mx-2" />
                </td>
                <td className="px-3 py-4 text-center border-b border-gray-200">
                  <div className="border-b border-gray-300 h-5 mx-2" />
                </td>
                <td className="px-3 py-4 text-center border-b border-gray-200">
                  <div className="border-b border-gray-300 h-5 mx-2" />
                </td>
                <td className="px-3 py-4 text-center border-b border-gray-200">
                  <div className="text-xs text-gray-400 tracking-widest">H / S / D</div>
                  <div className="text-[10px] text-gray-300">circle one</div>
                </td>
                <td className="px-3 py-4 text-center border-b border-gray-200">
                  <div className="w-5 h-5 border-2 border-gray-400 rounded mx-auto" />
                </td>
                <td className="px-3 py-4 border-b border-gray-200">
                  <div className="border-b border-gray-200 h-5 mb-2" />
                  <div className="border-b border-gray-200 h-5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Quick reference */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Health codes</div>
            <div className="text-xs text-gray-700 space-y-1">
              <div><strong>H</strong> – Healthy: full canopy, no visible disease</div>
              <div><strong>S</strong> – Stressed: sparse leaves, discoloration, damage</div>
              <div><strong>D</strong> – Dead / dying</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Trunk measurement</div>
            <div className="text-xs text-gray-700 space-y-1">
              <div>Measure trunk at <strong>1.3 m height</strong> (DBH)</div>
              <div>If using a regular tape → <strong>circumference</strong></div>
              <div>Diameter = Circumference ÷ 3.14</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Crown measurement</div>
            <div className="text-xs text-gray-700 space-y-1">
              <div>Stand at drip edge of canopy</div>
              <div>Measure <strong>widest point</strong>, end to end</div>
              <div>Record in <strong>metres</strong></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
          <span>Schools Are Forests · schoolsareforests.org</span>
          <span>Enter data at <strong className="text-gray-500">schoolsareforests.org/student</strong></span>
        </div>
      </div>

      {/* PAGE 2 — Clinometer instructions */}
      <div className="page page-break bg-white max-w-[860px] mx-auto mb-16 no-print:shadow-xl rounded-lg p-10" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-5 border-b-2 border-green-700">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="" width={52} height={52} className="rounded-lg" />
            <div>
              <div className="text-green-800 font-black text-xl leading-tight">Schools Are Forests</div>
              <div className="text-green-600 text-xs tracking-widest uppercase mt-0.5">schoolsareforests.org</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-700 font-bold text-lg">Cardboard Clinometer</div>
            <div className="text-gray-400 text-xs uppercase tracking-wide">Build & Use Guide</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10">
          {/* Left — Build it */}
          <div>
            <div className="text-green-800 font-bold text-base mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-green-700 text-white text-sm font-bold flex items-center justify-center shrink-0">A</span>
              Build the clinometer
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <div className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wide">You need</div>
              <ul className="text-xs text-green-900 space-y-1">
                <li>✂️ A piece of cardboard (~25 × 25 cm)</li>
                <li>📏 Ruler and pencil</li>
                <li>🪡 String (~35 cm long)</li>
                <li>🪙 A coin or small washer (weight)</li>
                <li>📌 A pin or hole punch</li>
              </ul>
            </div>

            <ol className="space-y-4 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Draw a right triangle.</strong> On the cardboard, mark two sides of exactly <strong>20 cm each</strong> at a right angle. Connect them with the hypotenuse. Cut it out.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Mark the right-angle corner.</strong> Draw a small square at that corner so you always know which one it is.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Make a hole</strong> at the right-angle corner with a pin or hole punch. Thread the string through and tie a knot so it can't pull through.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Tie the weight</strong> (coin or washer) to the free end of the string. The string will hang straight down by gravity when you hold the clinometer up.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div>
                  <strong>Label it.</strong> Write "Look this way →" along the hypotenuse, pointing from the right-angle end toward the opposite corner.
                </div>
              </li>
            </ol>
          </div>

          {/* Right — Diagram + use it */}
          <div>
            {/* SVG diagram */}
            <div className="flex justify-center mb-6">
              <svg viewBox="0 0 260 230" className="w-full max-w-[260px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                {/* Triangle body */}
                <polygon points="30,190 30,30 190,190" fill="#f0fdf4" stroke="#15803d" strokeWidth="2.5" strokeLinejoin="round" />

                {/* Right-angle marker */}
                <polyline points="30,170 50,170 50,190" fill="none" stroke="#15803d" strokeWidth="1.5" />

                {/* Hypotenuse arrow (sight line) */}
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#15803d" />
                  </marker>
                </defs>
                <line x1="60" y1="170" x2="155" y2="75" stroke="#15803d" strokeWidth="2" strokeDasharray="6,3" markerEnd="url(#arrow)" />
                <text x="120" y="110" fontSize="10" fill="#15803d" fontWeight="bold" transform="rotate(-44, 120, 110)">Sight along here</text>

                {/* String from right-angle corner going down */}
                <line x1="30" y1="190" x2="30" y2="228" stroke="#374151" strokeWidth="2" strokeDasharray="4,2" />
                {/* Weight */}
                <circle cx="30" cy="232" r="8" fill="#374151" />
                <text x="42" y="236" fontSize="9" fill="#374151">weight</text>

                {/* Eye at bottom-right */}
                <ellipse cx="195" cy="195" rx="9" ry="5" fill="none" stroke="#1e40af" strokeWidth="1.5" />
                <circle cx="195" cy="195" r="2.5" fill="#1e40af" />
                <text x="207" y="200" fontSize="9" fill="#1e40af">Eye here</text>

                {/* Treetop target */}
                <text x="10" y="24" fontSize="10" fill="#15803d">🌲 Tree top</text>

                {/* Right angle label */}
                <text x="5" y="185" fontSize="9" fill="#374151">Right</text>
                <text x="5" y="195" fontSize="9" fill="#374151">angle</text>

                {/* String label */}
                <text x="36" y="215" fontSize="9" fill="#374151">String</text>
              </svg>
            </div>

            <div className="text-green-800 font-bold text-base mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-green-700 text-white text-sm font-bold flex items-center justify-center shrink-0">B</span>
              Measure tree height
            </div>

            <ol className="space-y-3 text-sm text-gray-700 mb-5">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div><strong>Stand back</strong> from the tree until you can see the very top. Measure and note your <strong>distance to the trunk</strong> (D).</div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div><strong>Hold the clinometer</strong> at eye level, with the right-angle corner pointing toward you. Let the string hang freely.</div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div><strong>Tilt the triangle</strong> until you can see the top of the tree along the hypotenuse. When aligned, pinch the string against the cardboard.</div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>If the string touches the <strong>midpoint of the vertical side</strong> you're at 45°. Tree height = <strong>D + eye height</strong>.</div>
              </li>
            </ol>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">Quick formula (45° triangle)</div>
              <div className="text-center font-mono text-sm font-bold text-amber-900 my-2 py-2 bg-amber-100 rounded-lg">
                Height = Distance + Eye height
              </div>
              <div className="text-xs text-amber-800">
                Example: you stand <strong>8 m</strong> from the tree, eye height <strong>1.5 m</strong> → tree is <strong>9.5 m</strong> tall.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
          <span>Schools Are Forests · schoolsareforests.org</span>
          <span>Questions? <strong className="text-gray-500">schoolsareforests.org/contact</strong></span>
        </div>
      </div>
    </>
  )
}
