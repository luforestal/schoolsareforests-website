'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function StudentPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmed = code.trim()
    if (!trimmed) return

    setLoading(true)
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('id', trimmed)
      .single()

    setLoading(false)

    if (!school) {
      setError('School not found. Check the code your teacher gave you.')
      return
    }

    router.push(`/field/${trimmed}`)
  }

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌳</div>
          <h1 className="text-2xl font-bold text-forest-800">Enter your school code</h1>
          <p className="text-gray-500 text-sm mt-2">Your teacher will give you this code before going outside.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">School Code</label>
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value); setError('') }}
            placeholder="e.g. a1b2c3d4-e5f6-..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 font-mono"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="mt-4 w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40"
          >
            {loading ? 'Looking up…' : 'Go to my school →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Are you a teacher?{' '}
          <a href="/teacher" className="text-forest-600 hover:underline">Sign in here</a>
        </p>
      </div>
    </div>
  )
}
