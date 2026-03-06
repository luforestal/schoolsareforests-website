'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminQualityPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('accuracy') // 'accuracy' | 'plantnet' | 'name' | 'trees'

  useEffect(() => { loadQuality() }, [])

  const loadQuality = async () => {
    // Load all schools
    const { data: schools } = await supabase
      .from('schools').select('id, name, country, location').order('name')

    if (!schools?.length) { setLoading(false); return }

    // Load trees with species_confidence
    const { data: trees } = await supabase
      .from('trees')
      .select('id, school_id, zone_id, species_confidence, inaccessible, needs_identification')

    // Load validations
    const { data: validations } = await supabase
      .from('tree_validations')
      .select('school_id, zone_id, accuracy_pct')

    // Load zones (to calculate required validations)
    const { data: zones } = await supabase
      .from('zones').select('id, school_id')

    // Build stats per school
    const stats = schools.map(school => {
      const schoolTrees = trees?.filter(t => t.school_id === school.id) || []
      const accessibleTrees = schoolTrees.filter(t => !t.inaccessible)
      const schoolZones = zones?.filter(z => z.school_id === school.id) || []
      const schoolValidations = validations?.filter(v => v.school_id === school.id) || []

      // PlantNet stats
      const treesWithPlantnet = schoolTrees.filter(t => t.species_confidence != null)
      const avgPlantnet = treesWithPlantnet.length > 0
        ? treesWithPlantnet.reduce((sum, t) => sum + t.species_confidence, 0) / treesWithPlantnet.length
        : null

      // Validation stats
      const requiredValidations = schoolZones.reduce((sum, z) => {
        const zoneAccessible = accessibleTrees.filter(t => t.zone_id === z.id).length
        return sum + Math.max(1, Math.ceil(zoneAccessible / 10))
      }, 0)
      const doneValidations = schoolValidations.length

      // Accuracy stats
      const validationsWithAccuracy = schoolValidations.filter(v => v.accuracy_pct != null)
      const avgAccuracy = validationsWithAccuracy.length > 0
        ? validationsWithAccuracy.reduce((sum, v) => sum + v.accuracy_pct, 0) / validationsWithAccuracy.length
        : null

      return {
        school,
        totalTrees: schoolTrees.length,
        accessibleTrees: accessibleTrees.length,
        treesWithPlantnet: treesWithPlantnet.length,
        avgPlantnet,
        requiredValidations,
        doneValidations,
        avgAccuracy,
      }
    })

    setRows(stats)
    setLoading(false)
  }

  const sorted = [...rows].sort((a, b) => {
    if (sortBy === 'accuracy') {
      if (a.avgAccuracy === null && b.avgAccuracy === null) return 0
      if (a.avgAccuracy === null) return 1
      if (b.avgAccuracy === null) return -1
      return a.avgAccuracy - b.avgAccuracy // ascending (worst first)
    }
    if (sortBy === 'plantnet') {
      if (a.avgPlantnet === null && b.avgPlantnet === null) return 0
      if (a.avgPlantnet === null) return 1
      if (b.avgPlantnet === null) return -1
      return b.avgPlantnet - a.avgPlantnet
    }
    if (sortBy === 'trees') return b.totalTrees - a.totalTrees
    return a.school.name.localeCompare(b.school.name)
  })

  const pctColor = (pct) => {
    if (pct == null) return 'text-gray-300'
    if (pct >= 90) return 'text-green-600'
    if (pct >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const validationColor = (done, required) => {
    if (required === 0) return 'text-gray-400'
    if (done >= required) return 'text-green-600'
    return 'text-red-600'
  }

  if (loading) return <p className="text-gray-400">Loading quality data…</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Quality</h1>
          <p className="text-gray-400 text-sm mt-1">Measurement accuracy and PlantNet confidence per school</p>
        </div>
        <button onClick={loadQuality} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          Refresh
        </button>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: 'accuracy', label: 'Sort: Worst accuracy first' },
          { key: 'plantnet', label: 'Sort: Best PlantNet first' },
          { key: 'trees', label: 'Sort: Most trees first' },
          { key: 'name', label: 'Sort: Name A–Z' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setSortBy(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              sortBy === key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">School</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trees</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">PlantNet ID</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">PlantNet Confidence</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Validations</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Measurement Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map(({ school, totalTrees, treesWithPlantnet, avgPlantnet, requiredValidations, doneValidations, avgAccuracy }) => (
              <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-900">{school.name}</p>
                  <p className="text-xs text-gray-400">{school.location || school.country}</p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-semibold text-gray-700">{totalTrees}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  {totalTrees > 0 ? (
                    <span className="text-gray-700">
                      {treesWithPlantnet}/{totalTrees}
                      <span className="text-xs text-gray-400 ml-1">
                        ({Math.round(treesWithPlantnet / totalTrees * 100)}%)
                      </span>
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-4 text-center">
                  {avgPlantnet != null ? (
                    <span className={`font-bold ${pctColor(avgPlantnet)}`}>
                      {Math.round(avgPlantnet)}%
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`font-semibold ${validationColor(doneValidations, requiredValidations)}`}>
                    {doneValidations}/{requiredValidations}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {avgAccuracy != null ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-bold text-base ${pctColor(avgAccuracy)}`}>
                        {Math.round(avgAccuracy)}%
                      </span>
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${avgAccuracy >= 90 ? 'bg-green-500' : avgAccuracy >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.round(avgAccuracy)}%` }}
                        />
                      </div>
                    </div>
                  ) : <span className="text-gray-300 text-xs">No validations yet</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="p-10 text-center text-gray-300">
            <p>No school data yet</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-gray-400 flex-wrap">
        <span><span className="text-green-600 font-semibold">Green</span> = ≥90%</span>
        <span><span className="text-amber-600 font-semibold">Amber</span> = 70–89%</span>
        <span><span className="text-red-600 font-semibold">Red</span> = &lt;70%</span>
        <span className="text-gray-300">|</span>
        <span>Measurement accuracy = average of teacher vs student across height and crown measurements</span>
      </div>
    </div>
  )
}
