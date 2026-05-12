import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: {
    default: 'TechStore — Apple техника, смартфоны, ноутбуки, гаджеты',
    template: '%s | TechStore',
  },
  description: 'Интернет-магазин электроники и гаджетов. Apple, Samsung, Sony. Оригинальная техника с гарантией. Быстрая доставка по всей России.',
  keywords: ['Apple', 'iPhone', 'MacBook', 'смартфоны', 'ноутбуки', 'электроника', 'гаджеты', 'AirPods', 'Apple Watch', 'iPad', 'Samsung', 'Sony'],
  authors: [{ name: 'TechStore' }],
  creator: 'TechStore',
  publisher: 'TechStore',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'TechStore',
    title: 'TechStore — Apple техника, смартфоны, ноутбуки, гаджеты',
    description: 'Интернет-магазин электроники и гаджетов. Apple, Samsung, Sony. Оригинальная техника с гарантией.',
    url: process.env.NEXT_PUBLIC_SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechStore — Apple техника, смартфоны, ноутбуки, гаджеты',
    description: 'Интернет-магазин электроники и гаджетов. Apple, Samsung, Sony.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f2937" />
        
        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .container-custom{max-width:1200px;margin:0 auto;padding:0 1rem}
            @media(min-width:768px){.container-custom{padding:0 2rem}}
            .section-title{font-size:1.5rem;font-weight:700;margin-bottom:1.5rem}
            @media(min-width:768px){.section-title{font-size:2rem}}
          `
        }} />
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `
        }} />
        
        {process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
                ym(${process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID}, "init", {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true,
                  webvisor:true
                });
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen bg-white antialiased">
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
