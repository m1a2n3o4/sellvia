import type { Metadata, Viewport } from 'next';
import { Inter, Caveat } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site';

const inter = Inter({ subsets: ['latin'] });
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: 'SatyaSell - Smart WhatsApp Auto Ordering System',
  description: 'Free WhatsApp ordering system for Instagram sellers and small businesses. Smart system handles products, payments, and orders automatically. Pay only 1% per order.',
  keywords: ['WhatsApp ordering', 'Instagram sellers', 'smart commerce', 'auto order', 'payment links', 'SatyaSell', 'WhatsApp business'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'SatyaSell - Smart WhatsApp Auto Ordering System',
    description: 'Free WhatsApp ordering for Instagram sellers. Smart system handles everything — products, address, payment, orders. Pay only 1% per order.',
    url: 'https://www.satyasell.com',
    siteName: 'SatyaSell',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SatyaSell',
  },
};

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${caveat.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE.name,
              url: SITE.url,
              email: SITE.email,
              telephone: SITE.phoneTel,
              address: {
                '@type': 'PostalAddress',
                streetAddress: SITE.address.line1,
                addressLocality: 'Miyapur, Hyderabad',
                addressRegion: SITE.address.region,
                addressCountry: 'IN',
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
