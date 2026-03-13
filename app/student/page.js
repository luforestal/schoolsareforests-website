'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'

export default function StudentPage() {
  const router = useRouter()
  const t = useT()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return

    setLoading(true)

    // Look up the session by code
    const { data: session } = await supabase
      .from('class_sessions')
      .select('id, school_id, is_active, expires_at, zone_ids, notes')
      .eq('session_code', trimmed)
      .single()

    setLoading(false)

    if (!session) {
      setError(t('student.err_not_found'))
      return
    }

    if (!session.is_active) {
      setError(t('student.err_closed'))
      return
    }

    if (new Date(session.expires_at) < new Date()) {
      setError(t('student.err_expired'))
      return
    }

    // Store session in sessionStorage so field pages can use it
    sessionStorage.setItem('saf_session', JSON.stringify({
      code: trimmed,
      sessionId: session.id,
      schoolId: session.school_id,
      zoneIds: session.zone_ids || null,
      expiresAt: session.expires_at,
    }))

    router.push(`/field/${session.school_id}`)
  }

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌳</div>
          <h1 className="text-2xl font-bold text-forest-800">{t('student.title')}</h1>
          <p className="text-gray-500 text-sm mt-2">{t('student.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">{t('student.code_label')}</label>
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            placeholder="e.g. FX7K2M"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-2xl text-center tracking-[0.2em] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest-400 uppercase"
            autoFocus
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={6}
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.trim().length < 6}
            className="mt-4 w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40"
          >
            {loading ? t('student.checking') : t('student.start')}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          {t('student.teacher_prompt')}{' '}
          <a href="/teacher" className="text-forest-600 hover:underline">{t('student.sign_in_here')}</a>
        </p>
      </div>
    </div>
  )
}
