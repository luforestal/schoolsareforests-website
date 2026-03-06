'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TeacherTermsPage() {
  const router = useRouter()
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
          <h1 className="text-xl font-bold text-forest-800">Terms of Use</h1>
          <p className="text-sm text-gray-400 mt-1">Please read and scroll to the bottom to continue</p>
        </div>

        {/* Scrollable terms */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="px-8 py-5 h-72 overflow-y-auto text-sm text-gray-600 space-y-4 leading-relaxed"
        >
          <p className="font-semibold text-forest-800">1. Purpose of the Platform</p>
          <p>Schools Are Forests is a global community initiative dedicated to documenting, mapping, and celebrating the trees that grow on school campuses around the world. By registering as a teacher, you agree to contribute tree inventory data to this open platform.</p>

          <p className="font-semibold text-forest-800">2. Public Data</p>
          <p>All tree inventory data submitted through this platform — including species, measurements, health status, GPS coordinates, and photographs — will be made publicly available. This data may be viewed by anyone on the Schools Are Forests website and through our public API.</p>

          <p className="font-semibold text-forest-800">3. Use for Research</p>
          <p>By submitting data, you grant Schools Are Forests and authorized third parties the right to use, reproduce, and publish the data for scientific research, educational purposes, environmental monitoring, and related non-commercial activities. You will be credited as a contributing school where appropriate.</p>

          <p className="font-semibold text-forest-800">4. No Personal Student Data</p>
          <p>This platform does not collect personally identifiable information from students. Students access the platform using anonymous session codes. You are responsible for ensuring that no personal student data is submitted through tree notes or photographs.</p>

          <p className="font-semibold text-forest-800">5. Data Accuracy</p>
          <p>You agree to submit accurate and honest measurements and observations to the best of your ability. Schools Are Forests includes a validation system to ensure data quality, and reserves the right to flag or remove data that is clearly inaccurate or inappropriate.</p>

          <p className="font-semibold text-forest-800">6. Photographs</p>
          <p>By uploading photographs, you confirm that you have the right to submit them and that they do not contain identifiable images of minors. Photographs will be publicly displayed alongside the tree data.</p>

          <p className="font-semibold text-forest-800">7. No Liability</p>
          <p>Schools Are Forests is provided "as is" without warranties of any kind. We are not responsible for any loss, damage, or harm arising from the use of this platform, including but not limited to inaccurate data, service interruptions, or unauthorized access to submitted data. Use of this platform is at your own risk.</p>

          <p className="font-semibold text-forest-800">8. Account Responsibility</p>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately if you suspect unauthorized use of your account.</p>

          <p className="font-semibold text-forest-800">9. Modifications</p>
          <p>Schools Are Forests reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>

          <p className="font-semibold text-forest-800">10. Contact</p>
          <p>If you have questions about these terms, please contact us through the Schools Are Forests website.</p>

          <p className="text-xs text-gray-400 pt-2">Last updated: March 2026</p>
        </div>

        <div className="px-8 pb-8 pt-4 border-t border-gray-100">
          {!agreed && (
            <p className="text-xs text-gray-400 text-center mb-3">↓ Scroll to the bottom to enable the button</p>
          )}
          <button
            onClick={handleAgree}
            disabled={!agreed}
            className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            I Agree & Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
