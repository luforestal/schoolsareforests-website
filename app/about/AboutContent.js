'use client'
import { useT } from '@/lib/i18n'

const founders = [
  { first: 'Luisa',   last: 'Velásquez Camacho' },
  { first: 'Moreen',  last: 'Willaredt' },
  { first: 'Elizeth', last: 'Cinto Mejía' },
]

export default function AboutContent() {
  const t = useT()
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-forest-800 to-forest-500 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('about.title')}</h1>
        <p className="text-forest-100 text-xl max-w-2xl mx-auto leading-relaxed">{t('about.subtitle')}</p>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-forest-700 mb-5">{t('about.mission_title')}</h2>
            <p className="text-gray-600 leading-relaxed">{t('about.mission_body')}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-forest-700 mb-5">{t('about.vision_title')}</h2>
            <p className="text-gray-600 leading-relaxed">{t('about.vision_body')}</p>
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-16 px-4 bg-forest-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 mb-8 text-center">{t('about.story_title')}</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-5">{t('about.story_p1')}</p>
          <p className="text-gray-600 leading-relaxed text-lg">{t('about.story_p2')}</p>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-12">{t('about.team_title')}</h2>

          {/* Group photo */}
          <div className="rounded-2xl overflow-hidden shadow-xl mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/team.jpg"
              alt="Schools Are Forests founders"
              className="w-full object-cover object-center"
              style={{ maxHeight: '480px' }}
            />
          </div>

          {/* Name cards */}
          <div className="grid grid-cols-3 gap-6 text-center">
            {founders.map((f, i) => (
              <div key={i} className="bg-forest-50 rounded-xl py-5 px-4">
                <p className="text-lg font-bold text-forest-800">{f.first}</p>
                <p className="text-sm font-medium text-forest-700">{f.last}</p>
                <p className="text-xs text-gray-400 mt-1">{t('about.role_cofounder')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
