'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherSettings({ teacher, school, isOwner, onUpdate }) {
  // Profile
  const [name, setName] = useState(teacher.name || '')
  const [subject, setSubject] = useState(teacher.subject || '')
  const [grade, setGrade] = useState(teacher.grade || '')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(teacher.photo_url || null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  // Transfer
  const [transferEmail, setTransferEmail] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [transferMsg, setTransferMsg] = useState('')
  const [transferConfirm, setTransferConfirm] = useState(false)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const saveProfile = async () => {
    if (!name.trim()) { setProfileMsg('Name is required.'); return }
    setSavingProfile(true)
    setProfileMsg('')

    let photoUrl = teacher.photo_url || null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${teacher.id}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('teacher-photos')
        .upload(path, photoFile, { upsert: true })
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('teacher-photos').getPublicUrl(path)
        photoUrl = publicUrl
      }
    }

    const { error } = await supabase.from('teachers').update({
      name: name.trim(),
      subject: subject.trim() || null,
      grade: grade.trim() || null,
      photo_url: photoUrl,
    }).eq('id', teacher.id)

    if (error) {
      setProfileMsg('Error saving: ' + error.message)
    } else {
      setProfileMsg('Saved!')
      setPhotoFile(null)
      onUpdate({ name: name.trim(), subject: subject.trim() || null, grade: grade.trim() || null, photo_url: photoUrl })
    }
    setSavingProfile(false)
    setTimeout(() => setProfileMsg(''), 3000)
  }

  const changePassword = async () => {
    if (newPassword.length < 8) { setPasswordMsg('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPasswordMsg('Passwords don\'t match.'); return }
    setSavingPassword(true)
    setPasswordMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg('Error: ' + error.message)
    } else {
      setPasswordMsg('Password updated!')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswords(false)
    }
    setSavingPassword(false)
    setTimeout(() => setPasswordMsg(''), 4000)
  }

  const transferOwnership = async () => {
    if (!transferEmail.trim()) return
    setTransferring(true)
    setTransferMsg('')

    // Find teacher by email in same school
    const { data: candidate } = await supabase
      .from('teachers')
      .select('id, name, email')
      .eq('email', transferEmail.trim().toLowerCase())
      .eq('school_id', school.id)
      .eq('status', 'approved')
      .single()

    if (!candidate) {
      setTransferMsg('No approved teacher found with that email in your school.')
      setTransferring(false)
      return
    }

    if (candidate.id === teacher.id) {
      setTransferMsg('That\'s your own account.')
      setTransferring(false)
      return
    }

    const { error } = await supabase
      .from('schools')
      .update({ owner_id: candidate.id })
      .eq('id', school.id)

    if (error) {
      setTransferMsg('Error: ' + error.message)
    } else {
      setTransferMsg(`School transferred to ${candidate.name || candidate.email}.`)
      setTransferConfirm(false)
      setTransferEmail('')
    }
    setTransferring(false)
  }

  return (
    <div className="space-y-6">

      {/* ── Profile ── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-forest-800 mb-5">Your Profile</h2>

        {/* Photo */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-forest-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-forest-700 flex items-center justify-center text-white text-2xl font-bold border-2 border-forest-100 select-none">
                {(teacher.name || '?')[0].toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm">
              <span className="text-sm">✏️</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-semibold text-forest-800">{teacher.name}</p>
            <p className="text-sm text-gray-400">{teacher.email}</p>
            {isOwner && <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full font-medium">★ School owner</span>}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
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
                placeholder="e.g. 5th"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
          </div>
        </div>

        {profileMsg && (
          <p className={`text-sm mt-3 ${profileMsg === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>{profileMsg}</p>
        )}

        <button onClick={saveProfile} disabled={savingProfile}
          className="mt-5 bg-forest-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50 text-sm">
          {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </div>

      {/* ── Password ── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-forest-800 mb-1">Password</h2>
        <p className="text-sm text-gray-400 mb-4">Change your account password.</p>

        {!showPasswords ? (
          <button onClick={() => setShowPasswords(true)}
            className="border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Change password
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg === 'Password updated!' ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg}</p>
            )}
            <div className="flex gap-3">
              <button onClick={changePassword} disabled={savingPassword || !newPassword || !confirmPassword}
                className="bg-forest-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50 text-sm">
                {savingPassword ? 'Updating…' : 'Update password'}
              </button>
              <button onClick={() => { setShowPasswords(false); setNewPassword(''); setConfirmPassword(''); setPasswordMsg('') }}
                className="text-gray-400 text-sm px-4 py-2 hover:text-gray-600">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Transfer school ── */}
      {isOwner && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-amber-100">
          <h2 className="text-base font-bold text-forest-800 mb-1">Transfer school ownership</h2>
          <p className="text-sm text-gray-400 mb-4">
            Hand over management of <strong>{school.name}</strong> to another approved teacher at your school.
            You will keep your account and data access, but will no longer be the primary contact.
          </p>

          {!transferConfirm ? (
            <button onClick={() => setTransferConfirm(true)}
              className="border border-amber-200 text-amber-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-50 transition-colors text-sm">
              Transfer ownership…
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email of the new owner</label>
                <input type="email" value={transferEmail} onChange={e => setTransferEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
                <p className="text-xs text-gray-400 mt-1">Must be an approved teacher registered at {school.name}.</p>
              </div>
              {transferMsg && (
                <p className={`text-sm ${transferMsg.startsWith('School transferred') ? 'text-green-600' : 'text-red-500'}`}>{transferMsg}</p>
              )}
              <div className="flex gap-3">
                <button onClick={transferOwnership} disabled={transferring || !transferEmail.trim()}
                  className="bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 text-sm">
                  {transferring ? 'Transferring…' : 'Confirm transfer'}
                </button>
                <button onClick={() => { setTransferConfirm(false); setTransferEmail(''); setTransferMsg('') }}
                  className="text-gray-400 text-sm px-4 py-2 hover:text-gray-600">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
