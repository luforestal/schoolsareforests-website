'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [transferring, setTransferring] = useState(null) // school being transferred
  const [newOwnerId, setNewOwnerId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [{ data: schoolsData }, { data: teachersData }] = await Promise.all([
      supabase.from('schools').select('*').order('name'),
      supabase.from('teachers').select('id, name, email, school_id, status').eq('status', 'approved').order('name'),
    ])
    setSchools(schoolsData || [])
    setTeachers(teachersData || [])
    setLoading(false)
  }

  const getTeachersForSchool = (schoolId) =>
    teachers.filter(t => t.school_id === schoolId)

  const transferOwnership = async (school) => {
    if (!newOwnerId) return
    setActionLoading(true)
    // In the current schema, school ownership is implicit (who created it).
    // This sets a note — full ownership transfer comes in Phase 3 with school_teachers table.
    // For now, we just log the intent and can notify manually.
    alert(`Ownership transfer requested: school "${school.name}" → teacher ID ${newOwnerId}.\n\nThis will be fully automated in Phase 3. For now, note this and update the teachers table manually if needed.`)
    setTransferring(null)
    setNewOwnerId('')
    setActionLoading(false)
  }

  if (loading) return <p className="text-gray-400">Loading…</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
        <p className="text-gray-400 text-sm mt-1">View all schools and manage teacher assignments</p>
      </div>

      <div className="space-y-3">
        {schools.map(school => {
          const schoolTeachers = getTeachersForSchool(school.id)
          return (
            <div key={school.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{school.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{school.location || school.country}</p>
                  <p className="text-xs text-gray-300 font-mono mt-1">{school.id}</p>

                  {/* Teachers in this school */}
                  <div className="mt-2">
                    {schoolTeachers.length === 0 ? (
                      <p className="text-xs text-gray-300">No approved teachers linked</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {schoolTeachers.map(t => (
                          <span key={t.id} className="text-xs bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full">
                            {t.name || t.email}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => { setTransferring(school); setNewOwnerId('') }}
                    className="text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Transfer Ownership
                  </button>
                </div>
              </div>

              {/* Transfer form */}
              {transferring?.id === school.id && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Transfer ownership to:</p>
                  <select
                    value={newOwnerId}
                    onChange={e => setNewOwnerId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white mb-2"
                  >
                    <option value="">Select a teacher…</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name || t.email} ({t.email})</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => transferOwnership(school)}
                      disabled={!newOwnerId || actionLoading}
                      className="bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? '…' : 'Confirm Transfer'}
                    </button>
                    <button
                      onClick={() => { setTransferring(null); setNewOwnerId('') }}
                      className="text-gray-400 text-xs px-3 py-2 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
