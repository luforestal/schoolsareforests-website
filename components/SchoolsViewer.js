'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const TREEMAP_BASE = process.env.NEXT_PUBLIC_TREEMAP_URL || 'https://luforestal.github.io/SchoolTreeMap/'

function ViewerContent() {
  const [loaded, setLoaded] = useState(false)
  const searchParams = useSearchParams()
  const schoolId = searchParams.get('school')
  const iframeSrc = schoolId ? `${TREEMAP_BASE}?school=${schoolId}` : TREEMAP_BASE

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* top bar */}
      <div className="bg-forest-50 border-b border-forest-100 px-6 py-3 shrink-0">
        <h1 className="text-lg font-bold text-forest-700">Explore School Forests</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Select a school to explore its full tree inventory interactively.
        </p>
      </div>

      {/* iframe container */}
      <div className="relative flex-1">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-forest-50 z-10">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-pulse">🌳</div>
              <p className="text-forest-600 font-medium">Loading tree map…</p>
            </div>
          </div>
        )}
        <iframe
          src={iframeSrc}
          className="w-full h-full border-0"
          title="School Tree Map"
          onLoad={() => setLoaded(true)}
          allow="geolocation"
        />
      </div>
    </div>
  )
}

export default function SchoolsViewer() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="text-5xl mb-4 animate-pulse">🌳</div>
            <p className="text-forest-600 font-medium">Loading…</p>
          </div>
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  )
}
