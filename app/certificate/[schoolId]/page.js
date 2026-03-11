'use client'
import { use } from 'react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { schools } from '@/data/schools'

const PilotBadge = dynamic(
  () => import('@/components/PilotBadge').then(m => m.PilotBadge),
  { ssr: false }
)
const CertificationBadge = dynamic(
  () => import('@/components/CertificationBadge').then(m => m.CertificationBadge),
  { ssr: false }
)

export default function CertificatePage({ params }) {
  const { schoolId } = use(params)
  const school = schools.find(s => s.id === schoolId)
  const [ready, setReady] = useState(false)

  useEffect(() => { setReady(true) }, [])

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        School not found.
      </div>
    )
  }

  const today = new Date()
  const issueYear = school.pilotYear || today.getFullYear()
  const expiryYear = issueYear + 1

  return (
    <>
      {/* ── Print / Download button (hidden when printing) ── */}
      <div className="no-print bg-gray-100 py-4 px-6 flex items-center justify-between border-b border-gray-200">
        <div className="text-sm text-gray-600">
          Certificate for <strong>{school.name}</strong>
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
        <div className="certificate-sheet relative w-full max-w-4xl mx-auto bg-white border-[12px] border-double border-[#7A4818] rounded-lg shadow-2xl overflow-hidden"
          style={{ aspectRatio: '1.414 / 1', fontFamily: 'Georgia, serif' }}>

          {/* Decorative corner accents */}
          <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 border-[#B8722A] rounded-tl-sm"/>
          <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-[#B8722A] rounded-tr-sm"/>
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 border-[#B8722A] rounded-bl-sm"/>
          <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-[#B8722A] rounded-br-sm"/>

          {/* Background texture pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
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
              <h1 className="text-4xl font-bold text-[#3D2205] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
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
                has been recognized as a <strong className="text-[#7A4818]">Pilot School — Founding Member &amp; Trailblazer</strong> of
                the Schools Are Forests network, for outstanding commitment to urban tree inventory,
                environmental education, and community stewardship.
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-8">
              {ready && school.pilot && <PilotBadge schoolName={school.name} size={110}/>}
              {ready && school.certificationLevel && (
                <CertificationBadge level={school.certificationLevel} schoolName={school.name} size={100}/>
              )}
            </div>

            {/* Footer */}
            <div className="w-full flex items-end justify-between px-4">
              {/* Left: tree count */}
              <div className="text-center">
                <p className="text-3xl font-bold text-forest-700">{school.trees}+</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Trees Documented</p>
              </div>

              {/* Center: year + validity */}
              <div className="text-center">
                <p className="text-[#7A4818] text-sm font-semibold tracking-widest">{issueYear}</p>
                <p className="text-xs text-gray-400 mt-1">Valid through {expiryYear}</p>
                <div className="w-32 h-px bg-gray-300 mx-auto mt-3"/>
                <p className="text-xs text-gray-400 mt-1">Schools Are Forests NGO</p>
              </div>

              {/* Right: school ID */}
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
