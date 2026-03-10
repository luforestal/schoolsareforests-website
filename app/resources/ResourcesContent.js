'use client'
import { useT } from '@/lib/i18n'

function DBHIllustration() {
  return (
    <svg viewBox="0 0 220 260" className="w-full max-w-[220px] mx-auto" aria-label="How to measure DBH">
      {/* Sky/background */}
      <rect x="0" y="0" width="220" height="260" fill="#f0f7f0" rx="12" />

      {/* Ground */}
      <rect x="0" y="210" width="220" height="50" fill="#c8a96e" rx="0" />
      <rect x="0" y="208" width="220" height="8" fill="#8B6340" rx="2" />

      {/* Trunk */}
      <rect x="93" y="70" width="34" height="142" fill="#8B6340" rx="4" />
      {/* Trunk texture lines */}
      <line x1="100" y1="80" x2="100" y2="205" stroke="#6b4c2a" strokeWidth="1" opacity="0.4" />
      <line x1="110" y1="80" x2="110" y2="205" stroke="#6b4c2a" strokeWidth="1" opacity="0.3" />
      <line x1="120" y1="80" x2="120" y2="205" stroke="#6b4c2a" strokeWidth="1" opacity="0.4" />

      {/* Canopy */}
      <ellipse cx="110" cy="62" rx="62" ry="48" fill="#2d6a4f" />
      <ellipse cx="110" cy="55" rx="50" ry="38" fill="#40916c" />
      <ellipse cx="96"  cy="60" rx="28" ry="22" fill="#52b788" opacity="0.5" />
      <ellipse cx="128" cy="58" rx="24" ry="18" fill="#52b788" opacity="0.4" />

      {/* 1.3 m dashed line */}
      <line x1="14" y1="148" x2="206" y2="148" stroke="#e63946" strokeWidth="1.8" strokeDasharray="6,4" />

      {/* Left bracket arrow */}
      <line x1="14" y1="148" x2="14" y2="210" stroke="#555" strokeWidth="1.2" strokeDasharray="3,3" />

      {/* 1.3 m label */}
      <rect x="6" y="173" width="40" height="18" fill="white" rx="3" />
      <text x="26" y="186" fontSize="11" fontWeight="bold" fill="#e63946" textAnchor="middle">1.3 m</text>

      {/* Ground label */}
      <text x="110" y="237" fontSize="10" fill="white" textAnchor="middle" fontStyle="italic">ground level</text>

      {/* DBH diameter arrows at 1.3 m */}
      {/* Left arrow */}
      <line x1="56" y1="148" x2="93" y2="148" stroke="#1d3557" strokeWidth="2" />
      <polygon points="93,148 85,144 85,152" fill="#1d3557" />
      {/* Right arrow */}
      <line x1="164" y1="148" x2="127" y2="148" stroke="#1d3557" strokeWidth="2" />
      <polygon points="127,148 135,144 135,152" fill="#1d3557" />
      {/* DBH measurement label */}
      <rect x="56" y="154" width="108" height="18" fill="white" rx="3" />
      <text x="110" y="167" fontSize="11" fontWeight="bold" fill="#1d3557" textAnchor="middle">measure here (DBH)</text>
    </svg>
  )
}

