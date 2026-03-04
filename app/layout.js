import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

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
        <ConditionalLayout>
          {children}
        </ConditionalLayout>

        {/* Google Translate – loads after page is interactive */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                if (sessionStorage.getItem('saf_lang') === 'en') return;
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'es,de',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
