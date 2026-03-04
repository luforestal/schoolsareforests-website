import Link from 'next/link'

export const metadata = {
  title: 'Our Tool | Schools Are Forests',
  description: 'A field data collection tool for students and teachers — coming soon.',
}

export default function ToolPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-forest-800 to-forest-500 text-white py-24 px-4 text-center">
        <div className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          Coming Soon
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">The Schools Are Forests Tool</h1>
        <p className="text-forest-100 text-xl max-w-2xl mx-auto leading-relaxed">
          A field data collection app designed for students and teachers —
          turning any school campus into a living forest inventory.
        </p>
      </section>

      {/* ── What it will do ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-4">What We're Building</h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            We are developing a simple, guided tool that replaces the complicated multi-app workflow
            currently used for tree inventories — making it accessible to students as young as 8 years old.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-forest-50 rounded-2xl p-7">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">Works on Any Phone</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                No installation needed. Open it in a browser, go outside, and start measuring trees right away.
              </p>
            </div>
            <div className="bg-forest-50 rounded-2xl p-7">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">AI Species ID</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Take a photo of a leaf and the tool suggests the species name automatically —
                powered by PlantNet.
              </p>
            </div>
            <div className="bg-forest-50 rounded-2xl p-7">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">Auto-Maps Every Tree</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                GPS captures each tree's location automatically. New trees appear on the school map
                the moment they're submitted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-forest-700 mb-5">For Students (ages 8–16)</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> Step-by-step guided wizard — no training needed</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> Take photos, measure trunks, record health</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> Available in English, Spanish, and German</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> Real-time validation so mistakes get caught in the field</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-forest-700 mb-5">For Teachers</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> Create zones and assign groups with one click</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> Share a QR code — students are ready to go</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> Live dashboard showing progress per zone</li>
              <li className="flex gap-3"><span className="text-forest-500 font-bold">✓</span> Review and approve submissions before they go on the map</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-forest-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Interested in Being an Early Partner?</h2>
        <p className="text-forest-200 text-lg mb-8 max-w-xl mx-auto">
          We're looking for schools to pilot the tool when it launches.
          Get in touch and we'll keep you posted.
        </p>
        <Link
          href="/contact"
          className="bg-white text-forest-700 font-semibold px-10 py-4 rounded-full hover:bg-forest-50 transition-colors text-lg shadow-lg inline-block"
        >
          Contact Us →
        </Link>
      </section>
    </div>
  )
}
