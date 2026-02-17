import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SatyaSell - AI-Powered Business Management Platform',
  description: 'Manage your products, orders, customers, and WhatsApp communications — supercharged with AI. The all-in-one SaaS platform for modern businesses.',
  keywords: ['business management', 'inventory', 'orders', 'AI', 'WhatsApp', 'SaaS', 'SatyaSell'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'SatyaSell - AI-Powered Business Management',
    description: 'The all-in-one platform to manage products, orders, customers, and WhatsApp — powered by AI.',
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
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
