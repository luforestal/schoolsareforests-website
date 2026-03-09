'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminSchoolDetailPage() {
  const { schoolId } = useParams()
  const router = useRouter()

  const [school, setSchool] = useState(null)
  const [zones, setZones] = useState([])
  const [trees, setTrees] = useState([])
  const [validations, setValidations] = useState([])
  const [loading, setLoading] = useState(true)

  // Inline edit state
  const [editingTree, setEditingTree] = useState(null) // tree id being edited
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [schoolId])

  const loadData = async () => {
    const [
      { data: schoolData },
      { data: zonesData },
      { data: treesData },
      { data: validationsData },
    ] = await Promise.all([
      supabase.from('schools').select('*').eq('id', schoolId).single(),
      supabase.from('zones').select('*').eq('school_id', schoolId).order('label'),
      supabase.from('trees').select('*').eq('school_id', schoolId).order('zone_id').order('created_at'),
      supabase.from('tree_validations').select('*').eq('school_id', schoolId),
    ])
    setSchool(schoolData)
    setZones(zonesData || [])
    setTrees(treesData || [])
    setValidations(validationsData || [])
    setLoading(false)
  }

  const startEdit = (tree) => {
    setEditingTree(tree.id)
    setEditValues({
      species: tree.species || '',
      height_m: tree.height_m ?? '',
      crown_diameter_m: tree.crown_diameter_m ?? '',
      trunk_diameter_cm: tree.trunk_diameter_cm ?? '',
      health: tree.health || '',
    })
  }

  const cancelEdit = () => {
    setEditingTree(null)
    setEditValues({})
  }

  const saveEdit = async (treeId) => {
    setSaving(true)
    const update = {
      species: editValues.species || null,
      height_m: editValues.height_m !== '' ? parseFloat(editValues.height_m) : null,
      crown_diameter_m: editValues.crown_diameter_m !== '' ? parseFloat(editValues.crown_diameter_m) : null,
      trunk_diameter_cm: editValues.trunk_diameter_cm !== '' ? parseFloat(editValues.trunk_diameter_cm) : null,
      health: editValues.health || null,
    }
    const { error } = await supabase.from('trees').update(update).eq('id', treeId)
    if (error) { alert('Save error: ' + error.message); setSaving(false); return }
    await loadData()
    setEditingTree(null)
    setEditValues({})
    setSaving(false)
  }

  const deleteTree = async (treeId) => {
    if (!confirm('Delete this tree permanently?')) return
    await supabase.from('trees').delete().eq('id', treeId)
    await loadData()
  }

  if (loading) return <p className="text-gray-400">Loading…</p>
  if (!school) return <p className="text-red-400">School not found.</p>

  const getZoneTrees = (zoneId) => trees.filter(t => t.zone_id === zoneId)
  const getTreeValidation = (treeId) => validations.find(v => v.tree_id === treeId)

  const accuracyColor = (pct) => {
    if (pct == null) return 'text-gray-400'
    if (pct >= 90) return 'text-green-600'
    if (pct >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const healthColor = (h) => {
    if (!h) return 'bg-gray-100 text-gray-500'
    if (h === 'healthy') return 'bg-green-100 text-green-700'
    if (h === 'stressed') return 'bg-amber-100 text-amber-700'
    if (h === 'dead') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-700 mb-3 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{school.location || school.country} · {trees.length} trees · {zones.length} zones</p>
      </div>

      {/* Zones */}
      <div className="space-y-8">
        {zones.length === 0 && (
          <p className="text-gray-300 text-sm">No zones yet.</p>
        )}

        {zones.map(zone => {
          const zoneTrees = getZoneTrees(zone.id)
          return (
            <div key={zone.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Zone header */}
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-forest-600 text-white font-bold text-lg flex items-center justify-center">
                    {zone.label}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Zone {zone.label} — {zone.location_type || 'No type'}</p>
                    <p className="text-xs text-gray-400">Group {zone.group_number || '—'} · {zoneTrees.length} trees</p>
                  </div>
                </div>

                {/* Zone photos */}
                <div className="flex gap-2">
                  {zone.photo1_url && (
                    <a href={zone.photo1_url} target="_blank" rel="noreferrer">
                      <img src={zone.photo1_url} alt="Zone photo 1" className="w-14 h-14 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                    </a>
                  )}
                  {zone.photo2_url && (
                    <a href={zone.photo2_url} target="_blank" rel="noreferrer">
                      <img src={zone.photo2_url} alt="Zone photo 2" className="w-14 h-14 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                    </a>
                  )}
                  {!zone.photo1_url && !zone.photo2_url && (
                    <span className="text-xs text-gray-300 self-center">No zone photos</span>
                  )}
                </div>
              </div>

              {/* Trees */}
              {zoneTrees.length === 0 ? (
                <p className="px-5 py-4 text-xs text-gray-300">No trees recorded in this zone.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {zoneTrees.map((tree, idx) => {
                    const val = getTreeValidation(tree.id)
                    const isEditing = editingTree === tree.id

                    return (
                      <div key={tree.id} className="px-5 py-4">
                        <div className="flex gap-4">
                          {/* Tree photo */}
                          <div className="shrink-0">
                            {tree.photo_url ? (
                              <a href={tree.photo_url} target="_blank" rel="noreferrer">
                                <img
                                  src={tree.photo_url}
                                  alt={`Tree ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                🌳
                              </div>
                            )}
                          </div>

                          {/* Tree data */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tree {idx + 1}</span>
                                {val && (
                                  <span className={`ml-2 text-xs font-bold ${accuracyColor(val.accuracy_pct)}`}>
                                    {val.accuracy_pct != null ? `${Math.round(val.accuracy_pct)}% accuracy` : 'Validated'}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 shrink-0">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => saveEdit(tree.id)}
                                      disabled={saving}
                                      className="text-xs font-semibold bg-forest-600 text-white px-3 py-1 rounded-lg hover:bg-forest-700 disabled:opacity-50"
                                    >
                                      {saving ? '…' : 'Save'}
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="text-xs text-gray-400 px-2 py-1 hover:text-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEdit(tree)}
                                      className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteTree(tree.id)}
                                      className="text-xs text-red-400 border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs text-gray-400">Species</label>
                                  <input
                                    value={editValues.species}
                                    onChange={e => setEditValues(v => ({ ...v, species: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                                    placeholder="Species"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400">Height (m)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editValues.height_m}
                                    onChange={e => setEditValues(v => ({ ...v, height_m: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400">Crown diameter (m)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editValues.crown_diameter_m}
                                    onChange={e => setEditValues(v => ({ ...v, crown_diameter_m: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400">Trunk diameter (cm)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editValues.trunk_diameter_cm}
                                    onChange={e => setEditValues(v => ({ ...v, trunk_diameter_cm: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400">Health</label>
                                  <select
                                    value={editValues.health}
                                    onChange={e => setEditValues(v => ({ ...v, health: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                                  >
                                    <option value="">Unknown</option>
                                    <option value="healthy">Healthy</option>
                                    <option value="stressed">Stressed</option>
                                    <option value="dead">Dead</option>
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                <span className="text-gray-700 font-medium">{tree.species || <span className="text-gray-300">No species</span>}</span>
                                {tree.height_m != null && <span className="text-gray-500">H: <b>{tree.height_m}m</b></span>}
                                {tree.crown_diameter_m != null && <span className="text-gray-500">Crown: <b>{tree.crown_diameter_m}m</b></span>}
                                {tree.trunk_diameter_cm != null && <span className="text-gray-500">Trunk: <b>{tree.trunk_diameter_cm}cm</b></span>}
                                {tree.health && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${healthColor(tree.health)}`}>
                                    {tree.health}
                                  </span>
                                )}
                                {tree.inaccessible && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">inaccessible</span>
                                )}
                                {tree.needs_identification && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">needs ID</span>
                                )}
                              </div>
                            )}

                            {/* Validation info */}
                            {!isEditing && val && (
                              <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-3">
                                {val.teacher_height_m != null && (
                                  <span>Teacher H: {val.teacher_height_m}m</span>
                                )}
                                {val.teacher_crown_m != null && (
                                  <span>Teacher Crown: {val.teacher_crown_m}m</span>
                                )}
                                {val.teacher_species && val.teacher_species !== tree.species && (
                                  <span className="text-amber-500">Teacher species: {val.teacher_species}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Trees without a zone */}
      {(() => {
        const zoneIds = new Set(zones.map(z => z.id))
        const orphaned = trees.filter(t => !zoneIds.has(t.zone_id))
        if (orphaned.length === 0) return null
        return (
          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">
            <p className="font-semibold text-amber-700 mb-2">Trees without a matching zone ({orphaned.length})</p>
            <div className="space-y-1">
              {orphaned.map(t => (
                <p key={t.id} className="text-sm text-amber-600 font-mono">{t.id} — {t.species || 'No species'}</p>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
