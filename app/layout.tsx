import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PokéRogue Path Finder',
  description: 'Find the shortest or highest probability path between biomes in PokéRogue!',
  openGraph: {
    title: 'Pokérogue Biomes',
    description: 'A pathfinding tool for Pokérogue biomes',
    images: [
      {
        url: '/preview.png', // Must be placed in the public folder
        width: 1200,
        height: 630,
        alt: 'Pokérogue Biomes Preview'
      }
    ]
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
