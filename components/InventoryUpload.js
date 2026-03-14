'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// Fields we can import from the file
const FIELDS = [
  { key: 'original_id',       label: 'Tree ID / Número',                    required: false },
  { key: 'zone',              label: 'Zone / Zona',                          required: false },
  { key: 'species_common',    label: 'Common name / Nombre común',           required: false },
  { key: 'species_scientific',label: 'Scientific name / Nombre científico',  required: false },
  { key: 'genus',             label: 'Genus / Género  ➜ combines with epithet', required: false },
  { key: 'species_epithet',   label: 'Species epithet / Epíteto  ➜ combines with genus', required: false },
  { key: 'height_m',          label: 'Height (m) / Altura',                  required: false },
  { key: 'crown_ns_m',        label: 'Crown N-S (m) / Copa N-S',             required: false },
  { key: 'crown_ew_m',        label: 'Crown E-W (m) / Copa E-O',             required: false },
  { key: 'trunk_diameter_cm', label: 'Trunk (cm) / DAP',                     required: false },
  { key: 'health_status',     label: 'Health / Salud',                       required: false },
  { key: 'notes',             label: 'Notes / Notas',                        required: false },
  { key: 'lat',               label: 'Latitude / Latitud',                   required: false },
  { key: 'lng',               label: 'Longitude / Longitud',                 required: false },
]

