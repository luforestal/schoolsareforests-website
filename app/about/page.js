export const metadata = {
  title: 'About Us | Schools Are Forests',
  description: 'Learn about the Schools Are Forests mission, vision, and team.',
}

const founders = [
  { first: 'Luisa',   last: 'Velásquez Camacho', role: 'Co-Founder' },
  { first: 'Moreen',  last: 'Willaredt',          role: 'Co-Founder' },
  { first: 'Elizeth', last: 'Cinto Mejía',        role: 'Co-Founder' },
]

export default function AboutPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-forest-800 to-forest-500 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
        <p className="text-forest-100 text-xl max-w-2xl mx-auto leading-relaxed">
          We are a team of environmentalists, educators, and researchers passionate about
          urban forests and the communities that share them worldwide.
        </p>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-forest-700 mb-5">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Schools Are Forests is a community initiative dedicated to documenting, mapping, and
              celebrating the trees that grow on school campuses worldwide. We believe every tree
              tells a story — of ecological history, community care, and the living connections
              between students and the natural world.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-forest-700 mb-5">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              A future where every school community — no matter where in the world — knows, values,
              and tends to the trees around them. Where students grow up understanding the ecological
              importance of their school forests, and where schoolyards become living classrooms for
              the next generation of environmental stewards.
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-16 px-4 bg-forest-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 mb-8 text-center">Our Story</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-5">
            Schools Are Forests began with a simple observation: school campuses are home to
            hundreds of trees — oak, maple, eucalyptus, jacaranda — that go largely unnoticed and
            uncelebrated. These trees provide shade, clean air, and habitat for birds and insects,
            yet most students and teachers couldn't name a single tree on their campus.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg">
            We set out to change that, one school at a time, by creating detailed tree inventories
            that give each tree a name, a face, and a story. Our work has taken us across continents —
            and we're just getting started.
          </p>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest-700 text-center mb-12">Our Team</h2>

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
                <p className="text-xs text-gray-400 mt-1">{f.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
