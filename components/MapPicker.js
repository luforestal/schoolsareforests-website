'use client'
import { useEffect, useRef, useState } from 'react'

export default function MapPicker({ initialLat, initialLng, onConfirm, onCancel }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const startLat = initialLat || 4.0
  const startLng = initialLng || 9.0

  const [pickedCoords, setPickedCoords] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )

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

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19,
        }
      ).addTo(map)

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setPickedCoords({ lat: pos.lat, lng: pos.lng })
      })

      map.on('click', e => {
        marker.setLatLng(e.latlng)
        setPickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
      })

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
      <div ref={mapRef} className="flex-1" />

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