// Common column name patterns (EN + ES) for auto-detection
const AUTO_DETECT = {
  original_id:        ['id', 'tree_id', 'treecode', 'tree_code', 'tree code', 'tree id', 'codigo', 'código', 'numero', 'número', 'num', '#', 'arbol_id', 'no.', 'tag', 'label'],
  zone:               ['zone', 'zona', 'sector', 'area', 'área'],
  species_common:     ['common_name', 'nombre_comun', 'nombre_común', 'nombre común', 'common name', 'nombre_vulgar', 'nombre vulgar', 'common'],
  species_scientific: ['species', 'especie', 'scientific_name', 'nombre_cientifico', 'nombre_científico', 'nombre cientifico', 'nombre científico', 'scientific name', 'scientific', 'cientifico', 'científico', 'nombre_especie'],
  genus:              ['genus', 'genero', 'género', 'gen'],
  species_epithet:    ['epithet', 'epiteto', 'epíteto', 'specific_epithet', 'species_epithet', 'species', 'sp', 'spp'],
  height_m:           ['height', 'altura', 'alt', 'h_m', 'height_m', 'altura_m', 'h(m)', 'altura(m)', 'ht', 'alt(m)'],
  crown_ns_m:         ['crown_ns', 'copa_ns', 'crown n-s', 'copa n-s', 'ns_m', 'crown_north', 'copa_norte'],
  crown_ew_m:         ['crown_ew', 'copa_ew', 'crown e-w', 'copa e-o', 'ew_m', 'crown_east', 'copa_este'],
  trunk_diameter_cm:  ['trunk', 'dap', 'dbh', 'diameter', 'diametro', 'diámetro', 'trunk_cm', 'dap_cm', 'dbh_cm', 'tronco', 'circunferencia', 'circ'],
  health_status:      ['health', 'salud', 'estado', 'condition', 'condicion', 'condición', 'health_status'],
  notes:              ['notes', 'notas', 'remarks', 'comentarios', 'observaciones', 'obs'],
  lat:                ['lat', 'latitude', 'latitud', 'y', 'coord_lat', 'lat_decimal'],
  lng:                ['lng', 'lon', 'long', 'longitude', 'longitud', 'x', 'coord_lon', 'lon_decimal'],
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

function parseNum(raw) {
  if (raw === null || raw === undefined || raw === '') return null
  const n = parseFloat(String(raw).replace(',', '.'))
  return isNaN(n) ? null : n
}

function parseHealth(raw) {
  if (!raw) return null
  const s = String(raw).toLowerCase()
  if (['good', 'healthy', 'bueno', 'buena', 'sano', 'sana', 'bien', 'excelente'].some(k => s.includes(k))) return 'good'
  if (['fair', 'regular', 'medio', 'media', 'moderate', 'ok'].some(k => s.includes(k))) return 'fair'
  if (['poor', 'malo', 'mala', 'bad', 'weak', 'debil', 'débil'].some(k => s.includes(k))) return 'poor'
  return null
}

function applyMapping(row, mapping) {
  const get = (field) => {
    const col = mapping[field]
    if (!col || col === '__skip__') return null
    return row[col] ?? null
  }
  const str = (field) => { const v = get(field); return v ? String(v).trim() : null }

  // Build species_scientific: prefer direct column; fallback to genus + epithet
  let scientific = str('species_scientific')
  if (!scientific) {
    const g = str('genus'), e = str('species_epithet')
    if (g && e) scientific = `${g} ${e}`
    else if (g) scientific = g
  }

  return {
    original_id:        str('original_id'),
    zone:               str('zone'),
    species_common:     str('species_common'),
    species_scientific: scientific,
    height_m:           parseNum(get('height_m')),
    crown_ns_m:         parseNum(get('crown_ns_m')),
    crown_ew_m:         parseNum(get('crown_ew_m')),
    trunk_diameter_cm:  parseNum(get('trunk_diameter_cm')),
    health_status:      parseHealth(get('health_status')),
    notes:              str('notes'),
    lat:                parseNum(get('lat')),
    lng:                parseNum(get('lng')),
  }
}

const BATCH_SIZE = 50

export default function InventoryUpload({ school, zones, onImportDone, onDataParsed, gpsData = {} }) {
  const [step, setStep] = useState('upload') // upload | map | preview | importing | done
  const [year, setYear] = useState(new Date().getFullYear() - 1)
  const [file, setFile] = useState(null)
  const [headers, setHeaders] = useState([])
  const [rawRows, setRawRows] = useState([])
  const [mapping, setMapping] = useState({})
  const [defaultZoneId, setDefaultZoneId] = useState('')
  const [parseError, setParseError] = useState('')
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
      const XLSXmod = await import('xlsx')
      const XLSX = XLSXmod.default || XLSXmod
      const buf = await f.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
      if (!data.length) { setParseError('The file appears to be empty.'); return }
      const hdrs = Object.keys(data[0])
      const autoMapped = autoMap(hdrs)
      setHeaders(hdrs)
      setRawRows(data)
      setMapping(autoMapped)
      if (onDataParsed) {
        const mappedRows = data.map(r => applyMapping(r, autoMapped))
        onDataParsed(mappedRows)
      }
    } catch {
      setParseError('Could not read this file. Please use .csv or .xlsx format.')
    }
  }

  const preview = rawRows.slice(0, 8).map(r => applyMapping(r, mapping))
  // genus + species_epithet are helper fields (combined into species_scientific); exclude from preview table
  const HELPER_FIELDS = new Set(['genus', 'species_epithet'])
  const mappedFields = FIELDS.filter(f => !HELPER_FIELDS.has(f.key) && mapping[f.key] && mapping[f.key] !== '__skip__')

  const zoneCol = mapping['zone']
  const hasZoneCol = zoneCol && zoneCol !== '__skip__'
  const fileZoneValues = hasZoneCol
    ? [...new Set(rawRows.map(r => String(r[zoneCol] || '').trim()).filter(Boolean))]
    : []

  const handleImport = async () => {
    setStep('importing')
    setImportDone(0)
    setImportTotal(rawRows.length)
    setImportErrors([])

    // Find or create inventory record first (needed for zone linking)
    let inventoryId = null
    const { data: existingInv } = await supabase
      .from('inventories').select('id').eq('school_id', school.id).eq('year', year).single()
    if (existingInv) {
      inventoryId = existingInv.id
    } else {
      const { data: newInv } = await supabase.from('inventories').insert({
        school_id: school.id, year, label: `Inventory ${year}`, status: 'closed',
      }).select().single()
      if (newInv) inventoryId = newInv.id
    }

    // Ensure needed zones exist, linked to this inventory
    const zoneMap = {}
    zones.forEach(z => { zoneMap[z.label.toUpperCase()] = z.id })

    if (hasZoneCol && inventoryId) {
      for (const label of fileZoneValues) {
        const upper = label.toUpperCase()
        if (!zoneMap[upper]) {
          const { data: nz } = await supabase.from('zones').insert({
            school_id: school.id,
            label: upper.slice(0, 4),
            description: `Imported zone ${label}`,
            inventory_id: inventoryId,
          }).select().single()
          if (nz) zoneMap[upper] = nz.id
        } else {
          // Zone already exists — link it to this inventory
          await supabase.from('zones').update({ inventory_id: inventoryId }).eq('id', zoneMap[upper])
        }
      }
    }

    let done = 0
    const errors = []
    let successCount = 0

    for (let i = 0; i < rawRows.length; i += BATCH_SIZE) {
      const batch = rawRows.slice(i, i + BATCH_SIZE)
      const toInsert = []

      for (let j = 0; j < batch.length; j++) {
        const mapped = applyMapping(batch[j], mapping)
        let zoneId = defaultZoneId || null
        if (hasZoneCol && mapped.zone) {
          zoneId = zoneMap[mapped.zone.toUpperCase()] || defaultZoneId || null
        }
        if (!zoneId) { errors.push(`Row ${i + j + 2}: no zone — skipped`); done++; continue }

        let lat = mapped.lat
        let lng = mapped.lng
        if ((lat === null || lat === undefined) && (lng === null || lng === undefined) && mapped.original_id) {
          const gpsEntry = gpsData[mapped.original_id]
          if (gpsEntry) { lat = gpsEntry.lat; lng = gpsEntry.lng }
        }

        toInsert.push({
          school_id: school.id,
          zone_id: zoneId,
          original_id: mapped.original_id,
          species_common: mapped.species_common,
          species_scientific: mapped.species_scientific,
          height_m: mapped.height_m,
          crown_ns_m: mapped.crown_ns_m,
          crown_ew_m: mapped.crown_ew_m,
          dbh_cm: mapped.trunk_diameter_cm,
          health_status: mapped.health_status,
          notes: mapped.notes,
          lat,
          lng,
          inaccessible: false,
          inventory_id: inventoryId,
        })
      }

      if (toInsert.length) {
        const { error } = await supabase.from('trees').insert(toInsert)
        if (error) errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`)
        else successCount += toInsert.length
      }
      done += batch.length
      setImportDone(done)
    }

    await supabase.from('schools')
      .update({ trees_count: (school.trees_count || 0) + successCount })
      .eq('id', school.id)

    setImportErrors(errors)
    setImportedCount(successCount)
    setStep('done')
  }

  // ── UPLOAD ──
  if (step === 'upload') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Upload Previous Inventory</h2>
        <p className="text-sm text-gray-500">Upload a CSV or Excel file with your existing tree data. You'll map your columns to our fields in the next step.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Inventory year *</label>
        <input type="number" min="1990" max={new Date().getFullYear()} value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="w-40 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
        <p className="text-xs text-gray-400 mt-1">The year this inventory was collected</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">File (CSV or Excel) *</label>
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl py-10 cursor-pointer hover:border-forest-400 hover:bg-forest-50 transition-colors"
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          onDragOver={e => e.preventDefault()}>
          <span className="text-4xl">{file ? '📊' : '📂'}</span>
          {file
            ? <span className="text-sm font-medium text-forest-700">{file.name}</span>
            : <><span className="text-sm text-gray-500">Drag your file here, or click to browse</span>
               <span className="text-xs text-gray-400">.csv · .xlsx · .xls</span></>}
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </label>
        {parseError && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2 mt-2">{parseError}</p>}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">About Tree IDs</p>
        <p>If your file has a tree ID column (a number or code you used to label each tree), map it in the next step. This will allow you to match photos to trees when uploading a ZIP file.</p>
      </div>

      {rawRows.length > 0 && (
        <div className="bg-forest-50 border border-forest-100 rounded-xl px-4 py-3 text-sm text-forest-700">
          ✓ {rawRows.length} rows · {headers.length} columns
        </div>
      )}

      <button onClick={() => setStep('map')} disabled={!rawRows.length}
        className="w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40">
        Next: Map Columns →
      </button>
    </div>
  )

  // ── MAP ──
  if (step === 'map') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Map Your Columns</h2>
        <p className="text-sm text-gray-500">Match your file's columns to our fields. We've tried to auto-detect them.</p>
      </div>

      <div className="space-y-3">
        {FIELDS.map(field => (
          <div key={field.key} className="flex items-center gap-3">
            <div className="w-44 shrink-0">
              <p className="text-sm font-medium text-gray-700">{field.label}</p>
            </div>
            <select value={mapping[field.key] || '__skip__'}
              onChange={e => setMapping(m => ({ ...m, [field.key]: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white">
              <option value="__skip__">— not in my file —</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        ))}
      </div>

      {!hasZoneCol && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">No zone column — assign a default zone</p>
          <select value={defaultZoneId} onChange={e => setDefaultZoneId(e.target.value)}
            className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400">
            <option value="">Select a zone…</option>
            {zones.map(z => <option key={z.id} value={z.id}>Zone {z.label}{z.category ? ` — ${z.category}` : ''}</option>)}
          </select>
          {zones.length === 0 && <p className="text-xs text-amber-700 mt-1">No zones yet — create one in the Zones tab first.</p>}
        </div>
      )}

      {hasZoneCol && fileZoneValues.length > 0 && (
        <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 text-sm">
          <p className="font-medium text-forest-700 mb-2">Zone values in file:</p>
          <div className="flex flex-wrap gap-2">
            {fileZoneValues.map(v => {
              const exists = zones.some(z => z.label.toUpperCase() === v.toUpperCase())
              return (
                <span key={v} className={`px-2 py-0.5 rounded-full text-xs font-medium ${exists ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {v} {exists ? '✓' : '(new)'}
                </span>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">New zones will be created automatically.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setStep('upload')}
          className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={() => setStep('preview')} disabled={!hasZoneCol && !defaultZoneId}
          className="flex-1 bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40">
          Preview →
        </button>
      </div>
    </div>
  )

  // ── PREVIEW ──
  if (step === 'preview') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Preview</h2>
        <p className="text-sm text-gray-500">First {Math.min(8, rawRows.length)} of {rawRows.length} rows — check the data looks right.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              {mappedFields.map(f => (
                <th key={f.key} className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {mappedFields.map(f => (
                  <td key={f.key} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {row[f.key] !== null && row[f.key] !== undefined
                      ? String(row[f.key])
                      : <span className="text-gray-300">—</span>}
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
        <button onClick={() => setStep('map')}
          className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={handleImport}
          className="flex-1 bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors">
          Import {rawRows.length} Trees
        </button>
      </div>
    </div>
  )

  // ── IMPORTING ──
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
          <div className="bg-forest-600 h-3 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400">Please don't close this tab</p>
      </div>
    )
  }

  // ── DONE ──
  return (
    <div className="space-y-6 text-center py-8">
      <div className="text-5xl">🎉</div>
      <div>
        <p className="font-bold text-forest-800 text-xl mb-1">Import complete!</p>
        <p className="text-sm text-gray-500">
          <strong className="text-forest-700">{importedCount} trees</strong> added to inventory {year}.
        </p>
        {importErrors.length > 0 && <p className="text-xs text-amber-600 mt-1">{importErrors.length} rows skipped.</p>}
      </div>
      {importErrors.length > 0 && (
        <details className="text-left bg-amber-50 border border-amber-100 rounded-xl p-4">
          <summary className="text-sm font-medium text-amber-700 cursor-pointer">View skipped rows ({importErrors.length})</summary>
          <ul className="mt-2 space-y-1">
            {importErrors.map((e, i) => <li key={i} className="text-xs text-amber-600">{e}</li>)}
          </ul>
        </details>
      )}
      <button onClick={onImportDone}
        className="w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors">
        Go to Dashboard
      </button>
    </div>
  )
}
