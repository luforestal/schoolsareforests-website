'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const MapPicker = dynamicImport(() => import('@/components/MapPicker'), { ssr: false })

const PHOTO_LABELS = [
  { label: 'Full tree', hint: 'Step back and capture the whole tree' },
  { label: 'Bark / trunk', hint: 'Close-up of the bark texture' },
  { label: 'Leaves / detail', hint: 'Close-up of leaves, flowers or fruit' },
]

export default function NewTreePage() {
  const { schoolId, zoneLabel } = useParams()
  const router = useRouter()
  const [zone, setZone] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Inaccessible
  const [inaccessible, setInaccessible] = useState(false)
  const [inaccessibleNote, setInaccessibleNote] = useState('')

  // Species
  const [speciesCommon, setSpeciesCommon] = useState('')
  const [speciesScientific, setSpeciesScientific] = useState('')
  const [needsId, setNeedsId] = useState(false)

  // Units
  const [useMetric, setUseMetric] = useState(true)
  const [measureCircumference, setMeasureCircumference] = useState(false)

  // Height & crown (always stored in m internally)
  const [height, setHeight] = useState('')
  const [crownNS, setCrownNS] = useState('')
  const [crownEW, setCrownEW] = useState('')

  // Stems (diameter always stored in cm internally)
  const [isMultistem, setIsMultistem] = useState(false)
  const [stems, setStems] = useState([{ diameter: '', measureHeight: '1.3' }])

  // Health
  const [health, setHealth] = useState('')

  // Photos (up to 3)
  const [photos, setPhotos] = useState([null, null, null])
  const [previews, setPreviews] = useState([null, null, null])

  // PlantNet
  const [identifying, setIdentifying] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedConfidence, setSelectedConfidence] = useState(null)

  // GPS
  const [coords, setCoords] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('idle') // 'idle' | 'capturing' | 'success' | 'error'
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [schoolLocation, setSchoolLocation] = useState(null)
  const [schoolPerimeter, setSchoolPerimeter] = useState(null)

  // Unit conversion helpers — DB always stores metric
  const toMetricLen = (val) => useMetric ? parseFloat(val) : parseFloat(val) * 0.3048   // ft → m
  const toMetricDiam = (val) => useMetric ? parseFloat(val) : parseFloat(val) * 2.54    // in → cm
  const lenUnit = useMetric ? 'm' : 'ft'
  const diamUnit = useMetric ? 'cm' : 'in'
  const lenStep = useMetric ? '0.1' : '0.5'
  const diamStep = useMetric ? '0.1' : '0.1'

  useEffect(() => {
    const name = sessionStorage.getItem(`saf_student_name_${zoneLabel}`)
    if (!name) { router.push(`/field/${schoolId}/${zoneLabel}`); return }

    setGpsStatus('capturing')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGpsStatus('success')
        },
        () => setGpsStatus('error')
      )
    } else {
      setGpsStatus('error')
    }

    supabase.from('zones').select('*').eq('school_id', schoolId).eq('label', zoneLabel)
      .single().then(({ data }) => setZone(data))

    supabase.from('schools').select('location, country, lat, lng, perimeter_geojson').eq('id', schoolId)
      .single().then(async ({ data: school }) => {
        if (!school) return
        if (school.perimeter_geojson) setSchoolPerimeter(school.perimeter_geojson)
        if (school.lat && school.lng) {
          setSchoolLocation({ lat: school.lat, lng: school.lng })
        } else {
          try {
            const q = encodeURIComponent(school.location || school.country)
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`)
            const results = await res.json()
            if (results.length > 0) setSchoolLocation({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) })
          } catch (_) {}
        }
      })
  }, [schoolId, zoneLabel, router])

  const recaptureGPS = () => {
    setGpsStatus('capturing')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGpsStatus('success')
        },
        () => setGpsStatus('error')
      )
    } else {
      setGpsStatus('error')
    }
  }

  const handlePhoto = (index, e) => {
    const file = e.target.files[0]
    if (!file) return
    const newPhotos = [...photos]
    const newPreviews = [...previews]
    newPhotos[index] = file
    newPreviews[index] = URL.createObjectURL(file)
    setPhotos(newPhotos)
    setPreviews(newPreviews)
    setSuggestions([]) // clear previous suggestions when photos change
  }

  const compressImage = (file, maxPx = 1000, quality = 0.8) =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(blob => resolve(blob || file), 'image/jpeg', quality)
      }
      img.src = URL.createObjectURL(file)
    })

  const handleIdentify = async () => {
    const available = photos.filter(Boolean)
    if (!available.length) return
    setSuggestions([])
    setIdentifying(true)
    try {
      const compressed = await Promise.all(available.map(f => compressImage(f)))
      const formData = new FormData()
      compressed.forEach((blob, i) => formData.append('images', blob, `photo${i}.jpg`))
      const res = await fetch('/api/identify', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.results) {
        setSuggestions(data.results.slice(0, 3).map(r => ({
          score: Math.round(r.score * 100),
          scientific: r.species.scientificNameWithoutAuthor,
          common: r.species.commonNames?.[0] || '',
        })))
      }
    } catch (_) {}
    finally { setIdentifying(false) }
  }

  const addStem = () => {
    if (stems.length < 5) setStems([...stems, { diameter: '', measureHeight: '1.3' }])
  }
  const removeStem = (i) => setStems(stems.filter((_, idx) => idx !== i))
  const updateStem = (i, field, value) =>
    setStems(stems.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const validate = () => {
    if (inaccessible) {
      if (!inaccessibleNote.trim()) return 'Please describe why the tree is inaccessible.'
      return null
    }
    if (!photos[0]) return 'Please take at least the first photo (full tree).'
    if (!needsId && !speciesCommon.trim()) return 'Please enter the common species name, or tap "I don\'t know the species".'
    if (!height) return 'Please enter the tree height.'
    if (!crownNS) return 'Please enter the crown diameter (North–South).'
    if (!crownEW) return 'Please enter the crown diameter (West–East).'
    const activeStems = isMultistem ? stems : [stems[0]]
    for (let i = 0; i < activeStems.length; i++) {
      if (!activeStems[i].diameter) return `Please enter the diameter${isMultistem ? ` for stem ${i + 1}` : ''}.`
      if (isMultistem && !activeStems[i].measureHeight) return `Please enter the measurement height for stem ${i + 1}.`
    }
    if (!health) return 'Please select the health status.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); window.scrollTo(0, 0); return }
    setError('')
    setSubmitting(true)

    const recordedBy = sessionStorage.getItem(`saf_student_name_${zoneLabel}`)

    // Upload photos
    const uploadedUrls = []
    for (const photo of photos.filter(Boolean)) {
      const ext = photo.name.split('.').pop()
      const filename = `${zone.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('tree-photos').upload(filename, photo)
      if (!uploadErr) {
        const { data } = supabase.storage.from('tree-photos').getPublicUrl(filename)
        uploadedUrls.push(data.publicUrl)
      }
    }

    const { data: treeData, error: treeErr } = await supabase.from('trees').insert({
      school_id: schoolId,
      zone_id: zone.id,
      recorded_by: recordedBy,
      species_common: (inaccessible || needsId) ? null : speciesCommon.trim(),
      species_scientific: (inaccessible || needsId) ? null : (speciesScientific.trim() || null),
      height_m: inaccessible ? null : toMetricLen(height),
      crown_ns_m: inaccessible ? null : toMetricLen(crownNS),
      crown_ew_m: inaccessible ? null : toMetricLen(crownEW),
      is_multistem: inaccessible ? false : isMultistem,
      health_status: inaccessible ? null : health,
      photo_url: uploadedUrls[0] || null,
      inaccessible,
      inaccessible_note: inaccessible ? inaccessibleNote.trim() : null,
      needs_identification: !inaccessible && needsId,
      species_confidence: (!inaccessible && !needsId && selectedConfidence) ? selectedConfidence : null,
      lat: coords?.lat || null,
      lng: coords?.lng || null,
    }).select().single()

    if (treeErr) { setError(treeErr.message); setSubmitting(false); return }

    // Save additional photos to tree_photos table
    if (treeData && uploadedUrls.length > 1) {
      await supabase.from('tree_photos').insert(
        uploadedUrls.slice(1).map((url, i) => ({
          tree_id: treeData.id,
          photo_url: url,
          photo_order: i + 2,
        }))
      )
    }

    // Save stems
    if (!inaccessible && treeData) {
      const activeStems = isMultistem ? stems : [{ ...stems[0], measureHeight: '1.3' }]
      await supabase.from('tree_stems').insert(
        activeStems.map((s, i) => ({
          tree_id: treeData.id,
          stem_number: i + 1,
          diameter_cm: (() => {
            const raw = parseFloat(s.diameter)
            const asCm = toMetricDiam(raw)
            return measureCircumference ? asCm / Math.PI : asCm
          })(),
          measurement_height_m: toMetricLen(s.measureHeight),
        }))
      )
    }

    router.push(`/field/${schoolId}/${zoneLabel}`)
  }

  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-forest-800 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-forest-300 text-sm mb-2">← Back</button>
          <h1 className="font-bold text-lg">New Tree — Zone {zoneLabel}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
        )}

        {/* Inaccessible toggle */}
        <div className={`rounded-xl p-4 border-2 transition-colors ${inaccessible ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-white shadow-sm'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={inaccessible} onChange={e => setInaccessible(e.target.checked)}
              className="w-5 h-5 accent-amber-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-700">This tree cannot be measured safely</p>
              <p className="text-xs text-gray-400">Your teacher will be notified</p>
            </div>
          </label>
          {inaccessible && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Why is it inaccessible? *</label>
              <input type="text" value={inaccessibleNote} onChange={e => setInaccessibleNote(e.target.value)}
                placeholder="e.g. Too high up, wasp nest nearby, behind locked gate"
                className="w-full border border-amber-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
            </div>
          )}
        </div>

        {!inaccessible && (
          <>
            {/* 1. Photos */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
              <div>
                <p className="font-semibold text-forest-800">📷 Photos *</p>
                <p className="text-xs text-gray-400 mt-0.5">Take up to 3 photos — the more the better for species ID</p>
              </div>

              {PHOTO_LABELS.map((pl, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {i === 0 ? `${pl.label} *` : `${pl.label} `}
                    {i > 0 && <span className="text-gray-400 font-normal">(optional but helpful)</span>}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">{pl.hint}</p>
                  <label key={previews[i] || i} className="cursor-pointer block">
                    {previews[i] ? (
                      <div className="relative rounded-xl overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previews[i]} alt="" className="w-full h-36 object-cover" />
                        <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">Tap to change</span>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex items-center justify-center gap-2 text-gray-400 hover:border-forest-400 hover:text-forest-500 transition-colors">
                        <span className="text-2xl">📷</span>
                        <span className="text-sm">{pl.label}</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" capture="environment"
                      onChange={e => handlePhoto(i, e)} className="hidden" />
                  </label>
                </div>
              ))}

              {photos.some(Boolean) && (
                identifying ? (
                  <div className="flex items-center gap-2 text-sm text-forest-600 bg-forest-50 rounded-lg px-3 py-2">
                    <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Identifying with PlantNet… ({photos.filter(Boolean).length} photo{photos.filter(Boolean).length > 1 ? 's' : ''})
                  </div>
                ) : (
                  <button type="button" onClick={handleIdentify}
                    className="w-full bg-forest-50 border border-forest-200 text-forest-700 font-semibold py-2.5 rounded-lg hover:bg-forest-100 transition-colors text-sm">
                    🌿 Identify species with PlantNet ({photos.filter(Boolean).length} photo{photos.filter(Boolean).length > 1 ? 's' : ''})
                  </button>
                )
              )}
            </div>

            {/* 2. Species */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <p className="font-semibold text-forest-800">Species</p>

              {!identifying && suggestions.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">🌿 PlantNet suggestions — tap to use:</p>
                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <button key={i} type="button"
                        onClick={() => { setSpeciesCommon(s.common || s.scientific); setSpeciesScientific(s.scientific); setSelectedConfidence(s.score); setSuggestions([]); setNeedsId(false) }}
                        className="w-full text-left border border-forest-200 bg-forest-50 rounded-lg px-3 py-2.5 hover:bg-forest-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-forest-800">{s.common || s.scientific}</p>
                            <p className="text-xs italic text-gray-500">{s.scientific}</p>
                          </div>
                          <span className="text-xs font-bold text-forest-600 bg-white px-2 py-1 rounded-full border border-forest-200 flex-shrink-0 ml-2">
                            {s.score}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!needsId ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Common name *</label>
                    <input type="text" value={speciesCommon} onChange={e => setSpeciesCommon(e.target.value)}
                      placeholder="e.g. Oak, Pine, Mango"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scientific name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input type="text" value={speciesScientific} onChange={e => setSpeciesScientific(e.target.value)}
                      placeholder="e.g. Quercus robur"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 italic" />
                  </div>
                  <button type="button" onClick={() => { setNeedsId(true); setSpeciesCommon(''); setSpeciesScientific(''); setSelectedConfidence(null); setSuggestions([]) }}
                    className="w-full border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-gray-400 hover:border-amber-300 hover:text-amber-600 transition-colors">
                    ❓ I don't know the species — request help
                  </button>
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-amber-700 text-sm">❓ Identification requested</p>
                  <p className="text-amber-600 text-xs mt-1">Your teacher or an expert will identify this tree from your photos.</p>
                  <button type="button" onClick={() => setNeedsId(false)}
                    className="mt-3 text-xs text-amber-600 underline hover:text-amber-700">
                    I know the species — enter it manually
                  </button>
                </div>
              )}
            </div>

            {/* Unit toggle */}
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-600">Measurement units</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setUseMetric(true)}
                  className={`px-4 py-1.5 text-sm font-semibold transition-colors ${useMetric ? 'bg-forest-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  Metric
                </button>
                <button type="button" onClick={() => setUseMetric(false)}
                  className={`px-4 py-1.5 text-sm font-semibold transition-colors ${!useMetric ? 'bg-forest-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  Imperial
                </button>
              </div>
            </div>

            {/* 3. Height & Crown */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
              <div>
                <label className="block font-semibold text-forest-800 mb-1">Height *</label>
                <p className="text-xs text-gray-400 mb-2">Total tree height in {lenUnit}</p>
                <div className="flex items-center gap-2">
                  <input type="number" step={lenStep} min="0" value={height} onChange={e => setHeight(e.target.value)}
                    placeholder={useMetric ? 'e.g. 8.5' : 'e.g. 28'}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  <span className="text-gray-500 font-medium w-6">{lenUnit}</span>
                </div>
                {!useMetric && height && (
                  <p className="text-xs text-gray-400 mt-1">≈ {(parseFloat(height) * 0.3048).toFixed(2)} m</p>
                )}
              </div>
              <div>
                <label className="block font-semibold text-forest-800 mb-1">Crown diameter *</label>
                <p className="text-xs text-gray-400 mb-2">Measure in two directions ({lenUnit})</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">North–South</label>
                    <div className="flex items-center gap-1">
                      <input type="number" step={lenStep} min="0" value={crownNS} onChange={e => setCrownNS(e.target.value)}
                        placeholder={useMetric ? '5.0' : '16'}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                      <span className="text-gray-400 text-xs">{lenUnit}</span>
                    </div>
                    {!useMetric && crownNS && (
                      <p className="text-xs text-gray-400 mt-0.5">≈ {(parseFloat(crownNS) * 0.3048).toFixed(2)} m</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">West–East</label>
                    <div className="flex items-center gap-1">
                      <input type="number" step={lenStep} min="0" value={crownEW} onChange={e => setCrownEW(e.target.value)}
                        placeholder={useMetric ? '4.5' : '15'}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                      <span className="text-gray-400 text-xs">{lenUnit}</span>
                    </div>
                    {!useMetric && crownEW && (
                      <p className="text-xs text-gray-400 mt-0.5">≈ {(parseFloat(crownEW) * 0.3048).toFixed(2)} m</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Diameter */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-forest-800">Trunk measurement *</p>
                {/* Diameter vs Circumference toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                  <button type="button" onClick={() => setMeasureCircumference(false)}
                    className={`px-3 py-1.5 font-semibold transition-colors ${!measureCircumference ? 'bg-forest-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    Diameter
                  </button>
                  <button type="button" onClick={() => setMeasureCircumference(true)}
                    className={`px-3 py-1.5 font-semibold transition-colors ${measureCircumference ? 'bg-forest-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    Circumference
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {measureCircumference
                  ? `Wrap the tape around the trunk at 1.3${lenUnit === 'm' ? 'm' : ' ft'} — enter the full circumference`
                  : isMultistem ? `Diameter and measurement height for each stem (${diamUnit})`
                  : `Diameter at breast height (DBH) — at 1.3${lenUnit === 'm' ? 'm' : ' ft'} from the ground (${diamUnit})`}
              </p>
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={isMultistem}
                  onChange={e => { setIsMultistem(e.target.checked); if (!e.target.checked) setStems([stems[0] || { diameter: '', measureHeight: '1.3' }]) }}
                  className="w-4 h-4 accent-forest-600" />
                <span className="text-sm text-gray-600">Multi-stem tree</span>
              </label>
              <div className="space-y-3">
                {(isMultistem ? stems : [stems[0]]).map((stem, i) => (
                  <div key={i} className="flex items-end gap-2">
                    {isMultistem && <span className="text-xs font-bold text-forest-600 w-12 flex-shrink-0 pb-3">Stem {i + 1}</span>}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        {measureCircumference ? `Circumference (${diamUnit})` : `Diameter (${diamUnit})`}
                      </label>
                      <input type="number" step={diamStep} min="0" value={stem.diameter}
                        onChange={e => updateStem(i, 'diameter', e.target.value)}
                        placeholder={measureCircumference ? (useMetric ? 'e.g. 80' : 'e.g. 31') : (useMetric ? 'e.g. 25.4' : 'e.g. 10')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                      {stem.diameter && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {measureCircumference
                            ? <>diameter ≈ <strong>{(toMetricDiam(parseFloat(stem.diameter)) / Math.PI).toFixed(1)} cm</strong></>
                            : !useMetric
                              ? <>≈ {(parseFloat(stem.diameter) * 2.54).toFixed(1)} cm</>
                              : null}
                        </p>
                      )}
                    </div>
                    {isMultistem && (
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Measured at ({lenUnit})</label>
                        <input type="number" step={lenStep} min="0" value={stem.measureHeight}
                          onChange={e => updateStem(i, 'measureHeight', e.target.value)} placeholder={useMetric ? '1.3' : '4.3'}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                      </div>
                    )}
                    {isMultistem && stems.length > 1 && (
                      <button type="button" onClick={() => removeStem(i)}
                        className="text-gray-300 hover:text-red-400 pb-2.5 flex-shrink-0 text-lg">✕</button>
                    )}
                  </div>
                ))}
              </div>
              {isMultistem && stems.length < 5 && (
                <button type="button" onClick={addStem}
                  className="mt-3 text-forest-600 text-sm font-medium hover:text-forest-700">+ Add stem</button>
              )}
            </div>

            {/* 5. Health */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-forest-800 mb-3">Health Status *</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'good', label: 'Good', emoji: '🟢' },
                  { value: 'fair', label: 'Fair', emoji: '🟡' },
                  { value: 'poor', label: 'Poor', emoji: '🔴' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setHealth(opt.value)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors flex flex-col items-center gap-1 ${
                      health === opt.value ? 'border-forest-600 bg-forest-50 text-forest-700' : 'border-gray-200 text-gray-500'
                    }`}>
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Location */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="font-semibold text-forest-800 mb-3">📍 Location</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm mb-3 ${
            gpsStatus === 'capturing' ? 'bg-blue-50 text-blue-600' :
            gpsStatus === 'success' ? 'bg-green-50 text-green-700' :
            gpsStatus === 'error' ? 'bg-red-50 text-red-600' :
            'bg-gray-50 text-gray-500'
          }`}>
            {gpsStatus === 'capturing' && (
              <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {gpsStatus === 'capturing' && 'Capturing GPS…'}
            {gpsStatus === 'success' && `✓ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`}
            {gpsStatus === 'error' && '❌ GPS not available'}
            {gpsStatus === 'idle' && '— No location yet'}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={recaptureGPS}
              className="flex-1 border border-forest-200 text-forest-700 text-sm font-medium py-2.5 rounded-lg hover:bg-forest-50 transition-colors">
              📍 Recapture GPS
            </button>
            <button type="button" onClick={() => setShowMapPicker(true)}
              className="flex-1 border border-forest-200 text-forest-700 text-sm font-medium py-2.5 rounded-lg hover:bg-forest-50 transition-colors">
              🗺️ Adjust on map
            </button>
          </div>
        </div>

        {showMapPicker && (
          <MapPicker
            initialLat={coords?.lat ?? schoolLocation?.lat}
            initialLng={coords?.lng ?? schoolLocation?.lng}
            perimeterGeojson={schoolPerimeter}
            onConfirm={({ lat, lng }) => {
              setCoords({ lat, lng })
              setGpsStatus('success')
              setShowMapPicker(false)
            }}
            onCancel={() => setShowMapPicker(false)}
          />
        )}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-forest-700 text-white font-bold py-4 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-50 text-lg">
          {submitting ? 'Saving…' : inaccessible ? '⚠️ Report Inaccessible Tree' : needsId ? '💾 Save Tree (ID needed)' : '✓ Save Tree'}
        </button>
        <div className="pb-8" />
      </div>
    </div>
  )
}
