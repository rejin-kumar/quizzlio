import './globals.css'
import type { Metadata } from 'next'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
