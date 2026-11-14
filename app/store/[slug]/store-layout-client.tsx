'use client';

import { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/lib/store/cart-context';
import { StoreHeader } from '@/components/store/store-header';
import { StoreFooter } from '@/components/store/store-footer';
import { FloatingWhatsApp } from '@/components/store/floating-whatsapp';
import { rgba } from '@/lib/store/colors';

export interface StoreData {
  tenantId: string;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeBanner: string | null;
  storeThemeColor: string;
  storeAccentColor: string;
  storeDescription: string | null;
  deliveryFee: number;
  minOrderAmount: number;
  codEnabled: boolean;
  onlinePayEnabled: boolean;
  whatsappNumber: string | null;
  isDemo?: boolean;
  phone?: string | null;
  instagramUrl?: string | null;
  city?: string | null;
}

const StoreContext = createContext<StoreData | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreLayoutClient');
  return ctx;
}

export function StoreLayoutClient({ store, children }: { store: StoreData; children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === `/store/${store.storeSlug}`;
  return (
    <StoreContext.Provider value={store}>
      <CartProvider slug={store.storeSlug}>
        <div
          className="min-h-screen flex flex-col"
          style={{
            background: `linear-gradient(180deg, ${rgba(store.storeThemeColor, 0.16)} 0%, ${rgba(store.storeAccentColor, 0.10)} 38%, #ffffff 75%)`,
          }}
        >
          {store.isDemo && (
            <div className="bg-amber-100 text-amber-900 text-xs sm:text-sm text-center px-3 py-2">
              Demo store prepared by SatyaSell from public information - orders placed here are tests and are not fulfilled.
            </div>
          )}
          <StoreHeader
            slug={store.storeSlug}
            storeName={store.storeName}
            storeLogo={store.storeLogo}
            themeColor={store.storeThemeColor}
            accentColor={store.storeAccentColor}
            phone={store.phone}
            instagramUrl={store.instagramUrl}
          />
          <main className={isHome ? 'flex-1 w-full' : 'flex-1 w-full max-w-6xl mx-auto px-4 py-4'}>
            {children}
          </main>
          <StoreFooter
            slug={store.storeSlug}
            storeName={store.storeName}
            storeLogo={store.storeLogo}
            themeColor={store.storeThemeColor}
            description={store.storeDescription}
            phone={store.phone}
            instagramUrl={store.instagramUrl}
            city={store.city}
          />
          {store.whatsappNumber && (
            <FloatingWhatsApp phone={store.whatsappNumber} />
          )}
        </div>
      </CartProvider>
    </StoreContext.Provider>
  );
}
