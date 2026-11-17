import type { Metadata, Viewport } from 'next';
import { Anton, Barlow_Condensed, Inter } from 'next/font/google';
import { Suspense } from 'react';
import { Cursor } from '@/components/motion/cursor';
import { RouteWatcher } from '@/components/motion/route-watcher';
import { SmoothScroll } from '@/components/motion/smooth-scroll';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { site } from '@/content/site';
import { siteUrl } from '@/lib/format';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600'], style: ['italic'], variable: '--font-barlow', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Tactyqal Labs: your teen builds and launches a real app in 8 weeks',
    template: '%s | Tactyqal Labs',
  },
  description: site.description,
  openGraph: { type: 'website', siteName: site.name, locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#2f4fd8',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${anton.variable} ${barlow.variable}`}>
      <body>
        {/* Before first paint: repeat visits and reduced-motion visitors never see the intro loader. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('tq-seen')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.intro='off'}catch(e){}",
          }}
        />
        <noscript>
          <style>{'.loader{display:none!important}'}</style>
        </noscript>
        <div className="grain" aria-hidden="true" />
        <Cursor />
        <SmoothScroll />
        <Suspense fallback={null}>
          <RouteWatcher />
        </Suspense>
        <div className="tq">
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
