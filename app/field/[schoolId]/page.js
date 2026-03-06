'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FieldSchoolPage() {
  const { schoolId } = useParams()
  const router = useRouter()
  const [school, setSchool] = useState(null)
  const [zones, setZones] = useState([])
  const [treeCounts, setTreeCounts] = useState({})
  const [inaccessibleCounts, setInaccessibleCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const load = async () => {
      // Check access: must be a teacher logged in OR have a valid session in sessionStorage
      let allowedZoneIds = null // null = all zones allowed

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Authenticated teacher — check they belong to this school
        const { data: teacherData } = await supabase
          .from('teachers')
          .select('school_id, status')
          .eq('id', user.id)
          .single()

        const isTeacherForSchool = teacherData?.school_id === schoolId && teacherData?.status === 'approved'
        if (!isTeacherForSchool) {
          setAccessDenied(true)
          setLoading(false)
          return
        }
        // Teacher has access to all zones
      } else {
        // Unauthenticated — check for a valid session in sessionStorage
        const raw = sessionStorage.getItem('saf_session')
        if (!raw) {
          router.push('/student')
          return
        }

        let session
        try { session = JSON.parse(raw) } catch { router.push('/student'); return }

        if (session.schoolId !== schoolId) {
          // Session is for a different school
          router.push('/student')
          return
        }

        if (new Date(session.expiresAt) < new Date()) {
          // Session expired
          setAccessDenied(true)
          setLoading(false)
          return
        }

        allowedZoneIds = session.zoneIds // may be null (all) or an array
      }

      // Load school
      const { data: schoolData } = await supabase
        .from('schools').select('*').eq('id', schoolId).single()
      if (!schoolData) { setNotFound(true); setLoading(false); return }
      setSchool(schoolData)

      // Load zones (filter if session restricts to certain zones)
      let zonesQuery = supabase
        .from('zones').select('*').eq('school_id', schoolId).order('label')

      if (allowedZoneIds && allowedZoneIds.length > 0) {
        zonesQuery = zonesQuery.in('id', allowedZoneIds)
      }

      const { data: zonesData } = await zonesQuery
      setZones(zonesData || [])

      if (zonesData?.length) {
        const { data: treesData } = await supabase
          .from('trees').select('zone_id, inaccessible').eq('school_id', schoolId)
        const counts = {}, iCounts = {}
        treesData?.forEach(t => {
          counts[t.zone_id] = (counts[t.zone_id] || 0) + 1
          if (t.inaccessible) iCounts[t.zone_id] = (iCounts[t.zone_id] || 0) + 1
        })
        setTreeCounts(counts)
        setInaccessibleCounts(iCounts)
      }
      setLoading(false)
    }
    load()
  }, [schoolId, router])

  if (loading) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">Loading…</p>
    </div>
  )

  if (accessDenied) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-forest-800 mb-2">Session expired</h1>
        <p className="text-gray-400 text-sm mb-4">Your session has expired. Ask your teacher to reopen it.</p>
        <a href="/student" className="text-forest-600 text-sm underline">Back to entry</a>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-4xl mb-4">🌲</div>
        <h1 className="text-xl font-bold text-forest-800 mb-2">School not found</h1>
        <p className="text-gray-400 text-sm">Check the link your teacher shared with you.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-forest-800 text-white px-6 py-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {school.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={school.logo_url} alt="" className="h-12 w-12 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-forest-700 flex items-center justify-center text-xl flex-shrink-0">🏫</div>
          )}
          <div>
            <p className="text-forest-300 text-xs uppercase tracking-wide">Field Inventory</p>
            <h1 className="text-xl font-bold">{school.name}</h1>
            {school.location && <p className="text-forest-300 text-sm">{school.location}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <p className="text-gray-500 text-sm mb-5">Select your zone to start recording trees.</p>
        {zones.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">🗺️</div>
            <p>No zones set up yet.</p>
            <p className="text-sm mt-1">Ask your teacher to create zones first.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map(zone => {
              const count = treeCounts[zone.id] || 0
              const iCount = inaccessibleCounts[zone.id] || 0
              return (
                <button
                  key={zone.id}
                  onClick={() => router.push(`/field/${schoolId}/${zone.label}`)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm text-left flex items-center gap-4 hover:shadow-md transition-shadow active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {zone.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-forest-800">Zone {zone.label}</p>
                      {zone.category && (
                        <span className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full">{zone.category}</span>
                      )}
                      {zone.group_number && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Group {zone.group_number}</span>
                      )}
                    </div>
                    {zone.description && <p className="text-gray-400 text-xs mt-0.5">{zone.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">🌳 {count} trees recorded</span>
                      {iCount > 0 && <span className="text-xs text-amber-600">⚠️ {iCount} inaccessible</span>}
                    </div>
                  </div>
                  <span className="text-gray-300 text-xl flex-shrink-0">›</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
