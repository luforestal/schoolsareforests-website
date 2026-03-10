'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { schools as staticSchools } from '@/data/schools'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'

const FOREST_PALETTE = ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7']

const TILE_LAYERS = {
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
  },
  streets: {
    label: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
  },
  light: {
    label: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB',
  },
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SchoolsViewer() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-forest-400">Loading…</div>}>
      <SchoolsViewerInner />
    </Suspense>
  )
}

function SchoolsViewerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mapDivRef = useRef(null)
  const leafletRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const treeMarkersRef = useRef([])
  const schoolMarkerRef = useRef(null) // individual marker for selected school

  const [schools, setSchools] = useState([])
  const [countries, setCountries] = useState([])
  const [regions, setRegions] = useState([])
  const [filterCountry, setFilterCountry] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [filterName, setFilterName] = useState('')
  const [loadingSchools, setLoadingSchools] = useState(true)

  const [selectedSchool, setSelectedSchool] = useState(null)
  const [trees, setTrees] = useState([])
  const [zones, setZones] = useState([])
  const [loadingTrees, setLoadingTrees] = useState(false)

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTree, setSelectedTree] = useState(null)
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0)
  const [filterSpecies, setFilterSpecies] = useState(null)
  const [filterHeightBin, setFilterHeightBin] = useState(null)
  const [filterHealth, setFilterHealth] = useState(null)
  const [filterDiamBin, setFilterDiamBin] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [leftOpen, setLeftOpen] = useState(true)
  const [baseMap, setBaseMap] = useState('satellite')
  const tileLayerRef = useRef(null)

  // ── Load schools ─────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('schools').select('*').eq('published', true).order('name').then(({ data }) => {
        const enriched = (data || []).map(s => {
        const st = staticSchools.find(ss => ss.id === s.id)
        return { ...s, coordinates: st?.coordinates || null }
      })
      setSchools(enriched)
      const cs = [...new Set(enriched.map(s => s.country).filter(Boolean))].sort()
      setCountries(cs)
      setLoadingSchools(false)
    })
  }, [])

  // ── Update region list when country changes ──────────────────────────────────
  useEffect(() => {
    const rs = [...new Set(
      schools
        .filter(s => !filterCountry || s.country === filterCountry)
        .map(s => s.region)
        .filter(Boolean)
    )].sort()
    setRegions(rs)
    setFilterRegion('')
  }, [filterCountry, schools])

  // ── Init Leaflet ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !mapDivRef.current) return
    let destroyed = false

    const init = async () => {
      if (!document.querySelector('link[href*="leaflet@1.9"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      const L = (await import('leaflet')).default
      if (destroyed || mapRef.current || !mapDivRef.current) return
      leafletRef.current = L

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapDivRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
      })
      const tile = L.tileLayer(TILE_LAYERS.satellite.url, { attribution: TILE_LAYERS.satellite.attribution, maxZoom: 19 })
      tile.addTo(map)
      tileLayerRef.current = tile
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      mapRef.current = map
    }

    init()
    return () => {
      destroyed = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  // ── Tree markers + school centroid ───────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return
    const L = leafletRef.current

    // Clear old tree markers
    treeMarkersRef.current.forEach(m => m.remove())
    treeMarkersRef.current = []

    // Clear old school detail marker
    if (schoolMarkerRef.current) { schoolMarkerRef.current.remove(); schoolMarkerRef.current = null }

    const treesWithCoords = trees.filter(t => t.lat && t.lng)

    // Hide school 🌳 markers when zoomed into a school, show them when no trees loaded
    markersRef.current.forEach(m => {
      if (treesWithCoords.length > 0) m.remove()
      else m.addTo(mapRef.current)
    })

    if (treesWithCoords.length === 0) return

    // Compute centroid
    const avgLat = treesWithCoords.reduce((s, t) => s + t.lat, 0) / treesWithCoords.length
    const avgLng = treesWithCoords.reduce((s, t) => s + t.lng, 0) / treesWithCoords.length

    // Fly to centroid with padding to show all trees
    const bounds = L.latLngBounds(treesWithCoords.map(t => [t.lat, t.lng]))
    mapRef.current.flyToBounds(bounds, { padding: [40, 40], maxZoom: 18, duration: 1.2 })


    // Tree crown circles
    treesWithCoords.forEach(tree => {
      const crownRadius = (((tree.crown_ns_m || 0) + (tree.crown_ew_m || 0)) / 4) || 3

      const fillColor = tree.health_status === 'good' ? '#4ade80'
        : tree.health_status === 'fair' ? '#facc15'
        : tree.health_status === 'poor' ? '#f87171'
        : '#52b788'

      const circle = L.circle([tree.lat, tree.lng], {
        radius: crownRadius,
        fillColor,
        fillOpacity: 0.4,
        color: fillColor,
        weight: 1.5,
        opacity: 0.9,
      }).addTo(mapRef.current)

      const sp = tree.species_common || tree.species_scientific || 'Unknown'
      circle.bindTooltip(
        `<strong>${sp}</strong>${tree.health_status ? `<br>● ${tree.health_status}` : ''}<br>Crown ~${(crownRadius * 2).toFixed(1)}m`,
        { direction: 'top' }
      )
      circle.on('click', () => { setSelectedTree(tree); setSelectedPhotoIdx(0); setActiveTab('trees'); setPanelOpen(true) })
      treeMarkersRef.current.push(circle)

      // Small diamond at centroid
      const diamond = L.divIcon({
        html: `<div style="width:8px;height:8px;background:#1b4332;transform:rotate(45deg);border:1.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.6)"></div>`,
        className: '',
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      })
      const pin = L.marker([tree.lat, tree.lng], { icon: diamond, zIndexOffset: 500 }).addTo(mapRef.current)
      pin.on('click', () => { setSelectedTree(tree); setSelectedPhotoIdx(0); setActiveTab('trees'); setPanelOpen(true) })
      treeMarkersRef.current.push(pin)
    })
  }, [trees])

  // ── Swap base map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || !tileLayerRef.current) return
    const L = leafletRef.current
    tileLayerRef.current.remove()
    const cfg = TILE_LAYERS[baseMap]
    const tile = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 })
    tile.addTo(mapRef.current)
    tileLayerRef.current = tile
  }, [baseMap])

  // ── Update markers ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || schools.length === 0) return
    const L = leafletRef.current

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    schools.forEach(school => {
      if (!school.coordinates) return
      const [lng, lat] = school.coordinates

      const icon = L.divIcon({
        html: `<div style="font-size:22px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5));cursor:pointer;transition:transform 0.15s" title="${school.name}">🌳</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current)
      marker.bindTooltip(`<strong>${school.name}</strong><br><span style="color:#666;font-size:11px">${school.location || ''}</span>`, {
        direction: 'top',
        offset: [0, -30],
      })
      marker.on('click', () => handleSelectSchool(school))
      markersRef.current.push(marker)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools])

  // ── Restore school from URL ───────────────────────────────────────────────────
  useEffect(() => {
    if (schools.length === 0) return
    const schoolId = searchParams.get('school')
    if (schoolId && !selectedSchool) {
      const school = schools.find(s => s.id === schoolId)
      if (school) handleSelectSchool(school)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools])

  // ── Select school ─────────────────────────────────────────────────────────────
  const handleSelectSchool = async (school) => {
    router.replace(`/schools?school=${school.id}`, { scroll: false })
    setSelectedSchool(school)
    setActiveTab('overview')
    setFilterSpecies(null)
    setFilterHeightBin(null)
    setFilterHealth(null)
    setFilterDiamBin(null)
    setSelectedTree(null)
    setPanelOpen(true)
    setLoadingTrees(true)

    const [{ data: treesData }, { data: zonesData }] = await Promise.all([
      supabase.from('trees').select('*, tree_stems(*), tree_photos(*)').eq('school_id', school.id),
      supabase.from('zones').select('*').eq('school_id', school.id).order('label'),
    ])
    setTrees(treesData || [])
    setZones(zonesData || [])
    setLoadingTrees(false)
  }

  // ── Invalidate map size when panel opens/closes ───────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    setTimeout(() => mapRef.current?.invalidateSize(), 320)
  }, [panelOpen])

  // ── Filtered school list ──────────────────────────────────────────────────────
  const filteredSchools = schools.filter(s =>
    (!filterCountry || s.country === filterCountry) &&
    (!filterRegion || s.region === filterRegion) &&
    (!filterName || s.name.toLowerCase().includes(filterName.toLowerCase()))
  )

  // ── Chart data ────────────────────────────────────────────────────────────────
  const accessible = trees.filter(t => !t.inaccessible)

  const speciesData = Object.entries(
    accessible.reduce((acc, t) => {
      const sp = t.species_common || 'Unknown'
      acc[sp] = (acc[sp] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, count]) => ({ name, count }))

  // Cascading filters: species → height → health → diameter
  const forBySpecies = filterSpecies ? accessible.filter(t => t.species_common === filterSpecies) : accessible
  const forByHeight  = filterHeightBin ? forBySpecies.filter(t => t.height_m != null && t.height_m >= filterHeightBin.min && t.height_m < filterHeightBin.max) : forBySpecies
  const forByHealth  = filterHealth ? forByHeight.filter(t => t.health_status === filterHealth) : forByHeight
  const forByDiam    = filterDiamBin ? forByHealth.filter(t => (t.tree_stems || []).some(s => s.diameter_cm != null && s.diameter_cm >= filterDiamBin.min && s.diameter_cm < filterDiamBin.max)) : forByHealth

  const mkHist = (values, buckets, fmt) =>
    buckets.slice(0, -1).map((min, i) => ({
      name: fmt(min, buckets[i + 1]),
      min,
      max: buckets[i + 1],
      count: values.filter(v => v != null && v >= min && v < buckets[i + 1]).length,
    })).filter(d => d.count > 0)

  // Each chart responds to filters above it, shows its own distribution unfiltered by itself
  const heightData = mkHist(forBySpecies.map(t => t.height_m), [0, 2, 4, 6, 8, 10, 15, 20, 30], (a, b) => `${a}–${b}m`)
  const healthData = [
    { name: 'Good', value: forByHeight.filter(t => t.health_status === 'good').length, color: '#4ade80' },
    { name: 'Fair', value: forByHeight.filter(t => t.health_status === 'fair').length, color: '#facc15' },
    { name: 'Poor', value: forByHeight.filter(t => t.health_status === 'poor').length, color: '#f87171' },
  ].filter(d => d.value > 0)
  const diamData = mkHist(
    forByHealth.flatMap(t => (t.tree_stems || []).map(s => s.diameter_cm)).filter(Boolean),
    [0, 5, 10, 20, 30, 50, 75, 100],
    (a, b) => `${a}–${b}cm`
  )

  return (
    <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Map (base layer, fills everything) ── */}
      <div ref={mapDivRef} className="absolute inset-0" />

      {/* ── Left panel (floating, collapsible) ── */}
      <div className="absolute top-3 left-3 bottom-3 z-[500] flex flex-col" style={{ width: leftOpen ? '15rem' : 'auto' }}>
        {leftOpen ? (
          <div className="flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden h-full">
            <div className="p-4 bg-forest-50 border-b border-forest-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-bold text-forest-800 text-base">Explore Schools</h1>
                <button
                  onClick={() => setLeftOpen(false)}
                  className="text-gray-400 hover:text-gray-700 leading-none text-lg"
                  title="Hide panel"
                >✕</button>
              </div>

              <select
                value={filterCountry}
                onChange={e => setFilterCountry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 mb-2"
              >
                <option value="">All countries</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {regions.length > 0 && (
                <select
                  value={filterRegion}
                  onChange={e => setFilterRegion(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 mb-2"
                >
                  <option value="">All regions</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}

              <input
                type="text"
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
                placeholder="Search school…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingSchools ? (
                <div className="text-center text-gray-400 text-sm py-8">Loading…</div>
              ) : filteredSchools.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">No schools found</div>
              ) : filteredSchools.map(school => (
                <button
                  key={school.id}
                  onClick={() => handleSelectSchool(school)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-forest-50 transition-colors flex items-center gap-3 ${selectedSchool?.id === school.id ? 'bg-forest-50 border-l-[3px] border-l-forest-600' : ''}`}
                >
                  {school.logo_url
                    ? <img src={school.logo_url} alt="" className="h-9 w-9 object-contain rounded-lg bg-gray-50 flex-shrink-0" />
                    : <div className="h-9 w-9 rounded-lg bg-forest-100 flex items-center justify-center flex-shrink-0 text-base">🏫</div>
                  }
                  <div className="min-w-0">
                    <p className="font-medium text-forest-800 text-sm truncate">{school.name}</p>
                    <p className="text-xs text-gray-400 truncate">{school.region ? `${school.region} · ` : ''}{school.country}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLeftOpen(true)}
            className="bg-white rounded-xl shadow-lg w-10 h-10 flex items-center justify-center text-forest-700 hover:bg-forest-50 transition-colors text-lg"
            title="Show schools"
          >
            ☰
          </button>
        )}
      </div>

      {/* ── Base map switcher (top center) ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-1">
        {Object.entries(TILE_LAYERS).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setBaseMap(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${baseMap === key ? 'bg-forest-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Hint when no school selected */}
      {!panelOpen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg px-5 py-3 text-sm text-forest-700 font-medium pointer-events-none">
          🌳 Click a tree marker or select a school to explore
        </div>
      )}

      {/* ── Right panel (floating, slides in/out) ── */}
      <div className={`absolute top-3 right-3 bottom-3 z-[500] w-96 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${panelOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        {selectedSchool && (
          <>
            {/* School header */}
            <div className="bg-forest-800 text-white px-5 py-4 flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedSchool.logo_url
                    ? <img src={selectedSchool.logo_url} alt="" className="h-10 w-10 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0" />
                    : <div className="h-10 w-10 rounded-lg bg-forest-700 flex items-center justify-center flex-shrink-0 text-lg">🏫</div>
                  }
                  <div className="min-w-0">
                    <h2 className="font-bold text-base leading-tight truncate">{selectedSchool.name}</h2>
                    <p className="text-forest-300 text-xs truncate">
                      {[selectedSchool.region, selectedSchool.country].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setPanelOpen(false); setSelectedSchool(null); router.replace('/schools', { scroll: false }) }}
                  className="text-forest-400 hover:text-white text-xl leading-none flex-shrink-0 mt-0.5"
                >
                  ×
                </button>
              </div>
              {!loadingTrees && (
                <div className="flex gap-4 mt-3">
                  {[
                    { v: accessible.length, l: 'trees' },
                    { v: zones.length, l: 'zones' },
                    { v: new Set(accessible.map(t => t.species_common).filter(Boolean)).size, l: 'species' },
                  ].map(s => (
                    <div key={s.l} className="text-center">
                      <p className="text-xl font-bold">{s.v}</p>
                      <p className="text-forest-300 text-xs">{s.l}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-5 flex gap-5 flex-shrink-0">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'trees', label: 'Trees' },
                { id: 'charts', label: 'Charts' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-forest-600 text-forest-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {loadingTrees ? (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2 animate-pulse">🌳</div>
                    <p className="text-sm">Loading…</p>
                  </div>
                </div>
              ) : activeTab === 'overview' ? (
                <OverviewTab accessible={accessible} trees={trees} zones={zones} speciesData={speciesData} />
              ) : activeTab === 'trees' ? (
                <TreesTab trees={trees} zones={zones} selectedTree={selectedTree} onSelect={(t) => { setSelectedTree(t); setSelectedPhotoIdx(0) }} selectedPhotoIdx={selectedPhotoIdx} setSelectedPhotoIdx={setSelectedPhotoIdx} />
              ) : (
                <ChartsTab
                  speciesData={speciesData}
                  healthData={healthData}
                  heightData={heightData}
                  diamData={diamData}
                  filterSpecies={filterSpecies}
                  onSpeciesClick={sp => setFilterSpecies(filterSpecies === sp ? null : sp)}
                  filterHeightBin={filterHeightBin}
                  onHeightClick={bin => setFilterHeightBin(filterHeightBin?.name === bin.name ? null : bin)}
                  filterHealth={filterHealth}
                  onHealthClick={h => setFilterHealth(filterHealth === h ? null : h)}
                  filterDiamBin={filterDiamBin}
                  onDiamClick={bin => setFilterDiamBin(filterDiamBin?.name === bin.name ? null : bin)}
                />
              )}
            </div>
          </>
        )}
      </div>

    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ accessible, trees, zones, speciesData }) {
  const inaccessible = trees.filter(t => t.inaccessible).length
  const needsId = accessible.filter(t => t.needs_identification).length
  const goodPct = accessible.length
    ? Math.round(accessible.filter(t => t.health_status === 'good').length / accessible.length * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Trees', value: accessible.length, icon: '🌳' },
          { label: 'Zones', value: zones.length, icon: '🗺️' },
          { label: 'Species', value: new Set(accessible.map(t => t.species_common).filter(Boolean)).size, icon: '🌿' },
          { label: 'Good health', value: `${goodPct}%`, icon: '💚' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
            <div className="text-xl mb-0.5">{s.icon}</div>
            <div className="text-xl font-bold text-forest-700">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {inaccessible > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
          ⚠️ {inaccessible} tree{inaccessible > 1 ? 's' : ''} inaccessible
        </div>
      )}
      {needsId > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700">
          ❓ {needsId} tree{needsId > 1 ? 's' : ''} pending ID
        </div>
      )}

      {/* Top species */}
      {speciesData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-forest-800 text-sm mb-3">Top Species</h3>
          <div className="space-y-2">
            {speciesData.slice(0, 6).map((sp, i) => (
              <div key={sp.name} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-300 w-3">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-forest-800 truncate">{sp.name}</span>
                    <span className="text-xs text-gray-400 ml-1">{sp.count}</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-forest-500 rounded-full" style={{ width: `${(sp.count / speciesData[0].count) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zones */}
      {zones.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-forest-800 text-sm mb-3">Zones</h3>
          <div className="grid grid-cols-4 gap-2">
            {zones.map(z => (
              <div key={z.id} className={`rounded-lg p-2 text-center border ${z.completed ? 'bg-forest-50 border-forest-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="w-7 h-7 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-xs mx-auto mb-0.5">{z.label}</div>
                {z.completed && <p className="text-xs text-forest-500">✓</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Browse Trees tab ─────────────────────────────────────────────────────────

function TreesTab({ trees, zones, selectedTree, onSelect, selectedPhotoIdx = 0, setSelectedPhotoIdx = () => {} }) {
  const [search, setSearch] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [filterHealth, setFilterHealth] = useState('')

  const zoneMap = Object.fromEntries(zones.map(z => [z.id, z]))

  // Detail view
  if (selectedTree) {
    const tree = selectedTree
    const allPhotos = [
      tree.photo_url && { url: tree.photo_url, label: 'Full tree' },
      ...(tree.tree_photos || []).map((p, i) => ({
        url: p.photo_url,
        label: ['Bark / trunk', 'Leaves / detail'][i] || `Photo ${i + 2}`,
      })),
    ].filter(Boolean)
    const stems = tree.tree_stems || []
    const health = tree.health_status

    return (
      <div>
        <button
          onClick={() => onSelect(null)}
          className="flex items-center gap-1 text-forest-600 text-sm font-medium mb-4 hover:text-forest-800"
        >
          ← Back to list
        </button>

        {/* Photo gallery */}
        {allPhotos.length > 0 && (
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={allPhotos[selectedPhotoIdx].url} alt={allPhotos[selectedPhotoIdx].label}
              className="w-full h-72 object-contain bg-forest-50 rounded-xl shadow-sm mb-2" />
            {allPhotos.length > 1 && (
              <div className="flex gap-2">
                {allPhotos.map((p, i) => (
                  <button key={i} onClick={() => setSelectedPhotoIdx(i)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === selectedPhotoIdx ? 'border-forest-600 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.label} className="h-16 w-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Species */}
        <div className="mb-3">
          <h3 className="font-bold text-forest-800 text-lg leading-tight">
            {tree.species_common || (tree.needs_identification ? 'Unidentified Tree' : '—')}
          </h3>
          {tree.species_scientific && (
            <p className="text-sm italic text-gray-400">{tree.species_scientific}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {health && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${health === 'good' ? 'bg-green-100 text-green-700' : health === 'fair' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {health === 'good' ? '🟢 Good' : health === 'fair' ? '🟡 Fair' : '🔴 Poor'}
            </span>
          )}
          {zoneMap[tree.zone_id] && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-forest-50 text-forest-700">
              Zone {zoneMap[tree.zone_id].label}
            </span>
          )}
          {tree.needs_identification && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">❓ Needs ID</span>
          )}
        </div>

        {/* Measurements */}
        {!tree.inaccessible && (
          <div className="bg-forest-50 rounded-xl p-4 grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Height', value: tree.height_m ? `${tree.height_m} m` : null },
              { label: 'Crown N–S', value: tree.crown_ns_m ? `${tree.crown_ns_m} m` : null },
              { label: 'Crown W–E', value: tree.crown_ew_m ? `${tree.crown_ew_m} m` : null },
              ...stems.map(s => ({
                label: tree.is_multistem ? `Stem ${s.stem_number} ⌀` : 'Diameter (DBH)',
                value: s.diameter_cm ? `${s.diameter_cm} cm` : null,
              })),
            ].filter(r => r.value).map(row => (
              <div key={row.label}>
                <p className="text-xs text-gray-400">{row.label}</p>
                <p className="font-semibold text-forest-800 text-sm">{row.value}</p>
              </div>
            ))}
          </div>
        )}

        {tree.inaccessible && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="font-semibold text-amber-700 text-sm">⚠️ Reported as inaccessible</p>
            {tree.inaccessible_note && <p className="text-amber-600 text-xs mt-1">{tree.inaccessible_note}</p>}
          </div>
        )}

        {tree.recorded_by && (
          <p className="text-xs text-gray-400">Recorded by <span className="font-medium text-gray-600">{tree.recorded_by}</span></p>
        )}
        {tree.lat && tree.lng && (
          <p className="text-xs text-gray-300 font-mono mt-1">{tree.lat.toFixed(5)}, {tree.lng.toFixed(5)}</p>
        )}
      </div>
    )
  }

  // Grid view
  const visible = trees.filter(t => {
    if (t.inaccessible) return false
    if (filterZone && t.zone_id !== filterZone) return false
    if (filterHealth && t.health_status !== filterHealth) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(t.species_common || '').toLowerCase().includes(q) &&
          !(t.species_scientific || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div>
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search species…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
        />
        <div className="flex gap-2">
          <select value={filterZone} onChange={e => setFilterZone(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
            <option value="">All zones</option>
            {zones.map(z => <option key={z.id} value={z.id}>Zone {z.label}</option>)}
          </select>
          <select value={filterHealth} onChange={e => setFilterHealth(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
            <option value="">All health</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center text-gray-400 py-10 text-sm">No trees match your filters</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map(tree => {
            const zone = zoneMap[tree.zone_id]
            return (
              <button key={tree.id} onClick={() => onSelect(tree)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left group">
                {tree.photo_url
                  ? <img src={tree.photo_url} alt="" className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" /> // eslint-disable-line @next/next/no-img-element
                  : <div className="w-full h-28 bg-forest-100 flex items-center justify-center text-3xl">🌳</div>
                }
                <div className="p-2">
                  <p className="font-semibold text-forest-800 text-xs truncate">
                    {tree.species_common || (tree.needs_identification ? '❓ Unidentified' : '—')}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    {zone && <span className="text-xs text-gray-400">Zone {zone.label}</span>}
                    {tree.health_status && (
                      <span className="text-xs">
                        {tree.health_status === 'good' ? '🟢' : tree.health_status === 'fair' ? '🟡' : '🔴'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Charts tab ───────────────────────────────────────────────────────────────

function ChartsTab({ speciesData, healthData, heightData, diamData, filterSpecies, onSpeciesClick, filterHeightBin, onHeightClick, filterHealth, onHealthClick, filterDiamBin, onDiamClick }) {
  return (
    <div className="space-y-4">

      {/* Species frequency */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-forest-800 text-sm">Species Frequency</h3>
          {filterSpecies && (
            <button onClick={() => onSpeciesClick(filterSpecies)} className="text-xs text-forest-600 underline">Clear</button>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">Click a bar to filter size charts</p>
        {speciesData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={Math.max(120, speciesData.length * 22)}>
            <BarChart data={speciesData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#f0fdf4' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} onClick={d => onSpeciesClick(d.name)}>
                {speciesData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === filterSpecies ? '#1b4332' : FOREST_PALETTE[i % FOREST_PALETTE.length]}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Health pie */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-forest-800 text-sm">Health Distribution</h3>
          {filterHealth && (
            <button onClick={() => onHealthClick(filterHealth)} className="text-xs text-forest-600 underline">Clear</button>
          )}
        </div>
        {healthData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={healthData}
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={58}
                paddingAngle={3}
                dataKey="value"
                onClick={entry => onHealthClick(entry.name.toLowerCase())}
                style={{ cursor: 'pointer' }}
              >
                {healthData.map(entry => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={filterHealth && filterHealth !== entry.name.toLowerCase() ? 0.35 : 1}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [v, name]} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => (
                  <span style={{ fontSize: 12, color: '#374151' }}>
                    {value} — {entry.payload.value} ({Math.round(entry.payload.value / healthData.reduce((s, d) => s + d.value, 0) * 100)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Height histogram */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-semibold text-forest-800 text-sm">
            Height Distribution
            {filterSpecies && <span className="text-forest-500 font-normal"> · {filterSpecies}</span>}
          </h3>
          {filterHeightBin && (
            <button onClick={() => onHeightClick(filterHeightBin)} className="text-xs text-forest-600 underline">Clear</button>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">meters · click a bar to filter</p>
        {heightData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={heightData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#f0fdf4' }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} onClick={entry => onHeightClick(entry)} style={{ cursor: 'pointer' }}>
                {heightData.map(entry => (
                  <Cell
                    key={entry.name}
                    fill={filterHeightBin?.name === entry.name ? '#1b4332' : '#52b788'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Diameter histogram */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-semibold text-forest-800 text-sm">
            Diameter Distribution (DBH)
            {filterSpecies && <span className="text-forest-500 font-normal"> · {filterSpecies}</span>}
          </h3>
          {filterDiamBin && (
            <button onClick={() => onDiamClick(filterDiamBin)} className="text-xs text-forest-600 underline">Clear</button>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">cm · click a bar to filter</p>
        {diamData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={diamData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#f0fdf4' }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} onClick={entry => onDiamClick(entry)} style={{ cursor: 'pointer' }}>
                {diamData.map(entry => (
                  <Cell
                    key={entry.name}
                    fill={filterDiamBin?.name === entry.name ? '#1b4332' : '#2d6a4f'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}

// ─── Tree modal ───────────────────────────────────────────────────────────────

function TreeModal({ tree, onClose }) {
  const allPhotos = [
    tree.photo_url && { url: tree.photo_url, label: 'Full tree' },
    ...(tree.tree_photos || []).map((p, i) => ({
      url: p.photo_url,
      label: ['Bark / trunk', 'Leaves / detail'][i] || `Photo ${i + 2}`,
    })),
  ].filter(Boolean)

  const stems = tree.tree_stems || []
  const health = tree.health_status

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-black/50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="font-bold text-forest-800 text-lg">
              {tree.species_common || (tree.needs_identification ? 'Unidentified Tree' : 'Tree')}
            </h3>
            {tree.species_scientific && <p className="text-sm italic text-gray-400">{tree.species_scientific}</p>}
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none ml-4">×</button>
        </div>

        <div className="p-5 space-y-4">
          {allPhotos.length > 0 && (
            <div className="flex gap-3 overflow-x-auto">
              {allPhotos.map((p, i) => (
                <div key={i} className="flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.label} className="h-44 w-32 object-cover rounded-xl shadow-sm" />
                  <p className="text-xs text-gray-400 text-center mt-1">{p.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {health && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${health === 'good' ? 'bg-green-100 text-green-700' : health === 'fair' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {health === 'good' ? '🟢 Good' : health === 'fair' ? '🟡 Fair' : '🔴 Poor'}
              </span>
            )}
            {tree.needs_identification && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">❓ Needs ID</span>
            )}
          </div>

          {!tree.inaccessible && (
            <div className="bg-forest-50 rounded-xl p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Height', value: tree.height_m ? `${tree.height_m} m` : null },
                { label: 'Crown N–S', value: tree.crown_ns_m ? `${tree.crown_ns_m} m` : null },
                { label: 'Crown W–E', value: tree.crown_ew_m ? `${tree.crown_ew_m} m` : null },
                ...stems.map(s => ({
                  label: tree.is_multistem ? `Stem ${s.stem_number} ⌀` : 'Diameter (DBH)',
                  value: s.diameter_cm ? `${s.diameter_cm} cm${tree.is_multistem ? ` @ ${s.measurement_height_m}m` : ''}` : null,
                })),
              ].filter(r => r.value).map(row => (
                <div key={row.label}>
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="font-semibold text-forest-800 text-sm">{row.value}</p>
                </div>
              ))}
            </div>
          )}

          {tree.inaccessible && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-semibold text-amber-700 text-sm">⚠️ Reported as inaccessible</p>
              {tree.inaccessible_note && <p className="text-amber-600 text-xs mt-1">{tree.inaccessible_note}</p>}
            </div>
          )}

          {tree.lat && tree.lng && (
            <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-2">
              📍 {tree.lat.toFixed(6)}, {tree.lng.toFixed(6)}
            </p>
          )}
          {tree.recorded_by && (
            <p className="text-xs text-gray-400">Recorded by <span className="font-medium">{tree.recorded_by}</span></p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Empty() {
  return <p className="text-center text-gray-300 text-sm py-4">No data yet</p>
}
