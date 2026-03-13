'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { schools } from '@/data/schools'

const LEVELS = [
  {
    value: 'pilot',
    label: 'Pilot School',
    sublabel: 'Founding Member & Trailblazer',
    png: '/certificates/Founding_Member_noBG.png',
    jpeg: '/certificates/pilot.jpeg',
    desc: 'For the founding pilot schools of the network.',
  },
  {
    value: 'seedling',
    label: 'Seedling',
    sublabel: 'Level 1',
    png: '/certificates/Seedling_noBG.png',
    jpeg: '/certificates/level_1.jpeg',
    desc: 'First complete tree inventory submitted.',
  },
  {
    value: 'sapling',
    label: 'Sapling',
    sublabel: 'Level 2',
    png: '/certificates/Sapling_noBG.png',
    jpeg: '/certificates/level_2.jpeg',
    desc: 'Inventory validated and re-measured.',
  },
  {
    value: 'young_tree',
    label: 'Young Tree',
    sublabel: 'Level 3',
    png: '/certificates/YoungTree_noBG.png',
    jpeg: '/certificates/level_3.jpeg',
    desc: 'Multi-year tracking in progress.',
  },
  {
    value: 'mature_tree',
    label: 'Mature Tree',
    sublabel: 'Level 4',
    png: '/certificates/MatureTree_noBG.png',
    jpeg: '/certificates/level_4.jpeg',
    desc: 'Research-grade, full species ID, growth data.',
  },
]

export default function CertificationsAdmin() {
  const router = useRouter()
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const school = schools.find(s => s.id === selectedSchool)
  const level = LEVELS.find(l => l.value === selectedLevel)

  const canGenerate = selectedSchool && selectedLevel

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold text-forest-800 mb-1">Generate Certificate</h1>
        <p className="text-gray-500 mb-10">Select a school and certification level to generate a printable PDF certificate.</p>

        {/* Step 1 — School */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">1. Select School</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {schools.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSchool(s.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                  selectedSchool === s.id
                    ? 'border-forest-600 bg-forest-50'
                    : 'border-gray-200 hover:border-forest-300'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.logo} alt={s.name} className="w-10 h-10 object-contain flex-shrink-0 rounded" />
                <div className="min-w-0">
                  <p className="font-semibold text-forest-800 text-sm leading-tight">{s.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">{s.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Level */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">2. Select Certification Level</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setSelectedLevel(l.value)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-colors ${
                  selectedLevel === l.value
                    ? 'border-forest-600 bg-forest-50'
                    : 'border-gray-200 hover:border-forest-300'
                }`}
              >
                <Image src={l.png} alt={l.label} width={52} height={52} className="object-contain flex-shrink-0"/>
                <div>
                  <p className="font-semibold text-forest-800 text-sm">{l.label}</p>
                  <p className="text-gray-400 text-xs">{l.sublabel}</p>
                  <p className="text-gray-500 text-xs mt-1">{l.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {canGenerate && school && level && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">3. Preview</h2>
            <div className="flex items-center gap-4 bg-forest-50 rounded-xl p-4">
              <Image src={level.png} alt={level.label} width={64} height={64} className="object-contain flex-shrink-0"/>
              <div>
                <p className="font-bold text-forest-800">{school.name}</p>
                <p className="text-gray-500 text-sm">{school.location} · {school.trees}+ trees</p>
                <p className="text-forest-700 text-sm font-semibold mt-1">{level.label} — {level.sublabel}</p>
              </div>
            </div>
            {level.jpeg && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Certificate template:</p>
                <Image src={level.jpeg} alt={level.label} width={600} height={424} className="w-full rounded-xl object-cover shadow-sm"/>
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <button
          disabled={!canGenerate}
          onClick={() => router.push(`/certificate/${selectedSchool}?level=${selectedLevel}`)}
          className="w-full bg-forest-700 text-white font-bold py-4 rounded-2xl hover:bg-forest-600 transition-colors text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generate Certificate →
        </button>

      </div>
    </div>
  )
}
