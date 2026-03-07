'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

const messages = { en, es }

const LanguageContext = createContext({ lang: 'en', changeLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('saf_lang') || 'en'
    setLang(saved)
  }, [])

  const changeLang = (l) => {
    localStorage.setItem('saf_lang', l)
    setLang(l)
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

// t('nav.home') → looks up nested key in current language dict
export function useT() {
  const { lang } = useLanguage()
  return (key, vars = {}) => {
    const dict = messages[lang] || messages.en
    const keys = key.split('.')
    let val = dict
    for (const k of keys) { val = val?.[k]; if (val === undefined) break }
    if (typeof val !== 'string') {
      // fallback to English
      val = messages.en
      for (const k of keys) { val = val?.[k]; if (val === undefined) break }
    }
    if (typeof val !== 'string') return key
    // Replace {{var}} placeholders
    return val.replace(/\{\{(\w+)\}\}/g, (_, v) => vars[v] ?? `{{${v}}}`)
  }
}
