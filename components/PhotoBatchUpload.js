'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Extract a number/id from a filename like "arbol_023.jpg" → "023", "T-5.jpg" → "5"
function extractId(filename) {
  const name = filename.replace(/\.[^.]+$/, '') // remove extension
  // Try to find a numeric part: "arbol_023" → "023", "T23" → "23", "tree-7" → "7"
  const match = name.match(/(\d+)/)
  return match ? match[1].replace(/^0+/, '') || '0' : null // strip leading zeros for matching
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif']

function isImage(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext)
}

export default function PhotoBatchUpload({ school, zones }) {
  const [step, setStep] = useState('upload') // upload | match | uploading | done
  const [photos, setPhotos] = useState([]) // [{ name, blob, objectUrl, extractedId, matchedTreeId }]
  const [trees, setTrees] = useState([]) // all trees for this school
  const [zipError, setZipError] = useState('')
  const [uploadDone, setUploadDone] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [uploadErrors, setUploadErrors] = useState([])
  const fileRef = useRef(null)

  // Load trees when component mounts
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('trees')
        .select('id, zone_id, original_id, species_common, photo_url, submitted_by')
        .eq('school_id', school.id)
        .eq('inaccessible', false)
        .order('id')
      setTrees(data || [])
    }
    load()
  }, [school.id])

  // Build a lookup: original_id → tree.id
  const idToTreeId = {}
  trees.forEach((t, idx) => {
    if (t.original_id) {
      const stripped = String(t.original_id).replace(/^0+/, '') || '0'
      idToTreeId[stripped] = t.id
    }
    // Also map sequential index (1-based) for files without original_id
    idToTreeId[String(idx + 1)] = idToTreeId[String(idx + 1)] || t.id
  })

  const handleZip = async (f) => {
    if (!f) return
    setZipError('')
    try {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(f)
      const extracted = []

      for (const [path, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue
        const filename = path.split('/').pop()
        if (!isImage(filename)) continue
        const blob = await entry.async('blob')
        const objectUrl = URL.createObjectURL(blob)
        const extractedId = extractId(filename)
        const matchedTreeId = extractedId ? (idToTreeId[extractedId] || '') : ''
        extracted.push({ name: filename, path, blob, objectUrl, extractedId, matchedTreeId })
      }

      if (!extracted.length) { setZipError('No image files found in this ZIP.'); return }
      setPhotos(extracted)
      setStep('match')
    } catch {
      setZipError('Could not open the ZIP file. Make sure it\'s a valid .zip archive.')
    }
  }

  const matchedCount = photos.filter(p => p.matchedTreeId).length
  const unmatchedCount = photos.length - matchedCount

  const handleUpload = async () => {
    const toUpload = photos.filter(p => p.matchedTreeId)
    setStep('uploading')
    setUploadDone(0)
    setUploadTotal(toUpload.length)
    setUploadErrors([])

    let done = 0
    let success = 0
    const errors = []

    for (const photo of toUpload) {
      const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${school.id}/${photo.matchedTreeId}-imported-${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('tree-photos')
        .upload(path, photo.blob, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, upsert: false })

      if (uploadErr) {
        errors.push(`${photo.name}: ${uploadErr.message}`)
      } else {
        const { data: { publicUrl } } = supabase.storage.from('tree-photos').getPublicUrl(path)
        // Set as primary photo if tree has none; otherwise add to tree_photos table
        const tree = trees.find(t => t.id === photo.matchedTreeId)
        if (!tree?.photo_url) {
          await supabase.from('trees').update({ photo_url: publicUrl }).eq('id', photo.matchedTreeId)
        } else {
          await supabase.from('tree_photos').insert({
            tree_id: photo.matchedTreeId,
            photo_url: publicUrl,
            photo_order: 99,
          })
        }
        success++
      }

      done++
      setUploadDone(done)
    }

    setUploadedCount(success)
    setUploadErrors(errors)
    setStep('done')
  }

  // ── UPLOAD ──
  if (step === 'upload') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Upload Photos (ZIP)</h2>
        <p className="text-sm text-gray-500">
          Upload a ZIP file containing your tree photos. Photos should be named with their tree ID
          (e.g. <code className="bg-gray-100 px-1 rounded">arbol_001.jpg</code>, <code className="bg-gray-100 px-1 rounded">T-023.jpg</code>, <code className="bg-gray-100 px-1 rounded">025.jpg</code>).
          We'll match them to the imported trees by their number.
        </p>
      </div>

      <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 text-sm text-forest-700">
        <p className="font-semibold mb-1">{trees.length} trees loaded</p>
        <p className="text-xs text-forest-600">
          {trees.filter(t => t.original_id).length} have a Tree ID from the inventory · {trees.filter(t => t.photo_url).length} already have a photo
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl py-10 cursor-pointer hover:border-forest-400 hover:bg-forest-50 transition-colors"
        onDrop={e => { e.preventDefault(); handleZip(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}>
        <span className="text-4xl">🗜️</span>
        <span className="text-sm text-gray-500">Drag your ZIP here, or click to browse</span>
        <span className="text-xs text-gray-400">.zip</span>
        <input ref={fileRef} type="file" accept=".zip" className="hidden"
          onChange={e => handleZip(e.target.files[0])} />
      </label>

      {zipError && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{zipError}</p>}

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">How naming works</p>
        <ul className="text-xs space-y-1 list-disc list-inside">
          <li>Photos are matched by the number in their filename to the Tree ID you mapped during import</li>
          <li>If no Tree IDs were mapped, photos match by their row order in the import (photo 1 = tree 1, etc.)</li>
          <li>You can manually adjust any match in the next step</li>
        </ul>
      </div>
    </div>
  )

  // ── MATCH ──
  if (step === 'match') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-forest-800 mb-1">Review Matches</h2>
        <p className="text-sm text-gray-500">
          {matchedCount} of {photos.length} photos auto-matched.
          {unmatchedCount > 0 && ` ${unmatchedCount} unmatched — assign them manually or leave blank to skip.`}
        </p>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {photos.map((photo, i) => {
          const zone = photo.matchedTreeId
            ? zones.find(z => z.id === trees.find(t => t.id === photo.matchedTreeId)?.zone_id)
            : null
          const matchedTree = photo.matchedTreeId ? trees.find(t => t.id === photo.matchedTreeId) : null

          return (
            <div key={i} className={`flex items-center gap-3 bg-white rounded-xl p-3 border ${photo.matchedTreeId ? 'border-green-200' : 'border-amber-200'}`}>
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.objectUrl} alt={photo.name}
                className="w-16 h-16 object-cover rounded-lg shrink-0 bg-gray-100" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">{photo.name}</p>
                {photo.extractedId && (
                  <p className="text-xs text-gray-400">ID detected: <span className="font-mono">{photo.extractedId}</span></p>
                )}

                {/* Tree selector */}
                <select
                  value={photo.matchedTreeId}
                  onChange={e => setPhotos(prev => prev.map((p, j) => j === i ? { ...p, matchedTreeId: e.target.value } : p))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                >
                  <option value="">— skip this photo —</option>
                  {trees.map((t, idx) => {
                    const z = zones.find(z => z.id === t.zone_id)
                    return (
                      <option key={t.id} value={t.id}>
                        {t.original_id ? `ID ${t.original_id}` : `#${idx + 1}`} — Zone {z?.label || '?'} — {t.species_common || 'Unknown species'}{t.photo_url ? ' 📷' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Status badge */}
              <span className={`text-xs font-bold shrink-0 ${photo.matchedTreeId ? 'text-green-600' : 'text-amber-500'}`}>
                {photo.matchedTreeId ? '✓' : '?'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="bg-forest-50 border border-forest-100 rounded-xl px-4 py-3 text-sm text-forest-700">
        <strong>{matchedCount} photos</strong> will be uploaded · {unmatchedCount} will be skipped
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep('upload')}
          className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={handleUpload} disabled={matchedCount === 0}
          className="flex-1 bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors disabled:opacity-40">
          Upload {matchedCount} Photos
        </button>
      </div>
    </div>
  )

  // ── UPLOADING ──
  if (step === 'uploading') {
    const pct = uploadTotal ? Math.round((uploadDone / uploadTotal) * 100) : 0
    return (
      <div className="space-y-6 text-center py-8">
        <div className="text-5xl">📷</div>
        <div>
          <p className="font-bold text-forest-800 text-lg mb-1">Uploading photos…</p>
          <p className="text-sm text-gray-500">{uploadDone} / {uploadTotal}</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="bg-forest-600 h-3 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400">Please don't close this tab</p>
      </div>
    )
  }

  // ── DONE ──
  return (
    <div className="space-y-6 text-center py-8">
      <div className="text-5xl">🎉</div>
      <div>
        <p className="font-bold text-forest-800 text-xl mb-1">Photos uploaded!</p>
        <p className="text-sm text-gray-500">
          <strong className="text-forest-700">{uploadedCount} photos</strong> linked to their trees.
        </p>
        {uploadErrors.length > 0 && <p className="text-xs text-amber-600 mt-1">{uploadErrors.length} failed.</p>}
      </div>
      {uploadErrors.length > 0 && (
        <details className="text-left bg-amber-50 border border-amber-100 rounded-xl p-4">
          <summary className="text-sm font-medium text-amber-700 cursor-pointer">View errors ({uploadErrors.length})</summary>
          <ul className="mt-2 space-y-1">
            {uploadErrors.map((e, i) => <li key={i} className="text-xs text-amber-600">{e}</li>)}
          </ul>
        </details>
      )}
      <button onClick={() => setStep('upload')}
        className="w-full bg-forest-700 text-white font-semibold py-3 rounded-xl hover:bg-forest-600 transition-colors">
        Upload More
      </button>
    </div>
  )
}
