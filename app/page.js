import Link from 'next/link'
import WorldMapWrapper from '@/components/WorldMapWrapper'
import { schools } from '@/data/schools'

export default function HomePage() {
  const totalTrees = schools.reduce((sum, s) => sum + s.trees, 0)
  const totalCountries = new Set(schools.map(s => s.country)).size

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative text-white py-20 px-4 text-center overflow-hidden bg-white">
        {/* Dark green gradient at 82% opacity — white bg shows through softly */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-700 to-forest-500" style={{ opacity: 0.82 }} />

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
          <img
            src="/logo.png"
            alt="Schools Are Forests"
            className="w-4/5 md:w-2/3 max-w-3xl mx-auto mb-8 drop-shadow-2xl"
          />
          <p className="text-xl md:text-2xl text-forest-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Mapping and celebrating the trees that grow on school campuses around the world.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/schools"
              className="bg-white text-forest-700 font-semibold px-8 py-3 rounded-full hover:bg-forest-50 transition-colors shadow-lg"
            >
              Explore the Map
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-forest-700 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-forest-50 py-14 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-forest-700">{totalTrees}+</div>
            <div className="text-gray-500 mt-1 text-sm">Trees Documented</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-forest-700">{schools.length}</div>
            <div className="text-gray-500 mt-1 text-sm">Schools</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-forest-700">{totalCountries}</div>
            <div className="text-gray-500 mt-1 text-sm">{totalCountries === 1 ? 'Country' : 'Countries'}</div>
          </div>
        </div>
      </section>

      {/* ── World Map ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">Our Schools Around the World</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Hover over a dot to see school details. The map grows as new schools join.
          </p>
          <WorldMapWrapper schools={schools} />
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-forest-700 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Schools Are Forests is a community initiative dedicated to documenting, mapping, and
            celebrating the trees that grow on school campuses worldwide. We believe every
            tree tells a story — of ecological history, community care, and the living connection
            between students and the natural world.
          </p>
        </div>
      </section>

      {/* ── Schools Grid ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-3">Our Schools</h2>
          <p className="text-center text-gray-500 mb-12">
            Explore the tree inventories of our partner schools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schools.map(school => (
              <div
                key={school.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-32 flex items-center justify-center bg-forest-50 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={school.logo}
                    alt={school.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-forest-800 text-base mb-1">{school.name}</h3>
                  <p className="text-gray-400 text-sm mb-1">📍 {school.location}</p>
                  <p className="text-forest-600 text-sm font-medium mb-4">
                    🌳 {school.trees}+ trees documented
                  </p>
                  <Link
                    href={`/schools?school=${school.id}`}
                    className="block text-center bg-forest-700 text-white py-2 px-4 rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium"
                  >
                    Explore Map →
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
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-12">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-forest-700 mb-3">Interactive Maps</h3>
              <p className="text-gray-500 leading-relaxed">
                Every tree is precisely mapped so you can explore each school forest tree by tree
                from anywhere in the world.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-forest-700 mb-3">Photo Inventories</h3>
              <p className="text-gray-500 leading-relaxed">
                Each tree is photographed and catalogued with species, health status, and
                ecological notes.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-forest-700 mb-3">Living Data</h3>
              <p className="text-gray-500 leading-relaxed">
                Our inventories grow over time, tracking the evolution and health of each
                school's green spaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Join Our Network ── */}
      <section className="py-20 px-4 bg-forest-800 text-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Is Your School a Forest?</h2>
            <p className="text-forest-200 text-lg leading-relaxed mb-6">
              If you have a school tree inventory — or want to create one — we'd love to
              feature it on our map and help your community celebrate its trees.
              Schools from anywhere in the world are welcome.
            </p>
            <Link
              href="/contact"
              className="bg-white text-forest-700 font-semibold px-8 py-3 rounded-full hover:bg-forest-50 transition-colors inline-block shadow-lg"
            >
              Join Our Network →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-forest-700 rounded-xl p-5">
              <div className="text-3xl mb-2">🌍</div>
              <p className="text-sm text-forest-200">Schools worldwide welcome</p>
            </div>
            <div className="bg-forest-700 rounded-xl p-5">
              <div className="text-3xl mb-2">🆓</div>
              <p className="text-sm text-forest-200">Always free to join</p>
            </div>
            <div className="bg-forest-700 rounded-xl p-5">
              <div className="text-3xl mb-2">📍</div>
              <p className="text-sm text-forest-200">Your school on the world map</p>
            </div>
            <div className="bg-forest-700 rounded-xl p-5">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm text-forest-200">Full support from our team</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Support Us ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-forest-700 mb-4">Support Our Work</h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            Schools Are Forests is a community-driven project. Your support — whether through
            volunteering, spreading the word, or a donation — helps us document more trees and
            reach more schools around the world.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📣</div>
              <h3 className="font-semibold text-forest-800 mb-2">Spread the Word</h3>
              <p className="text-gray-500 text-sm">Share our project with schools and educators in your network.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🙋</div>
              <h3 className="font-semibold text-forest-800 mb-2">Volunteer</h3>
              <p className="text-gray-500 text-sm">Help us with field inventories, translations, or web development.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">💚</div>
              <h3 className="font-semibold text-forest-800 mb-2">Donate</h3>
              <p className="text-gray-500 text-sm">Help fund field equipment, travel, and tool development.</p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/contact"
              className="bg-forest-700 text-white font-semibold px-10 py-4 rounded-full hover:bg-forest-600 transition-colors text-lg shadow-lg inline-block"
            >
              Get Involved →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-forest-700 text-white py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
        <p className="text-forest-200 text-lg mb-8 max-w-xl mx-auto">
          Dive into our interactive tree maps and discover the forests hiding in plain sight
          on school campuses around the world.
        </p>
        <Link
          href="/schools"
          className="bg-white text-forest-700 font-semibold px-10 py-4 rounded-full hover:bg-forest-50 transition-colors text-lg shadow-lg inline-block"
        >
          Explore Schools →
        </Link>
      </section>
    </>
  )
}
