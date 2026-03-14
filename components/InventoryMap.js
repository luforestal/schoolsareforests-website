'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InventoryMap({ school, zones = [] }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [trees, setTrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [withGps, setWithGps] = useState(0)
  const [total, setTotal] = useState(0)

  // Zone label lookup
  const zoneLabelById = {}
  zones.forEach(z => { zoneLabelById[z.id] = z.label })

  useEffect(() => {
    supabase
      .from('trees')
      .select('id, original_id, species_common, species_scientific, zone_id, lat, lng')
      .eq('school_id', school.id)
      .order('id')
      .then(({ data }) => {
        const all = data || []
        setTotal(all.length)
        const located = all.filter(t => t.lat && t.lng)
        setWithGps(located.length)
        setTrees(located)
        setLoading(false)
      })
  }, [school.id])

  useEffect(() => {
    if (loading || !mapRef.current) return
    if (mapInstanceRef.current) return // already initialized

    // Inject Leaflet CSS once
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then(mod => {
      const L = mod.default

      // Guard against double-init (React StrictMode / hot reload)
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
      if (mapRef.current._leaflet_id) delete mapRef.current._leaflet_id

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Center: average of trees, or school coords, or fallback
      let center = [4.71, -74.07]
      if (trees.length > 0) {
        const avgLat = trees.reduce((s, t) => s + t.lat, 0) / trees.length
        const avgLng = trees.reduce((s, t) => s + t.lng, 0) / trees.length
        center = [avgLat, avgLng]
      } else if (school.lat && school.lng) {
        center = [school.lat, school.lng]
      }

      const map = L.map(mapRef.current).setView(center, 18)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 20,
      }).addTo(map)

      // Custom small green circle icon
      const treeIcon = L.divIcon({
        className: '',
        html: '<div style="width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -8],
      })

      trees.forEach(t => {
        const zone = zoneLabelById[t.zone_id] || '—'
        const label = t.original_id || `#${t.id}`
        const species = t.species_common || t.species_scientific || 'Unknown species'
        const marker = L.marker([t.lat, t.lng], { icon: treeIcon })
          .addTo(map)
          .bindPopup(`<b>${label}</b><br/>${species}<br/><span style="color:#6b7280;font-size:11px">Zone ${zone}</span>`)
        markersRef.current.push(marker)
      })

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, [loading, trees])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading trees…</div>
  )

  if (total === 0) return (
    <div className="text-center py-12 text-gray-500 text-sm">
      <p className="text-3xl mb-3">🌳</p>
      <p className="font-medium">No trees in inventory yet.</p>
      <p className="text-gray-400 mt-1">Import your Excel file first.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">
          <span className="font-semibold text-forest-700">{withGps}</span> of{' '}
          <span className="font-semibold">{total}</span> trees have GPS coordinates
        </span>
        {withGps < total && (
          <span className="text-amber-600 text-xs">
            ⚠️ {total - withGps} trees missing GPS — upload a KML file in the GPS tab
          </span>
        )}
      </div>

      {withGps === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-500 text-sm">
          <p className="text-3xl mb-3">📍</p>
          <p className="font-medium">No GPS coordinates yet.</p>
          <p className="text-gray-400 mt-1">Upload a KML file in the <b>Upload GPS</b> tab.</p>
        </div>
      ) : (
        <div ref={mapRef} className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: '420px' }} />
      )}
    </div>
  )
}
