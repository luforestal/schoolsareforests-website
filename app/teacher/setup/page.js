'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STEPS = ['About You', 'Your School', 'Your Class']

// Countries with phone dial codes
const COUNTRIES = [
  { name: 'Afghanistan', code: 'AF', dial: '+93' },
  { name: 'Albania', code: 'AL', dial: '+355' },
  { name: 'Algeria', code: 'DZ', dial: '+213' },
  { name: 'Argentina', code: 'AR', dial: '+54' },
  { name: 'Australia', code: 'AU', dial: '+61' },
  { name: 'Austria', code: 'AT', dial: '+43' },
  { name: 'Belgium', code: 'BE', dial: '+32' },
  { name: 'Bolivia', code: 'BO', dial: '+591' },
  { name: 'Brazil', code: 'BR', dial: '+55' },
  { name: 'Canada', code: 'CA', dial: '+1' },
  { name: 'Chile', code: 'CL', dial: '+56' },
  { name: 'China', code: 'CN', dial: '+86' },
  { name: 'Colombia', code: 'CO', dial: '+57' },
  { name: 'Costa Rica', code: 'CR', dial: '+506' },
  { name: 'Croatia', code: 'HR', dial: '+385' },
  { name: 'Cuba', code: 'CU', dial: '+53' },
  { name: 'Czech Republic', code: 'CZ', dial: '+420' },
  { name: 'Denmark', code: 'DK', dial: '+45' },
  { name: 'Dominican Republic', code: 'DO', dial: '+1' },
  { name: 'Ecuador', code: 'EC', dial: '+593' },
  { name: 'Egypt', code: 'EG', dial: '+20' },
  { name: 'El Salvador', code: 'SV', dial: '+503' },
  { name: 'Ethiopia', code: 'ET', dial: '+251' },
  { name: 'Finland', code: 'FI', dial: '+358' },
  { name: 'France', code: 'FR', dial: '+33' },
  { name: 'Germany', code: 'DE', dial: '+49' },
  { name: 'Ghana', code: 'GH', dial: '+233' },
  { name: 'Greece', code: 'GR', dial: '+30' },
  { name: 'Guatemala', code: 'GT', dial: '+502' },
  { name: 'Honduras', code: 'HN', dial: '+504' },
  { name: 'Hungary', code: 'HU', dial: '+36' },
  { name: 'India', code: 'IN', dial: '+91' },
  { name: 'Indonesia', code: 'ID', dial: '+62' },
  { name: 'Ireland', code: 'IE', dial: '+353' },
  { name: 'Israel', code: 'IL', dial: '+972' },
  { name: 'Italy', code: 'IT', dial: '+39' },
  { name: 'Japan', code: 'JP', dial: '+81' },
  { name: 'Kenya', code: 'KE', dial: '+254' },
  { name: 'Malaysia', code: 'MY', dial: '+60' },
  { name: 'Mexico', code: 'MX', dial: '+52' },
  { name: 'Morocco', code: 'MA', dial: '+212' },
  { name: 'Netherlands', code: 'NL', dial: '+31' },
  { name: 'New Zealand', code: 'NZ', dial: '+64' },
  { name: 'Nicaragua', code: 'NI', dial: '+505' },
  { name: 'Nigeria', code: 'NG', dial: '+234' },
  { name: 'Norway', code: 'NO', dial: '+47' },
  { name: 'Pakistan', code: 'PK', dial: '+92' },
  { name: 'Panama', code: 'PA', dial: '+507' },
  { name: 'Paraguay', code: 'PY', dial: '+595' },
  { name: 'Peru', code: 'PE', dial: '+51' },
  { name: 'Philippines', code: 'PH', dial: '+63' },
  { name: 'Poland', code: 'PL', dial: '+48' },
  { name: 'Portugal', code: 'PT', dial: '+351' },
  { name: 'Romania', code: 'RO', dial: '+40' },
  { name: 'Russia', code: 'RU', dial: '+7' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966' },
  { name: 'Senegal', code: 'SN', dial: '+221' },
  { name: 'South Africa', code: 'ZA', dial: '+27' },
  { name: 'South Korea', code: 'KR', dial: '+82' },
  { name: 'Spain', code: 'ES', dial: '+34' },
  { name: 'Sweden', code: 'SE', dial: '+46' },
  { name: 'Switzerland', code: 'CH', dial: '+41' },
  { name: 'Tanzania', code: 'TZ', dial: '+255' },
  { name: 'Thailand', code: 'TH', dial: '+66' },
  { name: 'Turkey', code: 'TR', dial: '+90' },
  { name: 'Uganda', code: 'UG', dial: '+256' },
  { name: 'Ukraine', code: 'UA', dial: '+380' },
  { name: 'United Kingdom', code: 'GB', dial: '+44' },
  { name: 'United States', code: 'US', dial: '+1' },
  { name: 'Uruguay', code: 'UY', dial: '+598' },
  { name: 'Venezuela', code: 'VE', dial: '+58' },
  { name: 'Vietnam', code: 'VN', dial: '+84' },
  { name: 'Zimbabwe', code: 'ZW', dial: '+263' },
].sort((a, b) => a.name.localeCompare(b.name))

export default function TeacherSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [user, setUser] = useState(null)
  const [allSchools, setAllSchools] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Teacher
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')

  // Step 2 — School
  const [selectedCountry, setSelectedCountry] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [newSchoolName, setNewSchoolName] = useState('')
  const [newSchoolAddress, setNewSchoolAddress] = useState('')
  const [newSchoolCity, setNewSchoolCity] = useState('')
  const [newSchoolRegion, setNewSchoolRegion] = useState('')
  const [newSchoolPostal, setNewSchoolPostal] = useState('')
  const [newSchoolPhone, setNewSchoolPhone] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  // Step 3 — Class
  const [studentCount, setStudentCount] = useState('')

  const dialCode = COUNTRIES.find(c => c.name === selectedCountry)?.dial || ''
  const filteredSchools = allSchools.filter(s => s.country === selectedCountry)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/teacher'); return }
      setUser(user)

      const { data: existing } = await supabase
        .from('teachers').select('school_id, status').eq('id', user.id).single()
      if (existing?.status === 'pending' || existing?.status === 'rejected') {
        router.push('/teacher/pending'); return
      }
      if (existing?.school_id) { router.push('/teacher/dashboard'); return }

      const { data } = await supabase.from('schools').select('id, name, location, country')
      if (data) setAllSchools(data)
    }
    init()
  }, [])

  // Reset school selection when country changes
  useEffect(() => {
    setSchoolId('')
  }, [selectedCountry])

  // Pre-fill phone dial code when country changes
  useEffect(() => {
    if (dialCode) setNewSchoolPhone(dialCode + ' ')
  }, [dialCode])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const recommendedZones = () => {
    const n = parseInt(studentCount)
    if (!n || n < 1) return null
    return Math.min(Math.max(Math.ceil(n / 5), 2), 10)
  }

  const handleFinish = async () => {
    setLoading(true)
    setError('')

    let finalSchoolId = schoolId
    let logoUrl = null

    if (schoolId === '__new__') {
      const newId = newSchoolName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)

      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(`${newId}.${ext}`, logoFile, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(`${newId}.${ext}`)
          logoUrl = urlData.publicUrl
        }
      }

      const { error: schoolError } = await supabase.from('schools').insert({
        id: newId,
        name: newSchoolName.trim(),
        address: newSchoolAddress.trim() || null,
        location: `${newSchoolCity.trim()}, ${selectedCountry}`,
        country: selectedCountry,
        region: newSchoolRegion.trim() || null,
        phone: newSchoolPhone.trim() || null,
        logo_url: logoUrl,
        trees_count: 0,
      })
      if (schoolError) { setError(schoolError.message); setLoading(false); return }
      finalSchoolId = newId
    }

    const { error: teacherError } = await supabase.from('teachers').insert({
      id: user.id,
      school_id: finalSchoolId,
      name: name.trim(),
      email: user.email,
      subject: subject.trim() || null,
      grade: grade.trim() || null,
      student_count: parseInt(studentCount) || null,
      status: 'pending',
    })

    if (teacherError) { setError(teacherError.message); setLoading(false); return }
    router.push('/teacher/pending')
  }

  const nextStep = () => {
    setError('')
    if (step === 1 && !name.trim()) { setError('Please enter your name.'); return }
    if (step === 2) {
      if (!selectedCountry) { setError('Please select your country.'); return }
      if (!schoolId) { setError('Please select or register your school.'); return }
      if (schoolId === '__new__') {
        if (!newSchoolName.trim()) { setError('Please enter the school name.'); return }
        if (!newSchoolCity.trim()) { setError('Please enter the city.'); return }
      }
    }
    if (step === 3) { handleFinish(); return }
    setStep(s => s + 1)
  }

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">

        {/* Progress */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > i + 1 ? 'bg-forest-600 text-white' :
                  step === i + 1 ? 'bg-forest-700 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium ${step === i + 1 ? 'text-forest-700' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 pb-8">

          {/* ── Step 1: About You ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-forest-800 mb-1">About You</h2>
                <p className="text-gray-400 text-sm">Tell us a bit about yourself</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ms. García"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Science"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" value={grade} onChange={e => setGrade(e.target.value)}
                    placeholder="e.g. 4th"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-500">
                Signed in as <span className="font-medium text-gray-700">{user?.email}</span>
              </div>
            </div>
          )}

          {/* ── Step 2: Your School ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-forest-800 mb-1">Your School</h2>
                <p className="text-gray-400 text-sm">Find your school or register a new one</p>
              </div>

              {/* Country first */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white">
                  <option value="">Select your country…</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Schools filtered by country */}
              {selectedCountry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School {filteredSchools.length > 0 ? `(${filteredSchools.length} found in ${selectedCountry})` : `in ${selectedCountry}`}
                  </label>
                  <select value={schoolId} onChange={e => setSchoolId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white">
                    <option value="">
                      {filteredSchools.length > 0 ? 'Choose your school…' : 'No schools registered yet'}
                    </option>
                    {filteredSchools.map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {s.location}</option>
                    ))}
                    <option value="__new__">+ Register my school</option>
                  </select>
                </div>
              )}

              {/* New school form */}
              {schoolId === '__new__' && (
                <div className="space-y-4 bg-forest-50 rounded-xl p-4 border border-forest-100">
                  <p className="text-xs font-semibold text-forest-600 uppercase tracking-wide">Register New School</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                    <input type="text" value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)}
                      placeholder="Lincoln Elementary School"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="text" value={newSchoolAddress} onChange={e => setNewSchoolAddress(e.target.value)}
                      placeholder="123 Oak Street"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input type="text" value={newSchoolCity} onChange={e => setNewSchoolCity(e.target.value)}
                        placeholder="Berlin"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State / Region / Department <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input type="text" value={newSchoolRegion} onChange={e => setNewSchoolRegion(e.target.value)}
                        placeholder="e.g. California, Cundinamarca, Bayern"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="text" value={newSchoolPostal} onChange={e => setNewSchoolPostal(e.target.value)}
                        placeholder="10115"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-gray-400 font-normal">(optional, code pre-filled)</span>
                    </label>
                    <input type="tel" value={newSchoolPhone} onChange={e => setNewSchoolPhone(e.target.value)}
                      placeholder={`${dialCode} 30 12345678`}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Logo <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="flex items-center gap-4">
                      {logoPreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoPreview} alt="Logo preview" className="h-14 w-14 object-contain rounded-lg border border-gray-200 bg-white p-1" />
                      )}
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        {logoFile ? logoFile.name : 'Choose image…'}
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Your Class ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-forest-800 mb-1">Your Class</h2>
                <p className="text-gray-400 text-sm">Help us recommend the right setup for your students</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Students <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={studentCount}
                  onChange={e => setStudentCount(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 25"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
              </div>
              {recommendedZones() && (
                <div className="bg-forest-50 border border-forest-100 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">🗺️</div>
                    <div>
                      <p className="font-semibold text-forest-800">
                        We recommend <span className="text-forest-600">{recommendedZones()} zones</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        ~{Math.ceil(parseInt(studentCount) / recommendedZones())} students per group
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">You can always add or remove zones later from your dashboard.</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2 mt-4">{error}</p>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => { setStep(s => s - 1); setError('') }}
                className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                ← Back
              </button>
            )}
            <button onClick={nextStep} disabled={loading}
              className="flex-1 bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50">
              {loading ? 'Saving…' : step === 3 ? 'Go to Dashboard →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
