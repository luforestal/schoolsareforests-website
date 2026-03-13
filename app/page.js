'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import WorldMapWrapper from '@/components/WorldMapWrapper'
import VolunteerCard from '@/components/VolunteerCard'
import { schools } from '@/data/schools'
import Image from 'next/image'
import { useT } from '@/lib/i18n'

export default function HomePage() {
  const t = useT()
  const totalTrees = schools.reduce((sum, s) => sum + s.trees, 0)
  const totalCountries = new Set(schools.map(s => s.country)).size

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative py-20 px-4 text-center overflow-hidden bg-gradient-to-b from-white via-white to-forest-700">

        {/* Tree canopy circles decoration */}
        <svg
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          viewBox="0 0 1000 140"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <circle cx="30"  cy="150" r="80"  fill="white" fillOpacity="0.07" />
          <circle cx="110" cy="140" r="90"  fill="white" fillOpacity="0.05" />
          <circle cx="200" cy="148" r="70"  fill="white" fillOpacity="0.08" />
          <circle cx="290" cy="135" r="85"  fill="white" fillOpacity="0.06" />
          <circle cx="380" cy="145" r="75"  fill="white" fillOpacity="0.07" />
          <circle cx="470" cy="140" r="90"  fill="white" fillOpacity="0.05" />
          <circle cx="560" cy="150" r="80"  fill="white" fillOpacity="0.07" />
          <circle cx="650" cy="138" r="85"  fill="white" fillOpacity="0.06" />
          <circle cx="740" cy="146" r="70"  fill="white" fillOpacity="0.08" />
          <circle cx="830" cy="140" r="90"  fill="white" fillOpacity="0.05" />
          <circle cx="920" cy="148" r="75"  fill="white" fillOpacity="0.07" />
          <circle cx="990" cy="142" r="80"  fill="white" fillOpacity="0.06" />
        </svg>

        {/* Content */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Schools Are Forests" className="w-[360px] md:w-[540px] mx-auto mb-8 drop-shadow-lg" />
          <p className="text-xl md:text-2xl text-forest-900 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.tagline')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/schools"
              className="bg-forest-800 text-white font-semibold px-8 py-3 rounded-full hover:bg-forest-900 transition-colors shadow-lg"
            >
              {t('home.cta_map')}
            </Link>
            <Link
              href="/about"
              className="border-2 border-forest-700 text-forest-800 font-semibold px-8 py-3 rounded-full hover:bg-forest-700 hover:text-white transition-colors"
            >
              {t('home.cta_learn')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-forest-50 py-14 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-forest-700">{totalTrees}+</div>
            <div className="text-gray-500 mt-1 text-sm">{t('home.stats_trees')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-forest-700">{schools.length}</div>
            <div className="text-gray-500 mt-1 text-sm">{t('home.stats_schools')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-forest-700">{totalCountries}</div>
            <div className="text-gray-500 mt-1 text-sm">{totalCountries === 1 ? t('home.stats_country') : t('home.stats_countries')}</div>
          </div>
        </div>
      </section>

      {/* ── World Map ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">{t('home.map_title')}</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">{t('home.map_hint')}</p>
          <WorldMapWrapper schools={schools} />
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-forest-700 mb-6">{t('home.mission_title')}</h2>
          <p className="text-lg text-gray-600 leading-relaxed">{t('home.mission_body')}</p>
        </div>
      </section>

      {/* ── Schools Grid ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">{t('home.schools_title')}</h2>
          <p className="text-center text-gray-500 mb-12">{t('home.schools_subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schools.map(school => (
              <div
                key={school.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-32 flex items-center justify-center bg-forest-50 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={school.logo}
                    alt={school.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {school.pilot && (
                    <div className="absolute top-1 right-1" title="Pilot School — Founding Member & Trailblazer">
                      <Image src="/certificates/Founding_Member_noBG.png" alt="Pilot School" width={52} height={52} className="object-contain"/>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-forest-800 text-base mb-1">{school.name}</h3>
                  <p className="text-gray-400 text-sm mb-1">📍 {school.location}</p>
                  <p className="text-forest-600 text-sm font-medium mb-4">
                    🌳 {school.trees}+ {t('home.trees_documented')}
                  </p>
                  <Link
                    href={`/schools?school=${school.id}`}
                    className="block text-center bg-forest-700 text-white py-2 px-4 rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium"
                  >
                    {t('home.explore_map')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-12">{t('home.what_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-forest-700 mb-3">{t('home.what_maps_title')}</h3>
              <p className="text-gray-500 leading-relaxed">{t('home.what_maps_body')}</p>
            </div>
            <div>
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-forest-700 mb-3">{t('home.what_photos_title')}</h3>
              <p className="text-gray-500 leading-relaxed">{t('home.what_photos_body')}</p>
            </div>
            <div>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-forest-700 mb-3">{t('home.what_data_title')}</h3>
              <p className="text-gray-500 leading-relaxed">{t('home.what_data_body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Certification teaser ── */}
      <section className="py-20 px-4 bg-forest-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🌱</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Is your school a forest?</h2>
          <p className="text-forest-300 text-lg leading-relaxed mb-3">
            Map your trees. Measure them with your students. Get certified by Schools Are Forests NGO.
          </p>
          <p className="text-forest-400 text-sm mb-10">
            ¿Es tu escuela un bosque? · Certifica tu escuela
          </p>
          <Link
            href="/tool"
            className="bg-white text-forest-800 font-bold px-10 py-4 rounded-full hover:bg-forest-50 transition-colors text-lg shadow-lg inline-block"
          >
            Get your school certified →
          </Link>
        </div>
      </section>

      {/* ── Join Our Network ── */}
      <section className="py-20 px-4 bg-forest-800 text-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">{t('home.join_title')}</h2>
            <p className="text-forest-200 text-lg leading-relaxed mb-6">{t('home.join_body')}</p>
            <Link
              href="/contact"
              className="bg-white text-forest-700 font-semibold px-8 py-3 rounded-full hover:bg-forest-50 transition-colors inline-block shadow-lg"
            >
              {t('home.join_cta')}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-forest-700 rounded-xl p-5">
              <div className="text-3xl mb-2">🌍</div>
              <p className="text-sm text-forest-200">{t('home.join_worldwide')}</p>
            </div>
            <div className="bg-forest-700 rounded-xl p-5">
              <div className="text-3xl mb-2">🆓</div>
              <p className="text-sm text-forest-200">{t('home.join_free')}</p>
            </div>
            <div className="bg-forest-700 rounded-xl p-5">
              <div className="text-3xl mb-2">📍</div>
              <p className="text-sm text-forest-200">{t('home.join_map')}</p>
            </div>
            <div className="bg-forest-700 rounded-xl p-5">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm text-forest-200">{t('home.join_support')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Support Us ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 mb-4 text-center">{t('home.support_title')}</h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 text-center">{t('home.support_subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left">
              <div className="text-3xl mb-3">📣</div>
              <h3 className="font-semibold text-forest-800 mb-2">{t('home.spread_title')}</h3>
              <p className="text-gray-500 text-sm">{t('home.spread_body')}</p>
            </div>
            <VolunteerCard />
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left flex flex-col">
              <div className="text-3xl mb-3">💚</div>
              <h3 className="font-semibold text-forest-800 mb-2">{t('home.donate_title')}</h3>
              <p className="text-gray-500 text-sm">{t('home.donate_body')}</p>
              <a href="https://www.paypal.com/" target="_blank" rel="noopener noreferrer"
                className="mt-4 text-sm font-semibold text-forest-600 hover:text-forest-800 transition-colors">
                {t('home.donate_cta')}
              </a>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/contact"
              className="bg-forest-700 text-white font-semibold px-10 py-4 rounded-full hover:bg-forest-600 transition-colors text-lg shadow-lg inline-block"
            >
              {t('home.involved_cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-forest-700 text-white py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{t('home.ready_title')}</h2>
        <p className="text-forest-200 text-lg mb-8 max-w-xl mx-auto">{t('home.ready_body')}</p>
        <Link
          href="/schools"
          className="bg-white text-forest-700 font-semibold px-10 py-4 rounded-full hover:bg-forest-50 transition-colors text-lg shadow-lg inline-block"
        >
          {t('home.ready_cta')}
        </Link>
      </section>
    </>
  )
}
