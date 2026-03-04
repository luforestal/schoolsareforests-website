'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewTreePage() {
  const { schoolId, zoneLabel } = useParams()
  const router = useRouter()
  const fileRef = useRef()
  const [zone, setZone] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Inaccessible
  const [inaccessible, setInaccessible] = useState(false)
  const [inaccessibleNote, setInaccessibleNote] = useState('')

  // Species
  const [speciesCommon, setSpeciesCommon] = useState('')
  const [speciesScientific, setSpeciesScientific] = useState('')

  // Height
  const [height, setHeight] = useState('')

  // Stems
  const [isMultistem, setIsMultistem] = useState(false)
  const [stems, setStems] = useState([{ diameter: '', measureHeight: '1.3' }])

  // Health
  const [health, setHealth] = useState('')

  // Photo
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  // GPS (silent)
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    const name = sessionStorage.getItem('saf_student_name')
    if (!name) { router.push(`/field/${schoolId}/${zoneLabel}`); return }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }

    const load = async () => {
      const { data: zoneData } = await supabase
        .from('zones').select('*').eq('school_id', schoolId).eq('label', zoneLabel).single()
      setZone(zoneData)
    }
    load()
  }, [schoolId, zoneLabel, router])

  const addStem = () => {
    if (stems.length < 5) setStems([...stems, { diameter: '', measureHeight: '1.3' }])
  }

  const removeStem = (i) => setStems(stems.filter((_, idx) => idx !== i))

  const updateStem = (i, field, value) =>
    setStems(stems.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    if (inaccessible) {
      if (!inaccessibleNote.trim()) return 'Please describe why the tree is inaccessible.'
      return null
    }
    if (!speciesCommon.trim()) return 'Please enter the common species name.'
    if (!height) return 'Please enter the tree height.'
    const activeStems = isMultistem ? stems : [stems[0]]
    for (let i = 0; i < activeStems.length; i++) {
      if (!activeStems[i].diameter) return `Please enter the diameter${isMultistem ? ` for stem ${i + 1}` : ''}.`
      if (isMultistem && !activeStems[i].measureHeight) return `Please enter the measurement height for stem ${i + 1}.`
    }
    if (!health) return 'Please select the health status.'
    if (!photoFile) return 'Please take a photo of the tree.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); window.scrollTo(0, 0); return }
    setError('')
    setSubmitting(true)

    const recordedBy = sessionStorage.getItem('saf_student_name')

    let photoUrl = null
    if (photoFile && !inaccessible) {
      const ext = photoFile.name.split('.').pop()
      const filename = `${zone.id}-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('tree-photos').upload(filename, photoFile)
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('tree-photos').getPublicUrl(filename)
        photoUrl = urlData.publicUrl
      }
    }

    const { data: treeData, error: treeErr } = await supabase
      .from('trees').insert({
        school_id: schoolId,
        zone_id: zone.id,
        recorded_by: recordedBy,
        species_common: inaccessible ? null : speciesCommon.trim(),
        species_scientific: inaccessible ? null : (speciesScientific.trim() || null),
        height_m: inaccessible ? null : parseFloat(height),
        is_multistem: inaccessible ? false : isMultistem,
        health_status: inaccessible ? null : health,
        photo_url: photoUrl,
        inaccessible,
        inaccessible_note: inaccessible ? inaccessibleNote.trim() : null,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
      }).select().single()

    if (treeErr) { setError(treeErr.message); setSubmitting(false); return }

    if (!inaccessible && treeData) {
      const activeStems = isMultistem ? stems : [{ ...stems[0], measureHeight: '1.3' }]
      await supabase.from('tree_stems').insert(
        activeStems.map((s, i) => ({
          tree_id: treeData.id,
          stem_number: i + 1,
          diameter_cm: parseFloat(s.diameter),
          measurement_height_m: parseFloat(s.measureHeight),
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
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Inaccessible toggle */}
        <div className={`rounded-xl p-4 border-2 transition-colors ${inaccessible ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-white shadow-sm'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inaccessible}
              onChange={e => setInaccessible(e.target.checked)}
              className="w-5 h-5 accent-amber-500 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-gray-700">This tree cannot be measured safely</p>
              <p className="text-xs text-gray-400">Your teacher will be notified</p>
            </div>
          </label>
          {inaccessible && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Why is it inaccessible? *</label>
              <input
                type="text"
                value={inaccessibleNote}
                onChange={e => setInaccessibleNote(e.target.value)}
                placeholder="e.g. Too high up, wasp nest nearby, behind locked gate"
                className="w-full border border-amber-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </div>
          )}
        </div>

        {!inaccessible && (
          <>
            {/* Species */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <p className="font-semibold text-forest-800">Species</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Common name *</label>
                <input
                  type="text"
                  value={speciesCommon}
                  onChange={e => setSpeciesCommon(e.target.value)}
                  placeholder="e.g. Oak, Pine, Mango"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scientific name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={speciesScientific}
                  onChange={e => setSpeciesScientific(e.target.value)}
                  placeholder="e.g. Quercus robur"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 italic"
                />
              </div>
            </div>

            {/* Height */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <label className="block font-semibold text-forest-800 mb-1">Height *</label>
              <p className="text-xs text-gray-400 mb-3">Total tree height in meters</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="e.g. 8.5"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
                <span className="text-gray-500 font-medium">m</span>
              </div>
            </div>

            {/* Diameter / Stems */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-forest-800 mb-1">Trunk Diameter *</p>
              <p className="text-xs text-gray-400 mb-3">
                {isMultistem ? 'Diameter and measurement height for each stem' : 'Diameter at breast height (DBH) — measured at 1.3m from the ground'}
              </p>

              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMultistem}
                  onChange={e => {
                    setIsMultistem(e.target.checked)
                    if (!e.target.checked) setStems([stems[0] || { diameter: '', measureHeight: '1.3' }])
                  }}
                  className="w-4 h-4 accent-forest-600"
                />
                <span className="text-sm text-gray-600">Multi-stem tree</span>
              </label>

              <div className="space-y-3">
                {(isMultistem ? stems : [stems[0]]).map((stem, i) => (
                  <div key={i} className="flex items-end gap-2">
                    {isMultistem && (
                      <span className="text-xs font-bold text-forest-600 w-12 flex-shrink-0 pb-3">Stem {i + 1}</span>
                    )}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Diameter (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={stem.diameter}
                        onChange={e => updateStem(i, 'diameter', e.target.value)}
                        placeholder="e.g. 25.4"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                      />
                    </div>
                    {isMultistem && (
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Measured at (m)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={stem.measureHeight}
                          onChange={e => updateStem(i, 'measureHeight', e.target.value)}
                          placeholder="1.3"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                        />
                      </div>
                    )}
                    {isMultistem && stems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStem(i)}
                        className="text-gray-300 hover:text-red-400 pb-2.5 flex-shrink-0 text-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isMultistem && stems.length < 5 && (
                <button
                  type="button"
                  onClick={addStem}
                  className="mt-3 text-forest-600 text-sm font-medium hover:text-forest-700"
                >
                  + Add stem
                </button>
              )}
            </div>

            {/* Health */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-forest-800 mb-3">Health Status *</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'good', label: 'Good', emoji: '🟢' },
                  { value: 'fair', label: 'Fair', emoji: '🟡' },
                  { value: 'poor', label: 'Poor', emoji: '🔴' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHealth(opt.value)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors flex flex-col items-center gap-1 ${
                      health === opt.value
                        ? 'border-forest-600 bg-forest-50 text-forest-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-forest-800 mb-1">Photo *</p>
              <p className="text-xs text-gray-400 mb-3">Take a photo of the full tree</p>
              <label className="cursor-pointer block">
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Tree" className="w-full h-52 object-cover" />
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                      Tap to change
                    </span>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 hover:border-forest-400 hover:text-forest-500 transition-colors">
                    <span className="text-3xl mb-1">📷</span>
                    <span className="text-sm font-medium">Take a photo</span>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhoto}
                  className="hidden"
                />
              </label>
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-forest-700 text-white font-bold py-4 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-50 text-lg"
        >
          {submitting ? 'Saving…' : inaccessible ? '⚠️ Report Inaccessible Tree' : '✓ Save Tree'}
        </button>

        <div className="pb-8" />
      </div>
    </div>
  )
}
