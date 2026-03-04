'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ZONE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function TeacherDashboard() {
  const router = useRouter()
  const [teacher, setTeacher] = useState(null)
  const [school, setSchool] = useState(null)
  const [zones, setZones] = useState([])
  const [treeCounts, setTreeCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [addingZone, setAddingZone] = useState(false)
  const [newZoneLabel, setNewZoneLabel] = useState('')
  const [newZoneDesc, setNewZoneDesc] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/teacher'); return }

    const { data: teacherData } = await supabase
      .from('teachers')
      .select('*, schools(*)')
      .eq('id', user.id)
      .single()

    if (!teacherData) { router.push('/teacher/setup'); return }

    setTeacher(teacherData)
    setSchool(teacherData.schools)

    const { data: zonesData } = await supabase
      .from('zones')
      .select('*')
      .eq('school_id', teacherData.school_id)
      .order('label')

    setZones(zonesData || [])

    // Get tree counts per zone
    if (zonesData?.length) {
      const { data: treesData } = await supabase
        .from('trees')
        .select('zone_id')
        .eq('school_id', teacherData.school_id)

      const counts = {}
      treesData?.forEach(t => {
        counts[t.zone_id] = (counts[t.zone_id] || 0) + 1
      })
      setTreeCounts(counts)
    }

    setLoading(false)
  }

  const nextAvailableLetter = () => {
    const used = zones.map(z => z.label)
    return ZONE_LETTERS.find(l => !used.includes(l)) || ''
  }

  const handleAddZone = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('zones').insert({
      school_id: school.id,
      label: newZoneLabel,
      description: newZoneDesc.trim() || null,
    })
    if (!error) {
      setAddingZone(false)
      setNewZoneLabel('')
      setNewZoneDesc('')
      loadData()
    }
  }

  const copyCode = (zone) => {
    const code = `${school.id}-${zone.label}`
    navigator.clipboard.writeText(code)
    setCopied(zone.id)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/teacher')
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-forest-300 text-xs uppercase tracking-wide mb-0.5">Teacher Dashboard</p>
            <h1 className="text-xl font-bold">{school?.name}</h1>
            <p className="text-forest-300 text-sm">{teacher?.name}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-forest-300 hover:text-white text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* School Info Panel */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-8 flex items-center gap-5">
          {school?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={school.logo_url} alt="School logo" className="h-16 w-16 object-contain rounded-lg border border-gray-100 flex-shrink-0" />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-forest-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏫</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-forest-800 text-lg leading-tight">{school?.name}</h2>
            {school?.location && <p className="text-gray-500 text-sm mt-0.5">{school.location}</p>}
            {school?.address && <p className="text-gray-400 text-xs mt-0.5">{school.address}{school?.postal_code ? `, ${school.postal_code}` : ''}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            {school?.phone && <p className="text-sm text-gray-500">📞 {school.phone}</p>}
            <p className="text-xs text-gray-400 mt-1 font-mono">ID: {school?.id}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-forest-700">{zones.length}</div>
            <div className="text-gray-400 text-sm mt-1">Zones</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-forest-700">
              {Object.values(treeCounts).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-gray-400 text-sm mt-1">Trees Submitted</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-forest-700">
              {zones.filter(z => z.completed).length}
            </div>
            <div className="text-gray-400 text-sm mt-1">Zones Complete</div>
          </div>
        </div>

        {/* Zones */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-forest-800">Campus Zones</h2>
          <button
            onClick={() => { setAddingZone(true); setNewZoneLabel(nextAvailableLetter()) }}
            className="bg-forest-700 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-forest-600 transition-colors"
          >
            + Add Zone
          </button>
        </div>

        {/* Add zone form */}
        {addingZone && (
          <form onSubmit={handleAddZone} className="bg-white rounded-xl p-5 shadow-sm mb-4 border-2 border-forest-200">
            <h3 className="font-semibold text-forest-800 mb-4">New Zone</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Zone Letter</label>
                <select
                  value={newZoneLabel}
                  onChange={e => setNewZoneLabel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                  required
                >
                  {ZONE_LETTERS.filter(l => !zones.map(z => z.label).includes(l)).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newZoneDesc}
                  onChange={e => setNewZoneDesc(e.target.value)}
                  placeholder="e.g. North playground"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-forest-700 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-forest-600 transition-colors">
                Create Zone
              </button>
              <button type="button" onClick={() => setAddingZone(false)} className="text-gray-400 text-sm px-5 py-2 hover:text-gray-600">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Zone cards */}
        {zones.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm text-gray-400">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="font-medium">No zones yet</p>
            <p className="text-sm mt-1">Click "Add Zone" to create the first zone for your students</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {zones.map(zone => (
              <div key={zone.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-lg">
                      {zone.label}
                    </div>
                    <div>
                      <p className="font-semibold text-forest-800">Zone {zone.label}</p>
                      {zone.description && <p className="text-gray-400 text-xs">{zone.description}</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    zone.completed ? 'bg-forest-100 text-forest-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {zone.completed ? 'Complete' : 'In progress'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    🌳 {treeCounts[zone.id] || 0} trees
                  </span>
                  <button
                    onClick={() => copyCode(zone)}
                    className="text-xs font-semibold bg-forest-50 text-forest-700 px-3 py-1.5 rounded-lg hover:bg-forest-100 transition-colors"
                  >
                    {copied === zone.id ? '✓ Copied!' : `Copy code: ${school.id}-${zone.label}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-forest-50 rounded-xl p-5 border border-forest-100">
          <h3 className="font-semibold text-forest-800 mb-2">How to use with students</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Create a zone for each group of students</li>
            <li>Share the zone code with each group (e.g. <span className="font-mono bg-white px-1 rounded">{school?.id}-A</span>)</li>
            <li>Students enter the code in the field app to start collecting data</li>
            <li>Trees appear here as students submit them</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
