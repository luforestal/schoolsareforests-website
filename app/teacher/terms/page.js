'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'

export default function TeacherTermsPage() {
  const router = useRouter()
  const t = useT()
  const scrollRef = useRef(null)
  const [agreed, setAgreed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/teacher'); return }

      // If already accepted, skip to setup
      if (localStorage.getItem('saf_terms_' + user.id)) {
        router.replace('/teacher/setup')
        return
      }
      setChecking(false)
    }
    check()
  }, [router])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40
    if (atBottom) setAgreed(true)
  }

  const handleAgree = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) localStorage.setItem('saf_terms_' + user.id, new Date().toISOString())
    router.push('/teacher/setup')
  }

  if (checking) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="px-8 pt-8 pb-4 text-center border-b border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Schools Are Forests" className="h-16 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-forest-800">{t('terms.title')}</h1>
          <p className="text-sm text-gray-400 mt-1">{t('terms.subtitle')}</p>
        </div>

        {/* Scrollable terms */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="px-8 py-5 h-72 overflow-y-auto text-sm text-gray-600 space-y-4 leading-relaxed"
        >
          <p className="font-semibold text-forest-800">{t('terms.s1_title')}</p>
          <p>{t('terms.s1_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s2_title')}</p>
          <p>{t('terms.s2_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s3_title')}</p>
          <p>{t('terms.s3_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s4_title')}</p>
          <p>{t('terms.s4_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s5_title')}</p>
          <p>{t('terms.s5_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s6_title')}</p>
          <p>{t('terms.s6_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s7_title')}</p>
          <p>{t('terms.s7_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s8_title')}</p>
          <p>{t('terms.s8_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s9_title')}</p>
          <p>{t('terms.s9_body')}</p>
          <p className="font-semibold text-forest-800">{t('terms.s10_title')}</p>
          <p>{t('terms.s10_body')}</p>
          <p className="text-xs text-gray-400 pt-2">{t('terms.updated')}</p>
        </div>

        <div className="px-8 pb-8 pt-4 border-t border-gray-100">
          {!agreed && (
            <p className="text-xs text-gray-400 text-center mb-3">{t('terms.scroll_hint')}</p>
          )}
          <button
            onClick={handleAgree}
            disabled={!agreed}
            className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('terms.agree')}
          </button>
        </div>
      </div>
    </div>
  )
}
