'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'

function calcAccuracy(studentVal, teacherVal) {
  if (studentVal == null || teacherVal == null || teacherVal === 0) return null
  return Math.max(0, (1 - Math.abs(studentVal - teacherVal) / teacherVal)) * 100
}

export default function TeacherValidatePage() {
  const { treeId } = useParams()
  const searchParams = useSearchParams()
  const zoneId = searchParams.get('zoneId')
  const router = useRouter()
  const t = useT()

  const [tree, setTree] = useState(null)
  const [zone, setZone] = useState(null)
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null) // null | { accuracy_pct, comparisons }

  // Teacher's measurement inputs
  const [height, setHeight] = useState('')
  const [crownNS, setCrownNS] = useState('')
  const [crownEW, setCrownEW] = useState('')
  const [healthStatus, setHealthStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => { loadData() }, [treeId])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/teacher'); return }

    const { data: teacherData } = await supabase
      .from('teachers')
      .select('id, school_id, status')
      .eq('id', user.id)
      .single()

    if (!teacherData || teacherData.status !== 'approved') {
      router.push('/teacher/pending'); return
    }
    setTeacher(teacherData)

    const { data: treeData } = await supabase
      .from('trees')
      .select('*, tree_stems(*)')
      .eq('id', treeId)
      .single()

    if (!treeData || treeData.school_id !== teacherData.school_id) {
      router.push('/teacher/dashboard'); return
    }
    setTree(treeData)

    if (zoneId) {
      const { data: zoneData } = await supabase
        .from('zones').select('id, label').eq('id', zoneId).single()
      setZone(zoneData)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!height && !crownNS && !crownEW && !healthStatus) {
      alert(t('validate.err_empty'))
      return
    }
    setSaving(true)

    // Calculate accuracy for each numeric field
    const comparisons = []
    if (height && tree.height_m) {
      const acc = calcAccuracy(tree.height_m, parseFloat(height))
      if (acc !== null) comparisons.push({ field: 'Height', student: tree.height_m, teacher: parseFloat(height), accuracy: acc })
    }
    if (crownNS && tree.crown_ns_m) {
      const acc = calcAccuracy(tree.crown_ns_m, parseFloat(crownNS))
      if (acc !== null) comparisons.push({ field: 'Crown N–S', student: tree.crown_ns_m, teacher: parseFloat(crownNS), accuracy: acc })
    }
    if (crownEW && tree.crown_ew_m) {
      const acc = calcAccuracy(tree.crown_ew_m, parseFloat(crownEW))
      if (acc !== null) comparisons.push({ field: 'Crown W–E', student: tree.crown_ew_m, teacher: parseFloat(crownEW), accuracy: acc })
    }

    const accuracy_pct = comparisons.length > 0
      ? comparisons.reduce((sum, c) => sum + c.accuracy, 0) / comparisons.length
      : null

    await supabase.from('tree_validations').insert({
      tree_id: treeId,
      zone_id: zoneId || tree.zone_id,
      school_id: tree.school_id,
      validated_by: teacher.id,
      height_m: height ? parseFloat(height) : null,
      crown_ns_m: crownNS ? parseFloat(crownNS) : null,
      crown_ew_m: crownEW ? parseFloat(crownEW) : null,
      health_status: healthStatus || null,
      notes: notes.trim() || null,
      accuracy_pct,
    })

    setSaving(false)
    setResult({ accuracy_pct, comparisons })
  }

  if (loading) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <p className="text-forest-400">{t('common.loading')}</p>
    </div>
  )

  // Result screen after saving
  if (result) {
    const pct = result.accuracy_pct
    const color = pct === null ? 'text-gray-500' : pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'
    return (
      <div className="min-h-screen bg-forest-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">{pct === null ? '📋' : pct >= 90 ? '🎯' : pct >= 70 ? '📊' : '⚠️'}</div>
          <h2 className="text-2xl font-bold text-forest-800 mb-1">{t('validate.saved_title')}</h2>
          {pct !== null && (
            <p className={`text-4xl font-bold mt-2 ${color}`}>{Math.round(pct)}% accuracy</p>
          )}

          {result.comparisons.length > 0 && (
            <div className="mt-5 text-left space-y-3">
              {result.comparisons.map((c, i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-700">{c.field}</p>
                    <span className={`text-sm font-bold ${c.accuracy >= 90 ? 'text-green-600' : c.accuracy >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                      {Math.round(c.accuracy)}%
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{t('validate.student')}: <strong>{c.student}m</strong></span>
                    <span>{t('validate.teacher')}: <strong>{c.teacher}m</strong></span>
                    <span>{t('validate.diff')}: <strong>{Math.abs(c.student - c.teacher).toFixed(1)}m</strong></span>
                  </div>
                  {/* Accuracy bar */}
                  <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${c.accuracy >= 90 ? 'bg-green-500' : c.accuracy >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.round(c.accuracy)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push(zoneId ? `/teacher/zone/${zoneId}` : '/teacher/dashboard')}
            className="mt-6 w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors"
          >
            {t('validate.back_zone')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest-50">
      <div className="bg-forest-800 text-white px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push(zoneId ? `/teacher/zone/${zoneId}` : '/teacher/dashboard')}
            className="text-forest-300 text-sm mb-2 hover:text-white transition-colors"
          >
            {t('validate.back', { label: zone?.label })}
          </button>
          <h1 className="text-xl font-bold">{t('validate.title')}</h1>
          <p className="text-forest-300 text-sm">
            {t('validate.subtitle', { species: tree.species_common || 'Unknown species' })}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Student measurements (read-only reference) */}
        <div className="bg-forest-50 border border-forest-100 rounded-xl p-5 mb-6">
          <p className="text-xs font-semibold text-forest-600 uppercase tracking-wide mb-3">{t('validate.ref_title')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: t('validate.label_height'), value: tree.height_m ? `${tree.height_m} m` : '—' },
              { label: t('validate.label_crown_ns'), value: tree.crown_ns_m ? `${tree.crown_ns_m} m` : '—' },
              { label: t('validate.label_crown_ew'), value: tree.crown_ew_m ? `${tree.crown_ew_m} m` : '—' },
              { label: t('validate.label_health'), value: tree.health_status || '—' },
              { label: t('validate.label_species'), value: tree.species_common || '—' },
              { label: t('validate.label_recorded'), value: tree.recorded_by || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-lg px-3 py-2.5">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-forest-800">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">{t('validate.ref_warning')}</p>
        </div>

        {/* Teacher's measurements */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4 mb-6">
          <p className="font-semibold text-forest-800">{t('validate.your_measurements')}</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('validate.height_m')}</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.1" min="0" value={height} onChange={e => setHeight(e.target.value)}
                placeholder="e.g. 8.5"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
              <span className="text-gray-500 font-medium">m</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('validate.crown_ns')}</label>
              <input type="number" step="0.1" min="0" value={crownNS} onChange={e => setCrownNS(e.target.value)}
                placeholder="e.g. 5.0"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('validate.crown_ew')}</label>
              <input type="number" step="0.1" min="0" value={crownEW} onChange={e => setCrownEW(e.target.value)}
                placeholder="e.g. 4.5"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('validate.health')}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'good', label: t('newTree.health_good'), emoji: '🟢' },
                { value: 'fair', label: t('newTree.health_fair'), emoji: '🟡' },
                { value: 'poor', label: t('newTree.health_poor'), emoji: '🔴' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setHealthStatus(opt.value)}
                  className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-colors flex flex-col items-center gap-1 ${
                    healthStatus === opt.value ? 'border-forest-600 bg-forest-50 text-forest-700' : 'border-gray-200 text-gray-500'
                  }`}>
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('validate.notes')} <span className="text-gray-400 font-normal">({t('common.optional')})</span></label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={t('validate.notes_placeholder')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-forest-700 text-white font-bold py-4 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-50 text-lg"
        >
          {saving ? t('validate.saving') : t('validate.save')}
        </button>
        <div className="pb-8" />
      </div>
    </div>
  )
}
