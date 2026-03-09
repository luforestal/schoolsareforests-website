'use client'
import Link from 'next/link'

export default function ToolContent() {
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

            <div className="flex gap-4 items-start bg-forest-50 rounded-2xl p-6">
              <div className="text-4xl shrink-0">📐</div>
              <div>
                <h3 className="font-semibold text-forest-800 mb-1">Cardboard triangle</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A simple homemade clinometer for estimating tree height. Cut a right-angle triangle from cardboard, attach a string with a small weight, and sight along the long edge. Instructions are in the printable kit below.
                </p>
              </div>
            </div>

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
            Download and print the field data sheet before heading outside. Students fill it in by hand, and you enter the data later when back online. The sheet includes all measurement fields plus instructions for building the cardboard triangle clinometer.
          </p>
          <a
            href="/printable-field-sheet.pdf"
            className="inline-flex items-center gap-2 bg-forest-600 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-forest-700 transition-colors shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
            </svg>
            Download printable field sheet (PDF)
          </a>
          <p className="text-xs text-gray-400 mt-4">Available in English and Spanish</p>
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
