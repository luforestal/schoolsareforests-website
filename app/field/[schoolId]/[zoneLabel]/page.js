'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'

export default function ZonePage() {
  const { schoolId, zoneLabel } = useParams()
  const router = useRouter()
  const t = useT()

  const [zone, setZone] = useState(null)
  const [trees, setTrees] = useState([])
  const [resurveyedIds, setResurveyed] = useState(new Set()) // original_tree_ids that have been resurveyed
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [started, setStarted] = useState(false)

  const [medal, setMedal] = useState(null) // '🥇' | '🥈' | '🥉' | null

  // Zone photos step
  const [showZonePhotos, setShowZonePhotos] = useState(false)
  const [zp1File, setZp1File] = useState(null)
  const [zp1Preview, setZp1Preview] = useState(null)
  const [zp2File, setZp2File] = useState(null)
  const [zp2Preview, setZp2Preview] = useState(null)
  const [savingZonePhotos, setSavingZonePhotos] = useState(false)
  const [zonePhotoError, setZonePhotoError] = useState('')

  const sessionKey = `saf_student_name_${zoneLabel}`

  // Map refs — must be at top level (Rules of Hooks)
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    const saved = sessionStorage.getItem(sessionKey)
    if (saved) { setName(saved); setStarted(true) }

    const load = async () => {
      // Prefer survey zone (no inventory_id); fall back to inventory zone
      const { data: allMatchingZones } = await supabase
        .from('zones').select('*').eq('school_id', schoolId).eq('label', zoneLabel)
      const zoneData = allMatchingZones?.find(z => !z.inventory_id) || allMatchingZones?.[0] || null
      setZone(zoneData)

      if (zoneData) {
        let allTrees = []

        // Trees in this zone
        const { data: treesData } = await supabase
          .from('trees').select('*').eq('zone_id', zoneData.id).order('id')
        allTrees = treesData || []

        // If this is a survey zone (no inventory), also load prior inventory trees
        // from the inventory zone with the same label in the same school
        if (!zoneData.inventory_id) {
          const { data: inventoryZones } = await supabase
            .from('zones').select('id')
            .eq('school_id', schoolId)
            .eq('label', zoneLabel)
            .not('inventory_id', 'is', null)
          if (inventoryZones?.length) {
            const invZoneIds = inventoryZones.map(z => z.id)
            const { data: priorData } = await supabase
              .from('trees').select('*')
              .in('zone_id', invZoneIds)
              .eq('inaccessible', false)
              .order('id')
            if (priorData) allTrees = [...allTrees, ...priorData]
          }
          // Load which inventory trees have already been resurveyed (have original_tree_id)
          const { data: resurveyed } = await supabase
            .from('trees').select('original_tree_id')
            .eq('school_id', schoolId)
            .not('original_tree_id', 'is', null)
          if (resurveyed) setResurveyed(new Set(resurveyed.map(r => r.original_tree_id)))
        }

        setTrees(allTrees)

        // Show zone photos step if no photos yet
        if (!zoneData.photo1_url || !zoneData.photo2_url) {
          if (sessionStorage.getItem(`saf_student_name_${zoneLabel}`)) setShowZonePhotos(true)
        }

        // Load medal from validations
        const { data: validations } = await supabase
          .from('tree_validations')
          .select('accuracy_pct')
          .eq('zone_id', zoneData.id)
          .not('accuracy_pct', 'is', null)
        if (validations?.length) {
          const avg = validations.reduce((s, v) => s + v.accuracy_pct, 0) / validations.length
          setMedal(avg >= 90 ? '🥇' : avg >= 75 ? '🥈' : avg >= 60 ? '🥉' : null)
        }
      }
      setLoading(false)
    }
    load()
  }, [schoolId, zoneLabel])

  // ── Inventory map — must be here (before any early returns) to obey Rules of Hooks ──
  useEffect(() => {
    const inventoryWithGps = trees.filter(t => t.inventory_id != null && !t.inaccessible && t.lat && t.lng)
    const done = (t) => resurveyedIds.has(t.id)
    if (!inventoryWithGps.length || !mapContainerRef.current) return
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    import('leaflet').then(mod => {
      const L = mod.default
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
      if (mapContainerRef.current._leaflet_id) delete mapContainerRef.current._leaflet_id
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      const avgLat = inventoryWithGps.reduce((s, t) => s + t.lat, 0) / inventoryWithGps.length
      const avgLng = inventoryWithGps.reduce((s, t) => s + t.lng, 0) / inventoryWithGps.length
      const map = L.map(mapContainerRef.current).setView([avgLat, avgLng], 19)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri', maxZoom: 20,
      }).addTo(map)
      const pendingIcon = L.divIcon({
        className: '',
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#60a5fa;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.5)"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -9],
      })
      const doneIcon = L.divIcon({
        className: '',
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.5)"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -9],
      })
      inventoryWithGps.forEach(tree => {
        const isDone = done(tree)
        const label = tree.original_id || `#${tree.id}`
        const species = tree.species_common || tree.species_scientific || 'Unknown'
        const popup = isDone
          ? `<b>${label}</b><br/>${species}<br/><span style="color:#16a34a;font-size:11px">✓ Remedido</span>`
          : `<b>${label}</b><br/>${species}<br/><a href="/field/${schoolId}/${zoneLabel}/new?resurvey=${tree.id}" style="color:#2563eb;font-size:12px">Medir →</a>`
        L.marker([tree.lat, tree.lng], { icon: isDone ? doneIcon : pendingIcon })
          .addTo(map)
          .bindPopup(popup)
      })
      mapInstanceRef.current = map
    })
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
  }, [trees, resurveyedIds, schoolId, zoneLabel, started, showZonePhotos])

  const handleStart = () => {
    if (!name.trim()) return
    sessionStorage.setItem(sessionKey, name.trim())
    setStarted(true)
    if (!zone?.photo1_url || !zone?.photo2_url) setShowZonePhotos(true)
  }

  const handleZonePhoto = (slot, e) => {
    const file = e.target.files[0]
    if (!file) return
    if (slot === 1) { setZp1File(file); setZp1Preview(URL.createObjectURL(file)) }
    else { setZp2File(file); setZp2Preview(URL.createObjectURL(file)) }
  }

  const handleSaveZonePhotos = async () => {
    if (!zp1File || !zp2File) return
    setSavingZonePhotos(true)
    setZonePhotoError('')

    const upload = async (file, slot) => {
      const ext = file.name.split('.').pop()
      const filename = `${zone.id}-ref${slot}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('zone-photos').upload(filename, file)
      if (error) return { url: null, error: error.message }
      const { data } = supabase.storage.from('zone-photos').getPublicUrl(filename)
      return { url: data.publicUrl, error: null }
    }

    const [r1, r2] = await Promise.all([upload(zp1File, 1), upload(zp2File, 2)])
    if (r1.error || r2.error) {
      setZonePhotoError(`Upload failed: ${r1.error || r2.error}. Make sure the zone-photos bucket exists in Supabase Storage.`)
      setSavingZonePhotos(false)
      return
    }

    const { error: updateError } = await supabase
      .from('zones').update({ photo1_url: r1.url, photo2_url: r2.url }).eq('id', zone.id)
    if (updateError) {
      setZonePhotoError(`Could not save to database: ${updateError.message}`)
      setSavingZonePhotos(false)
      return
    }

    setZone(z => ({ ...z, photo1_url: r1.url, photo2_url: r2.url }))
    setShowZonePhotos(false)
    setSavingZonePhotos(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">{t('field.loading')}</p>
    </div>
  )

  // ── Step 1: Enter name ──
  if (!started) {
    return (
      <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-3xl mx-auto mb-4">
              {zoneLabel}
            </div>
            <h1 className="text-xl font-bold text-forest-800">{t('field.zone_title', { label: zoneLabel })}</h1>
            {zone?.category && <p className="text-gray-400 text-sm">{zone.category}</p>}
            {zone?.description && <p className="text-gray-400 text-xs mt-0.5">{zone.description}</p>}
            {zone?.group_number && (
              <span className="inline-block mt-2 text-xs bg-forest-50 text-forest-600 px-3 py-1 rounded-full font-medium">
                {t('field.group', { number: zone.group_number })}
              </span>
            )}
          </div>

          {trees.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-amber-700 text-sm font-semibold">⚠️ {t('field.already_recorded', { count: trees.length, plural: trees.length > 1 ? 's' : '' })}</p>
              <p className="text-amber-600 text-xs mt-0.5">{t('field.check_zone')}</p>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('field.who_entering')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder={t('field.name_placeholder')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              autoFocus
            />
          </div>

          <button onClick={handleStart} disabled={!name.trim()}
            className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50">
            {t('field.start')}
          </button>
          <button onClick={() => router.push(`/field/${schoolId}`)}
            className="w-full text-gray-400 text-sm mt-3 py-2 hover:text-gray-600">
            {t('field.back_zones')}
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2: Zone reference photos ──
  if (showZonePhotos) {
    return (
      <div className="min-h-screen bg-forest-50">
        <div className="bg-forest-800 text-white px-4 py-5">
          <div className="max-w-lg mx-auto">
            <h1 className="font-bold text-lg">{t('field.ref_photos_title', { label: zoneLabel })}</h1>
            <p className="text-forest-300 text-sm">{t('field.ref_photos_step')}</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 text-sm text-forest-700">
            <p className="font-semibold mb-1">📸 {t('field.ref_photos_hint')}</p>
            <p className="text-forest-600 text-xs">{t('field.ref_photos_body')}</p>
          </div>

          {/* Photo 1 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-forest-800 mb-1">{t('field.photo1_label')}</p>
            <p className="text-xs text-gray-400 mb-3">{t('field.photo1_hint')}</p>
            <label className="cursor-pointer block">
              {zp1Preview ? (
                <div className="relative rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={zp1Preview} alt="" className="w-full h-44 object-cover" />
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">{t('field.tap_change')}</span>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 hover:border-forest-400 hover:text-forest-500 transition-colors">
                  <span className="text-3xl mb-1">📷</span>
                  <span className="text-sm font-medium">{t('field.take_photo1')}</span>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment"
                onChange={e => handleZonePhoto(1, e)} className="hidden" />
            </label>
          </div>

          {/* Photo 2 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-forest-800 mb-1">{t('field.photo2_label')}</p>
            <p className="text-xs text-gray-400 mb-3">{t('field.photo2_hint')}</p>
            <label className="cursor-pointer block">
              {zp2Preview ? (
                <div className="relative rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={zp2Preview} alt="" className="w-full h-44 object-cover" />
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">{t('field.tap_change')}</span>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 hover:border-forest-400 hover:text-forest-500 transition-colors">
                  <span className="text-3xl mb-1">📷</span>
                  <span className="text-sm font-medium">{t('field.take_photo2')}</span>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment"
                onChange={e => handleZonePhoto(2, e)} className="hidden" />
            </label>
          </div>

          {zonePhotoError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {zonePhotoError}
            </div>
          )}
          <button onClick={handleSaveZonePhotos}
            disabled={!zp1File || !zp2File || savingZonePhotos}
            className="w-full bg-forest-700 text-white font-bold py-4 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-50 text-lg">
            {savingZonePhotos ? t('field.saving') : t('field.save_continue')}
          </button>

          <button onClick={() => setShowZonePhotos(false)}
            className="w-full text-gray-400 text-sm py-2 hover:text-gray-600">
            {t('field.skip')}
          </button>
        </div>
      </div>
    )
  }

  // ── Step 3: Tree inventory ──
  const inaccessibleTrees = trees.filter(t => t.inaccessible)
  // Prior inventory = imported by teacher, not yet re-surveyed by students this cycle
  const priorTrees = trees.filter(t => !t.inaccessible && t.inventory_id != null && !resurveyedIds.has(t.id))
  const surveyedTrees = trees.filter(t => !t.inaccessible && t.inventory_id == null)
  const regularTrees = surveyedTrees // kept for compatibility

  const priorWithGps = priorTrees.filter(t => t.lat && t.lng)


  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-forest-800 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.push(`/field/${schoolId}`)} className="text-forest-300 text-sm mb-2">
            {t('field.back_zones')}
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-forest-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                {zoneLabel}
              </div>
              {medal && (
                <span className="absolute -top-2 -right-2 text-xl">{medal}</span>
              )}
            </div>
            <div>
              <h1 className="font-bold text-lg">{t('field.zone_title', { label: zoneLabel })}{zone?.category ? ` · ${zone.category}` : ''}</h1>
              <p className="text-forest-300 text-sm">
                {t('field.recording_as')} <span className="text-white font-medium">{name}</span>
                {' · '}
                <button onClick={() => { sessionStorage.removeItem(sessionKey); setStarted(false) }}
                  className="underline text-forest-300 hover:text-white">{t('field.change')}</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Zone reference photos thumbnails */}
        {(zone?.photo1_url || zone?.photo2_url) && (
          <div className="flex gap-2 mb-5">
            {zone.photo1_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={zone.photo1_url} alt="Zone ref 1" className="h-16 flex-1 object-cover rounded-lg" />
            )}
            {zone.photo2_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={zone.photo2_url} alt="Zone ref 2" className="h-16 flex-1 object-cover rounded-lg" />
            )}
            <button onClick={() => setShowZonePhotos(true)}
              className="text-xs text-forest-600 bg-forest-50 px-2 rounded-lg hover:bg-forest-100 flex-shrink-0">
              {t('field.retake')}
            </button>
          </div>
        )}

        {/* Prior inventory — map only, tap a tree to resurvey */}
        {priorTrees.length > 0 && (
          <div className="mb-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
              <p className="text-blue-800 font-semibold text-sm">📋 {priorTrees.length} trees from previous inventory</p>
              <p className="text-blue-600 text-xs mt-0.5">Tap a tree on the map to resurvey it.</p>
            </div>
            {priorWithGps.length > 0 && (
              <>
                <div ref={mapContainerRef} className="w-full rounded-xl overflow-hidden border border-blue-200" style={{ height: '300px' }} />
                <div className="flex items-center gap-4 mt-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-400 border border-white shadow-sm" />
                    <span className="text-xs text-gray-500">Por medir</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm" />
                    <span className="text-xs text-gray-500">Remedido</span>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">{resurveyedIds.size}/{priorTrees.length + resurveyedIds.size} listos</span>
                </div>
              </>
            )}
            {priorTrees.length > priorWithGps.length && (
              <p className="text-xs text-gray-400 text-center mt-2">{priorTrees.length - priorWithGps.length} árboles sin GPS — usa "+ Add Tree" para remedirlos</p>
            )}
          </div>
        )}

        <button onClick={() => router.push(`/field/${schoolId}/${zoneLabel}/new`)}
          className="w-full bg-forest-700 text-white font-semibold py-4 rounded-xl hover:bg-forest-600 transition-colors mb-6 text-lg active:scale-[0.99]">
          🌳 {t('field.add_tree')}
        </button>

        {inaccessibleTrees.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-amber-700 font-semibold text-sm">⚠️ {t('field.inaccessible_reported', { count: inaccessibleTrees.length, plural: inaccessibleTrees.length > 1 ? 's' : '' })}</p>
            <p className="text-amber-600 text-xs mt-1">{t('field.teacher_notified')}</p>
          </div>
        )}

        {surveyedTrees.length > 0 && (
          <div>
            <p className="text-gray-500 text-sm font-medium mb-3">🌳 {surveyedTrees.length} {t('field.trees_recorded')}</p>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-[2rem_1fr_3rem_3rem] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span>#</span>
                <span>{t('field.species_col')}</span>
                <span className="text-center">{t('field.height_col')}</span>
                <span className="text-center">{t('field.health_col')}</span>
              </div>
              {surveyedTrees.map((tree, i) => (
                <button key={tree.id}
                  onClick={() => router.push(`/field/${schoolId}/${zoneLabel}/${tree.id}`)}
                  className={`w-full grid grid-cols-[2rem_1fr_3rem_3rem] gap-2 px-4 py-3 items-center text-left hover:bg-gray-50 active:bg-gray-100 transition-colors ${i < surveyedTrees.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-xs font-bold text-forest-600">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-forest-800 truncate">
                      {tree.needs_identification ? `❓ ${t('field.needs_id')}` : (tree.species_common || '—')}
                    </p>
                    {tree.species_scientific && (
                      <p className="text-xs text-gray-400 italic truncate">{tree.species_scientific}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 text-center">{tree.height_m ?? '—'}</span>
                  <span className="text-center text-sm">
                    {tree.health_status === 'good' ? '🟢' : tree.health_status === 'fair' ? '🟡' : tree.health_status === 'poor' ? '🔴' : '—'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {trees.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">🌱</div>
            <p>{t('field.no_trees')}</p>
            <p className="text-sm mt-1">{t('field.no_trees_hint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
