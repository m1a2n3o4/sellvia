'use client';

import Link from 'next/link';
import { ShoppingCart, Phone, Instagram } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { rgba, shade, telHref, prettyPhone } from '@/lib/store/colors';

interface StoreHeaderProps {
  slug: string;
  storeName: string;
  storeLogo?: string | null;
  themeColor?: string;
  accentColor?: string;
  phone?: string | null;
  instagramUrl?: string | null;
}

const MENU = [
  { label: 'Home', hash: '' },
  { label: 'Shop', hash: '#shop' },
  { label: 'About', hash: '#about' },
  { label: 'Contact', hash: '#contact' },
];

export function StoreHeader({ slug, storeName, storeLogo, themeColor = '#2563eb', accentColor = '#f59e0b', phone, instagramUrl }: StoreHeaderProps) {
  const { totalItems } = useCart();
  const base = `/store/${slug}`;

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ background: `linear-gradient(120deg, ${shade(themeColor, -0.35)}, ${themeColor} 55%, ${shade(themeColor, 0.15)})` }}>
      {/* contact strip */}
      {(phone || instagramUrl) && (
        <div className="hidden sm:block" style={{ backgroundColor: rgba('#000000', 0.18) }}>
          <div className="max-w-6xl mx-auto px-4 h-8 flex items-center justify-end gap-5 text-xs text-white/90">
            {phone && (
              <a href={telHref(phone)} className="inline-flex items-center gap-1.5 hover:text-white">
                <Phone className="h-3.5 w-3.5" /> {prettyPhone(phone)}
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
                <Instagram className="h-3.5 w-3.5" /> Follow us on Instagram
              </a>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <Link href={base} className="flex items-center gap-3 min-w-0">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover bg-white flex-shrink-0 ring-2 ring-white shadow-md" />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center font-extrabold text-xl flex-shrink-0 bg-white ring-2 ring-white shadow-md" style={{ color: themeColor }}>
              {storeName?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          )}
          <span className="text-white font-extrabold text-base sm:text-xl tracking-tight leading-tight truncate drop-shadow">{storeName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {MENU.map((m) => (
            <Link key={m.label} href={`${base}${m.hash}`} className="px-3.5 py-1.5 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 transition-colors">
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
              <Instagram className="h-[18px] w-[18px]" />
            </a>
          )}
          {phone && (
            <a href={telHref(phone)} aria-label="Call" className="sm:hidden h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
              <Phone className="h-[18px] w-[18px]" />
            </a>
          )}
          <Link href={`${base}/cart`} aria-label="Cart" className="relative h-9 w-9 rounded-full flex items-center justify-center text-white shadow" style={{ backgroundColor: accentColor }}>
            <ShoppingCart className="h-[18px] w-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-white text-[10px] font-bold flex items-center justify-center px-1" style={{ color: themeColor }}>
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile menu */}
      <nav className="md:hidden flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-hide">
        {MENU.map((m) => (
          <Link key={m.label} href={`${base}${m.hash}`} className="flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-semibold text-white bg-white/15 hover:bg-white/25">
            {m.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
