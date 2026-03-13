'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// Fields we can map from the file
const FIELDS = [
  { key: 'zone',             label: 'Zone / Zona',            required: false },
  { key: 'species',          label: 'Species / Especie',      required: false },
  { key: 'height_m',         label: 'Height (m) / Altura',    required: false },
  { key: 'crown_ns_m',       label: 'Crown N-S (m)',          required: false },
  { key: 'crown_ew_m',       label: 'Crown E-W (m)',          required: false },
  { key: 'trunk_diameter_cm',label: 'Trunk diameter (cm) / DAP', required: false },
  { key: 'health',           label: 'Health / Salud',         required: false },
  { key: 'notes',            label: 'Notes / Notas',          required: false },
  { key: 'lat',              label: 'Latitude / Latitud',     required: false },
  { key: 'lng',              label: 'Longitude / Longitud',   required: false },
]

// Try to auto-detect mapping from column header names
const AUTO_DETECT = {
  zone:              ['zone', 'zona', 'sector', 'area'],
  species:           ['species', 'especie', 'nombre', 'common_name', 'tree', 'arbol', 'árbol', 'nombre_comun'],
  height_m:          ['height', 'altura', 'alt', 'h_m', 'height_m', 'altura_m', 'h(m)', 'altura(m)'],
  crown_ns_m:        ['crown_ns', 'copa_ns', 'crown_n', 'ns_m', 'copa_n-s', 'crown ns', 'copa ns'],
  crown_ew_m:        ['crown_ew', 'copa_ew', 'crown_e', 'ew_m', 'copa_e-w', 'crown ew', 'copa ew'],
  trunk_diameter_cm: ['trunk', 'dap', 'dbh', 'diameter', 'diametro', 'diámetro', 'trunk_cm', 'dap_cm', 'dbh_cm', 'tronco'],
  health:            ['health', 'salud', 'estado', 'condition', 'condicion', 'condición'],
  notes:             ['notes', 'notas', 'remarks', 'comentarios', 'observaciones', 'obs'],
  lat:               ['lat', 'latitude', 'latitud', 'y', 'coord_lat'],
  lng:               ['lng', 'lon', 'long', 'longitude', 'longitud', 'x', 'coord_lon'],
}

function autoMap(headers) {
  const mapping = {}
  for (const [field, keywords] of Object.entries(AUTO_DETECT)) {
    const match = headers.find(h =>
      keywords.some(kw => h.toLowerCase().trim() === kw)
    )
    mapping[field] = match || '__skip__'
  }
  return mapping
}

function parseValue(raw, field) {
  if (!raw && raw !== 0) return null
  const s = String(raw).trim()
  if (!s) return null
  if (['height_m', 'crown_ns_m', 'crown_ew_m', 'lat', 'lng'].includes(field)) {
    const n = parseFloat(s.replace(',', '.'))
    return isNaN(n) ? null : n
  }
  if (field === 'trunk_diameter_cm') {
    const n = parseFloat(s.replace(',', '.'))
    return isNaN(n) ? null : n
  }
  if (field === 'health') {
    const lower = s.toLowerCase()
    if (['good', 'healthy', 'bueno', 'buena', 'sano', 'sana', 'bien'].some(k => lower.includes(k))) return 'healthy'
    if (['fair', 'regular', 'medio', 'media', 'moderate'].some(k => lower.includes(k))) return 'fair'
    if (['poor', 'malo', 'mala', 'bad', 'weak', 'débil'].some(k => lower.includes(k))) return 'poor'
    if (['dead', 'muerto', 'muerta', 'seco', 'seca'].some(k => lower.includes(k))) return 'dead'
    return null
  }
  return s || null
}

function applyMapping(row, mapping) {
  const result = {}
  for (const field of FIELDS) {
    const col = mapping[field.key]
    if (!col || col === '__skip__') { result[field.key] = null; continue }
    result[field.key] = parseValue(row[col], field.key)
  }
  return result
}

const BATCH_SIZE = 50

