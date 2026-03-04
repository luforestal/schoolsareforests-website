'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TeacherSetupPage() {
  const router = useRouter()
  const [schools, setSchools] = useState([])
  const [name, setName] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [newSchoolName, setNewSchoolName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('schools').select('id, name, location').then(({ data }) => {
      if (data) setSchools(data)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/teacher'); return }

    let finalSchoolId = schoolId

    // If teacher is adding a new school
    if (schoolId === '__new__') {
      if (!newSchoolName.trim()) {
        setError('Please enter your school name.')
        setLoading(false)
        return
      }
      const newId = newSchoolName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)
      const { error: schoolError } = await supabase.from('schools').insert({
        id: newId,
        name: newSchoolName.trim(),
        location: '',
        country: '',
        trees_count: 0,
      })
      if (schoolError) { setError(schoolError.message); setLoading(false); return }
      finalSchoolId = newId
    }

    const { error: teacherError } = await supabase.from('teachers').insert({
      id: user.id,
      school_id: finalSchoolId,
      name: name.trim(),
      email: user.email,
    })

    if (teacherError) { setError(teacherError.message); setLoading(false); return }
    router.push('/teacher/dashboard')
  }

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌳</div>
          <h1 className="text-2xl font-bold text-forest-800">Set Up Your Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Tell us about yourself and your school</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ms. García"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your School</label>
            <select
              required
              value={schoolId}
              onChange={e => setSchoolId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
            >
              <option value="">Select your school…</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name} — {s.location}</option>
              ))}
              <option value="__new__">My school is not listed</option>
            </select>
          </div>

          {schoolId === '__new__' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                type="text"
                value={newSchoolName}
                onChange={e => setNewSchoolName(e.target.value)}
                placeholder="Lincoln Elementary School"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Continue to Dashboard →'}
          </button>
        </form>
      </div>
    </div>
  )
}
