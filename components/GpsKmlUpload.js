'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// Parse a KML file and return array of { name, lat, lng }
function parseKml(text) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')
  const placemarks = Array.from(doc.querySelectorAll('Placemark'))
  const results = []
  for (const pm of placemarks) {
    const name = pm.querySelector('name')?.textContent?.trim() || ''
    const coordsRaw = pm.querySelector('coordinates')?.textContent?.trim() || ''
    if (!coordsRaw) continue
    const firstPair = coordsRaw.split(/\s+/)[0]
    const parts = firstPair.split(',').map(s => parseFloat(s.trim()))
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) continue
    results.push({ name, lng: parts[0], lat: parts[1] })
  }
  return results
}

// Exact normalized match: lowercase, trim, strip leading zeros
function normalizeId(s) {
  if (!s && s !== 0) return ''
  return String(s).trim().toLowerCase().replace(/^0+/, '') || '0'
}

// Parse zone-prefixed IDs like "A01", "AB-03", "B7"
// Returns { zone: "A", num: 1 } or null
function parseZonePrefixed(name) {
  const m = String(name).trim().match(/^([A-Za-z]+)[-_]?0*(\d+)$/)
  if (!m) return null
  return { zone: m[1].toUpperCase(), num: parseInt(m[2], 10) }
}

// Build best match for each placemark against in-memory excelRows (pre-import)
function buildMatchesFromExcel(placemarks, excelRows, zones) {
  const byId = {}
  excelRows.forEach(r => {
    if (r.original_id) byId[normalizeId(r.original_id)] = r
  })

  const byZone = {}
  excelRows.forEach(r => {
    const z = (r.zone || '').toUpperCase()
    if (!byZone[z]) byZone[z] = []
    byZone[z].push(r)
  })

  return placemarks.map(pm => {
    let excelRow = byId[normalizeId(pm.name)] || null
    let matchMethod = excelRow ? 'id' : null

    if (!excelRow) {
      const parsed = parseZonePrefixed(pm.name)
      if (parsed) {
        const candidates = byZone[parsed.zone] || []
        if (candidates[parsed.num - 1]) {
          excelRow = candidates[parsed.num - 1]
          matchMethod = 'zone'
        }
      }
    }

    return { placemark: pm, excelRow, tree: null, matchMethod, manual: '' }
  })
}

// Build best match for each placemark given trees + zones
function buildMatches(placemarks, trees, zones) {
  // Map 1: original_id → tree (exact normalized)
  const byOriginalId = {}
  trees.forEach(t => {
    if (t.original_id) byOriginalId[normalizeId(t.original_id)] = t
  })

  // Map 2: zone label → trees sorted by original_id or DB id
  const zoneById = {}
  zones.forEach(z => { zoneById[z.id] = z.label.toUpperCase() })

  const byZone = {} // zoneLabel → [tree...]
  trees.forEach(t => {
    const label = zoneById[t.zone_id]
    if (!label) return
    if (!byZone[label]) byZone[label] = []
    byZone[label].push(t)
  })
  // Sort each zone's trees: by numeric part of original_id, then by DB id
  for (const arr of Object.values(byZone)) {
    arr.sort((a, b) => {
      const na = parseInt(String(a.original_id || '').replace(/\D/g, ''), 10)
      const nb = parseInt(String(b.original_id || '').replace(/\D/g, ''), 10)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return String(a.id).localeCompare(String(b.id))
    })
  }

  return placemarks.map(pm => {
    // Strategy 1: exact original_id match
    let tree = byOriginalId[normalizeId(pm.name)] || null
    let matchMethod = tree ? 'id' : null

    // Strategy 2: zone + position (e.g. "A01" → zone A, position 1)
    if (!tree) {
      const parsed = parseZonePrefixed(pm.name)
      if (parsed) {
        const candidates = byZone[parsed.zone] || []
        const candidate = candidates[parsed.num - 1] || null
        if (candidate) { tree = candidate; matchMethod = 'zone' }
      }
    }

    // Strategy 3: sequential index across all trees (numeric-only KML names)
    if (!tree) {
      const n = parseInt(pm.name, 10)
      if (!isNaN(n) && n >= 1 && n <= trees.length) {
        tree = trees[n - 1]
        matchMethod = 'seq'
      }
    }

    return { placemark: pm, tree, matchMethod, manual: '' }
  })
}