export default function InventoryUpload({ school, zones, onImportDone }) {
  const [step, setStep] = useState('upload') // upload | map | preview | importing | done
  const [year, setYear] = useState(new Date().getFullYear() - 1)
  const [file, setFile] = useState(null)
  const [headers, setHeaders] = useState([])
  const [rawRows, setRawRows] = useState([])
  const [mapping, setMapping] = useState({})
  const [defaultZoneId, setDefaultZoneId] = useState('')
  const [parseError, setParseError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(0)
  const [importTotal, setImportTotal] = useState(0)
  const [importErrors, setImportErrors] = useState([])
  const [importedCount, setImportedCount] = useState(0)
  const fileRef = useRef(null)

  const handleFile = async (f) => {
    if (!f) return
    setFile(f)
    setParseError('')
    try {
      const XLSX = await import('xlsx')
      const buf = await f.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
      if (!data.length) { setParseError('The file appears to be empty.'); return }
      const hdrs = Object.keys(data[0])
      setHeaders(hdrs)
      setRawRows(data)
      setMapping(autoMap(hdrs))
    } catch {
      setParseError('Could not read this file. Please use .csv or .xlsx format.')
    }
  }

  const preview = rawRows.slice(0, 8).map(r => applyMapping(r, mapping))

  const zoneColumn = mapping['zone']
  const hasZoneColumn = zoneColumn && zoneColumn !== '__skip__'

  // Collect unique zone values from file
  const fileZoneValues = hasZoneColumn
    ? [...new Set(rawRows.map(r => String(r[zoneColumn] || '').trim()).filter(Boolean))]
    : []

  const handleImport = async () => {
    setImporting(true)
    setStep('importing')
    setImportDone(0)
    setImportTotal(rawRows.length)
    setImportErrors([])

    // First: ensure all needed zones exist
    const zoneMap = {} // label → zone_id
    zones.forEach(z => { zoneMap[z.label.toUpperCase()] = z.id })

    if (hasZoneColumn) {
      // Create missing zones
      for (const label of fileZoneValues) {
        const upper = label.toUpperCase()
        if (!zoneMap[upper]) {
          const { data: newZone, error } = await supabase.from('zones').insert({
            school_id: school.id,
            label: upper.slice(0, 4),
            category: null,
            description: `Imported zone ${label}`,
          }).select().single()
          if (!error && newZone) {
            zoneMap[upper] = newZone.id
          }
        }
      }
    }

    // Create or find inventory record for this year
    let inventoryId = null
    const { data: existingInv } = await supabase
      .from('inventories')
      .select('id')
      .eq('school_id', school.id)
      .eq('year', year)
      .single()

    if (existingInv) {
      inventoryId = existingInv.id
    } else {
      const { data: newInv } = await supabase.from('inventories').insert({
        school_id: school.id,
        year,
        label: `Inventory ${year}`,
        status: 'closed',
      }).select().single()
      if (newInv) inventoryId = newInv.id
    }

    // Import trees in batches
    let done = 0
    const errors = []
    let successCount = 0

    for (let i = 0; i < rawRows.length; i += BATCH_SIZE) {
      const batch = rawRows.slice(i, i + BATCH_SIZE)
      const treesToInsert = []

      for (const row of batch) {
        const mapped = applyMapping(row, mapping)

        let zoneId = defaultZoneId || null
        if (hasZoneColumn && mapped.zone) {
          zoneId = zoneMap[mapped.zone.toUpperCase()] || defaultZoneId || null
        }

        if (!zoneId) {
          errors.push(`Row ${i + 1}: no zone assigned — skipped`)
          done++
          continue
        }

        const tree = {
          school_id: school.id,
          zone_id: zoneId,
          species: mapped.species || null,
          height_m: mapped.height_m,
          crown_diameter_m: mapped.crown_ns_m || mapped.crown_ew_m
            ? ((mapped.crown_ns_m || 0) + (mapped.crown_ew_m || 0)) / (mapped.crown_ns_m && mapped.crown_ew_m ? 2 : 1)
            : null,
          trunk_diameter_cm: mapped.trunk_diameter_cm,
          health: mapped.health || null,
          notes: mapped.notes || null,
          gps: mapped.lat && mapped.lng ? { lat: mapped.lat, lng: mapped.lng } : null,
          inaccessible: false,
          inventory_id: inventoryId,
        }
        treesToInsert.push(tree)
      }

      if (treesToInsert.length) {
        const { error } = await supabase.from('trees').insert(treesToInsert)
        if (error) {
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`)
        } else {
          successCount += treesToInsert.length
        }
      }

      done += batch.length
      setImportDone(done)
    }

    // Update trees_count on school
    await supabase
      .from('schools')
      .update({ trees_count: (school.trees_count || 0) + successCount })
      .eq('id', school.id)

    setImportErrors(errors)
    setImportedCount(successCount)
    setImporting(false)
    setStep('done')
  }

  // ── STEP: UPLOAD ──
  if (step === 'upload') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Upload Previous Inventory</h2>
        <p className="text-sm text-gray-500">
          Upload a CSV or Excel file with your school's existing tree data.
          You'll be able to map your column names to our fields in the next step.
        </p>
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Inventory year *
        </label>
        <input
          type="number"
          min="1990"
          max={new Date().getFullYear()}
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="w-40 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
        />
        <p className="text-xs text-gray-400 mt-1">The year this inventory was collected</p>
      </div>

      {/* File drop */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File (CSV or Excel) *
        </label>
        <label
          className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl py-10 cursor-pointer hover:border-forest-400 hover:bg-forest-50 transition-colors"
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          onDragOver={e => e.preventDefault()}
        >
          <span className="text-4xl">{file ? '📊' : '📂'}</span>
          {file ? (
            <span className="text-sm font-medium text-forest-700">{file.name}</span>
          ) : (
            <>
              <span className="text-sm text-gray-500">Drag your file here, or click to browse</span>
              <span className="text-xs text-gray-400">.csv · .xlsx · .xls</span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </label>
        {parseError && (
          <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2 mt-2">{parseError}</p>
        )}
      </div>

      {/* Photo note */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">About photos</p>
        <p>
          Photos can be added later from each tree's detail page. If your photos are named by tree ID,
          you'll be able to match them after the import is complete.
        </p>
      </div>

      {rawRows.length > 0 && (
        <div className="bg-forest-50 border border-forest-100 rounded-xl px-4 py-3 text-sm text-forest-700">
          ✓ {rawRows.length} rows detected · {headers.length} columns
        </div>
      )}

      <button
        onClick={() => setStep('map')}
        disabled={!rawRows.length}
        className="w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40"
      >
        Next: Map Columns →
      </button>
    </div>
  )

  // ── STEP: MAP ──
  if (step === 'map') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Map Your Columns</h2>
        <p className="text-sm text-gray-500">
          Match the columns from your file to our fields. We've tried to auto-detect them —
          check and adjust as needed. All fields are optional except a zone assignment.
        </p>
      </div>

      <div className="space-y-3">
        {FIELDS.map(field => (
          <div key={field.key} className="flex items-center gap-3">
            <div className="w-48 shrink-0">
              <p className="text-sm font-medium text-gray-700">{field.label}</p>
            </div>
            <select
              value={mapping[field.key] || '__skip__'}
              onChange={e => setMapping(m => ({ ...m, [field.key]: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
            >
              <option value="__skip__">— not in my file —</option>
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Default zone if no zone column */}
      {!hasZoneColumn && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            No zone column selected — assign a default zone
          </p>
          <select
            value={defaultZoneId}
            onChange={e => setDefaultZoneId(e.target.value)}
            className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
          >
            <option value="">Select a zone…</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                Zone {z.label}{z.category ? ` — ${z.category}` : ''}
              </option>
            ))}
          </select>
          {zones.length === 0 && (
            <p className="text-xs text-amber-700 mt-1">
              No zones exist yet. Go to the Zones tab and create at least one zone first.
            </p>
          )}
        </div>
      )}

      {/* Zone values found in file */}
      {hasZoneColumn && fileZoneValues.length > 0 && (
        <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 text-sm">
          <p className="font-medium text-forest-700 mb-1">Zone values found in file:</p>
          <div className="flex flex-wrap gap-2">
            {fileZoneValues.map(v => {
              const exists = zones.some(z => z.label.toUpperCase() === v.toUpperCase())
              return (
                <span key={v} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  exists ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {v} {exists ? '✓' : '(new)'}
                </span>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">New zones will be created automatically.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('upload')}
          className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep('preview')}
          disabled={!hasZoneColumn && !defaultZoneId}
          className="flex-1 bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40"
        >
          Next: Preview →
        </button>
      </div>
    </div>
  )

  // ── STEP: PREVIEW ──
  if (step === 'preview') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Preview</h2>
        <p className="text-sm text-gray-500">
          First {Math.min(8, rawRows.length)} of {rawRows.length} rows — verify the data looks correct before importing.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              {FIELDS.filter(f => mapping[f.key] && mapping[f.key] !== '__skip__').map(f => (
                <th key={f.key} className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {FIELDS.filter(f => mapping[f.key] && mapping[f.key] !== '__skip__').map(f => (
                  <td key={f.key} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {row[f.key] !== null && row[f.key] !== undefined ? String(row[f.key]) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-forest-50 border border-forest-100 rounded-xl px-4 py-3 text-sm text-forest-700">
        <strong>{rawRows.length} trees</strong> will be imported into inventory year <strong>{year}</strong>.
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('map')}
          className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleImport}
          className="flex-1 bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors"
        >
          Import {rawRows.length} Trees
        </button>
      </div>
    </div>
  )

  // ── STEP: IMPORTING ──
  if (step === 'importing') {
    const pct = importTotal ? Math.round((importDone / importTotal) * 100) : 0
    return (
      <div className="space-y-6 text-center py-8">
        <div className="text-5xl">🌳</div>
        <div>
          <p className="font-bold text-forest-800 text-lg mb-1">Importing trees…</p>
          <p className="text-sm text-gray-500">{importDone} / {importTotal}</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-forest-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">Please don't close this tab</p>
      </div>
    )
  }

  // ── STEP: DONE ──
  if (step === 'done') return (
    <div className="space-y-6 text-center py-8">
      <div className="text-5xl">🎉</div>
      <div>
        <p className="font-bold text-forest-800 text-xl mb-1">Import complete!</p>
        <p className="text-sm text-gray-500">
          <strong className="text-forest-700">{importedCount} trees</strong> added to inventory {year}.
        </p>
        {importErrors.length > 0 && (
          <p className="text-xs text-amber-600 mt-1">{importErrors.length} rows were skipped.</p>
        )}
      </div>

      {importErrors.length > 0 && (
        <details className="text-left bg-amber-50 border border-amber-100 rounded-xl p-4">
          <summary className="text-sm font-medium text-amber-700 cursor-pointer">
            View skipped rows ({importErrors.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {importErrors.map((e, i) => (
              <li key={i} className="text-xs text-amber-600">{e}</li>
            ))}
          </ul>
        </details>
      )}

      <button
        onClick={onImportDone}
        className="w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  )

  return null
}
