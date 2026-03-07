'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'

export default function TeacherPendingPage() {
  const router = useRouter()
  const t = useT()
  const [teacher, setTeacher] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/teacher'); return }

      const { data } = await supabase
        .from('teachers')
        .select('status, rejection_reason, name')
        .eq('id', user.id)
        .single()

      if (!data) { router.push('/teacher/setup'); return }

      // If already approved, send them to dashboard
      if (data.status === 'approved') {
        router.push('/teacher/dashboard')
        return
      }

      setTeacher(data)
      setChecking(false)
    }
    check()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/teacher')
  }

  if (checking) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">{t('pending.checking')}</p>
    </div>
  )

  const isRejected = teacher?.status === 'rejected'

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">{isRejected ? '❌' : '⏳'}</div>

        {isRejected ? (
          <>
            <h1 className="text-2xl font-bold text-red-700 mb-2">{t('pending.rejected_title')}</h1>
            <p className="text-gray-500 text-sm mb-4">{t('pending.rejected_body')}</p>
            {teacher?.rejection_reason && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5 text-left">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">{t('pending.reason_label')}</p>
                <p className="text-sm text-red-700">{teacher.rejection_reason}</p>
              </div>
            )}
            <p className="text-gray-400 text-xs mb-6">
              {t('pending.contact_hint')}{' '}
              <a href="/contact" className="text-forest-600 underline">{t('pending.contact_link')}</a>.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-forest-800 mb-2">{t('pending.pending_title')}</h1>
            <p className="text-gray-500 text-sm mb-4">
              {t('pending.pending_body', { name: teacher?.name ? ` ${teacher.name}` : '' })}
            </p>
            <div className="bg-forest-50 border border-forest-100 rounded-xl px-4 py-3 mb-5 text-left">
              <p className="text-xs font-semibold text-forest-600 uppercase tracking-wide mb-1">{t('pending.next_title')}</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>{t('pending.next_1')}</li>
                <li>{t('pending.next_2')}</li>
                <li>{t('pending.next_3')}</li>
              </ol>
            </div>
            <p className="text-gray-400 text-xs mb-6">{t('pending.already')}</p>
          </>
        )}

        <button
          onClick={handleSignOut}
          className="w-full border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          {t('pending.sign_out')}
        </button>
      </div>
    </div>
  )
}
