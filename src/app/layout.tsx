import './globals.css'
import type { Metadata } from 'next'
import { Open_Sans, Pacifico } from 'next/font/google'

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

export const metadata: Metadata = {
  title: 'Quizzlio - Multiplayer Trivia Game',
  description: 'Challenge your friends with real-time trivia questions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${openSans.variable} ${pacifico.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
