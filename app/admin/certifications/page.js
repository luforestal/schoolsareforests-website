'use client'
import dynamic from 'next/dynamic'
const CertificationBadge = dynamic(
  () => import('@/components/CertificationBadge').then(m => m.CertificationBadge),
  { ssr: false }
)

const LEVELS = [
  { level: 'seedling',    label: 'Seedling',    sublabel: 'Level 1' },
  { level: 'sapling',     label: 'Sapling',     sublabel: 'Level 2' },
  { level: 'young_tree',  label: 'Young Tree',  sublabel: 'Level 3' },
  { level: 'mature_tree', label: 'Mature Tree', sublabel: 'Level 4' },
  { level: 'forest',      label: 'School Forests', sublabel: 'Level 5' },
]

export default function CertificationsPreview() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-forest-800 mb-2">Certification Badges</h1>
        <p className="text-gray-500 mb-10">Schools Are Forests NGO — all certification levels</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-16">
          {LEVELS.map(({ level, label, sublabel }) => (
            <div key={level} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2">
              <CertificationBadge level={level} size={140}/>
              <p className="font-semibold text-forest-800 text-sm text-center">{label}</p>
              <p className="text-gray-400 text-xs">{sublabel}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-forest-700 mb-6">Full size preview</h2>
        <div className="flex flex-wrap gap-8 justify-center">
          {LEVELS.map(({ level, label }) => (
            <div key={level} className="flex flex-col items-center gap-2">
              <CertificationBadge level={level} size={220} schoolName="Lincoln Elementary"/>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
