'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ZonePage() {
  const { schoolId, zoneLabel } = useParams()
  const router = useRouter()
  const [zone, setZone] = useState(null)
  const [school, setSchool] = useState(null)
  const [trees, setTrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('saf_student_name')
    if (saved) { setName(saved); setStarted(true) }

    const load = async () => {
      const { data: schoolData } = await supabase
        .from('schools').select('id, name, logo_url').eq('id', schoolId).single()
      setSchool(schoolData)

      const { data: zoneData } = await supabase
        .from('zones').select('*').eq('school_id', schoolId).eq('label', zoneLabel).single()
      setZone(zoneData)

      if (zoneData) {
        const { data: treesData } = await supabase
          .from('trees').select('*').eq('zone_id', zoneData.id).order('id')
        setTrees(treesData || [])
      }
      setLoading(false)
    }
    load()
  }, [schoolId, zoneLabel])

  const handleStart = () => {
    if (!name.trim()) return
    sessionStorage.setItem('saf_student_name', name.trim())
    setStarted(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">Loading…</p>
    </div>
  )

  if (!started) {
    return (
      <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-3xl mx-auto mb-4">
              {zoneLabel}
            </div>
            <h1 className="text-xl font-bold text-forest-800">Zone {zoneLabel}</h1>
            {zone?.category && <p className="text-gray-400 text-sm">{zone.category}</p>}
            {zone?.description && <p className="text-gray-400 text-xs mt-0.5">{zone.description}</p>}
            {zone?.group_number && (
              <span className="inline-block mt-2 text-xs bg-forest-50 text-forest-600 px-3 py-1 rounded-full font-medium">
                Group {zone.group_number}
              </span>
            )}
          </div>

          {trees.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-amber-700 text-sm font-semibold">⚠️ This zone already has {trees.length} tree{trees.length > 1 ? 's' : ''} recorded.</p>
              <p className="text-amber-600 text-xs mt-0.5">Make sure this is your zone before continuing.</p>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Who's entering the data?</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="Your name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              autoFocus
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50"
          >
            Start Inventory →
          </button>

          <button
            onClick={() => router.push(`/field/${schoolId}`)}
            className="w-full text-gray-400 text-sm mt-3 py-2 hover:text-gray-600"
          >
            ← Back to zones
          </button>
        </div>
      </div>
    )
  }

  const regularTrees = trees.filter(t => !t.inaccessible)
  const inaccessibleTrees = trees.filter(t => t.inaccessible)

  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-forest-800 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.push(`/field/${schoolId}`)} className="text-forest-300 text-sm mb-2">
            ← Back to zones
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
              {zoneLabel}
            </div>
            <div>
              <h1 className="font-bold text-lg">
                Zone {zoneLabel}{zone?.category ? ` · ${zone.category}` : ''}
              </h1>
              <p className="text-forest-300 text-sm">
                Recording as <span className="text-white font-medium">{name}</span>
                {' · '}
                <button onClick={() => { sessionStorage.removeItem('saf_student_name'); setStarted(false) }} className="underline text-forest-300 hover:text-white">
                  change
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => router.push(`/field/${schoolId}/${zoneLabel}/new`)}
          className="w-full bg-forest-700 text-white font-semibold py-4 rounded-xl hover:bg-forest-600 transition-colors mb-6 text-lg active:scale-[0.99]"
        >
          🌳 Add Tree
        </button>

        {inaccessibleTrees.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-amber-700 font-semibold text-sm">
              ⚠️ {inaccessibleTrees.length} inaccessible tree{inaccessibleTrees.length > 1 ? 's' : ''} reported
            </p>
            <p className="text-amber-600 text-xs mt-1">Your teacher has been notified.</p>
          </div>
        )}

        {regularTrees.length > 0 && (
          <div>
            <p className="text-gray-500 text-sm font-medium mb-3">🌳 {regularTrees.length} tree{regularTrees.length > 1 ? 's' : ''} recorded</p>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[2rem_1fr_3rem_3rem_3rem] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span>#</span>
                <span>Species</span>
                <span className="text-center">↕ m</span>
                <span className="text-center">⌀ cm</span>
                <span className="text-center">Health</span>
              </div>
              {regularTrees.map((tree, i) => (
                <div key={tree.id} className={`grid grid-cols-[2rem_1fr_3rem_3rem_3rem] gap-2 px-4 py-3 items-center ${i < regularTrees.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-xs font-bold text-forest-600">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-forest-800 truncate">{tree.species_common || '—'}</p>
                    {tree.species_scientific && (
                      <p className="text-xs text-gray-400 italic truncate">{tree.species_scientific}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 text-center">{tree.height_m ?? '—'}</span>
                  <span className="text-xs text-gray-600 text-center">—</span>
                  <span className="text-center text-sm">
                    {tree.health_status === 'good' ? '🟢' : tree.health_status === 'fair' ? '🟡' : tree.health_status === 'poor' ? '🔴' : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {trees.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">🌱</div>
            <p>No trees recorded yet.</p>
            <p className="text-sm mt-1">Tap "Add Tree" to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
