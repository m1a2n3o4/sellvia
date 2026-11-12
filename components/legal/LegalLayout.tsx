import Link from 'next/link';
import { Zap } from 'lucide-react';
import { SITE } from '@/lib/site';

export function LegalLayout({
  title,
  updated = SITE.effectiveDate,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 antialiased">
      <header className="border-b border-gray-800/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SatyaSell</span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-violet-400">
            &larr; Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
        <p className="text-sm text-gray-500 mt-2">Last updated: {updated}</p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-10 [&_h3]:font-semibold [&_h3]:text-gray-100 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:text-violet-400 [&_a:hover]:underline [&_strong]:text-gray-100">
          {children}
        </div>

        <div className="mt-12 rounded-xl border border-gray-800 bg-gray-900/50 p-5 text-sm">
          <p className="font-semibold text-white">{SITE.name}</p>
          <p>{SITE.addressOneLine}</p>
          <p>
            Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> &middot; Phone:{' '}
            <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-800/60 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
          <Link href="/privacy-policy" className="hover:text-violet-400">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-violet-400">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-violet-400">Refund Policy</Link>
          <Link href="/data-deletion" className="hover:text-violet-400">Data Deletion</Link>
          <Link href="/contact" className="hover:text-violet-400">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
