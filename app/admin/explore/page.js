'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const HEALTH_COLORS = {
  good: 'bg-green-100 text-green-700',
  fair: 'bg-amber-100 text-amber-700',
  poor: 'bg-red-100 text-red-700',
}

export default function AdminExplorePage() {
  const [schools, setSchools] = useState([])
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [zones, setZones] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [trees, setTrees] = useState([])
  const [validations, setValidations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingZones, setLoadingZones] = useState(false)
  const [loadingTrees, setLoadingTrees] = useState(false)
  const [lightbox, setLightbox] = useState(null) // { photos: [], index: 0 }

  useEffect(() => {
    supabase.from('schools').select('id, name, country, location').order('name')
      .then(({ data }) => { setSchools(data || []); setLoading(false) })
  }, [])

  const selectSchool = async (school) => {
    setSelectedSchool(school)
    setSelectedZone(null)
    setTrees([])
    setValidations([])
    setLoadingZones(true)
    const { data } = await supabase
      .from('zones').select('*').eq('school_id', school.id).order('label')
    setZones(data || [])
    setLoadingZones(false)
  }

  const selectZone = async (zone) => {
    setSelectedZone(zone)
    setLoadingTrees(true)
    const [{ data: treesData }, { data: vData }] = await Promise.all([
      supabase.from('trees').select('*, tree_stems(*), tree_photos(*)').eq('zone_id', zone.id).order('id'),
      supabase.from('tree_validations').select('*').eq('zone_id', zone.id),
    ])
    setTrees(treesData || [])
    setValidations(vData || [])
    setLoadingTrees(false)
  }

  const validatedIds = new Set(validations.map(v => v.tree_id))

  if (loading) return <p className="text-gray-400">Loading schools…</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Explore Data</h1>
        <p className="text-gray-400 text-sm mt-1">Browse all schools, zones, and trees</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Schools panel */}
        <div className="col-span-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Schools ({schools.length})</p>
          <div className="space-y-1">
            {schools.map(s => (
              <button key={s.id} onClick={() => selectSchool(s)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedSchool?.id === s.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'
                }`}>
                <p className="font-semibold truncate">{s.name}</p>
                <p className="text-xs opacity-60 truncate">{s.location || s.country}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Zones panel */}
        <div className="col-span-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {selectedSchool ? `Zones — ${selectedSchool.name}` : 'Select a school'}
          </p>
          {loadingZones ? (
            <p className="text-gray-300 text-sm">Loading…</p>
          ) : (
            <div className="space-y-1">
              {zones.map(z => (
                <button key={z.id} onClick={() => selectZone(z)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedZone?.id === z.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}>
                  <p className="font-semibold">Zone {z.label}</p>
                  {z.category && <p className="text-xs opacity-60">{z.category}</p>}
                </button>
              ))}
              {selectedSchool && zones.length === 0 && !loadingZones && (
                <p className="text-gray-300 text-sm">No zones yet</p>
              )}
            </div>
          )}
        </div>

        {/* Trees panel */}
        <div className="col-span-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {selectedZone ? `Trees — Zone ${selectedZone.label}` : 'Select a zone'}
          </p>
          {loadingTrees ? (
            <p className="text-gray-300 text-sm">Loading…</p>
          ) : (
            <div className="space-y-2">
              {trees.map((tree, idx) => (
                <div key={tree.id} className={`bg-white rounded-xl border p-4 ${validatedIds.has(tree.id) ? 'border-green-200' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-3">
                    {tree.photo_url && (() => {
                      const allPhotos = [tree.photo_url, ...(tree.tree_photos || []).sort((a,b) => a.photo_order - b.photo_order).map(p => p.photo_url)]
                      return (
                        <div className="flex gap-1 flex-shrink-0">
                          {allPhotos.slice(0, 3).map((url, pi) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={pi} src={url} alt="" onClick={() => setLightbox({ photos: allPhotos, index: pi })}
                              className="w-14 h-14 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity" />
                          ))}
                        </div>
                      )
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                        {tree.inaccessible ? (
                          <span className="text-sm font-semibold text-amber-700">⚠️ Inaccessible</span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">
                            {tree.species_common || (tree.needs_identification ? 'ID needed' : 'Unknown')}
                          </span>
                        )}
                        {tree.species_scientific && (
                          <span className="text-xs italic text-gray-400">{tree.species_scientific}</span>
                        )}
                        {validatedIds.has(tree.id) && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">✓ validated</span>
                        )}
                      </div>
                      {!tree.inaccessible && (
                        <div className="flex gap-3 flex-wrap">
                          {tree.height_m && <span className="text-xs text-gray-500">↕ {tree.height_m}m</span>}
                          {tree.crown_ns_m && <span className="text-xs text-gray-500">⊕ {tree.crown_ns_m}×{tree.crown_ew_m}m</span>}
                          {tree.health_status && (
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${HEALTH_COLORS[tree.health_status] || ''}`}>
                              {tree.health_status}
                            </span>
                          )}
                          {tree.species_confidence && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                              PlantNet {tree.species_confidence}%
                            </span>
                          )}
                          {tree.recorded_by && <span className="text-xs text-gray-400">by {tree.recorded_by}</span>}
                        </div>
                      )}
                      {tree.inaccessible && tree.inaccessible_note && (
                        <p className="text-xs text-gray-400 mt-0.5">{tree.inaccessible_note}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {selectedZone && trees.length === 0 && !loadingTrees && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-300">
                  <p>No trees recorded yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-2xl font-bold w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full">✕</button>

          {lightbox.photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index - 1 + l.photos.length) % l.photos.length })) }}
              className="absolute left-4 text-white text-3xl w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full">‹</button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.photos[lightbox.index]} alt="" onClick={e => e.stopPropagation()}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl" />

          {lightbox.photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index + 1) % l.photos.length })) }}
              className="absolute right-4 text-white text-3xl w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full">›</button>
          )}

          {lightbox.photos.length > 1 && (
            <div className="absolute bottom-4 flex gap-1.5">
              {lightbox.photos.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: i })) }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === lightbox.index ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
