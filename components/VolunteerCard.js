'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const INTERESTS = [
  { key: 'species_id',    label: '🌿 Species identification',        desc: 'Help identify trees from photos submitted by students' },
  { key: 'translations',  label: '🌐 Translations',                  desc: 'Translate the platform into other languages' },
  { key: 'web_dev',       label: '💻 Web development',               desc: 'Contribute to the platform code on GitHub' },
  { key: 'fieldwork',     label: '🌳 Field inventory support',       desc: 'Help with tree inventories at nearby schools' },
  { key: 'outreach',      label: '📣 School outreach',               desc: 'Help us connect with schools in your region' },
  { key: 'other',         label: '✨ Other',                         desc: 'Tell us how you\'d like to help' },
]

export default function VolunteerCard() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const toggleInterest = (key) => {
    setInterests(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!interests.length) { setError('Please select at least one area of interest.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('volunteers').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      interests,
      message: message.trim() || null,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
  }

  return (
    <>
      {/* Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left">
        <div className="text-3xl mb-3">🙋</div>
        <h3 className="font-semibold text-forest-800 mb-2">Volunteer</h3>
        <p className="text-gray-500 text-sm">Help us with species identification, translations, fieldwork, or web development.</p>
        <button onClick={() => setOpen(true)}
          className="mt-4 text-sm font-semibold text-forest-600 hover:text-forest-800 transition-colors">
          I want to help →
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-forest-800">Volunteer with us</h2>
                <p className="text-xs text-gray-400 mt-0.5">We'd love to hear from you</p>
              </div>
              <button onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>

            {done ? (
              <div className="px-6 py-12 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-bold text-forest-800 text-lg mb-2">Thank you!</h3>
                <p className="text-gray-500 text-sm">We'll be in touch soon. Your contribution means a lot to us.</p>
                <button onClick={() => setOpen(false)}
                  className="mt-6 text-sm text-forest-600 font-semibold hover:text-forest-800">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">How would you like to help? * <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                  <div className="space-y-2">
                    {INTERESTS.map(({ key, label, desc }) => (
                      <label key={key} className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer border transition-colors ${interests.includes(key) ? 'border-forest-300 bg-forest-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={interests.includes(key)} onChange={() => toggleInterest(key)}
                          className="mt-0.5 accent-forest-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Anything else? <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                    placeholder="Tell us about your background, availability, or how you heard about us…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none" />
                </div>

                {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50">
                  {loading ? 'Sending…' : 'Submit →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