export default function GpsKmlUpload({ school, zones = [], excelRows = [], onGpsDone }) {
  const [step, setStep] = useState('upload') // upload | preview | saving | done
  const [file, setFile] = useState(null)
  const [placemarks, setPlacemarks] = useState([])
  const [trees, setTrees] = useState([])
  const [treesLoaded, setTreesLoaded] = useState(false)
  const [matches, setMatches] = useState([])
  const [parseError, setParseError] = useState('')
  const [savingDone, setSavingDone] = useState(0)
  const [savingTotal, setSavingTotal] = useState(0)
  const [updatedCount, setUpdatedCount] = useState(0)
  const [gpsReadyCount, setGpsReadyCount] = useState(0)
  const [showMatched, setShowMatched] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    supabase
      .from('trees')
      .select('id, original_id, species_common, zone_id, lat, lng')
      .eq('school_id', school.id)
      .eq('inaccessible', false)
      .order('id')
      .then(({ data }) => { setTrees(data || []); setTreesLoaded(true) })
  }, [school.id])

  const treesWithoutGps = trees.filter(t => !t.lat && !t.lng)
  const treesWithGps    = trees.filter(t => t.lat  || t.lng)

  const hasData = excelRows.length > 0 || trees.length > 0

  const handleFile = async (f) => {
    if (!f) return
    if (!hasData) {
      setParseError('Load your Excel file first (Import data tab), then come back to add GPS.')
      return
    }
    setFile(f)
    setParseError('')
    try {
      const text = await f.text()
      const parsed = parseKml(text)
      if (!parsed.length) { setParseError('No placemarks with coordinates found in this KML.'); return }
      setPlacemarks(parsed)
      if (excelRows.length > 0) {
        setMatches(buildMatchesFromExcel(parsed, excelRows, zones))
      } else {
        setMatches(buildMatches(parsed, trees, zones))
      }
      setStep('preview')
    } catch {
      setParseError('Could not read this file. Make sure it is a valid .kml file.')
    }
  }

  // Returns the DB tree object for DB-matched items (manual override or m.tree)
  const resolveTree = (m) => {
    if (m.manual) return trees.find(t => t.id === m.manual) || null
    return m.tree || null
  }

  // Returns true if this match has a valid target (either excelRow or DB tree)
  const isMatched = (m) => {
    if (m.manual) return !!trees.find(t => t.id === m.manual)
    return !!(m.excelRow || m.tree)
  }

  const matchedItems   = matches.filter(m => isMatched(m))
  const unmatchedItems = matches.filter(m => !isMatched(m))
  const matchedCount   = matchedItems.length

  const handleSave = async () => {
    const toProcess = matches.filter(m => isMatched(m))
    setStep('saving')
    setSavingTotal(toProcess.length)
    setSavingDone(0)

    const collectedGpsMap = {}
    let dbCount = 0

    for (const m of toProcess) {
      const dbTree = resolveTree(m)
      if (dbTree) {
        // DB tree — update directly
        const { error } = await supabase.from('trees')
          .update({ lat: m.placemark.lat, lng: m.placemark.lng })
          .eq('id', dbTree.id)
        if (!error) dbCount++
      } else if (m.excelRow && m.excelRow.original_id) {
        // Excel-only row — collect for in-memory GPS map
        collectedGpsMap[m.excelRow.original_id] = { lat: m.placemark.lat, lng: m.placemark.lng }
      }
      setSavingDone(d => d + 1)
    }

    setUpdatedCount(dbCount)
    const excelGpsCount = Object.keys(collectedGpsMap).length
    setGpsReadyCount(excelGpsCount)

    if (excelGpsCount > 0 && onGpsDone) {
      onGpsDone(collectedGpsMap)
    }

    setStep('done')
  }

  const reset = () => { setStep('upload'); setFile(null); setMatches([]) }

  // ── UPLOAD ──
  if (step === 'upload') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Upload GPS Coordinates (KML)</h2>
        <p className="text-sm text-gray-500">
          If your tree coordinates are in a separate KML file (e.g. from Google Earth or ArcGIS),
          upload it here to add GPS to your imported trees.
        </p>
      </div>

      {/* State-aware status banner */}
      {!treesLoaded ? (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-400">Loading…</div>
      ) : excelRows.length > 0 ? (
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 text-sm text-forest-700">
          <p className="font-semibold mb-0.5">✓ Excel ready — {excelRows.length} rows loaded</p>
          <p className="text-xs text-forest-600">Upload your KML and we'll match automatically. GPS will be embedded when you import.</p>
        </div>
      ) : trees.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{treesWithoutGps.length}</p>
            <p className="text-xs text-amber-600">trees without GPS</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-700">{treesWithGps.length}</p>
            <p className="text-xs text-green-600">trees with GPS</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">⚠ First load your Excel file</p>
          <p>Go to the <strong>📊 Import data</strong> tab, upload your CSV/Excel, and come back here to add GPS. The KML will be matched automatically against your tree data.</p>
        </div>
      )}

      {treesLoaded && excelRows.length === 0 && treesWithoutGps.length === 0 && trees.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
          All your trees already have GPS coordinates — nothing to do here!
        </div>
      )}

      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl py-10 cursor-pointer hover:border-forest-400 hover:bg-forest-50 transition-colors"
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}>
        <span className="text-4xl">{file ? '🗺️' : '📍'}</span>
        {file
          ? <span className="text-sm font-medium text-forest-700">{file.name}</span>
          : <><span className="text-sm text-gray-500">Drag your KML here, or click to browse</span>
             <span className="text-xs text-gray-400">.kml</span></>}
        <input ref={fileRef} type="file" accept=".kml" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />
      </label>

      {parseError && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{parseError}</p>}
    </div>
  )

  // ── PREVIEW ──
  if (step === 'preview') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Review Matches</h2>
        <p className="text-sm text-gray-500">{file?.name}</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-green-700">{matchedCount}</p>
          <p className="text-xs text-green-600">matched automatically</p>
        </div>
        <div className={`border rounded-xl px-4 py-3 text-center ${unmatchedItems.length ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`text-2xl font-bold ${unmatchedItems.length ? 'text-amber-700' : 'text-gray-400'}`}>{unmatchedItems.length}</p>
          <p className={`text-xs ${unmatchedItems.length ? 'text-amber-600' : 'text-gray-400'}`}>couldn't be matched</p>
        </div>
      </div>

      {/* Unmatched — need manual attention */}
      {unmatchedItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-700">⚠ These {unmatchedItems.length} placemarks need manual assignment:</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {unmatchedItems.map((m, _) => {
              const globalIdx = matches.indexOf(m)
              return (
                <div key={globalIdx} className="bg-white rounded-xl border border-amber-200 p-3 flex items-center gap-3">
                  <div className="shrink-0 w-24">
                    <p className="text-xs font-semibold text-gray-700">📍 {m.placemark.name || '(no name)'}</p>
                    <p className="text-xs text-gray-400 font-mono">{m.placemark.lat.toFixed(5)}</p>
                  </div>
                  <span className="text-gray-300">→</span>
                  <select
                    value={m.manual || ''}
                    onChange={e => setMatches(prev => prev.map((x, j) =>
                      j === globalIdx ? { ...x, manual: e.target.value } : x
                    ))}
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                  >
                    <option value="">— skip —</option>
                    {trees.map((t, idx) => (
                      <option key={t.id} value={t.id}>
                        {t.original_id ? `ID ${t.original_id}` : `#${idx + 1}`}
                        {' — '}{t.species_common || 'Unknown'}
                        {(t.lat || t.lng) ? ' 📍' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Matched — collapsible */}
      {matchedCount > 0 && (
        <div>
          <button
            onClick={() => setShowMatched(v => !v)}
            className="text-sm text-forest-700 font-semibold hover:underline"
          >
            {showMatched ? '▾' : '▸'} {matchedCount} matched trees {showMatched ? '(hide)' : '(show)'}
          </button>
          {showMatched && (
            <div className="mt-2 space-y-1 max-h-64 overflow-y-auto pr-1">
              {matchedItems.map((m, _) => {
                const dbTree = resolveTree(m)
                const target = dbTree || m.excelRow
                const globalIdx = matches.indexOf(m)
                return (
                  <div key={globalIdx} className="bg-white rounded-xl border border-green-100 p-2.5 flex items-center gap-3">
                    <p className="text-xs font-semibold text-gray-600 w-16 shrink-0">📍 {m.placemark.name}</p>
                    <span className="text-gray-300 text-xs">→</span>
                    <p className="text-xs text-green-700 flex-1">
                      ✓ {target?.original_id ? `ID ${target.original_id}` : ''} {target?.species_common || ''}
                      {m.excelRow && !dbTree && <span className="ml-1 text-forest-400 text-xs">(Excel)</span>}
                      <span className="ml-1 text-gray-300 text-xs">
                        {m.matchMethod === 'zone' ? '(zone+pos)' : m.matchMethod === 'seq' ? '(seq)' : ''}
                      </span>
                    </p>
                    {/* Only show DB override dropdown when DB trees are available */}
                    {trees.length > 0 && (
                      <select
                        value={m.manual || m.tree?.id || ''}
                        onChange={e => setMatches(prev => prev.map((x, j) =>
                          j === globalIdx ? { ...x, manual: e.target.value } : x
                        ))}
                        className="w-32 border border-gray-100 rounded-lg px-1 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-forest-400"
                      >
                        <option value="">— skip —</option>
                        {trees.map((t, idx) => (
                          <option key={t.id} value={t.id}>
                            {t.original_id ? `ID ${t.original_id}` : `#${idx + 1}`}
                            {' — '}{t.species_common || 'Unknown'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={reset}
          className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={handleSave} disabled={matchedCount === 0}
          className="flex-1 bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40">
          {excelRows.length > 0 && trees.length === 0
            ? `Save GPS for ${matchedCount} trees`
            : `Save GPS to ${matchedCount} trees`}
        </button>
      </div>
    </div>
  )

  // ── SAVING ──
  if (step === 'saving') {
    const pct = savingTotal ? Math.round((savingDone / savingTotal) * 100) : 0
    return (
      <div className="space-y-6 text-center py-8">
        <div className="text-5xl">📍</div>
        <div>
          <p className="font-bold text-forest-800 text-lg mb-1">Saving coordinates…</p>
          <p className="text-sm text-gray-500">{savingDone} / {savingTotal}</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="bg-forest-600 h-3 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
    )
  }

  // ── DONE ──
  return (
    <div className="space-y-6 text-center py-8">
      <div className="text-5xl">🗺️</div>
      {gpsReadyCount > 0 && updatedCount === 0 ? (
        <div>
          <p className="font-bold text-forest-800 text-xl mb-1">GPS data ready!</p>
          <p className="text-sm text-gray-500">
            Coordinates for <strong className="text-forest-700">{gpsReadyCount} trees</strong> will be saved when you import the Excel file.
          </p>
          <p className="text-xs text-forest-600 mt-2">Go to the <strong>Import data</strong> tab and click Import to include the GPS.</p>
        </div>
      ) : (
        <div>
          <p className="font-bold text-forest-800 text-xl mb-1">GPS saved!</p>
          <p className="text-sm text-gray-500">
            <strong className="text-forest-700">{updatedCount} trees</strong> now have coordinates and will appear on the map.
          </p>
          {gpsReadyCount > 0 && (
            <p className="text-xs text-forest-600 mt-1">
              Also queued GPS for <strong>{gpsReadyCount}</strong> Excel rows — will apply on import.
            </p>
          )}
        </div>
      )}
      <button onClick={reset}
        className="w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors">
        Upload another KML
      </button>
    </div>
  )
}
