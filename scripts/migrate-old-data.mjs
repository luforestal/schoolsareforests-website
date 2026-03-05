/**
 * Migration script — imports tree data from the old GitHub Pages system into Supabase.
 *
 * Run:
 *   node scripts/migrate-old-data.mjs
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   ← get this from Supabase → Settings → API
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Load env from .env.local ──────────────────────────────────────────────────
const env = {}
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('Could not read .env.local — make sure you run this from the project root.')
  process.exit(1)
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── School definitions ────────────────────────────────────────────────────────
const PHOTO_BASE = 'https://luforestal.github.io/SchoolTreeMap/'

const SCHOOLS = [
  {
    id: 'wildav',
    name: 'Robert E. Willett Elementary',
    location: 'Davis, CA, USA',
    country: 'USA',
    region: 'California',
    address: '1207 Sycamore Ln, Davis, CA 95616',
    logo_url: `${PHOTO_BASE}logos/wildav.png`,
    csvUrl: 'https://raw.githubusercontent.com/luforestal/SchoolTreeMap/main/public/trees/wildav.csv',
  },
  {
    id: 'coocol',
    name: 'Cooley Ranch Elementary',
    location: 'Colton, CA, USA',
    country: 'USA',
    region: 'California',
    address: '1000 S Cooley Dr E, Colton, CA 92324',
    logo_url: `${PHOTO_BASE}logos/coocol.png`,
    csvUrl: 'https://raw.githubusercontent.com/luforestal/SchoolTreeMap/main/public/trees/coocol.csv',
  },
  {
    id: 'rutcol',
    name: 'Ruth Grimes Elementary',
    location: 'Bloomington, CA, USA',
    country: 'USA',
    region: 'California',
    address: '1609 Spruce Ave, Bloomington, CA 92316',
    logo_url: `${PHOTO_BASE}logos/rutcol.png`,
    csvUrl: 'https://raw.githubusercontent.com/luforestal/SchoolTreeMap/main/public/trees/rutcol.csv',
  },
]

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('🌳 Starting migration...\n')

  for (const school of SCHOOLS) {
    console.log(`━━━ ${school.name} (${school.id}) ━━━`)

    // 1. Upsert school
    const { error: schoolErr } = await supabase.from('schools').upsert({
      id: school.id,
      name: school.name,
      location: school.location,
      country: school.country,
      region: school.region,
      address: school.address,
      logo_url: school.logo_url,
    }, { onConflict: 'id' })

    if (schoolErr) {
      console.error(`  ✗ School insert failed:`, schoolErr.message)
      continue
    }
    console.log(`  ✓ School upserted`)

    // 2. Fetch CSV
    const res = await fetch(school.csvUrl)
    if (!res.ok) {
      console.error(`  ✗ Could not fetch CSV: ${res.status}`)
      continue
    }
    const trees = parseCSV(await res.text())
    console.log(`  ✓ ${trees.length} trees in CSV`)

    // 3. Create zones from unique first letters of treecode
    const zoneLetters = [...new Set(trees.map(t => (t.treecode || t.TreeCode || '')[0]?.toUpperCase()).filter(Boolean))].sort()
    const zoneMap = {}

    for (const letter of zoneLetters) {
      const { data: existing } = await supabase
        .from('zones').select('id').eq('school_id', school.id).eq('label', letter).maybeSingle()

      if (existing) {
        zoneMap[letter] = existing.id
      } else {
        const { data: newZone, error: zoneErr } = await supabase
          .from('zones')
          .insert({ school_id: school.id, label: letter, completed: true })
          .select('id').single()

        if (zoneErr) {
          console.error(`  ✗ Zone ${letter} failed:`, zoneErr.message)
          continue
        }
        zoneMap[letter] = newZone.id
      }
    }
    console.log(`  ✓ Zones ready: ${zoneLetters.join(', ')}`)

    // 4. Insert trees + stems
    let inserted = 0, skipped = 0

    for (const t of trees) {
      const code = (t.treecode || t.TreeCode || '').trim()
      if (!code) { skipped++; continue }

      const zoneLabel = code[0].toUpperCase()
      const zoneId = zoneMap[zoneLabel]
      if (!zoneId) { skipped++; continue }

      const genus = (t.genus || t.Genus || '').trim()
      const species = (t.species || t.Species || '').trim()
      const scientificName = [genus, species].filter(Boolean).join(' ') || null
      const photoPath = (t.photoPath || t.PhotoPath || '').trim()
      const photoUrl = photoPath ? `${PHOTO_BASE}${photoPath}` : null

      const { data: treeData, error: treeErr } = await supabase
        .from('trees')
        .insert({
          school_id: school.id,
          zone_id: zoneId,
          species_common: genus || null,
          species_scientific: scientificName,
          height_m: t.height ? parseFloat(t.height) : null,
          crown_ns_m: t.crownNSm ? parseFloat(t.crownNSm) : null,
          crown_ew_m: t.crownEWm ? parseFloat(t.crownEWm) : null,
          lat: t.lat ? parseFloat(t.lat) : null,
          lng: t.lon ? parseFloat(t.lon) : null,
          photo_url: photoUrl,
          inaccessible: false,
          needs_identification: false,
          recorded_by: 'migration',
        })
        .select('id').single()

      if (treeErr) {
        console.error(`  ✗ Tree ${code}:`, treeErr.message)
        skipped++
        continue
      }

      // Insert stem (DBH)
      if (t.dbh && parseFloat(t.dbh) > 0 && treeData) {
        await supabase.from('tree_stems').insert({
          tree_id: treeData.id,
          stem_number: 1,
          diameter_cm: parseFloat(t.dbh),
          measurement_height_m: 1.3,
        })
      }

      inserted++
    }

    console.log(`  ✓ ${inserted} trees inserted${skipped ? `, ${skipped} skipped` : ''}\n`)
  }

  console.log('✅ Migration complete!')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
