'use client'
import { useEffect, useRef, useState } from 'react'

const LAYERS = [
  {
    id: 'satellite',
    label: '🛰️ Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
  },
  {
    id: 'streets',
    label: '🗺️ Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  {
    id: 'carto',
    label: '✏️ Carto',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
]

export default function MapPicker({ initialLat, initialLng, onConfirm, onCancel, perimeterGeojson }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const tileLayerRef = useRef(null)

  const startLat = initialLat || 4.0
  const startLng = initialLng || 9.0

  const [pickedCoords, setPickedCoords] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )
  const [activeLayer, setActiveLayer] = useState('satellite')

  // Switch tile layer when activeLayer changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    import('leaflet').then(mod => {
      const L = mod.default
      if (tileLayerRef.current) map.removeLayer(tileLayerRef.current)
      const layer = LAYERS.find(l => l.id === activeLayer)
      tileLayerRef.current = L.tileLayer(layer.url, {
        attribution: layer.attribution,
        maxZoom: layer.maxZoom,
      }).addTo(map)
    })
  }, [activeLayer])

  useEffect(() => {
    // Inject Leaflet CSS once
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    let map

    import('leaflet').then(mod => {
      const L = mod.default

      // Fix webpack broken default icon
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapInstanceRef.current || !mapRef.current) return

      map = L.map(mapRef.current, {
        center: [startLat, startLng],
        zoom: initialLat ? 18 : 3,
      })

      const defaultLayer = LAYERS.find(l => l.id === 'satellite')
      tileLayerRef.current = L.tileLayer(defaultLayer.url, {
        attribution: defaultLayer.attribution,
        maxZoom: defaultLayer.maxZoom,
      }).addTo(map)

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setPickedCoords({ lat: pos.lat, lng: pos.lng })
      })

      map.on('click', e => {
        marker.setLatLng(e.latlng)
        setPickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
      })

      // Draw school perimeter if available
      if (perimeterGeojson) {
        try {
          const geojson = typeof perimeterGeojson === 'string' ? JSON.parse(perimeterGeojson) : perimeterGeojson
          L.geoJSON(geojson, {
            style: { color: '#4ade80', weight: 1.5, opacity: 0.8, fillOpacity: 0.06 }
          }).addTo(map)
        } catch (_) {}
      }

      mapInstanceRef.current = map
      markerRef.current = marker
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header bar */}
      <div className="bg-forest-800 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onCancel} className="text-forest-300 text-sm font-medium px-2 py-1">
          ✗ Cancel
        </button>
        <p className="text-sm font-semibold">Tap map or drag marker</p>
        <button
          onClick={() => pickedCoords && onConfirm(pickedCoords)}
          disabled={!pickedCoords}
          className="bg-forest-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 transition-opacity"
        >
          ✓ Confirm
        </button>
      </div>

      {/* Map container */}
      <div ref={mapRef} className="flex-1 relative">
        {/* Layer switcher */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
          {LAYERS.map(layer => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-md transition-colors ${
                activeLayer === layer.id
                  ? 'bg-forest-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-forest-50'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coordinates footer */}
      <div className="bg-forest-900 text-white px-4 py-3 text-center flex-shrink-0">
        {pickedCoords ? (
          <p className="text-sm font-mono tracking-wide">
            {pickedCoords.lat.toFixed(6)}, {pickedCoords.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-forest-400">Tap the map or drag the marker to set location</p>
        )}
      </div>
    </div>
  )
}
