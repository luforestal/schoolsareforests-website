import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-200 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="mb-3">
              <div className="bg-white rounded-lg px-2 py-1 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Schools Are Forests" className="h-8 w-auto" />
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Documenting and celebrating the trees growing on school campuses worldwide,
              one inventory at a time.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/"        className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about"   className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/schools" className="hover:text-white transition-colors">Explore Schools</Link></li>
              <li><Link href="/tool"    className="hover:text-white transition-colors">Our Tool</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-3">Find Us</h3>
            <p className="text-sm">Worldwide</p>
            <p className="text-sm mt-1">
              <a href="mailto:schoolsareforests@gmail.com" className="hover:text-white transition-colors">
                schoolsareforests@gmail.com
              </a>
            </p>
            <p className="text-sm mt-1">
              <a href="https://schoolsareforests.org" className="hover:text-white transition-colors">
                schoolsareforests.org
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-forest-700 mt-10 pt-6 text-center text-xs text-forest-500">
          <p>© {new Date().getFullYear()} Schools Are Forests. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
