'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';

interface StoreHeaderProps {
  slug: string;
  storeName: string;
  storeLogo?: string | null;
  themeColor?: string;
  showBack?: boolean;
  backHref?: string;
}

export function StoreHeader({ slug, storeName, storeLogo, themeColor = '#2563eb', showBack, backHref }: StoreHeaderProps) {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Link href={backHref || `/store/${slug}`} className="p-1 -ml-1 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <Link href={`/store/${slug}`} className="flex items-center gap-2 min-w-0">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: themeColor }}
              >
                {storeName?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}
            <span className="font-semibold text-gray-900 truncate">{storeName}</span>
          </Link>
        </div>

        <Link
          href={`/store/${slug}/cart`}
          className="relative p-2 text-gray-700 hover:text-gray-900"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
              style={{ backgroundColor: themeColor }}
            >
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
