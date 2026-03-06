'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TeacherAuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setLoading(false)
    if (resetError) { setError(resetError.message); return }
    setMessage('Check your email — we sent a password reset link.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'register') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      // New user → setup school
      router.push('/teacher/setup')
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }

      // Check teacher status and school setup
      const { data: teacher } = await supabase
        .from('teachers')
        .select('school_id, status')
        .eq('id', data.user.id)
        .single()

      if (!teacher) {
        // Never completed setup
        router.push('/teacher/setup')
      } else if (teacher.status === 'pending' || teacher.status === 'rejected') {
        router.push('/teacher/pending')
      } else if (teacher.school_id) {
        router.push('/teacher/dashboard')
      } else {
        router.push('/teacher/setup')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Schools Are Forests" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-forest-800">Teacher Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your school's tree inventory</p>
        </div>

        {/* Toggle — only show for login/register, not forgot */}
        {mode !== 'forgot' && (
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setMessage('') }}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === 'login' ? 'bg-forest-700 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setMessage('') }}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === 'register' ? 'bg-forest-700 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Forgot password form */}
        {mode === 'forgot' ? (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm mb-4">Enter your email and we'll send you a reset link.</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>}
            {message && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-4 py-2">{message}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); setMessage('') }}
              className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors py-1">
              ← Back to sign in
            </button>
          </form>
        ) : (
          /* Login / Register form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
                className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors py-1">
                Forgot password?
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
