'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage, useT } from '@/lib/i18n'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
]

function LangSwitcher() {
  const { lang, changeLang } = useLanguage()
  return (
    <div className="flex items-center gap-0.5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => changeLang(code)}
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            lang === code
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
  const t = useT()

  const navLinks = [
    { href: '/',        label: t('nav.home') },
    { href: '/about',   label: t('nav.about') },
    { href: '/schools', label: t('nav.schools') },
    { href: '/tool',    label: t('nav.tool') },
    { href: '/contact', label: t('nav.contact') },
  ]

  return (
    <nav className="bg-forest-900 shadow-md sticky top-0 z-50">
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
