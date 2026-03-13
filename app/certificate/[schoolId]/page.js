'use client'
import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { schools } from '@/data/schools'

const LEVEL_META = {
  pilot: {
    label: 'Pilot School',
    sublabel: 'Founding Member & Trailblazer',
    png: '/certificates/Founding_Member_noBG.png',
    description: 'has been recognized as a Founding Member and Trailblazer of the Schools Are Forests network — one of the first schools in the world to document, map, and celebrate every tree on its campus.',
  },
  seedling: {
    label: 'Seedling',
    sublabel: 'Level 1 Certification',
    png: '/certificates/Seedling_noBG.png',
    description: 'has completed its first full tree inventory as a member of the Schools Are Forests network — documenting every tree on campus and beginning a living record of its school forest.',
  },
  sapling: {
    label: 'Sapling',
    sublabel: 'Level 2 Certification',
    png: '/certificates/Sapling_noBG.png',
    description: 'has achieved Level 2 certification in the Schools Are Forests network, with a validated and re-measured tree inventory demonstrating commitment to data quality and environmental stewardship.',
  },
  young_tree: {
    label: 'Young Tree',
    sublabel: 'Level 3 Certification',
    png: '/certificates/YoungTree_noBG.png',
    description: 'has achieved Level 3 certification in the Schools Are Forests network, maintaining a multi-year tree inventory that tracks the growth and health of every tree on campus over time.',
  },
  mature_tree: {
    label: 'Mature Tree',
    sublabel: 'Level 4 Certification',
    png: '/certificates/MatureTree_noBG.png',
    description: 'has achieved Level 4 certification in the Schools Are Forests network, maintaining a research-grade tree inventory with full species identification, measurements, and multi-year growth data.',
  },
  forest: {
    label: 'School Forest',
    sublabel: 'Level 5 — Highest Certification',
    png: '/certificates/Founding_Member_noBG.png', // placeholder until Level 5 PNG exists
    description: 'has achieved the highest certification in the Schools Are Forests network — School Forest status — recognizing an exemplary, fully documented urban forest that serves as a living classroom for students and the broader community.',
  },
}

export default function CertificatePage({ params }) {
  const { schoolId } = use(params)
  const searchParams = useSearchParams()
  const level = searchParams.get('level') || 'pilot'

  const school = schools.find(s => s.id === schoolId)
  const meta = LEVEL_META[level] || LEVEL_META.pilot

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        School not found.
      </div>
    )
  }

  const today = new Date()
  const issueYear = school.pilotYear || today.getFullYear()
  const issueDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <>
      {/* ── Print / Download button (hidden when printing) ── */}
      <div className="no-print bg-gray-100 py-4 px-6 flex items-center justify-between border-b border-gray-200">
        <div className="text-sm text-gray-600">
          Certificate for <strong>{school.name}</strong> — <span className="text-forest-700 font-semibold">{meta.label}</span>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-forest-700 text-white font-semibold px-6 py-2 rounded-full hover:bg-forest-600 transition-colors text-sm shadow"
        >
          Download as PDF →
        </button>
      </div>

      {/* ── Certificate ── */}
      <div className="certificate-page min-h-screen bg-white flex items-center justify-center p-8">
        <div
          className="certificate-sheet relative w-full max-w-4xl mx-auto bg-white border-[12px] border-double border-[#7A4818] rounded-lg shadow-2xl overflow-hidden"
          style={{ aspectRatio: '1.414 / 1', fontFamily: 'Georgia, serif' }}
        >

          {/* Decorative corner accents */}
          <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 border-[#B8722A] rounded-tl-sm"/>
          <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-[#B8722A] rounded-tr-sm"/>
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 border-[#B8722A] rounded-bl-sm"/>
          <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-[#B8722A] rounded-br-sm"/>

          {/* Background dot texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #4a5828 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          <div className="relative z-10 h-full flex flex-col items-center justify-between py-10 px-12 text-center">

            {/* Header */}
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Schools Are Forests" className="h-14 mx-auto mb-3 object-contain"/>
              <p className="text-[#7A4818] text-xs font-semibold tracking-[0.25em] uppercase">
                Schools Are Forests NGO
              </p>
            </div>

            {/* Title */}
            <div>
              <p className="text-[#7A4818] text-sm tracking-[0.3em] uppercase font-semibold mb-1">
                Certificate of Recognition
              </p>
              <h1 className="text-4xl font-bold text-[#3D2205] mb-1">
                This Certifies That
              </h1>
              <div className="w-48 h-px bg-[#B8722A] mx-auto my-3"/>
              <h2 className="text-3xl font-bold text-forest-800 mb-1">
                {school.name}
              </h2>
              <p className="text-gray-500 text-sm">{school.location}</p>
            </div>

            {/* Body text */}
            <div className="max-w-xl">
              <p className="text-gray-700 text-base leading-relaxed">
                {meta.description}
              </p>
            </div>

            {/* Badge + level label */}
            <div className="flex flex-col items-center gap-2">
              <Image src={meta.png} alt={meta.label} width={100} height={100} className="object-contain"/>
              <p className="text-[#7A4818] font-bold text-sm tracking-wide">{meta.label}</p>
              <p className="text-gray-400 text-xs">{meta.sublabel}</p>
            </div>

            {/* Footer */}
            <div className="w-full flex items-end justify-between px-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-forest-700">{school.trees}+</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Trees Documented</p>
              </div>

              <div className="text-center">
                <p className="text-[#7A4818] text-sm font-semibold tracking-widest">{issueDate}</p>
                <div className="w-32 h-px bg-gray-300 mx-auto mt-3"/>
                <p className="text-xs text-gray-400 mt-1">Schools Are Forests NGO</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider">School ID</p>
                <p className="text-sm font-mono text-gray-600">{school.id}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .certificate-page { padding: 0 !important; }
          .certificate-sheet {
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}</style>
    </>
  )
}
