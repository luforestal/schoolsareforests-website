'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TreeDetailPage() {
  const { schoolId, zoneLabel, treeId } = useParams()
  const router = useRouter()

  const [tree, setTree] = useState(null)
  const [stems, setStems] = useState([])
  const [extraPhotos, setExtraPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [treeNumber, setTreeNumber] = useState(null)

  // Edit species state
  const [editingSpecies, setEditingSpecies] = useState(false)
  const [editCommon, setEditCommon] = useState('')
  const [editScientific, setEditScientific] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: treeData } = await supabase
        .from('trees').select('*').eq('id', treeId).single()
      if (!treeData) { router.back(); return }
      setTree(treeData)
      setEditCommon(treeData.species_common || '')
      setEditScientific(treeData.species_scientific || '')

      // Get stems
      const { data: stemsData } = await supabase
        .from('tree_stems').select('*').eq('tree_id', treeId).order('stem_number')
      setStems(stemsData || [])

      // Get extra photos
      const { data: photosData } = await supabase
        .from('tree_photos').select('*').eq('tree_id', treeId).order('photo_order')
      setExtraPhotos(photosData || [])

      // Get tree number within zone
      const { data: zoneTrees } = await supabase
        .from('trees').select('id').eq('zone_id', treeData.zone_id)
        .eq('inaccessible', false).order('id')
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

  if (loading) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">Loading…</p>
    </div>
  )

  const allPhotos = [
    tree.photo_url && { url: tree.photo_url, label: 'Full tree' },
    ...extraPhotos.map((p, i) => ({ url: p.photo_url, label: ['Bark / trunk', 'Leaves / detail'][i] || `Photo ${i + 2}` })),
  ].filter(Boolean)

  const healthLabel = tree.health_status === 'good' ? '🟢 Good' : tree.health_status === 'fair' ? '🟡 Fair' : tree.health_status === 'poor' ? '🔴 Poor' : null

  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-forest-800 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-forest-300 text-sm mb-2">← Back to zone</button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">
                {tree.inaccessible ? '⚠️ Inaccessible Tree' : `Tree ${treeNumber ?? ''}`}
              </h1>
              <p className="text-forest-300 text-sm">Zone {zoneLabel} · Recorded by {tree.recorded_by}</p>
            </div>
            {tree.needs_identification && (
              <span className="text-xs bg-amber-400 text-amber-900 font-bold px-2 py-1 rounded-full">❓ Needs ID</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Photo gallery */}
        {allPhotos.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {allPhotos.map((p, i) => (
              <div key={i} className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.label}
                  className="h-48 w-36 object-cover rounded-xl shadow-sm" />
                <p className="text-xs text-gray-400 text-center mt-1">{p.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Inaccessible */}
        {tree.inaccessible && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-700">⚠️ Reported as inaccessible</p>
            {tree.inaccessible_note && <p className="text-amber-600 text-sm mt-1">{tree.inaccessible_note}</p>}
          </div>
        )}

        {/* Species */}
        {!tree.inaccessible && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-forest-800">Species</p>
              {!editingSpecies && (
                <button onClick={() => setEditingSpecies(true)}
                  className="text-xs text-forest-600 hover:text-forest-700 font-medium">Edit</button>
              )}
            </div>

            {editingSpecies ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Common name *</label>
                  <input type="text" value={editCommon} onChange={e => setEditCommon(e.target.value)}
                    placeholder="e.g. Oak"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Scientific name (optional)</label>
                  <input type="text" value={editScientific} onChange={e => setEditScientific(e.target.value)}
                    placeholder="e.g. Quercus robur"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 italic" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveSpecies} disabled={!editCommon.trim() || saving}
                    className="flex-1 bg-forest-700 text-white text-sm font-semibold py-2 rounded-lg hover:bg-forest-600 disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => { setEditingSpecies(false); setEditCommon(tree.species_common || ''); setEditScientific(tree.species_scientific || '') }}
                    className="text-gray-400 text-sm px-4 hover:text-gray-600">Cancel</button>
                </div>
              </div>
            ) : tree.needs_identification ? (
              <div>
                <p className="text-amber-600 text-sm font-medium">❓ Species not yet identified</p>
                <button onClick={() => setEditingSpecies(true)}
                  className="mt-2 text-sm text-forest-600 font-medium hover:text-forest-700">
                  + Enter species now
                </button>
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
            <p className="font-semibold text-forest-800 mb-3">Measurements</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Height</span>
                <span className="font-medium text-forest-800">{tree.height_m ? `${tree.height_m} m` : '—'}</span>
              </div>
              {stems.length > 0 && stems.map((stem, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {tree.is_multistem ? `Stem ${stem.stem_number} diameter` : 'Diameter (DBH)'}
                  </span>
                  <span className="font-medium text-forest-800">
                    {stem.diameter_cm} cm
                    {tree.is_multistem && <span className="text-gray-400 text-xs"> at {stem.measurement_height_m}m</span>}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Health</span>
                <span className="font-medium">{healthLabel || '—'}</span>
              </div>
              {tree.is_multistem && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-forest-800">Multi-stem</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {(tree.lat && tree.lng) && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-forest-800 mb-1">Location</p>
            <p className="text-sm text-gray-500 font-mono">{tree.lat.toFixed(6)}, {tree.lng.toFixed(6)}</p>
          </div>
        )}

      </div>
    </div>
  )
}
