'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useT } from '@/lib/i18n'

export default function ToolContent() {
  const t = useT()
  const [clinometerOpen, setClinometerOpen] = useState(false)

  const clinoItems = t('tool.clino_items').split('|')
  const clinoSteps = t('tool.clino_steps').split('|')
  const clinoUseSteps = t('tool.clino_use_steps').split('|')

  return (
    <div>
      {/* ── Hero + CTAs ── */}
      <section className="bg-gradient-to-br from-forest-800 to-forest-500 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('tool.hero_title')}</h1>
        <p className="text-forest-100 text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          {t('tool.hero_subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link
            href="/teacher"
            className="flex-1 bg-white text-forest-700 font-semibold px-8 py-5 rounded-2xl hover:bg-forest-50 transition-colors shadow-lg"
          >
            <div className="text-3xl mb-1">👩‍🏫</div>
            <div className="text-lg">{t('tool.teacher_btn')}</div>
            <div className="text-xs text-forest-500 mt-0.5 font-normal">{t('tool.teacher_btn_sub')}</div>
          </Link>
          <Link
            href="/student"
            className="flex-1 bg-forest-600 text-white font-semibold px-8 py-5 rounded-2xl hover:bg-forest-500 transition-colors shadow-lg border border-forest-500"
          >
            <div className="text-3xl mb-1">🎒</div>
            <div className="text-lg">{t('tool.student_btn')}</div>
            <div className="text-xs text-forest-200 mt-0.5 font-normal">{t('tool.student_btn_sub')}</div>
          </Link>
        </div>
      </section>

      {/* ── How it works (3 steps) ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">{t('tool.how_title')}</h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            {t('tool.how_subtitle')}
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 font-bold text-xl flex items-center justify-center mb-4">1</div>
              <div className="text-3xl mb-3">🏫</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">{t('tool.step1_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.step1_body')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 font-bold text-xl flex items-center justify-center mb-4">2</div>
              <div className="text-3xl mb-3">🌳</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">{t('tool.step2_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.step2_body')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 font-bold text-xl flex items-center justify-center mb-4">3</div>
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">{t('tool.step3_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.step3_body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What students learn ── */}
      <section className="py-20 px-4 bg-forest-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">{t('tool.learn_title')}</h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            {t('tool.learn_subtitle')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">📐</div>
              <h3 className="font-semibold text-forest-800 mb-2">{t('tool.learn_trig_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.learn_trig_body')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🔢</div>
              <h3 className="font-semibold text-forest-800 mb-2">{t('tool.learn_math_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t('tool.learn_math_body')} (<span className="font-mono text-xs bg-gray-100 px-1 rounded">D = C ÷ π</span>)
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🌿</div>
              <h3 className="font-semibold text-forest-800 mb-2">{t('tool.learn_species_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.learn_species_body')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold text-forest-800 mb-2">{t('tool.learn_team_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.learn_team_body')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="font-semibold text-forest-800 mb-2">{t('tool.learn_science_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.learn_science_body')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-semibold text-forest-800 mb-2">{t('tool.learn_env_title')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t('tool.learn_env_body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Teacher Guide ── */}
      <section className="py-20 px-4 bg-forest-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">{t('tool.guide_title')}</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            {t('tool.guide_subtitle')}
          </p>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-forest-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-forest-800 text-lg mb-1">{t('tool.guide1_title')}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    <Link href="/teacher" className="text-forest-600 underline underline-offset-2">{t('tool.guide1_title')}</Link>{' — '}{t('tool.guide1_body')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-7 shadow-sm border border-forest-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-forest-800 text-lg mb-1">{t('tool.guide2_title')}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{t('tool.guide2_body')}</p>
                  <div className="bg-forest-50 rounded-xl px-4 py-3 text-sm text-forest-700">
                    {t('tool.guide2_tip')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-7 shadow-sm border border-forest-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-forest-800 text-lg mb-1">{t('tool.guide3_title')}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t('tool.guide3_body')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-7 shadow-sm border border-forest-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white font-bold flex items-center justify-center shrink-0">4</div>
                <div>
                  <h3 className="font-semibold text-forest-800 text-lg mb-1">{t('tool.guide4_title')}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t('tool.guide4_body')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What you'll need ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">{t('tool.need_title')}</h2>
          <p className="text-center text-gray-500 mb-12">{t('tool.need_subtitle')}</p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6">
              <div className="text-4xl shrink-0">📏</div>
              <div>
                <h3 className="font-semibold text-forest-800 mb-1">{t('tool.need_tape_title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t('tool.need_tape_body')}</p>
              </div>
            </div>

            <button
              onClick={() => setClinometerOpen(o => !o)}
              className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6 w-full text-left hover:bg-forest-100 transition-colors group"
            >
              <div className="text-4xl shrink-0">📐</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-forest-800 mb-1">{t('tool.need_clino_title')}</h3>
                  <span className="text-forest-500 text-sm font-medium group-hover:text-forest-700 transition-colors">
                    {clinometerOpen ? t('tool.need_clino_open') : t('tool.need_clino_closed')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{t('tool.need_clino_body')}</p>
              </div>
            </button>

            {clinometerOpen && (
              <div className="bg-white border border-forest-200 rounded-2xl overflow-hidden -mt-2">
                <div className="bg-forest-700 text-white px-6 py-4">
                  <h4 className="font-bold text-base">{t('tool.need_clino_title')}</h4>
                </div>
                <div className="p-6 grid sm:grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t('tool.clino_you_need')}</div>
                    <ul className="text-sm text-gray-700 space-y-1 mb-5">
                      {clinoItems.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t('tool.clino_build')}</div>
                    <ol className="text-sm text-gray-700 space-y-3">
                      {clinoSteps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <svg viewBox="0 0 240 200" className="w-full max-w-[220px] mx-auto block mb-5" style={{ fontFamily: 'Arial, sans-serif' }}>
                      <path d="M 30,130 A 90,90 0 0,1 210,130 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
                      <rect x="26" y="126" width="188" height="8" rx="4" fill="#0369a1" />
                      <line x1="120" y1="130" x2="120" y2="44" stroke="#64748b" strokeWidth="1" strokeDasharray="3,2" />
                      <text x="123" y="50" fontSize="7" fill="#64748b">90°</text>
                      <line x1="120" y1="130" x2="165" y2="52" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                      <text x="168" y="55" fontSize="7" fill="#64748b">60°</text>
                      <line x1="120" y1="130" x2="198" y2="85" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                      <text x="200" y="88" fontSize="7" fill="#64748b">30°</text>
                      <circle cx="120" cy="130" r="3" fill="#0369a1" />
                      <line x1="120" y1="130" x2="148" y2="185" stroke="#dc2626" strokeWidth="2" />
                      <circle cx="148" cy="188" r="6" fill="#dc2626" />
                      <text x="156" y="192" fontSize="8" fill="#dc2626" fontWeight="bold">weight</text>
                      <path d="M 120,105 A 25,25 0 0,1 138,112" fill="none" stroke="#dc2626" strokeWidth="1.5" />
                      <text x="132" y="102" fontSize="8" fill="#dc2626" fontWeight="bold">read here</text>
                      <ellipse cx="26" cy="130" rx="8" ry="5" fill="none" stroke="#1e40af" strokeWidth="1.5" />
                      <circle cx="26" cy="130" r="2.5" fill="#1e40af" />
                    </svg>

                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t('tool.clino_use_title')}</div>
                    <ol className="text-sm text-gray-700 space-y-2">
                      {clinoUseSteps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <div className="text-xs font-bold text-amber-800 mb-1">{t('tool.clino_formula_title')}</div>
                      <div className="font-mono text-sm font-bold text-amber-900 text-center py-1">{t('tool.clino_formula')}</div>
                      <div className="text-xs text-amber-700 mt-1">{t('tool.clino_formula_example')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6">
              <div className="text-4xl shrink-0">📱</div>
              <div>
                <h3 className="font-semibold text-forest-800 mb-1">{t('tool.need_phone_title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t('tool.need_phone_body')}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6">
              <div className="text-4xl shrink-0">📄</div>
              <div>
                <h3 className="font-semibold text-forest-800 mb-1">
                  {t('tool.need_sheet_title')}{' '}
                  <span className="text-xs bg-forest-200 text-forest-800 px-2 py-0.5 rounded-full ml-1">{t('tool.need_sheet_optional')}</span>
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t('tool.need_sheet_body')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Printable resources ── */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🖨️</div>
          <h2 className="text-2xl font-bold text-forest-700 mb-3">{t('tool.print_title')}</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">{t('tool.print_body')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/print/field-sheet"
              target="_blank"
              className="inline-flex items-center gap-2 bg-forest-600 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-forest-700 transition-colors shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('tool.print_btn')}
            </Link>
            <span className="text-xs text-gray-400">{t('tool.print_hint')}</span>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-4 bg-forest-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">{t('tool.cta_title')}</h2>
        <p className="text-forest-200 text-lg mb-10 max-w-xl mx-auto">{t('tool.cta_body')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link
            href="/teacher"
            className="flex-1 bg-white text-forest-700 font-semibold px-8 py-5 rounded-2xl hover:bg-forest-50 transition-colors shadow-lg"
          >
            <div className="text-2xl mb-1">👩‍🏫</div>
            <div className="text-lg">{t('tool.cta_teacher')}</div>
          </Link>
          <Link
            href="/student"
            className="flex-1 bg-forest-600 text-white font-semibold px-8 py-5 rounded-2xl hover:bg-forest-500 transition-colors shadow-lg border border-forest-500"
          >
            <div className="text-2xl mb-1">🎒</div>
            <div className="text-lg">{t('tool.cta_student')}</div>
          </Link>
        </div>
      </section>
    </div>
  )
}
