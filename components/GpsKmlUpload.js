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
    // KML coords format: "lng,lat,alt" (first pair if multipoint)
    const firstPair = coordsRaw.split(/\s+/)[0]
    const parts = firstPair.split(',').map(s => parseFloat(s.trim()))
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) continue
    results.push({ name, lng: parts[0], lat: parts[1] })
  }
  return results
}

// Normalize an ID string for matching: strip leading zeros, lowercase, trim
function normalizeId(s) {
  if (!s && s !== 0) return ''
  return String(s).trim().toLowerCase().replace(/^0+/, '') || '0'
}

export default function GpsKmlUpload({ school }) {
  const [step, setStep] = useState('upload') // upload | preview | saving | done
  const [file, setFile] = useState(null)
  const [placemarks, setPlacemarks] = useState([]) // parsed from KML
  const [trees, setTrees] = useState([]) // trees with original_id, no GPS
  const [matches, setMatches] = useState([]) // [{ placemark, tree, matched }]
  const [parseError, setParseError] = useState('')
  const [savingDone, setSavingDone] = useState(0)
  const [savingTotal, setSavingTotal] = useState(0)
  const [updatedCount, setUpdatedCount] = useState(0)
  const fileRef = useRef(null)

  useEffect(() => {
    supabase
      .from('trees')
      .select('id, original_id, species_common, zone_id, lat, lng')
      .eq('school_id', school.id)
      .eq('inaccessible', false)
      .order('id')
      .then(({ data }) => setTrees(data || []))
  }, [school.id])

  const treesWithoutGps = trees.filter(t => !t.lat && !t.lng)
  const treesWithGps = trees.filter(t => t.lat || t.lng)

  const handleFile = async (f) => {
    if (!f) return
    setFile(f)
    setParseError('')
    try {
      const text = await f.text()
      const parsed = parseKml(text)
      if (!parsed.length) { setParseError('No placemarks with coordinates found in this KML.'); return }
      setPlacemarks(parsed)

      // Auto-match by normalized name → original_id
      const idMap = {}
      trees.forEach(t => {
        if (t.original_id) idMap[normalizeId(t.original_id)] = t
      })
      // Also map by sequential index as fallback
      trees.forEach((t, i) => {
        const key = String(i + 1)
        if (!idMap[key]) idMap[key] = t
      })

      const matched = parsed.map(pm => ({
        placemark: pm,
        tree: idMap[normalizeId(pm.name)] || null,
        manual: '',
      }))
      setMatches(matched)
      setStep('preview')
    } catch {
      setParseError('Could not read this file. Make sure it is a valid .kml file.')
    }
  }

  const matchedCount = matches.filter(m => m.tree || m.manual).length

  const resolveTree = (m) => {
    if (m.manual) return trees.find(t => t.id === m.manual) || null
    return m.tree
  }

  const handleSave = async () => {
    const toUpdate = matches.filter(m => resolveTree(m))
    setStep('saving')
    setSavingTotal(toUpdate.length)
    setSavingDone(0)
    let count = 0
    for (const m of toUpdate) {
      const tree = resolveTree(m)
      const { error } = await supabase.from('trees')
        .update({ lat: m.placemark.lat, lng: m.placemark.lng })
        .eq('id', tree.id)
      if (!error) count++
      setSavingDone(d => d + 1)
    }
    setUpdatedCount(count)
    setStep('done')
  }

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

      {/* Stats */}
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

      {treesWithoutGps.length === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
          All your trees already have GPS coordinates — nothing to do here!
        </div>
      )}

      {/* KML format hint */}
      <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 text-sm text-forest-700">
        <p className="font-semibold mb-2">How your KML should be structured</p>
        <p className="text-xs text-forest-600 mb-2">
          Each tree should be a <code className="bg-white px-1 rounded">Placemark</code> where the
          <code className="bg-white px-1 rounded mx-1">name</code> matches the Tree ID from your inventory:
        </p>
        <pre className="bg-white rounded-lg p-3 text-xs text-gray-600 overflow-x-auto border border-forest-100">{`<Placemark>
  <name>001</name>
  <Point>
    <coordinates>-73.123,4.567,0</coordinates>
  </Point>
</Placemark>`}</pre>
        <p className="text-xs text-forest-600 mt-2">
          The number in <code className="bg-white px-1 rounded">name</code> must match
          the Tree ID column you mapped during the CSV import.
          If your names don't match exactly, you can adjust them manually in the next step.
        </p>
      </div>

      {/* File drop */}
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
        <p className="text-sm text-gray-500">
          {matchedCount} of {placemarks.length} placemarks matched to trees.
          Adjust any mismatches manually.
        </p>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {matches.map((m, i) => {
          const resolved = resolveTree(m)
          return (
            <div key={i} className={`bg-white rounded-xl border p-3 ${resolved ? 'border-green-200' : 'border-amber-200'}`}>
              <div className="flex items-start gap-3">
                {/* Placemark info */}
                <div className="shrink-0 w-28">
                  <p className="text-xs font-semibold text-gray-700">📍 {m.placemark.name || '(no name)'}</p>
                  <p className="text-xs text-gray-400 font-mono">{m.placemark.lat.toFixed(5)}</p>
                  <p className="text-xs text-gray-400 font-mono">{m.placemark.lng.toFixed(5)}</p>
                </div>

                {/* Arrow */}
                <span className="text-gray-300 text-lg mt-1">→</span>

                {/* Tree match */}
                <div className="flex-1 min-w-0">
                  {m.tree && !m.manual ? (
                    <p className="text-xs font-medium text-green-700 mb-1">
                      ✓ ID {m.tree.original_id} — {m.tree.species_common || 'Unknown species'}
                    </p>
                  ) : null}
                  <select
                    value={m.manual || m.tree?.id || ''}
                    onChange={e => setMatches(prev => prev.map((x, j) =>
                      j === i ? { ...x, manual: e.target.value, tree: null } : x
                    ))}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                  >
                    <option value="">— skip this placemark —</option>
                    {trees.map((t, idx) => (
                      <option key={t.id} value={t.id}>
                        {t.original_id ? `ID ${t.original_id}` : `#${idx + 1}`}
                        {' — '}{t.species_common || 'Unknown'}
                        {(t.lat || t.lng) ? ' 📍' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <span className={`text-sm font-bold shrink-0 ${resolved ? 'text-green-600' : 'text-amber-400'}`}>
                  {resolved ? '✓' : '?'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-forest-50 border border-forest-100 rounded-xl px-4 py-3 text-sm text-forest-700">
        <strong>{matchedCount} trees</strong> will get GPS coordinates.
        {matches.filter(m => !resolveTree(m)).length > 0 && (
          <span className="text-gray-400"> · {matches.filter(m => !resolveTree(m)).length} placemarks skipped.</span>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => { setStep('upload'); setFile(null); setMatches([]) }}
          className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={handleSave} disabled={matchedCount === 0}
          className="flex-1 bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40">
          Save GPS to {matchedCount} trees
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
      <div>
        <p className="font-bold text-forest-800 text-xl mb-1">GPS saved!</p>
        <p className="text-sm text-gray-500">
          <strong className="text-forest-700">{updatedCount} trees</strong> now have coordinates and will appear on the map.
        </p>
      </div>
      <button onClick={() => { setStep('upload'); setFile(null); setMatches([]) }}
        className="w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors">
        Upload another KML
      </button>
    </div>
  )
}
