'use client'
export const dynamic = 'force-dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      // Wait for Supabase to process the tokens from the URL
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Try to get session from URL hash (Supabase puts tokens here)
        await new Promise(resolve => setTimeout(resolve, 1000))
        const { data: { session: session2 } } = await supabase.auth.getSession()
        if (!session2) { router.push('/teacher'); return }
      }

      const user = session?.user
      if (!user) { router.push('/teacher'); return }

      // Check if teacher already has school setup
      const { data: teacher } = await supabase
        .from('teachers')
        .select('school_id')
        .eq('id', user.id)
        .single()

      if (teacher?.school_id) {
        router.push('/teacher/dashboard')
      } else {
        router.push('/teacher/setup')
      }
    }

    handle()
  }, [router])

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🌳</div>
        <p className="text-forest-600 font-medium">Confirming your account…</p>
        <p className="text-gray-400 text-sm mt-2">You'll be redirected in a moment</p>
      </div>
    </div>
  )
}
