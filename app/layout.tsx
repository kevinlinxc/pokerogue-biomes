import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"
import Script from 'next/script'
import { cookies } from 'next/headers'

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
  const themeCookie = cookies().get('theme')?.value
  const isDarkFromCookie = themeCookie === 'dark'
  return (
    <html
      lang="en"
      className={isDarkFromCookie ? 'dark' : ''}
      style={{ background: isDarkFromCookie ? '#0b0b0b' : '#ffffff', colorScheme: isDarkFromCookie ? 'dark' : 'light' }}
    >
      <head>
        {/* Prevent theme flash: set dark class before hydration based on localStorage or system */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function(){try{
              var m=document.cookie.split('; ').find(function(x){return x.indexOf('theme=')===0});
              var cookieTheme=m?decodeURIComponent(m.split('=')[1]):null;
              var stored=localStorage.getItem('theme');
              var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
              var useDark=cookieTheme?cookieTheme==='dark':(stored?stored==='dark':prefersDark);
              var r=document.documentElement;
              r.classList.toggle('dark',useDark);
              r.style.colorScheme=useDark?'dark':'light';
              r.style.backgroundColor=useDark?'#0b0b0b':'#ffffff';
            }catch(e){}})();
          `}
        </Script>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
