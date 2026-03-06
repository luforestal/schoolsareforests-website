'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ZONE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const ZONE_CATEGORIES = [
  'Playground',
  'Front yard',
  'Garden',
  'Sports field',
  'Parking lot',
  'Corridor',
  'Building perimeter',
  'Courtyard',
  'Other',
]

// Generates a readable 6-character session code (no ambiguous chars like 0/O, 1/I/L)
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function formatExpiry(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function isExpired(dateStr) {
  if (!dateStr) return true
  return new Date(dateStr) < new Date()
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [teacher, setTeacher] = useState(null)
  const [school, setSchool] = useState(null)
  const [zones, setZones] = useState([])
  const [treeCounts, setTreeCounts] = useState({})
  const [inaccessibleCounts, setInaccessibleCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [addingZone, setAddingZone] = useState(false)
  const [newZoneLabel, setNewZoneLabel] = useState('')
  const [newZoneCategory, setNewZoneCategory] = useState('')
  const [newZoneDesc, setNewZoneDesc] = useState('')
  const [newZoneGroup, setNewZoneGroup] = useState('')
  const [copied, setCopied] = useState('')
  const [published, setPublished] = useState(false)
  const [togglingPublished, setTogglingPublished] = useState(false)

  // Zone editing state
  const [editingZone, setEditingZone] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editGroup, setEditGroup] = useState('')
  const [validationCounts, setValidationCounts] = useState({})

  // Session management state
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [sessionNotes, setSessionNotes] = useState('')
  const [sessionLoading, setSessionLoading] = useState(false)
  const [copiedSession, setCopiedSession] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/teacher'); return }

    const { data: teacherData } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!teacherData) { router.push('/teacher/setup'); return }

    // Block unapproved teachers
    if (teacherData.status === 'pending' || teacherData.status === 'rejected') {
      router.push('/teacher/pending')
      return
    }

    setTeacher(teacherData)

    const { data: schoolData } = await supabase
      .from('schools')
      .select('*')
      .eq('id', teacherData.school_id)
      .single()

    setSchool(schoolData)
    setPublished(schoolData?.published ?? false)

    const { data: zonesData } = await supabase
      .from('zones')
      .select('*')
      .eq('school_id', teacherData.school_id)
      .order('label')

    setZones(zonesData || [])

    if (zonesData?.length) {
      const { data: treesData } = await supabase
        .from('trees')
        .select('zone_id, inaccessible')
        .eq('school_id', teacherData.school_id)

      const counts = {}, iCounts = {}
      treesData?.forEach(t => {
        counts[t.zone_id] = (counts[t.zone_id] || 0) + 1
        if (t.inaccessible) iCounts[t.zone_id] = (iCounts[t.zone_id] || 0) + 1
      })
      setTreeCounts(counts)
      setInaccessibleCounts(iCounts)
    }

    await loadSessions(teacherData.school_id)

    // Load validation counts per zone
    const { data: validationsData } = await supabase
      .from('tree_validations')
      .select('zone_id')
      .eq('school_id', teacherData.school_id)
    const vCounts = {}
    validationsData?.forEach(v => {
      vCounts[v.zone_id] = (vCounts[v.zone_id] || 0) + 1
    })
    setValidationCounts(vCounts)

    setLoading(false)
  }

  const loadSessions = async (schoolId) => {
    const { data } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(5)

    const sessionList = data || []
    setSessions(sessionList)

    // Active session = is_active AND not expired
    const active = sessionList.find(s => s.is_active && !isExpired(s.expires_at))
    setActiveSession(active || null)
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
      category: newZoneCategory || null,
      description: newZoneDesc.trim() || null,
      group_number: newZoneGroup ? parseInt(newZoneGroup) : null,
    })
    if (!error) {
      setAddingZone(false)
      setNewZoneLabel('')
      setNewZoneCategory('')
      setNewZoneDesc('')
      setNewZoneGroup('')
      loadData()
    }
  }

  // --- Zone management ---

  const startEditZone = (zone) => {
    setEditingZone(zone)
    setEditLabel(zone.label)
    setEditCategory(zone.category || '')
    setEditDesc(zone.description || '')
    setEditGroup(zone.group_number ? String(zone.group_number) : '')
  }

  const saveEditZone = async (e) => {
    e.preventDefault()
    await supabase.from('zones').update({
      category: editCategory || null,
      description: editDesc.trim() || null,
      group_number: editGroup ? parseInt(editGroup) : null,
    }).eq('id', editingZone.id)
    setEditingZone(null)
    loadData()
  }

  const deleteZone = async (zone) => {
    if (!confirm(`Delete Zone ${zone.label}? This will also delete all trees recorded in this zone. This cannot be undone.`)) return
    await supabase.from('zones').delete().eq('id', zone.id)
    loadData()
  }

  // --- Session management ---

  const startSession = async () => {
    setSessionLoading(true)
    const code = generateCode()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('class_sessions')
      .insert({
        teacher_id: teacher.id,
        school_id: school.id,
        session_code: code,
        notes: sessionNotes.trim() || null,
        is_active: true,
        activated_at: now.toISOString(),
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (!error && data) {
      setActiveSession(data)
      setSessions(prev => [data, ...prev])
      setSessionNotes('')
    }
    setSessionLoading(false)
  }

  const closeSession = async () => {
    if (!activeSession) return
    setSessionLoading(true)
    await supabase
      .from('class_sessions')
      .update({ is_active: false })
      .eq('id', activeSession.id)
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, is_active: false } : s))
    setActiveSession(null)
    setSessionLoading(false)
  }

  const reactivateSession = async (session) => {
    setSessionLoading(true)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('class_sessions')
      .update({ is_active: true, activated_at: now.toISOString(), expires_at: expiresAt })
      .eq('id', session.id)
      .select()
      .single()
    if (data) {
      setActiveSession(data)
      setSessions(prev => prev.map(s => s.id === session.id ? data : s))
    }
    setSessionLoading(false)
  }

  const copySessionCode = () => {
    if (!activeSession) return
    navigator.clipboard.writeText(activeSession.session_code)
    setCopiedSession(true)
    setTimeout(() => setCopiedSession(false), 2000)
  }

  // --- Zone UI ---

  const copyCode = (zone) => {
    const code = `${school.id}-${zone.label}`
    navigator.clipboard.writeText(code)
    setCopied(zone.id)
    setTimeout(() => setCopied(''), 2000)
  }

  const togglePublished = async () => {
    setTogglingPublished(true)
    const next = !published
    const { error } = await supabase
      .from('schools')
      .update({ published: next })
      .eq('id', school.id)
    if (!error) setPublished(next)
    setTogglingPublished(false)
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

  // The most recent session for the "reactivate" option
  const lastSession = sessions.find(s => !s.is_active || isExpired(s.expires_at))

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
          </div>
        </div>

        {/* Publish toggle */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-forest-800">Visible in Explore Schools</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {published
                ? 'Your school is publicly visible on the map.'
                : 'Your school is hidden — only you can see it.'}
            </p>
          </div>
          <button
            onClick={togglePublished}
            disabled={togglingPublished}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              published ? 'bg-forest-600' : 'bg-gray-200'
            } ${togglingPublished ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ${published ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* ── CLASS SESSION PANEL ── */}
        <div className={`rounded-xl p-5 mb-8 ${activeSession ? 'bg-forest-800 text-white' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-xs uppercase tracking-wide font-semibold mb-0.5 ${activeSession ? 'text-forest-300' : 'text-gray-400'}`}>
                Class Session
              </p>
              <p className={`text-sm ${activeSession ? 'text-forest-100' : 'text-gray-500'}`}>
                {activeSession
                  ? `Active until ${formatExpiry(activeSession.expires_at)}${activeSession.notes ? ` — ${activeSession.notes}` : ''}`
                  : 'Give students a short code to access the field inventory'}
              </p>
            </div>
            {activeSession && (
              <span className="text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0">
                Active
              </span>
            )}
          </div>

          {activeSession ? (
            /* Active session: show big code */
            <div>
              <div className="flex items-center gap-3 bg-forest-900/50 rounded-xl px-5 py-4 mb-4">
                <span className="font-mono text-3xl font-bold text-white tracking-[0.25em] flex-1 text-center">
                  {activeSession.session_code}
                </span>
                <button
                  onClick={copySessionCode}
                  className="flex-shrink-0 bg-white text-forest-800 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-forest-50 transition-colors"
                >
                  {copiedSession ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-forest-300 text-xs text-center mb-4">
                Students go to <span className="font-mono bg-forest-700 px-1 rounded">schoolsareforests.org/student</span> and enter this code
              </p>
              <button
                onClick={closeSession}
                disabled={sessionLoading}
                className="w-full bg-forest-700 hover:bg-forest-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {sessionLoading ? 'Closing…' : 'Close Session'}
              </button>
            </div>
          ) : (
            /* No active session */
            <div>
              <input
                type="text"
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                placeholder="Notes (optional) — e.g. Grade 7B, Period 3"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={startSession}
                  disabled={sessionLoading}
                  className="flex-1 bg-forest-700 text-white font-semibold py-2.5 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-50 text-sm"
                >
                  {sessionLoading ? 'Starting…' : 'Start Session →'}
                </button>
                {sessions.length > 0 && !activeSession && (
                  <button
                    onClick={() => reactivateSession(sessions[0])}
                    disabled={sessionLoading}
                    className="flex-shrink-0 border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title={`Reactivate code: ${sessions[0].session_code}`}
                  >
                    Reuse {sessions[0].session_code}
                  </button>
                )}
              </div>
            </div>
          )}
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Zone Letter *</label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select
                  value={newZoneCategory}
                  onChange={e => setNewZoneCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                >
                  <option value="">Select category…</option>
                  {ZONE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description <span className="font-normal text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  value={newZoneDesc}
                  onChange={e => setNewZoneDesc(e.target.value)}
                  placeholder="e.g. North side near the gate"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Assigned Group <span className="font-normal text-gray-400">(optional)</span></label>
                <input
                  type="number"
                  min="1"
                  value={newZoneGroup}
                  onChange={e => setNewZoneGroup(e.target.value)}
                  placeholder="e.g. 1"
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
            {zones.map(zone => {
              const accessibleCount = (treeCounts[zone.id] || 0) - (inaccessibleCounts[zone.id] || 0)
              const requiredValidations = Math.max(1, Math.ceil(accessibleCount / 10))
              const doneValidations = validationCounts[zone.id] || 0
              const validationComplete = accessibleCount === 0 || doneValidations >= requiredValidations
              return (
                <div key={zone.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Clickable area → zone detail */}
                  <button
                    onClick={() => router.push(`/teacher/zone/${zone.id}`)}
                    className="w-full p-5 text-left hover:bg-forest-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {zone.label}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-forest-800">Zone {zone.label}</p>
                            {zone.category && (
                              <span className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full font-medium">
                                {zone.category}
                              </span>
                            )}
                          </div>
                          {zone.description && <p className="text-gray-400 text-xs mt-0.5">{zone.description}</p>}
                          {zone.group_number && (
                            <p className="text-xs text-gray-500 mt-0.5">👥 Group {zone.group_number}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-300 text-xl flex-shrink-0">›</span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-gray-500">🌳 {treeCounts[zone.id] || 0} trees</span>
                      {(inaccessibleCounts[zone.id] || 0) > 0 && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          ⚠️ {inaccessibleCounts[zone.id]} inaccessible
                        </span>
                      )}
                      {accessibleCount > 0 && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          validationComplete
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {validationComplete ? '✓' : '⚠'} {doneValidations}/{requiredValidations} validated
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Edit / Delete bar */}
                  <div className="px-5 py-2.5 border-t border-gray-50 flex gap-3">
                    <button
                      onClick={() => startEditZone(zone)}
                      className="text-xs font-semibold text-forest-700 hover:text-forest-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteZone(zone)}
                      className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Inline edit form */}
                  {editingZone?.id === zone.id && (
                    <form onSubmit={saveEditZone} className="px-5 pb-5 border-t border-forest-100 bg-forest-50">
                      <p className="text-xs font-semibold text-forest-600 uppercase tracking-wide pt-4 mb-3">Edit Zone {zone.label}</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                          <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400">
                            <option value="">No category</option>
                            {ZONE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Group</label>
                          <input type="number" min="1" value={editGroup} onChange={e => setEditGroup(e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)}
                          placeholder="e.g. North side near the gate"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-forest-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-forest-600 transition-colors">
                          Save
                        </button>
                        <button type="button" onClick={() => setEditingZone(null)} className="text-gray-400 text-xs px-3 py-2 hover:text-gray-600">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-forest-50 rounded-xl p-5 border border-forest-100">
          <h3 className="font-semibold text-forest-800 mb-2">How to use with students</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Create zones for each area of your campus</li>
            <li>Click <strong>Start Session</strong> in the panel above — a 6-letter code will appear</li>
            <li>Project or share the code with your students</li>
            <li>Students go to <span className="font-mono bg-white px-1 rounded">schoolsareforests.org/student</span> and enter the code</li>
            <li>Close the session when class ends to prevent further entries</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
