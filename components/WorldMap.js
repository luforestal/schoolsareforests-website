'use client'
import { useState, useEffect } from 'react'

const W = 960, H = 500

export default function WorldMap({ schools }) {
  const [paths, setPaths] = useState([])
  const [markers, setMarkers] = useState([])
  const [tooltip, setTooltip] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Send school coordinates to the server so it can project them
    // with the same Natural Earth projection used for the map paths
    const param = encodeURIComponent(JSON.stringify(
      schools.map(s => ({ id: s.id, name: s.name, location: s.location, trees: s.trees, coordinates: s.coordinates }))
    ))
    fetch(`/api/worldmap?schools=${param}`)
      .then(r => r.json())
      .then(data => {
        if (data.paths && data.markers) {
          setPaths(data.paths)
          setMarkers(data.markers)
        } else {
          console.error('WorldMap API error:', data)
          setError(true)
        }
      })
      .catch(() => setError(true))
  }, [schools])

  if (error) return (
    <div className="w-full h-48 flex items-center justify-center bg-forest-50 rounded-2xl text-forest-400 text-sm">
      Map unavailable
    </div>
  )

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-inner" style={{ background: '#d6eef8' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <clipPath id="mapclip">
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>

        {/* Ocean */}
        <rect width={W} height={H} fill="#d6eef8" />

        {/* Countries */}
        <g clipPath="url(#mapclip)">
          {paths.map(p => (
            <path key={p.id} d={p.d} fill="#c5dba8" stroke="#9ec07a" strokeWidth={0.5} />
          ))}
        </g>

        {/* School markers — positions come from server projection */}
        {markers.map(m => (
          <g key={m.id}>
            <circle cx={m.x} cy={m.y} r={9} fill="#2d5016" fillOpacity={0.25} />
            <circle
              cx={m.x} cy={m.y} r={5}
              fill="#2d5016" stroke="#fff" strokeWidth={1.5}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip(m)}
              onMouseLeave={() => setTooltip(null)}
            />
          </g>
        ))}
      </svg>

      {paths.length === 0 && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-forest-400 text-sm">Loading map…</p>
        </div>
      )}

      <div className="absolute top-3 right-3 bg-forest-700 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
        {schools.length} {schools.length === 1 ? 'school' : 'schools'} mapped
      </div>

      {tooltip && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-forest-800 text-white text-xs px-4 py-2 rounded-xl shadow-lg pointer-events-none whitespace-nowrap">
          <span className="font-semibold">{tooltip.name}</span>
          <span className="text-forest-300 ml-2">{tooltip.location} · 🌳 {tooltip.trees} trees</span>
        </div>
      )}
    </div>
  )
}
