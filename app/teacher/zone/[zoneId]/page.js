'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const HEALTH_COLORS = {
  good: 'bg-green-100 text-green-700',
  fair: 'bg-amber-100 text-amber-700',
  poor: 'bg-red-100 text-red-700',
}

export default function TeacherZonePage() {
  const { zoneId } = useParams()
  const router = useRouter()
  const [zone, setZone] = useState(null)
  const [school, setSchool] = useState(null)
  const [trees, setTrees] = useState([])
  const [validations, setValidations] = useState([]) // tree_validations for this zone
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pickingRandom, setPickingRandom] = useState(false)

  useEffect(() => { loadData() }, [zoneId])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/teacher'); return }

    const { data: teacherData } = await supabase
      .from('teachers')
      .select('id, school_id, status')
      .eq('id', user.id)
      .single()

    if (!teacherData || teacherData.status !== 'approved') {
      router.push('/teacher/pending'); return
    }
    setTeacher(teacherData)

    // Load zone
    const { data: zoneData } = await supabase
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single()

    if (!zoneData || zoneData.school_id !== teacherData.school_id) {
      router.push('/teacher/dashboard'); return
    }
    setZone(zoneData)

    // Load school
    const { data: schoolData } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', zoneData.school_id)
      .single()
    setSchool(schoolData)

    // Load trees in this zone with stems
    const { data: treesData } = await supabase
      .from('trees')
      .select('*, tree_stems(*)')
      .eq('zone_id', zoneId)
      .order('id')
    setTrees(treesData || [])

    // Load validations for this zone
    const { data: validationsData } = await supabase
      .from('tree_validations')
      .select('*')
      .eq('zone_id', zoneId)
    setValidations(validationsData || [])

    setLoading(false)
  }

  const accessibleTrees = trees.filter(t => !t.inaccessible)
  const requiredValidations = Math.max(1, Math.ceil(accessibleTrees.length / 10))
  const doneValidations = validations.length
  const validationComplete = accessibleTrees.length === 0 || doneValidations >= requiredValidations
  const avgAccuracy = validations.length > 0
    ? Math.round(validations.reduce((sum, v) => sum + (v.accuracy_pct || 0), 0) / validations.length)
    : null

  const validatedTreeIds = new Set(validations.map(v => v.tree_id))

  const startValidation = async () => {
    setPickingRandom(true)
    // Pick a random accessible tree that hasn't been validated yet
    const unvalidated = accessibleTrees.filter(t => !validatedTreeIds.has(t.id))
    const pool = unvalidated.length > 0 ? unvalidated : accessibleTrees
    if (pool.length === 0) { setPickingRandom(false); return }
    const picked = pool[Math.floor(Math.random() * pool.length)]
    router.push(`/teacher/validate/${picked.id}?zoneId=${zoneId}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">Loading…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-forest-50">
      {/* Header */}
      <div className="bg-forest-800 text-white px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.push('/teacher/dashboard')} className="text-forest-300 text-sm mb-2 hover:text-white transition-colors">
            ← Dashboard
          </button>
          <h1 className="text-xl font-bold">Zone {zone.label} {zone.category ? `— ${zone.category}` : ''}</h1>
          {zone.description && <p className="text-forest-300 text-sm">{zone.description}</p>}
          {school && <p className="text-forest-400 text-xs mt-0.5">{school.name}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-forest-700">{trees.length}</div>
            <div className="text-gray-400 text-xs mt-1">Total trees</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-forest-700">{accessibleTrees.length}</div>
            <div className="text-gray-400 text-xs mt-1">Accessible</div>
          </div>
          <div className={`rounded-xl p-4 text-center shadow-sm ${validationComplete ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`text-2xl font-bold ${validationComplete ? 'text-green-700' : 'text-red-600'}`}>
              {doneValidations}/{requiredValidations}
            </div>
            <div className={`text-xs mt-1 ${validationComplete ? 'text-green-600' : 'text-red-500'}`}>Validations</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-forest-700">
              {avgAccuracy !== null ? `${avgAccuracy}%` : '—'}
            </div>
            <div className="text-gray-400 text-xs mt-1">Avg accuracy</div>
          </div>
        </div>

        {/* Validation panel */}
        {accessibleTrees.length > 0 && (
          <div className={`rounded-xl p-5 mb-8 ${validationComplete ? 'bg-green-50 border border-green-100' : 'bg-white shadow-sm border-2 border-red-100'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`font-semibold ${validationComplete ? 'text-green-800' : 'text-forest-800'}`}>
                  {validationComplete ? '✓ Validation complete for this zone' : 'Validation required'}
                </p>
                <p className={`text-sm mt-0.5 ${validationComplete ? 'text-green-600' : 'text-gray-500'}`}>
                  {validationComplete
                    ? `${doneValidations} tree${doneValidations !== 1 ? 's' : ''} validated — data quality confirmed`
                    : `${requiredValidations - doneValidations} more validation${requiredValidations - doneValidations !== 1 ? 's' : ''} needed (1 per 10 trees)`}
                </p>
              </div>
              {!validationComplete && (
                <button
                  onClick={startValidation}
                  disabled={pickingRandom}
                  className="flex-shrink-0 bg-forest-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-50"
                >
                  {pickingRandom ? 'Selecting…' : 'Validate random tree →'}
                </button>
              )}
              {validationComplete && doneValidations < accessibleTrees.length && (
                <button
                  onClick={startValidation}
                  disabled={pickingRandom}
                  className="flex-shrink-0 border border-green-300 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {pickingRandom ? 'Selecting…' : 'Validate another'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tree list */}
        <h2 className="text-lg font-bold text-forest-800 mb-4">Trees in Zone {zone.label}</h2>

        {trees.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm">
            <div className="text-3xl mb-2">🌱</div>
            <p>No trees recorded in this zone yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trees.map((tree, idx) => {
              const isValidated = validatedTreeIds.has(tree.id)
              const validation = validations.find(v => v.tree_id === tree.id)
              return (
                <div key={tree.id} className={`bg-white rounded-xl shadow-sm overflow-hidden ${isValidated ? 'border-l-4 border-green-400' : ''}`}>
                  <div className="p-4 flex items-start gap-4">
                    {/* Tree number */}
                    <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {tree.inaccessible ? (
                        <p className="text-sm font-semibold text-amber-700">⚠️ Inaccessible — {tree.inaccessible_note || 'no reason given'}</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-forest-800 text-sm">
                              {tree.species_common || (tree.needs_identification ? 'ID needed' : 'Unknown')}
                            </p>
                            {tree.species_scientific && (
                              <p className="text-xs italic text-gray-400">{tree.species_scientific}</p>
                            )}
                            {tree.species_confidence && (
                              <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                                PlantNet {tree.species_confidence}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {tree.height_m && <span className="text-xs text-gray-500">↕ {tree.height_m}m</span>}
                            {tree.crown_ns_m && <span className="text-xs text-gray-500">⊕ {tree.crown_ns_m}×{tree.crown_ew_m}m</span>}
                            {tree.health_status && (
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${HEALTH_COLORS[tree.health_status] || ''}`}>
                                {tree.health_status}
                              </span>
                            )}
                            {tree.recorded_by && <span className="text-xs text-gray-400">by {tree.recorded_by}</span>}
                          </div>
                          {isValidated && validation && (
                            <p className="text-xs text-green-600 mt-1 font-semibold">
                              ✓ Validated — {Math.round(validation.accuracy_pct || 0)}% accuracy
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-2 items-start">
                      <button
                        onClick={() => router.push(`/field/${zone.school_id}/${zone.label}/${tree.id}`)}
                        className="text-xs font-semibold text-forest-600 bg-forest-50 px-3 py-1.5 rounded-lg hover:bg-forest-100 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
