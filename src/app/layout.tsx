import type { Metadata } from 'next'
import { Cinzel, Crimson_Text } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
})

const crimson = Crimson_Text({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'BibleQuiz — Пізнай Слово Боже',
  description: 'Тренування та змагання зі знань Біблії',
  manifest: '/manifest.json',
  themeColor: '#faf8f3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${cinzel.variable} ${crimson.variable}`}>
      <body className="text-stone-900 font-body antialiased">
        {children}
      </body>
    </html>
  )
}
