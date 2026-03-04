import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

let cachedPaths = null

let cachedProjection = null

async function getProjection() {
  if (!cachedProjection) {
    const { geoNaturalEarth1 } = await import('d3-geo')
    cachedProjection = geoNaturalEarth1()
      .scale(153)
      .translate([480, 250])
      .clipExtent([[0, 0], [960, 500]])
  }
  return cachedProjection
}

export async function GET(request) {
  try {
    const projection = await getProjection()

    // Build country paths (cached after first load)
    if (!cachedPaths) {
      const { feature } = await import('topojson-client')
      const { geoPath } = await import('d3-geo')
      const world = JSON.parse(
        readFileSync(join(process.cwd(), 'public', 'world-110m.json'), 'utf-8')
      )
      const countries = feature(world, world.objects.countries)
      const pathGen = geoPath().projection(projection)
      cachedPaths = countries.features
        .map((f, i) => ({ id: i, d: pathGen(f) || '' }))
        .filter(p => p.d)
    }

    // Project any school coordinates passed as query param
    const { searchParams } = new URL(request.url)
    const raw = searchParams.get('schools')
    let markers = []
    if (raw) {
      const schools = JSON.parse(raw)
      markers = schools.map(s => {
        const [x, y] = projection(s.coordinates)
        return { ...s, x, y }
      })
    }

    return NextResponse.json({ paths: cachedPaths, markers })
  } catch (err) {
    console.error('WorldMap API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
