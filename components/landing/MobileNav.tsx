'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/site';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-gray-900 border-l border-gray-800 shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-white">Menu</span>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 flex-1">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Contact', href: '#demo' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-gray-300 font-medium rounded-lg hover:bg-violet-500/10 hover:text-violet-400 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <a
              href={SITE.whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors mt-4"
            >
              Chat on WhatsApp
            </a>
            <Link
              href="/client/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 transition-colors mt-4"
            >
              Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
