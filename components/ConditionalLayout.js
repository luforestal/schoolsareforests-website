'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

const APP_ROUTES = ['/teacher', '/field', '/student', '/print', '/admin']
const MAP_ROUTES = ['/schools']

export default function ConditionalLayout({ children }) {
  const pathname = usePathname()
  const isAppRoute = APP_ROUTES.some(r => pathname.startsWith(r))
  const isMapRoute = MAP_ROUTES.some(r => pathname.startsWith(r))

  if (isAppRoute) return <>{children}</>

  if (isMapRoute) return (
    <>
      <Navbar />
      {children}
    </>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
