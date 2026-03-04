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
    const match = document.cookie.match(/googtrans=\/en\/(\w+)/)
    if (match) setActive(match[1])
  }, [])

  const switchLang = (lang) => {
    // Always set an explicit cookie — even for English (/en/en)
    // This overrides Google Translate's browser-language auto-detection
    const value = lang === 'en' ? '/en/en' : `/en/${lang}`
    document.cookie = `googtrans=${value}; path=/`
    document.cookie = `googtrans=${value}; path=/; domain=.${location.hostname}`
    window.location.replace(window.location.pathname + window.location.search)
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
              ? 'bg-forest-700 text-white'
              : 'text-forest-600 hover:bg-forest-50'
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
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      {/* Hidden Google Translate widget */}
      <div id="google_translate_element" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Schools Are Forests" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors font-medium ${
                  pathname === link.href
                    ? 'text-forest-700'
                    : 'text-gray-600 hover:text-forest-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-l border-gray-200 pl-4">
              <LangSwitcher />
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-2xl leading-none text-forest-700"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-5 flex flex-col gap-4 text-sm border-t border-gray-100 pt-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-forest-700 transition-colors font-medium"
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
