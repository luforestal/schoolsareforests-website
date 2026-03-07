'use client'
import Link from 'next/link'
import { useT } from '@/lib/i18n'

export default function ToolContent() {
  const t = useT()
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-forest-800 to-forest-500 text-white py-24 px-4 text-center">
        <div className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          {t('tool.coming_soon')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('tool.title')}</h1>
        <p className="text-forest-100 text-xl max-w-2xl mx-auto leading-relaxed">{t('tool.subtitle')}</p>
      </section>

      {/* ── What it will do ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-4">{t('tool.building_title')}</h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">{t('tool.building_body')}</p>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-forest-50 rounded-2xl p-7">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">{t('tool.feature1_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.feature1_body')}</p>
            </div>
            <div className="bg-forest-50 rounded-2xl p-7">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">{t('tool.feature2_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.feature2_body')}</p>
            </div>
            <div className="bg-forest-50 rounded-2xl p-7">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">{t('tool.feature3_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.feature3_body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-forest-700 mb-5">{t('tool.students_title')}</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> {t('tool.students_1')}</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> {t('tool.students_2')}</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> {t('tool.students_3')}</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> {t('tool.students_4')}</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-forest-700 mb-5">{t('tool.teachers_title')}</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> {t('tool.teachers_1')}</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> {t('tool.teachers_2')}</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> {t('tool.teachers_3')}</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> {t('tool.teachers_4')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Entry CTAs ── */}
      <section className="py-20 px-4 bg-forest-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">{t('tool.cta_title')}</h2>
        <p className="text-forest-200 text-lg mb-12 max-w-xl mx-auto">{t('tool.cta_body')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link
            href="/teacher"
            className="flex-1 bg-white text-forest-700 font-semibold px-8 py-5 rounded-2xl hover:bg-forest-50 transition-colors shadow-lg"
          >
            <div className="text-2xl mb-1">👩‍🏫</div>
            <div className="text-lg">{t('tool.teacher_btn')}</div>
            <div className="text-xs text-forest-500 mt-0.5 font-normal">{t('tool.teacher_btn_sub')}</div>
          </Link>
          <Link
            href="/student"
            className="flex-1 bg-forest-600 text-white font-semibold px-8 py-5 rounded-2xl hover:bg-forest-500 transition-colors shadow-lg border border-forest-500"
          >
            <div className="text-2xl mb-1">🎒</div>
            <div className="text-lg">{t('tool.student_btn')}</div>
            <div className="text-xs text-forest-200 mt-0.5 font-normal">{t('tool.student_btn_sub')}</div>
          </Link>
        </div>
      </section>
    </div>
  )
}
