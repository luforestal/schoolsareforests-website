'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ToolContent() {
  const [clinometerOpen, setClinometerOpen] = useState(false)

  return (
    <div>
      {/* ── Hero + CTAs ── */}
      <section className="bg-gradient-to-br from-forest-800 to-forest-500 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">The Schools Are Forests Tool</h1>
        <p className="text-forest-100 text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          A browser-based field app for turning any school campus into a living tree inventory —
          no installation needed, works on any phone or tablet.
        </p>

        {/* Big entry CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link
            href="/teacher"
            className="flex-1 bg-white text-forest-700 font-semibold px-8 py-5 rounded-2xl hover:bg-forest-50 transition-colors shadow-lg"
          >
            <div className="text-3xl mb-1">👩‍🏫</div>
            <div className="text-lg">I'm a Teacher</div>
            <div className="text-xs text-forest-500 mt-0.5 font-normal">Set up your school &amp; zones</div>
          </Link>
          <Link
            href="/student"
            className="flex-1 bg-forest-600 text-white font-semibold px-8 py-5 rounded-2xl hover:bg-forest-500 transition-colors shadow-lg border border-forest-500"
          >
            <div className="text-3xl mb-1">🎒</div>
            <div className="text-lg">I'm a Student</div>
            <div className="text-xs text-forest-200 mt-0.5 font-normal">Enter your session code</div>
          </Link>
        </div>
      </section>

      {/* ── How it works (3 steps) ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">How it works</h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            Three simple steps — from setup to a live tree map.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 font-bold text-xl flex items-center justify-center mb-4">1</div>
              <div className="text-3xl mb-3">🏫</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">Teacher sets up</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Create an account, add your school, define zones, and start a session. Students get a 6-character code.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 font-bold text-xl flex items-center justify-center mb-4">2</div>
              <div className="text-3xl mb-3">🌳</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">Students measure</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Students go outside, enter the code, and follow the guided wizard: photos, species, height, trunk diameter — tree by tree.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 font-bold text-xl flex items-center justify-center mb-4">3</div>
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">Data lives on the map</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Every tree appears on the school map the moment it's submitted. Teachers review and validate from the dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What students learn ── */}
      <section className="py-20 px-4 bg-forest-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">What students actually learn</h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            A tree inventory is more than ecology — it's a hands-on lesson in several disciplines at once.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">📐</div>
              <h3 className="font-semibold text-forest-800 mb-2">Trigonometry</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Students use a protractor clinometer to measure the angle to the treetop, then apply trigonometry (tan) to calculate the real height — putting right triangles to work in the real world.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🔢</div>
              <h3 className="font-semibold text-forest-800 mb-2">Math</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Measuring trunk circumference and converting it to diameter (<span className="font-mono text-xs bg-gray-100 px-1 rounded">D = C ÷ π</span>) gives students a concrete reason to care about pi and unit conversions.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🌿</div>
              <h3 className="font-semibold text-forest-800 mb-2">Species identification</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Students observe leaves, bark, shape, and fruit to identify the trees around them — building nature literacy on their own campus.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold text-forest-800 mb-2">Teamwork</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Each group divides roles — measurer, recorder, photographer, navigator — and has to coordinate to cover their zone efficiently.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="font-semibold text-forest-800 mb-2">Scientific method</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Students collect standardized field data, learn why consistency matters, and see how individual measurements combine into a dataset.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-semibold text-forest-800 mb-2">Environmental awareness</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Mapping the school's trees makes students think about urban green space, biodiversity, and their own campus as a living ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Teacher Guide ── */}
      <section className="py-20 px-4 bg-forest-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">Teacher Guide</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Everything you need to run a tree inventory session with your class.
          </p>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-forest-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-forest-800 text-lg mb-1">Create your teacher account</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Go to <Link href="/teacher" className="text-forest-600 underline underline-offset-2">Teacher Login</Link> and register with your email. After filling in your profile and school details, your account is reviewed by our team — you'll be approved within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-forest-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-forest-800 text-lg mb-1">Define your zones</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Zones are sections of your school grounds — think of them as areas you'll assign to different student groups. Each zone gets a letter (A, B, C…) and a location category (Playground, Garden, Front yard, etc.).
                  </p>
                  <div className="bg-forest-50 rounded-xl px-4 py-3 text-sm text-forest-700">
                    <strong>Tip:</strong> Create one zone per group of students. If you have 30 students in groups of 5, create 6 zones. Balance the number of trees per zone so the workload is even.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-forest-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-forest-800 text-lg mb-1">Start a session</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    From your dashboard, click <strong>Start Session</strong>. You'll get a 6-character code (e.g. <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">XF4T2K</span>). Share it verbally, write it on the board, or print it. Students go to <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">schoolsareforests.org/student</span> and enter it. Sessions last 3 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-forest-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white font-bold flex items-center justify-center shrink-0">4</div>
                <div>
                  <h3 className="font-semibold text-forest-800 text-lg mb-1">Monitor &amp; validate</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Watch progress in real time from your dashboard. Once all trees are recorded, you can validate each submission — checking photo quality, species ID, and measurements. Validated trees are published to the public school map.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What you'll need ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">What you'll need</h2>
          <p className="text-center text-gray-500 mb-12">
            Simple materials — most schools already have them.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6">
              <div className="text-4xl shrink-0">📏</div>
              <div>
                <h3 className="font-semibold text-forest-800 mb-1">Measuring tape</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A standard tape measure works for trunk circumference and crown diameter. A <strong>diameter tape</strong> (reads diameter directly) is ideal but not required — the app converts automatically.
                </p>
              </div>
            </div>

            <button
              onClick={() => setClinometerOpen(o => !o)}
              className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6 w-full text-left hover:bg-forest-100 transition-colors group"
            >
              <div className="text-4xl shrink-0">📐</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-forest-800 mb-1">Cardboard clinometer</h3>
                  <span className="text-forest-500 text-sm font-medium group-hover:text-forest-700 transition-colors">
                    {clinometerOpen ? '▲ Close' : '▼ How to build it'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A simple homemade tool for measuring tree height — takes 5 minutes to build. Click to see step-by-step instructions.
                </p>
              </div>
            </button>

            {clinometerOpen && (
              <div className="bg-white border border-forest-200 rounded-2xl overflow-hidden -mt-2">
                <div className="bg-forest-700 text-white px-6 py-4">
                  <h4 className="font-bold text-base">Build a protractor clinometer</h4>
                  <p className="text-forest-200 text-xs mt-0.5">A free, 5-minute DIY angle meter</p>
                </div>
                <div className="p-6 grid sm:grid-cols-2 gap-8">
                  {/* Left — build steps */}
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">You need</div>
                    <ul className="text-sm text-gray-700 space-y-1 mb-5">
                      <li>📐 Protractor (clear plastic preferred)</li>
                      <li>🥤 Drinking straw</li>
                      <li>🪡 String (~25–30 cm)</li>
                      <li>🪙 Small weight — nut, washer, or paperclip</li>
                      <li>🩹 Tape (masking or clear)</li>
                    </ul>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Build it</div>
                    <ol className="text-sm text-gray-700 space-y-3">
                      {[
                        'Tape the straw securely along the flat, straight edge of the protractor (the 0°–180° line). This is your sight.',
                        'Thread the string through the small hole at the center of the protractor\'s straight edge.',
                        'Tie a knot on the back so the string won\'t pull through.',
                        'Tie the weight to the free end of the string. It must hang freely.',
                        'Test: hold it horizontal — the string should hang straight down and read 90°.',
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Right — diagram + use it */}
                  <div>
                    {/* Diagram: protractor with straw and plumb line */}
                    <svg viewBox="0 0 240 200" className="w-full max-w-[220px] mx-auto block mb-5" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {/* Protractor body (semicircle) */}
                      <path d="M 30,130 A 90,90 0 0,1 210,130 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
                      {/* Flat edge (straw) */}
                      <rect x="26" y="126" width="188" height="8" rx="4" fill="#0369a1" />
                      <text x="120" y="122" fontSize="8" fill="#0369a1" textAnchor="middle" fontWeight="bold">← straw (sight here) →</text>
                      {/* Angle tick marks */}
                      <line x1="120" y1="130" x2="120" y2="44" stroke="#64748b" strokeWidth="1" strokeDasharray="3,2" />
                      <text x="123" y="50" fontSize="7" fill="#64748b">90°</text>
                      <line x1="120" y1="130" x2="165" y2="52" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                      <text x="168" y="55" fontSize="7" fill="#64748b">60°</text>
                      <line x1="120" y1="130" x2="198" y2="85" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                      <text x="200" y="88" fontSize="7" fill="#64748b">30°</text>
                      {/* Center dot */}
                      <circle cx="120" cy="130" r="3" fill="#0369a1" />
                      {/* Plumb line hanging at ~55° reading (meaning 35° elevation) */}
                      <line x1="120" y1="130" x2="148" y2="185" stroke="#dc2626" strokeWidth="2" />
                      <circle cx="148" cy="188" r="6" fill="#dc2626" />
                      <text x="156" y="192" fontSize="8" fill="#dc2626" fontWeight="bold">weight</text>
                      {/* Angle label */}
                      <path d="M 120,105 A 25,25 0 0,1 138,112" fill="none" stroke="#dc2626" strokeWidth="1.5" />
                      <text x="132" y="102" fontSize="8" fill="#dc2626" fontWeight="bold">read here</text>
                      {/* Eye */}
                      <ellipse cx="26" cy="130" rx="8" ry="5" fill="none" stroke="#1e40af" strokeWidth="1.5" />
                      <circle cx="26" cy="130" r="2.5" fill="#1e40af" />
                      <text x="4" y="148" fontSize="8" fill="#1e40af">Eye</text>
                    </svg>

                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Use it</div>
                    <ol className="text-sm text-gray-700 space-y-2">
                      {[
                        'Stand back from the tree. Measure your distance to the trunk (D) and your eye height (h).',
                        'Look through the straw at the very top of the tree.',
                        'Have a partner read the number where the string crosses the protractor.',
                        'Subtract that number from 90° to get the angle of elevation (α).',
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <div className="text-xs font-bold text-amber-800 mb-1">Formula</div>
                      <div className="font-mono text-sm font-bold text-amber-900 text-center py-1">Height = D × tan(α) + eye height</div>
                      <div className="text-xs text-amber-700 mt-1">e.g. string reads 55° → α = 35°, D = 10 m, eye = 1.5 m → tree ≈ 8.5 m</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6">
              <div className="text-4xl shrink-0">📱</div>
              <div>
                <h3 className="font-semibold text-forest-800 mb-1">Phone or tablet (any)</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Any browser works — Chrome, Safari, Firefox. No app to install. One device per group of 2–4 students is enough.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6">
              <div className="text-4xl shrink-0">📄</div>
              <div>
                <h3 className="font-semibold text-forest-800 mb-1">Printed field sheets <span className="text-xs bg-forest-200 text-forest-800 px-2 py-0.5 rounded-full ml-1">optional</span></h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  No internet at your school? Students can record measurements on paper first, then enter the data later. Download the printable sheet below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Printable resources ── */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🖨️</div>
          <h2 className="text-2xl font-bold text-forest-700 mb-3">No internet? No problem.</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Download and print the field data sheet before heading outside. Students fill it in by hand, and you enter the data later when back online. The sheet includes all measurement fields plus instructions for building the protractor clinometer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/print/field-sheet"
              target="_blank"
              className="inline-flex items-center gap-2 bg-forest-600 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-forest-700 transition-colors shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Open printable field sheet
            </Link>
            <span className="text-xs text-gray-400">Opens in a new tab — use browser Print → Save as PDF</span>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-4 bg-forest-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to start?</h2>
        <p className="text-forest-200 text-lg mb-10 max-w-xl mx-auto">
          Teachers set up the school. Students go outside. Trees end up on the map.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link
            href="/teacher"
            className="flex-1 bg-white text-forest-700 font-semibold px-8 py-5 rounded-2xl hover:bg-forest-50 transition-colors shadow-lg"
          >
            <div className="text-2xl mb-1">👩‍🏫</div>
            <div className="text-lg">Teacher login</div>
          </Link>
          <Link
            href="/student"
            className="flex-1 bg-forest-600 text-white font-semibold px-8 py-5 rounded-2xl hover:bg-forest-500 transition-colors shadow-lg border border-forest-500"
          >
            <div className="text-2xl mb-1">🎒</div>
            <div className="text-lg">Student entry</div>
          </Link>
        </div>
      </section>
    </div>
  )
}
