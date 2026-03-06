'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/',        label: 'Home' },
  { href: '/about',   label: 'About' },
  { href: '/schools', label: 'Explore Schools' },
  { href: '/tool',    label: 'Our Tool' },
  { href: '/contact', label: 'Contact' },
]

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
]

function LangSwitcher() {
  const [active, setActive] = useState('en')

  useEffect(() => {
    const saved = sessionStorage.getItem('saf_lang') || 'en'
    setActive(saved)
  }, [])

  const switchLang = (lang) => {
    sessionStorage.setItem('saf_lang', lang)
    setActive(lang)

    const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC'
    // Clear existing cookies
    document.cookie = `googtrans=; path=/; ${expire}`
    document.cookie = `googtrans=; path=/; domain=.${location.hostname}; ${expire}`

    if (lang !== 'en') {
      // Set translation cookie for ES or DE
      document.cookie = `googtrans=/en/${lang}; path=/`
      document.cookie = `googtrans=/en/${lang}; path=/; domain=.${location.hostname}`
    }

    window.location.reload()
  }

  return (
    <div className="flex items-center gap-0.5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLang(code)}
          translate="no"
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            active === code
              ? 'bg-white text-forest-900'
              : 'text-forest-200 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-forest-900 shadow-md sticky top-0 z-50">
      {/* Hidden Google Translate widget */}
      <div id="google_translate_element" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Schools Are Forests" className="w-full h-full object-contain" />
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors font-medium ${
                  pathname === link.href
                    ? 'text-white font-semibold'
                    : 'text-forest-200 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-l border-forest-700 pl-4">
              <LangSwitcher />
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-2xl leading-none text-white"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-5 flex flex-col gap-4 text-sm border-t border-forest-700 pt-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-forest-200 hover:text-white transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-1">
              <LangSwitcher />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
