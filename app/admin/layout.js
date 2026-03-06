'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Skip auth check on the login page itself
    if (pathname === '/admin/login') { setChecking(false); return }

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/admin/login'); return }

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!admin) { router.replace('/admin/login'); return }
      setChecking(false)
    }
    check()
  }, [router, pathname])

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Verifying admin access…</p>
    </div>
  )

  // On login page, render children directly (no nav)
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-sm tracking-wide">SAF Admin</span>
            <nav className="flex gap-5 text-sm">
              {[
                { href: '/admin/teachers', label: 'Teachers' },
                { href: '/admin/schools', label: 'Schools' },
                { href: '/admin/explore', label: 'Explore' },
                { href: '/admin/quality', label: 'Quality' },
              ].map(({ href, label }) => (
                <a key={href} href={href}
                  className={`transition-colors ${pathname === href ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                >
                  {label}
                </a>
              ))}
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
