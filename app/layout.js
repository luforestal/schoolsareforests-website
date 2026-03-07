import { Inter } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { LanguageProvider } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Schools Are Forests',
  description: 'Documenting and mapping urban trees on school campuses worldwide.',
  keywords: 'trees, schools, forest inventory, urban trees, school forest, worldwide',
  openGraph: {
    title: 'Schools Are Forests',
    description: 'Mapping and celebrating the trees that make school campuses come alive around the world.',
    url: 'https://schoolsareforests.org',
    siteName: 'Schools Are Forests',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-gray-900`} suppressHydrationWarning>
        <LanguageProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </LanguageProvider>
      </body>
    </html>
  )
}