function CrownIllustration() {
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[220px] mx-auto" aria-label="How to measure crown diameter">
      {/* Background */}
      <rect x="0" y="0" width="220" height="220" fill="#f0f7f0" rx="12" />

      {/* "Top view" label */}
      <text x="110" y="18" fontSize="10" fill="#555" textAnchor="middle" fontStyle="italic">aerial view</text>

      {/* Shadow */}
      <ellipse cx="112" cy="114" rx="76" ry="74" fill="#c8e6c9" opacity="0.6" />

      {/* Crown (irregular circle from top) */}
      <ellipse cx="110" cy="110" rx="72" ry="68" fill="#2d6a4f" />
      <ellipse cx="110" cy="106" rx="58" ry="54" fill="#40916c" />
      {/* Texture blobs */}
      <ellipse cx="88"  cy="92"  rx="26" ry="24" fill="#52b788" opacity="0.55" />
      <ellipse cx="136" cy="98"  rx="22" ry="20" fill="#52b788" opacity="0.45" />
      <ellipse cx="100" cy="130" rx="28" ry="20" fill="#52b788" opacity="0.4" />
      <ellipse cx="130" cy="126" rx="18" ry="16" fill="#74c69d" opacity="0.4" />

      {/* Trunk center dot */}
      <circle cx="110" cy="110" r="5" fill="#8B6340" />

      {/* End-to-end measurement line (horizontal, widest) */}
      <line x1="36" y1="110" x2="184" y2="110" stroke="#e63946" strokeWidth="2" strokeDasharray="5,3" />

      {/* Left arrowhead */}
      <polygon points="38,110 48,105 48,115" fill="#e63946" />
      {/* Right arrowhead */}
      <polygon points="182,110 172,105 172,115" fill="#e63946" />

      {/* Measurement label */}
      <rect x="62" y="118" width="96" height="18" fill="white" rx="3" />
      <text x="110" y="131" fontSize="11" fontWeight="bold" fill="#e63946" textAnchor="middle">widest point</text>

      {/* Corner guides (like the square from the book) */}
      {/* Top-left corner */}
      <polyline points="38,76 38,68 46,68" stroke="#1d3557" strokeWidth="1.5" fill="none" strokeDasharray="3,2" />
      {/* Top-right corner */}
      <polyline points="174,76 174,68 166,68" stroke="#1d3557" strokeWidth="1.5" fill="none" strokeDasharray="3,2" />
      {/* Bottom-left corner */}
      <polyline points="38,144 38,152 46,152" stroke="#1d3557" strokeWidth="1.5" fill="none" strokeDasharray="3,2" />
      {/* Bottom-right corner */}
      <polyline points="174,144 174,152 166,152" stroke="#1d3557" strokeWidth="1.5" fill="none" strokeDasharray="3,2" />

      {/* Top-bottom vertical dashed for bounding box context */}
      <line x1="38" y1="42" x2="38" y2="178" stroke="#1d3557" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      <line x1="182" y1="42" x2="182" y2="178" stroke="#1d3557" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      <line x1="36" y1="42" x2="184" y2="42" stroke="#1d3557" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      <line x1="36" y1="178" x2="184" y2="178" stroke="#1d3557" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
    </svg>
  )
}

export default function ResourcesContent() {
  const t = useT()

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-forest-800 to-forest-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">{t('resources.hero_title')}</h1>
        <p className="text-forest-200 text-lg max-w-2xl mx-auto">{t('resources.hero_subtitle')}</p>
      </section>

      {/* ── How to Measure ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">{t('resources.measure_title')}</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">{t('resources.measure_subtitle')}</p>

          <div className="grid md:grid-cols-2 gap-10">

            {/* DBH Card */}
            <div className="bg-forest-50 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
              <DBHIllustration />
              <h3 className="text-xl font-bold text-forest-800 mt-6 mb-2">{t('resources.dbh_title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t('resources.dbh_body')}</p>
            </div>

            {/* Crown Card */}
            <div className="bg-forest-50 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
              <CrownIllustration />
              <h3 className="text-xl font-bold text-forest-800 mt-6 mb-2">{t('resources.crown_title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t('resources.crown_body')}</p>
            </div>

          </div>

          {/* Citation */}
          <p className="text-center text-gray-400 text-xs mt-10 italic">
            {t('resources.citation')}
          </p>
        </div>
      </section>

      {/* ── Videos ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">{t('resources.videos_title')}</h2>
          <p className="text-center text-gray-500 mb-10">{t('resources.videos_subtitle')}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Placeholder cards — replace href and title when ready */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-dashed border-gray-300 p-6 flex items-center gap-4 opacity-60">
                <div className="w-14 h-14 rounded-lg bg-red-100 flex items-center justify-center shrink-0 text-2xl">▶️</div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-6 italic">{t('resources.videos_coming')}</p>
        </div>
      </section>

      {/* ── Scientific References ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-10">{t('resources.refs_title')}</h2>

          <div className="space-y-4">
            <a
              href="https://research.fs.usda.gov/treesearch/60818"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-forest-50 rounded-xl p-5 hover:bg-forest-100 transition-colors border border-forest-100"
            >
              <p className="font-semibold text-forest-800 text-sm mb-1">
                Roman, L.A., van Doorn, N.S., McPherson, E.G., et al. (2020).
              </p>
              <p className="text-forest-600 text-sm italic mb-2">
                Urban tree monitoring: a field guide.
              </p>
              <p className="text-gray-400 text-xs">
                General Technical Report NRS-194. USDA Forest Service, Northern Research Station. pp. 1–48.
              </p>
              <span className="text-forest-500 text-xs mt-2 inline-block hover:underline">
                research.fs.usda.gov →
              </span>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
