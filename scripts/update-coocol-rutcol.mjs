/**
 * Re-migration script for Cooley Ranch (coocol) and Ruth Grimes (rutcol).
 * Merges updated Excel data (health, common name, height, LCB) with
 * coordinates from the old GitHub Pages CSVs.
 *
 * Run from project root:
 *   node scripts/update-coocol-rutcol.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

// ── Load .env.local ────────────────────────────────────────────────────────────
const env = {}
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('Could not read .env.local')
  process.exit(1)
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

const PHOTO_BASE = 'https://luforestal.github.io/SchoolTreeMap/'

// ── Helpers ────────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

function normaliseHealth(raw) {
  if (!raw) return null
  const v = raw.toString().trim().toLowerCase()
  if (v === 'good') return 'good'
  if (v === 'fair') return 'fair'
  if (v === 'poor') return 'poor'
  return null
}

// Build treecode key from zone letter + tree number, e.g. "A" + 1 → "A01"
function makeCode(zone, num) {
  return zone.toString().trim().toUpperCase() + String(num).padStart(2, '0')
}

// ── School definitions ─────────────────────────────────────────────────────────
const SCHOOLS = [
  {
    id: 'coocol',
    excelPath: 'C:/Users/lfvqz/Box/Microclimate_CAL/Colton/Cooley_Ranch/Inventory/Cooley Ranch Tree Data.xlsx',
    csvUrl: 'https://raw.githubusercontent.com/luforestal/SchoolTreeMap/main/public/trees/coocol.csv',
    commonNameCol: 'Common name',
    healthCol: 'Health Status',
    treeCodePreformatted: false,
  },
  {
    id: 'rutcol',
    excelPath: 'C:/Users/lfvqz/Box/Microclimate_CAL/Colton/Ruth_Grimes/Inventory/Ruth_Grimmes.xlsx',
    csvUrl: 'https://raw.githubusercontent.com/luforestal/SchoolTreeMap/main/public/trees/rutcol.csv',
    commonNameCol: 'common name ',   // trailing space in this file
    healthCol: 'CrownVigor',
    treeCodePreformatted: false,
  },
  {
    id: 'wildav',
    excelPath: 'C:/Users/lfvqz/Box/Microclimate_CAL/Willet/Tree Inventory/WilletTreeInventory.xlsx',
    csvUrl: 'https://raw.githubusercontent.com/luforestal/SchoolTreeMap/main/public/trees/wildav.csv',
    commonNameCol: null,             // no common name column
    healthCol: 'CrownVigor',
    treeCodePreformatted: true,      // TreeCode already = "A01"
  },
]

// ── Main ───────────────────────────────────────────────────────────────────────
async function processSchool(school) {
  console.log(`\n━━━ ${school.id} ━━━`)

  // 1. Read Excel
  const wb = XLSX.readFile(school.excelPath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const excelRows = XLSX.utils.sheet_to_json(ws)
  console.log(`  Excel rows: ${excelRows.length}`)

  // 2. Fetch old CSV for coords + photo paths
  const csvRes = await fetch(school.csvUrl)
  if (!csvRes.ok) {
    console.error(`  ✗ Could not fetch old CSV: ${csvRes.status}`)
    return
  }
  const csvRows = parseCSV(await csvRes.text())
  // Index old CSV by treecode
  const csvByCode = {}
  csvRows.forEach(r => {
    const code = (r.treecode || r.TreeCode || '').trim().toUpperCase()
    if (code) csvByCode[code] = r
  })
  console.log(`  Old CSV rows: ${csvRows.length}`)

  // 3. Get existing zones for this school
  const { data: zones } = await supabase
    .from('zones').select('id, label').eq('school_id', school.id).order('label')
  const zoneMap = Object.fromEntries((zones || []).map(z => [z.label.toUpperCase(), z.id]))
  console.log(`  Zones: ${Object.keys(zoneMap).join(', ')}`)

  // 4. Delete existing trees (stems cascade via FK or we delete manually)
  const { data: existingTrees } = await supabase
    .from('trees').select('id').eq('school_id', school.id)
  if (existingTrees?.length) {
    const ids = existingTrees.map(t => t.id)
    await supabase.from('tree_stems').delete().in('tree_id', ids)
    await supabase.from('trees').delete().eq('school_id', school.id)
    console.log(`  Deleted ${ids.length} old trees + their stems`)
  }

  // 5. Re-insert from Excel + old CSV
  let inserted = 0, skipped = 0, noCoords = 0

  for (const row of excelRows) {
    const zone = (row['Zone'] || '').toString().trim().toUpperCase()
    const treeNum = row['TreeCode']
    if (!zone || treeNum == null) { skipped++; continue }

    const treeCode = school.treeCodePreformatted
      ? treeNum.toString().trim().toUpperCase()
      : makeCode(zone, treeNum)
    const zoneId = zoneMap[zone]
    if (!zoneId) {
      console.warn(`  ⚠ No zone found for "${zone}" — skipping ${treeCode}`)
      skipped++; continue
    }

    // Merge coords + photo from old CSV
    const oldRow = csvByCode[treeCode]
    const lat = oldRow?.lat ? parseFloat(oldRow.lat) : null
    const lng = oldRow?.lon ? parseFloat(oldRow.lon) : null
    const photoPath = oldRow?.photoPath?.trim()
    const photoUrl = photoPath ? `${PHOTO_BASE}${photoPath}` : null
    if (!lat && !lng) noCoords++

    // Species
    const genus = (row['Genus'] || '').trim()
    const species = (row['Species'] || '').trim()
    const scientificName = [genus, species].filter(Boolean).join(' ') || null
    const commonName = school.commonNameCol
      ? (row[school.commonNameCol] || '').trim() || genus || null
      : genus || null

    // Measurements
    const dbh = row['DBH1cm'] ? parseFloat(row['DBH1cm']) : null
    const dbhHt = row['DBH1Htcm'] ? parseFloat(row['DBH1Htcm']) / 100 : 1.3 // convert cm → m
    const crownNS = row['CrownNSm'] ? parseFloat(row['CrownNSm']) : null
    const crownEW = row['CrownEWm'] ? parseFloat(row['CrownEWm']) : null
    const height = row['Heightm'] ? parseFloat(row['Heightm']) : null
    const lcb = row['LiveCrownBottomm'] ? parseFloat(row['LiveCrownBottomm']) : null
    const health = normaliseHealth(row[school.healthCol])

    // Insert tree
    const { data: treeData, error: treeErr } = await supabase
      .from('trees')
      .insert({
        school_id: school.id,
        zone_id: zoneId,
        tree_code: treeCode,
        species_common: commonName,
        species_scientific: scientificName,
        height_m: height,
        live_crown_bottom_m: lcb,
        crown_ns_m: crownNS,
        crown_ew_m: crownEW,
        lat,
        lng,
        photo_url: photoUrl,
        health_status: health,
        inaccessible: false,
        needs_identification: false,
        recorded_by: 'University of California Davis',
      })
      .select('id').single()

    if (treeErr) {
      console.error(`  ✗ Tree ${treeCode}:`, treeErr.message)
      skipped++; continue
    }

    // Insert stem
    if (dbh && dbh > 0 && treeData) {
      await supabase.from('tree_stems').insert({
        tree_id: treeData.id,
        stem_number: 1,
        diameter_cm: dbh,
        measurement_height_m: dbhHt,
      })
    }

    inserted++
  }

  console.log(`  ✓ ${inserted} trees inserted${skipped ? `, ${skipped} skipped` : ''}${noCoords ? `, ${noCoords} without coords` : ''}`)
}

async function run() {
  const target = process.argv[2] // optional: node script.mjs wildav
  const toRun = target ? SCHOOLS.filter(s => s.id === target) : SCHOOLS
  if (toRun.length === 0) { console.error('School not found:', target); process.exit(1) }
  console.log('🌳 Starting update migration...')
  for (const school of toRun) {
    await processSchool(school)
  }
  console.log('\n✅ Done!')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
