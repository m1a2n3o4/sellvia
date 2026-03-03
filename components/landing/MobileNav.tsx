'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-gray-900">
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
                  className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <Link
              href="/client/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors mt-4"
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
