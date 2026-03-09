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

  // Location state
  const [coordInput, setCoordInput] = useState('')
  const [coordParsed, setCoordParsed] = useState(null) // { lat, lng }
  const [coordError, setCoordError] = useState('')
  const [savingLocation, setSavingLocation] = useState(false)
  const [locationSaved, setLocationSaved] = useState(false)
  const [kmlFile, setKmlFile] = useState(null)
  const [kmlParsed, setKmlParsed] = useState(null) // GeoJSON polygon
  const [kmlError, setKmlError] = useState('')
  const [locationMapRef, setLocationMapRef] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/teacher'); return }

    const { data: teacherData } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!teacherData) { router.push('/teacher/terms'); return }

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
    if (schoolData?.lat && schoolData?.lng) {
      const c = { lat: schoolData.lat, lng: schoolData.lng }
      setCoordParsed(c)
      setCoordInput(`${schoolData.lat}, ${schoolData.lng}`)
    }

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
      group_number: newZoneGroup.trim() || null,
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
      group_number: editGroup.trim() || null,
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

  const [activeTab, setActiveTab] = useState('zones')

  // Parse "lat, lng" string from Google Maps
  const parseCoords = (raw) => {
    const match = raw.trim().match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/)
    if (!match) return null
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
    return { lat, lng }
  }

  const handleCoordInput = (val) => {
    setCoordInput(val)
    setCoordError('')
    setLocationSaved(false)
    const parsed = parseCoords(val)
    setCoordParsed(parsed)
  }

  const handleKmlUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setKmlFile(file)
    setKmlError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parser = new DOMParser()
        const kml = parser.parseFromString(ev.target.result, 'text/xml')
        const coords = kml.querySelector('coordinates')
        if (!coords) { setKmlError('No polygon coordinates found in this KML file.'); return }
        const pairs = coords.textContent.trim().split(/\s+/).map(p => {
          const [lng, lat] = p.split(',').map(Number)
          return [lng, lat]
        }).filter(p => !isNaN(p[0]) && !isNaN(p[1]))
        if (pairs.length < 3) { setKmlError('The polygon has too few points.'); return }
        setKmlParsed({ type: 'Polygon', coordinates: [pairs] })
      } catch {
        setKmlError('Could not read this file. Make sure it is a valid KML.')
      }
    }
    reader.readAsText(file)
  }

  const saveLocation = async () => {
    if (!coordParsed) { setCoordError('Please enter valid coordinates first.'); return }
    setSavingLocation(true)
    const updates = {
      lat: coordParsed.lat,
      lng: coordParsed.lng,
    }
    if (kmlParsed) updates.perimeter_geojson = JSON.stringify(kmlParsed)
    const { error } = await supabase.from('schools').update(updates).eq('id', school.id)
    setSavingLocation(false)
    if (error) { setCoordError(error.message); return }
    setLocationSaved(true)
    setSchool(prev => ({ ...prev, ...updates }))
  }

  // Init Leaflet preview map for location tab
  const initLocationMap = async (containerId) => {
    if (typeof window === 'undefined') return
    if (locationMapRef) { locationMapRef.remove(); setLocationMapRef(null) }
    const L = (await import('leaflet')).default
    if (!document.getElementById(containerId)) return
    const existing = document.getElementById(containerId)._leaflet_id
    if (existing) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    const center = coordParsed || (school?.lat ? { lat: school.lat, lng: school.lng } : { lat: 4.71, lng: -74.07 })
    const map = L.map(containerId).setView([center.lat, center.lng], 17)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri World Imagery',
    }).addTo(map)
    if (coordParsed) L.marker([coordParsed.lat, coordParsed.lng]).addTo(map)
    else if (school?.lat) L.marker([school.lat, school.lng]).addTo(map)
    setLocationMapRef(map)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/teacher')
  }

  const totalValidations = Object.values(validationCounts).reduce((a, b) => a + b, 0)
  const totalTrees = Object.values(treeCounts).reduce((a, b) => a + b, 0)

  if (loading) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">Loading…</p>
    </div>
  )

  // The most recent session for the "reactivate" option
  const lastSession = sessions.find(s => !s.is_active || isExpired(s.expires_at))

  const TABS = [
    { id: 'use', label: 'How to Use' },
    { id: 'location', label: 'Location' },
    { id: 'zones', label: 'Zones' },
    { id: 'validation', label: 'Validation' },
  ]

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
          <button onClick={handleSignOut} className="text-forest-300 hover:text-white text-sm transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">

        {/* School Info */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex items-center gap-5">
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
          {school?.phone && <p className="text-sm text-gray-500 flex-shrink-0">📞 {school.phone}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-forest-700">{zones.length}</div>
            <div className="text-gray-400 text-xs mt-1">Zones</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-forest-700">{totalTrees}</div>
            <div className="text-gray-400 text-xs mt-1">Trees</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-forest-700">{totalValidations}</div>
            <div className="text-gray-400 text-xs mt-1">Validated</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-8 bg-white shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-forest-700 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: HOW TO USE ── */}
        {activeTab === 'use' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-forest-400">
              <p className="font-semibold text-forest-800 mb-1">1. What are zones?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Zones are sections of your school grounds — each assigned to a student group. Zone A might be the playground, Zone B the garden, etc. Each zone gets a letter and a location type. Divide them so every group has a similar number of trees to measure.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-forest-400">
              <p className="font-semibold text-forest-800 mb-1">2. How many zones do I need?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                One zone per student group. If you have 30 students in groups of 5, create 6 zones. Balance the number of trees per zone so the workload is even.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-forest-400">
              <p className="font-semibold text-forest-800 mb-1">3. Starting a session</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Once your zones are ready, go to the <strong>Zones</strong> tab and click <strong>Start Session</strong>. You'll get a 6-character code (e.g. <span className="font-mono bg-gray-100 px-1.5 rounded">XF4T2K</span>). Project it or write it on the board. Students go to <span className="font-mono text-xs bg-gray-100 px-1.5 rounded">schoolsareforests.org/student</span> and enter it. Sessions last 3 hours.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-forest-400">
              <p className="font-semibold text-forest-800 mb-2">4. What do students need?</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>📱 One phone or tablet per group — any browser, no app to install</li>
                <li>📏 A measuring tape — for trunk circumference and crown diameter</li>
                <li>📐 A cardboard triangle — for estimating tree height</li>
                <li>📄 Printed field sheets — if your school has limited internet</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-forest-400">
              <p className="font-semibold text-forest-800 mb-1">5. Validating the data</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                After the session, go to the <strong>Validation</strong> tab. Each zone needs at least 1 review per 10 trees. Check photos, species ID, and measurements. Your school only becomes publicly visible once the minimum validations are complete.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB: ZONES ── */}
        {activeTab === 'zones' && (
          <div>
            {/* Zone management */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-forest-800">Campus Zones</h2>
              <button
                onClick={() => { setAddingZone(true); setNewZoneLabel(nextAvailableLetter()) }}
                className="bg-forest-700 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-forest-600 transition-colors"
              >
                + Add Zone
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Create all your zones first, then start a session below.
            </p>

            {/* Add zone form */}
            {addingZone && (
              <form onSubmit={handleAddZone} className="bg-white rounded-xl p-5 shadow-sm mb-4 border-2 border-forest-200">
                <h3 className="font-semibold text-forest-800 mb-4">New Zone</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Zone Letter *</label>
                    <select value={newZoneLabel} onChange={e => setNewZoneLabel(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white" required>
                      {ZONE_LETTERS.filter(l => !zones.map(z => z.label).includes(l)).map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <select value={newZoneCategory} onChange={e => setNewZoneCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white">
                      <option value="">Select category…</option>
                      {ZONE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description <span className="font-normal text-gray-400">(optional)</span></label>
                    <input type="text" value={newZoneDesc} onChange={e => setNewZoneDesc(e.target.value)}
                      placeholder="e.g. North side near the gate"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Assigned Group <span className="font-normal text-gray-400">(optional)</span></label>
                    <input type="text" value={newZoneGroup} onChange={e => setNewZoneGroup(e.target.value)}
                      placeholder="e.g. 1 or Red team"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
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
              <div className="bg-white rounded-xl p-10 text-center shadow-sm text-gray-400 mb-8">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="font-medium">No zones yet</p>
                <p className="text-sm mt-1">Click "+ Add Zone" to create the first zone for your students</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {zones.map(zone => {
                  const accessibleCount = (treeCounts[zone.id] || 0) - (inaccessibleCounts[zone.id] || 0)
                  const requiredValidations = Math.max(1, Math.ceil(accessibleCount / 10))
                  const doneValidations = validationCounts[zone.id] || 0
                  const validationComplete = accessibleCount === 0 || doneValidations >= requiredValidations
                  return (
                    <div key={zone.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <button onClick={() => router.push(`/teacher/zone/${zone.id}`)}
                        className="w-full p-5 text-left hover:bg-forest-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                              {zone.label}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-forest-800">Zone {zone.label}</p>
                                {zone.category && (
                                  <span className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full font-medium">{zone.category}</span>
                                )}
                              </div>
                              {zone.description && <p className="text-gray-400 text-xs mt-0.5">{zone.description}</p>}
                              {zone.group_number && <p className="text-xs text-gray-500 mt-0.5">👥 Group {zone.group_number}</p>}
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
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${validationComplete ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                              {validationComplete ? '✓' : '⚠'} {doneValidations}/{requiredValidations} validated
                            </span>
                          )}
                        </div>
                      </button>
                      <div className="px-5 py-2.5 border-t border-gray-50 flex gap-3">
                        <button onClick={() => startEditZone(zone)} className="text-xs font-semibold text-forest-700 hover:text-forest-600 transition-colors">Edit</button>
                        <button onClick={() => deleteZone(zone)} className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">Delete</button>
                      </div>
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
                              <input type="text" value={editGroup} onChange={e => setEditGroup(e.target.value)}
                                placeholder="e.g. 1 or Red team"
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
                            <button type="submit" className="bg-forest-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-forest-600 transition-colors">Save</button>
                            <button type="button" onClick={() => setEditingZone(null)} className="text-gray-400 text-xs px-3 py-2 hover:text-gray-600">Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Session panel — below zones */}
            <div className={`rounded-xl p-5 ${activeSession ? 'bg-forest-800 text-white' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-xs uppercase tracking-wide font-semibold mb-0.5 ${activeSession ? 'text-forest-300' : 'text-gray-400'}`}>
                    Class Session
                  </p>
                  <p className={`text-sm ${activeSession ? 'text-forest-100' : 'text-gray-500'}`}>
                    {activeSession
                      ? `Active until ${formatExpiry(activeSession.expires_at)}${activeSession.notes ? ` — ${activeSession.notes}` : ''}`
                      : 'Once your zones are ready, start a session to let students in'}
                  </p>
                </div>
                {activeSession && (
                  <span className="text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0">Active</span>
                )}
              </div>
              {activeSession ? (
                <div>
                  <div className="flex items-center gap-3 bg-forest-900/50 rounded-xl px-5 py-4 mb-4">
                    <span className="font-mono text-3xl font-bold text-white tracking-[0.25em] flex-1 text-center">
                      {activeSession.session_code}
                    </span>
                    <button onClick={copySessionCode}
                      className="flex-shrink-0 bg-white text-forest-800 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-forest-50 transition-colors">
                      {copiedSession ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-forest-300 text-xs text-center mb-4">
                    Students go to <span className="font-mono bg-forest-700 px-1 rounded">schoolsareforests.org/student</span> and enter this code
                  </p>
                  <button onClick={closeSession} disabled={sessionLoading}
                    className="w-full bg-forest-700 hover:bg-forest-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                    {sessionLoading ? 'Closing…' : 'Close Session'}
                  </button>
                </div>
              ) : (
                <div>
                  <input type="text" value={sessionNotes} onChange={e => setSessionNotes(e.target.value)}
                    placeholder="Notes (optional) — e.g. Grade 7B, Period 3"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 mb-3" />
                  <div className="flex gap-3">
                    <button onClick={startSession} disabled={sessionLoading || zones.length === 0}
                      className="flex-1 bg-forest-700 text-white font-semibold py-2.5 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-50 text-sm"
                      title={zones.length === 0 ? 'Create at least one zone first' : ''}>
                      {sessionLoading ? 'Starting…' : zones.length === 0 ? 'Add zones first' : 'Start Session →'}
                    </button>
                    {sessions.length > 0 && !activeSession && (
                      <button onClick={() => reactivateSession(sessions[0])} disabled={sessionLoading}
                        className="flex-shrink-0 border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Reuse {sessions[0].session_code}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: VALIDATION ── */}
        {activeTab === 'validation' && (
          <div>
            {/* Publish toggle — only enabled when validations are done */}
            {(() => {
              const allZonesValidated = zones.length > 0 && zones.every(z => {
                const accessible = (treeCounts[z.id] || 0) - (inaccessibleCounts[z.id] || 0)
                if (accessible === 0) return true
                return (validationCounts[z.id] || 0) >= Math.max(1, Math.ceil(accessible / 10))
              })
              return (
                <div className={`rounded-xl p-5 mb-6 flex items-center justify-between gap-4 ${allZonesValidated ? 'bg-white shadow-sm' : 'bg-gray-50 border border-gray-200'}`}>
                  <div>
                    <p className="font-semibold text-forest-800">Visible in Explore Schools</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {allZonesValidated
                        ? published ? 'Your school is publicly visible on the map.' : 'Your school is hidden — toggle to publish.'
                        : 'Complete all zone validations to publish your school.'}
                    </p>
                  </div>
                  <button
                    onClick={allZonesValidated ? togglePublished : undefined}
                    disabled={togglingPublished || !allZonesValidated}
                    className={`relative inline-flex h-7 w-14 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      published && allZonesValidated ? 'bg-forest-600' : 'bg-gray-200'
                    } ${!allZonesValidated ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ${published && allZonesValidated ? 'translate-x-7' : 'translate-x-0'}`} />
                  </button>
                </div>
              )
            })()}

            {/* Per-zone validation status */}
            {zones.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-medium">No zones yet</p>
                <p className="text-sm mt-1">Create zones in the Zones tab first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {zones.map(zone => {
                  const accessibleCount = (treeCounts[zone.id] || 0) - (inaccessibleCounts[zone.id] || 0)
                  const required = Math.max(1, Math.ceil(accessibleCount / 10))
                  const done = validationCounts[zone.id] || 0
                  const complete = accessibleCount === 0 || done >= required
                  return (
                    <button key={zone.id} onClick={() => router.push(`/teacher/zone/${zone.id}`)}
                      className="w-full bg-white rounded-xl p-5 shadow-sm flex items-center gap-4 hover:bg-forest-50 transition-colors text-left">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${complete ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                        {complete ? '✓' : zone.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-forest-800">Zone {zone.label}{zone.category ? ` — ${zone.category}` : ''}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {accessibleCount === 0
                            ? 'No measurable trees yet'
                            : `${done} of ${required} validations done · ${accessibleCount} trees`}
                        </p>
                      </div>
                      {/* Progress bar */}
                      {accessibleCount > 0 && (
                        <div className="w-24 flex-shrink-0">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${complete ? 'bg-green-500' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(100, (done / required) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 text-right mt-0.5">{Math.min(100, Math.round((done / required) * 100))}%</p>
                        </div>
                      )}
                      <span className="text-gray-300 text-xl flex-shrink-0">›</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
        {/* ── TAB: LOCATION ── */}
        {activeTab === 'location' && (
          <div className="space-y-6">

            {/* Current status */}
            {school?.lat && school?.lng && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <span>✓</span>
                <span>School location saved: <span className="font-mono">{school.lat.toFixed(6)}, {school.lng.toFixed(6)}</span></span>
              </div>
            )}

            {/* Step 1 — Coordinates */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-forest-800 mb-1">School centroid coordinates</p>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                This helps us place your school accurately on the map — especially useful if your address is hard to geocode.
              </p>

              {/* Instructions */}
              <div className="bg-forest-50 rounded-xl p-4 mb-4 text-sm text-forest-800 space-y-1.5">
                <p className="font-semibold mb-2">How to get your school's coordinates:</p>
                <p>1. Open <strong>Google Maps</strong> in your browser</p>
                <p>2. Search for your school by name</p>
                <p>3. <strong>Right-click</strong> on the center of your school grounds</p>
                <p>4. The coordinates appear at the top of the menu — click them to copy</p>
                <p>5. Paste them in the field below</p>
                <p className="text-forest-500 text-xs mt-2">They look like: <span className="font-mono">4.710989, -74.072092</span></p>
              </div>

              <label className="block text-xs font-medium text-gray-500 mb-1">Coordinates (lat, lng)</label>
              <input
                type="text"
                value={coordInput}
                onChange={e => handleCoordInput(e.target.value)}
                placeholder="e.g. 4.710989, -74.072092"
                className={`w-full border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-400 ${
                  coordParsed ? 'border-green-300 bg-green-50' : 'border-gray-300'
                }`}
              />
              {coordParsed && (
                <p className="text-xs text-green-600 mt-1">✓ Valid — lat {coordParsed.lat.toFixed(6)}, lng {coordParsed.lng.toFixed(6)}</p>
              )}
              {coordError && (
                <p className="text-xs text-red-500 mt-1">{coordError}</p>
              )}
            </div>

            {/* Map preview */}
            {coordParsed && (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-forest-800">Preview</p>
                  <button
                    type="button"
                    onClick={() => initLocationMap('location-map')}
                    className="text-xs text-forest-600 underline hover:text-forest-700"
                  >
                    Load map
                  </button>
                </div>
                <div id="location-map" className="w-full h-56 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  Click "Load map" to preview
                </div>
              </div>
            )}

            {/* Step 2 — KML (optional) */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-forest-800 mb-1">School perimeter <span className="text-gray-400 font-normal text-sm">(optional)</span></p>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Upload a KML file of your school boundary. This lets us show the full outline of your campus on the public map. If you don't have one, skip this step.
              </p>

              <div className="bg-amber-50 rounded-xl p-4 mb-4 text-sm text-amber-800 space-y-1.5">
                <p className="font-semibold mb-2">How to create and export a KML from Google Earth:</p>
                <p>1. Open <a href="https://earth.google.com/web/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-900">Google Earth</a> in your browser</p>
                <p>2. Search for your school using the search bar</p>
                <p>3. In the left panel, click <strong>New Project</strong> → <strong>Create KML file</strong></p>
                <p>4. Click <strong>New Feature</strong> → <strong>Draw polygon</strong></p>
                <p>5. Click around the perimeter of your school to trace the boundary — close the shape by clicking the first point again</p>
                <p>6. Give the polygon a name (e.g. "School boundary") and click <strong>Save</strong></p>
                <p>7. In the left panel, click the three dots next to your project → <strong>Export as KML file</strong></p>
                <p>8. Upload the downloaded <span className="font-mono">.kml</span> file here</p>
                <p className="text-amber-600 text-xs mt-2">No Google Earth account? You can also use <a href="https://mymaps.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google My Maps</a> — draw a polygon, then Export → KML.</p>
              </div>

              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl px-4 py-6 text-center transition-colors ${
                  kmlParsed ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-forest-300'
                }`}>
                  {kmlParsed ? (
                    <div className="text-green-700 text-sm">
                      <p className="text-xl mb-1">✓</p>
                      <p className="font-semibold">{kmlFile?.name}</p>
                      <p className="text-xs text-green-600 mt-1">{kmlParsed.coordinates[0].length} boundary points loaded</p>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      <p className="text-2xl mb-2">📄</p>
                      <p>Click to upload a .kml file</p>
                    </div>
                  )}
                </div>
                <input type="file" accept=".kml,.kmz" onChange={handleKmlUpload} className="hidden" />
              </label>
              {kmlError && <p className="text-xs text-red-500 mt-2">{kmlError}</p>}
            </div>

            {/* Save button */}
            <button
              onClick={saveLocation}
              disabled={savingLocation || !coordParsed}
              className="w-full bg-forest-700 text-white font-bold py-4 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-50"
            >
              {savingLocation ? 'Saving…' : locationSaved ? '✓ Location saved!' : 'Save Location'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
