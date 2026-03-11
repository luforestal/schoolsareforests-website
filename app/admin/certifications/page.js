'use client'
import { CertificationBadge } from '@/components/CertificationBadge'

const LEVELS = [
  { level: 'seed',       label: 'Seed / Semilla',             year: 'Year 1' },
  { level: 'plantula',   label: 'Seedling / Plántula',        year: 'Year 2' },
  { level: 'arbusto',    label: 'Shrub / Arbusto',            year: 'Year 3' },
  { level: 'arbol_joven',label: 'Young Tree / Árbol Joven',   year: 'Year 4' },
  { level: 'arbol',      label: 'Tree / Árbol',               year: 'Year 5' },
  { level: 'bosque',     label: 'Forest School / Escuela Bosque', year: 'Year 6+' },
]

export default function CertificationsPreview() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-forest-800 mb-2">Certification Badges</h1>
        <p className="text-gray-500 mb-10">Preview of all certification levels — Schools Are Forests NGO</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {LEVELS.map(({ level, label, year }) => (
            <div key={level} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <CertificationBadge level={level} size={160} schoolName="Example School" />
              <div className="text-center">
                <p className="font-semibold text-forest-800 text-sm">{label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{year}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Large preview */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-forest-700 mb-6">Full size — with school name</h2>
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="flex flex-col items-center gap-2">
              <CertificationBadge level="seed" size={240} schoolName="Lincoln Elementary" />
              <p className="text-xs text-gray-400">Seed · Year 1</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CertificationBadge level="bosque" size={240} schoolName="Riverside Academy" />
              <p className="text-xs text-gray-400">Forest School · Year 6+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
