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
