'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/teacher'); return }

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!admin) { router.replace('/'); return }
      setChecking(false)
    }
    check()
  }, [router])

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Verifying admin access…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-sm tracking-wide">SAF Admin</span>
            <nav className="flex gap-5 text-sm">
              <a
                href="/admin/teachers"
                className={`transition-colors ${pathname === '/admin/teachers' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                Teachers
              </a>
              <a
                href="/admin/schools"
                className={`transition-colors ${pathname === '/admin/schools' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                Schools
              </a>
            </nav>
          </div>
          <a href="/" className="text-gray-400 text-sm hover:text-white transition-colors">
            ← Back to site
          </a>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
