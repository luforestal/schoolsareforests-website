'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // 'pending' | 'approved' | 'rejected' | 'all'
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => { loadTeachers() }, [])

  const loadTeachers = async () => {
    const [{ data: teachersData }, { data: schoolsData }] = await Promise.all([
      supabase.from('teachers').select('*').order('name'),
      supabase.from('schools').select('id, name, country, location'),
    ])
    const schoolMap = Object.fromEntries((schoolsData || []).map(s => [s.id, s]))
    const merged = (teachersData || []).map(t => ({ ...t, schools: schoolMap[t.school_id] || null }))
    setTeachers(merged)
    setLoading(false)
  }

  const approve = async (teacher) => {
    setActionLoading(teacher.id)
    await supabase
      .from('teachers')
      .update({ status: 'approved', rejection_reason: null })
      .eq('id', teacher.id)
    // Auto-assign owner if school has none
    if (teacher.school_id) {
      const { data: school } = await supabase
        .from('schools').select('owner_id').eq('id', teacher.school_id).single()
      if (school && !school.owner_id) {
        await supabase.from('schools').update({ owner_id: teacher.id }).eq('id', teacher.school_id)
      }
    }
    await loadTeachers()
    setActionLoading('')
  }

  const reject = async (teacher) => {
    if (!rejectReason.trim()) return
    setActionLoading(teacher.id)
    await supabase
      .from('teachers')
      .update({ status: 'rejected', rejection_reason: rejectReason.trim() })
      .eq('id', teacher.id)
    // Clear owner_id if this teacher was the owner
    if (teacher.school_id) {
      const { data: school } = await supabase
        .from('schools').select('owner_id').eq('id', teacher.school_id).single()
      if (school?.owner_id === teacher.id) {
        await supabase.from('schools').update({ owner_id: null }).eq('id', teacher.school_id)
      }
    }
    setRejectingId(null)
    setRejectReason('')
    await loadTeachers()
    setActionLoading('')
  }

  const filtered = filter === 'all'
    ? teachers
    : teachers.filter(t => (t.status || 'pending') === filter)

  const counts = {
    pending: teachers.filter(t => (t.status || 'pending') === 'pending').length,
    approved: teachers.filter(t => t.status === 'approved').length,
    rejected: teachers.filter(t => t.status === 'rejected').length,
  }

  if (loading) return <p className="text-gray-400">Loading…</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Registrations</h1>
          <p className="text-gray-400 text-sm mt-1">Review and approve or reject teacher accounts</p>
        </div>
        <button
          onClick={loadTeachers}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filter === f ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts[f] ?? teachers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Teacher list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100">
          <p className="font-medium">No teachers in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(teacher => {
            const status = teacher.status || 'pending'
            const badge = STATUS_LABELS[status]
            return (
              <div key={teacher.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900">{teacher.name || '—'}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                    {teacher.schools && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        {teacher.schools.name} — {teacher.schools.location || teacher.schools.country}
                      </p>
                    )}
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      {teacher.subject && <span>Subject: {teacher.subject}</span>}
                      {teacher.grade && <span>Grade: {teacher.grade}</span>}
                      {teacher.student_count && <span>Students: {teacher.student_count}</span>}
                    </div>
                    {teacher.rejection_reason && (
                      <p className="text-xs text-red-500 mt-1">Reason: {teacher.rejection_reason}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2">
                    {status !== 'approved' && (
                      <button
                        onClick={() => approve(teacher)}
                        disabled={actionLoading === teacher.id}
                        className="bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === teacher.id ? '…' : 'Approve'}
                      </button>
                    )}
                    {status !== 'rejected' && rejectingId !== teacher.id && (
                      <button
                        onClick={() => { setRejectingId(teacher.id); setRejectReason('') }}
                        className="bg-white border border-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    {status === 'approved' && (
                      <button
                        onClick={() => { setRejectingId(teacher.id); setRejectReason('') }}
                        className="bg-white border border-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>

                {/* Rejection reason input */}
                {rejectingId === teacher.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection (required)"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                      autoFocus
                    />
                    <button
                      onClick={() => reject(teacher)}
                      disabled={!rejectReason.trim() || actionLoading === teacher.id}
                      className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectReason('') }}
                      className="text-gray-400 text-xs px-3 py-2 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
