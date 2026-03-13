'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'

const MapPicker = dynamicImport(() => import('@/components/MapPicker'), { ssr: false })

export default function TreeDetailPage() {
  const { schoolId, zoneLabel, treeId } = useParams()
  const router = useRouter()
  const t = useT()

  const [tree, setTree] = useState(null)
  const [stems, setStems] = useState([])
  const [extraPhotos, setExtraPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [treeNumber, setTreeNumber] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)

  // Edit species
  const [editingSpecies, setEditingSpecies] = useState(false)
  const [editCommon, setEditCommon] = useState('')
  const [editScientific, setEditScientific] = useState('')

  // Edit measurements
  const [editingMeasurements, setEditingMeasurements] = useState(false)
  const [editClinoDistance, setEditClinoDistance] = useState('')
  const [editMeasurerHeight, setEditMeasurerHeight] = useState('')
  const [editClinoAngle, setEditClinoAngle] = useState('')
  const [editCrownNS, setEditCrownNS] = useState('')
  const [editCrownEW, setEditCrownEW] = useState('')
  const [editHealth, setEditHealth] = useState('')
  const [editStems, setEditStems] = useState([])

  const editComputedHeightM = (() => {
    const D = parseFloat(editClinoDistance)
    const h = parseFloat(editMeasurerHeight)
    const elevAngle = parseFloat(editClinoAngle)
    if (isNaN(D) || isNaN(h) || isNaN(elevAngle) || elevAngle <= 0 || elevAngle >= 90) return null
    return D * Math.tan(elevAngle * Math.PI / 180) + h
  })()

  useEffect(() => {
    const load = async () => {
      const { data: treeData } = await supabase
        .from('trees').select('*').eq('id', treeId).single()
      if (!treeData) { router.back(); return }
      setTree(treeData)
      setEditCommon(treeData.species_common || '')
      setEditScientific(treeData.species_scientific || '')
      setEditClinoDistance(treeData.clinometer_distance_m?.toString() || '')
      setEditMeasurerHeight(treeData.measurer_eye_height_m?.toString() || '')
      setEditClinoAngle(treeData.clinometer_angle_deg?.toString() || '')
      setEditCrownNS(treeData.crown_ns_m?.toString() || '')
      setEditCrownEW(treeData.crown_ew_m?.toString() || '')
      setEditHealth(treeData.health_status || '')

      const { data: stemsData } = await supabase
        .from('tree_stems').select('*').eq('tree_id', treeId).order('stem_number')
      setStems(stemsData || [])
      setEditStems(stemsData?.map(s => ({ ...s, diameter_cm: s.diameter_cm?.toString(), measurement_height_m: s.measurement_height_m?.toString() })) || [])

      const { data: photosData } = await supabase
        .from('tree_photos').select('*').eq('tree_id', treeId).order('photo_order')
      setExtraPhotos(photosData || [])

      const { data: zoneTrees } = await supabase
        .from('trees').select('id').eq('zone_id', treeData.zone_id).eq('inaccessible', false).order('id')
      const idx = zoneTrees?.findIndex(t => t.id === treeId)
      if (idx !== undefined && idx >= 0) setTreeNumber(idx + 1)

      setLoading(false)
    }
    load()
  }, [treeId, router])

  const handleSaveSpecies = async () => {
    if (!editCommon.trim()) return
    setSaving(true)
    await supabase.from('trees').update({
      species_common: editCommon.trim(),
      species_scientific: editScientific.trim() || null,
      needs_identification: false,
    }).eq('id', treeId)
    setTree(t => ({ ...t, species_common: editCommon.trim(), species_scientific: editScientific.trim() || null, needs_identification: false }))
    setEditingSpecies(false)
    setSaving(false)
  }

  const handleSaveMeasurements = async () => {
    setSaving(true)
    await supabase.from('trees').update({
      clinometer_distance_m: parseFloat(editClinoDistance) || null,
      measurer_eye_height_m: parseFloat(editMeasurerHeight) || null,
      clinometer_angle_deg: parseFloat(editClinoAngle) || null,
      height_m: editComputedHeightM,
      crown_ns_m: parseFloat(editCrownNS) || null,
      crown_ew_m: parseFloat(editCrownEW) || null,
      health_status: editHealth || null,
    }).eq('id', treeId)

    // Update stems
    for (const stem of editStems) {
      await supabase.from('tree_stems').update({
        diameter_cm: parseFloat(stem.diameter_cm) || null,
        measurement_height_m: parseFloat(stem.measurement_height_m) || null,
      }).eq('id', stem.id)
    }

    setTree(t => ({ ...t, height_m: editComputedHeightM, clinometer_distance_m: parseFloat(editClinoDistance) || null, measurer_eye_height_m: parseFloat(editMeasurerHeight) || null, clinometer_angle_deg: parseFloat(editClinoAngle) || null, crown_ns_m: parseFloat(editCrownNS) || null, crown_ew_m: parseFloat(editCrownEW) || null, health_status: editHealth || null }))
    setStems(editStems.map(s => ({ ...s, diameter_cm: parseFloat(s.diameter_cm), measurement_height_m: parseFloat(s.measurement_height_m) })))
    setEditingMeasurements(false)
    setSaving(false)
  }

  const recaptureGPS = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      await supabase.from('trees').update({ lat, lng }).eq('id', treeId)
      setTree(t => ({ ...t, lat, lng }))
    }, () => alert('Could not get GPS location.'))
  }

  if (loading) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">{t('common.loading')}</p>
    </div>
  )

  const allPhotos = [
    tree.photo_url && { url: tree.photo_url, label: t('newTree.photo_full') },
    ...extraPhotos.map((p, i) => ({ url: p.photo_url, label: [t('newTree.photo_bark'), t('newTree.photo_leaf')][i] || `Photo ${i + 2}` })),
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-forest-800 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-forest-300 text-sm mb-2">{t('treeDetail.back')}</button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">
                {tree.inaccessible ? t('treeDetail.inaccessible_title') : t('treeDetail.tree_n', { n: treeNumber ?? '' })}
              </h1>
              <p className="text-forest-300 text-sm">{t('treeDetail.zone_recorded', { zone: zoneLabel, by: tree.recorded_by })}</p>
            </div>
            {tree.needs_identification && (
              <span className="text-xs bg-amber-400 text-amber-900 font-bold px-2 py-1 rounded-full">❓ {t('treeDetail.needs_id_badge')}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Prior inventory banner */}
        {tree.submitted_by === 'import' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-semibold text-blue-800 text-sm mb-1">
              📋 {t('treeDetail.prior_inventory_badge')}
            </p>
            <p className="text-blue-600 text-xs leading-relaxed">
              {t('treeDetail.prior_inventory_hint')}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {tree.height_m && (
                <div className="bg-white rounded-lg py-2 px-1">
                  <p className="text-xs text-blue-400">Height</p>
                  <p className="font-bold text-blue-700 text-sm">{tree.height_m}m</p>
                </div>
              )}
              {(tree.crown_ns_m || tree.crown_ew_m) && (
                <div className="bg-white rounded-lg py-2 px-1">
                  <p className="text-xs text-blue-400">Crown</p>
                  <p className="font-bold text-blue-700 text-sm">
                    {tree.crown_ns_m ?? '?'} × {tree.crown_ew_m ?? '?'}m
                  </p>
                </div>
              )}
              {tree.health_status && (
                <div className="bg-white rounded-lg py-2 px-1">
                  <p className="text-xs text-blue-400">Health</p>
                  <p className="font-bold text-blue-700 text-sm capitalize">{tree.health_status}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo gallery */}
        {allPhotos.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {allPhotos.map((p, i) => (
              <div key={i} className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.label} className="h-48 w-36 object-cover rounded-xl shadow-sm" />
                <p className="text-xs text-gray-400 text-center mt-1">{p.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Inaccessible */}
        {tree.inaccessible && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-700">{t('treeDetail.inaccessible_label')}</p>
            {tree.inaccessible_note && <p className="text-amber-600 text-sm mt-1">{tree.inaccessible_note}</p>}
          </div>
        )}

        {/* Species */}
        {!tree.inaccessible && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-forest-800">{t('treeDetail.species')}</p>
              {!editingSpecies && (
                <button onClick={() => setEditingSpecies(true)}
                  className="text-xs text-forest-600 hover:text-forest-700 font-medium">{t('treeDetail.edit')}</button>
              )}
            </div>
            {editingSpecies ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('treeDetail.common_name')}</label>
                  <input type="text" value={editCommon} onChange={e => setEditCommon(e.target.value)}
                    placeholder="e.g. Oak"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('treeDetail.scientific_name')}</label>
                  <input type="text" value={editScientific} onChange={e => setEditScientific(e.target.value)}
                    placeholder="e.g. Quercus robur"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 italic" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveSpecies} disabled={!editCommon.trim() || saving}
                    className="flex-1 bg-forest-700 text-white text-sm font-semibold py-2 rounded-lg hover:bg-forest-600 disabled:opacity-50">
                    {saving ? t('treeDetail.saving') : t('treeDetail.save')}
                  </button>
                  <button onClick={() => { setEditingSpecies(false); setEditCommon(tree.species_common || ''); setEditScientific(tree.species_scientific || '') }}
                    className="text-gray-400 text-sm px-4 hover:text-gray-600">{t('treeDetail.cancel')}</button>
                </div>
              </div>
            ) : tree.needs_identification ? (
              <div>
                <p className="text-amber-600 text-sm font-medium">{t('treeDetail.needs_id_msg')}</p>
                <button onClick={() => setEditingSpecies(true)}
                  className="mt-2 text-sm text-forest-600 font-medium hover:text-forest-700">{t('treeDetail.enter_species')}</button>
              </div>
            ) : (
              <div>
                <p className="text-forest-800 font-medium">{tree.species_common || '—'}</p>
                {tree.species_scientific && <p className="text-gray-400 text-sm italic">{tree.species_scientific}</p>}
              </div>
            )}
          </div>
        )}

        {/* Measurements */}
        {!tree.inaccessible && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-forest-800">{t('treeDetail.measurements')}</p>
              {!editingMeasurements && (
                <button onClick={() => setEditingMeasurements(true)}
                  className="text-xs text-forest-600 hover:text-forest-700 font-medium">{t('treeDetail.edit')}</button>
              )}
            </div>

            {editingMeasurements ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">{t('treeDetail.clino_section')}</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('treeDetail.distance_trunk')}</label>
                    <input type="number" step="0.1" min="0" value={editClinoDistance}
                      onChange={e => setEditClinoDistance(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('treeDetail.eye_height')}</label>
                    <input type="number" step="0.1" min="0" value={editMeasurerHeight}
                      onChange={e => setEditMeasurerHeight(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('treeDetail.clino_angle')}</label>
                    <input type="number" step="1" min="1" max="89" value={editClinoAngle}
                      onChange={e => setEditClinoAngle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                  {editComputedHeightM !== null && (
                    <p className="text-xs text-forest-600 bg-forest-50 rounded-lg px-3 py-2">
                      {t('treeDetail.calc_height')} <strong>{editComputedHeightM.toFixed(1)} m</strong>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('treeDetail.crown_ns')}</label>
                    <input type="number" step="0.1" min="0" value={editCrownNS}
                      onChange={e => setEditCrownNS(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('treeDetail.crown_ew')}</label>
                    <input type="number" step="0.1" min="0" value={editCrownEW}
                      onChange={e => setEditCrownEW(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                </div>

                {editStems.map((stem, i) => (
                  <div key={i} className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {tree.is_multistem ? `${t('newTree.stem', { n: stem.stem_number })} ⌀ (cm)` : t('treeDetail.row_diameter')}
                      </label>
                      <input type="number" step="0.1" min="0" value={stem.diameter_cm}
                        onChange={e => setEditStems(editStems.map((s, idx) => idx === i ? { ...s, diameter_cm: e.target.value } : s))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                    </div>
                    {tree.is_multistem && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('newTree.measured_at')}</label>
                        <input type="number" step="0.1" min="0" value={stem.measurement_height_m}
                          onChange={e => setEditStems(editStems.map((s, idx) => idx === i ? { ...s, measurement_height_m: e.target.value } : s))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                      </div>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-xs text-gray-500 mb-2">{t('treeDetail.health')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ value: 'good', label: t('newTree.health_good'), emoji: '🟢' }, { value: 'fair', label: t('newTree.health_fair'), emoji: '🟡' }, { value: 'poor', label: t('newTree.health_poor'), emoji: '🔴' }].map(opt => (
                      <button key={opt.value} type="button" onClick={() => setEditHealth(opt.value)}
                        className={`py-2 rounded-lg border-2 text-sm font-semibold flex items-center justify-center gap-1 transition-colors ${editHealth === opt.value ? 'border-forest-600 bg-forest-50 text-forest-700' : 'border-gray-200 text-gray-500'}`}>
                        {opt.emoji} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={handleSaveMeasurements} disabled={saving}
                    className="flex-1 bg-forest-700 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-forest-600 disabled:opacity-50">
                    {saving ? t('treeDetail.saving') : t('treeDetail.save_measurements')}
                  </button>
                  <button onClick={() => { setEditingMeasurements(false); setEditClinoDistance(tree.clinometer_distance_m?.toString() || ''); setEditMeasurerHeight(tree.measurer_eye_height_m?.toString() || ''); setEditClinoAngle(tree.clinometer_angle_deg?.toString() || ''); setEditCrownNS(tree.crown_ns_m?.toString() || ''); setEditCrownEW(tree.crown_ew_m?.toString() || ''); setEditHealth(tree.health_status || ''); setEditStems(stems.map(s => ({ ...s, diameter_cm: s.diameter_cm?.toString(), measurement_height_m: s.measurement_height_m?.toString() }))) }}
                    className="text-gray-400 text-sm px-4 hover:text-gray-600">{t('treeDetail.cancel')}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {tree.clinometer_distance_m && <Row label={t('treeDetail.row_distance')} value={`${tree.clinometer_distance_m} m`} />}
                {tree.measurer_eye_height_m && <Row label={t('treeDetail.row_eye')} value={`${tree.measurer_eye_height_m} m`} />}
                {tree.clinometer_angle_deg && <Row label={t('treeDetail.row_angle')} value={`${tree.clinometer_angle_deg}°`} />}
                <Row label={t('treeDetail.row_height')} value={tree.height_m ? `${tree.height_m.toFixed(1)} m` : '—'} />
                <Row label={t('treeDetail.row_crown_ns')} value={tree.crown_ns_m ? `${tree.crown_ns_m} m` : '—'} />
                <Row label={t('treeDetail.row_crown_ew')} value={tree.crown_ew_m ? `${tree.crown_ew_m} m` : '—'} />
                {stems.map((stem, i) => (
                  <Row key={i}
                    label={tree.is_multistem ? t('treeDetail.row_stem_diam', { n: stem.stem_number }) : t('treeDetail.row_diameter')}
                    value={stem.diameter_cm ? `${stem.diameter_cm} cm${tree.is_multistem ? ` at ${stem.measurement_height_m}m` : ''}` : '—'} />
                ))}
                <Row label={t('treeDetail.row_health')} value={tree.health_status === 'good' ? `🟢 ${t('newTree.health_good')}` : tree.health_status === 'fair' ? `🟡 ${t('newTree.health_fair')}` : tree.health_status === 'poor' ? `🔴 ${t('newTree.health_poor')}` : '—'} />
                {tree.is_multistem && <Row label={t('treeDetail.row_multistem')} value={t('treeDetail.row_multistem_val')} />}
              </div>
            )}
          </div>
        )}

        {/* Location */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="font-semibold text-forest-800 mb-2">{t('treeDetail.gps_title')}</p>
          {tree.lat && tree.lng ? (
            <p className="text-sm text-gray-500 font-mono mb-3">{tree.lat.toFixed(6)}, {tree.lng.toFixed(6)}</p>
          ) : (
            <p className="text-sm text-gray-400 mb-3">{t('treeDetail.no_gps')}</p>
          )}
          <div className="flex gap-2">
            <button onClick={recaptureGPS}
              className="flex-1 border border-forest-200 text-forest-700 text-sm font-medium py-2.5 rounded-lg hover:bg-forest-50 transition-colors">
              {t('treeDetail.recapture')}
            </button>
            <button onClick={() => setShowMapPicker(true)}
              className="flex-1 border border-forest-200 text-forest-700 text-sm font-medium py-2.5 rounded-lg hover:bg-forest-50 transition-colors">
              {t('treeDetail.pick_map')}
            </button>
          </div>
        </div>

        {showMapPicker && (
          <MapPicker
            initialLat={tree.lat}
            initialLng={tree.lng}
            onConfirm={async ({ lat, lng }) => {
              await supabase.from('trees').update({ lat, lng }).eq('id', treeId)
              setTree(t => ({ ...t, lat, lng }))
              setShowMapPicker(false)
            }}
            onCancel={() => setShowMapPicker(false)}
          />
        )}

      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-forest-800">{value}</span>
    </div>
  )
}
