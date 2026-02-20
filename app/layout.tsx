import type { Metadata, Viewport } from 'next';
import { Inter, Caveat } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SatyaSell - AI Powered WhatsApp Auto Ordering System',
  description: 'Free WhatsApp ordering system for Instagram sellers and small businesses. AI handles products, payments, and orders automatically. Pay only 1% per order.',
  keywords: ['WhatsApp ordering', 'Instagram sellers', 'AI commerce', 'auto order', 'payment links', 'SatyaSell', 'WhatsApp business'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'SatyaSell - AI Powered WhatsApp Auto Ordering System',
    description: 'Free WhatsApp ordering for Instagram sellers. AI handles everything — products, address, payment, orders. Pay only 1% per order.',
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
  themeColor: '#2563EB',
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
      <body className={`${inter.className} ${caveat.variable}`}>{children}</body>
    </html>
  );
}
