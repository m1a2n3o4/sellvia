'use client';

import { createContext, useContext } from 'react';
import { CartProvider } from '@/lib/store/cart-context';
import { StoreHeader } from '@/components/store/store-header';
import { StoreFooter } from '@/components/store/store-footer';
import { FloatingWhatsApp } from '@/components/store/floating-whatsapp';

export interface StoreData {
  tenantId: string;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeBanner: string | null;
  storeThemeColor: string;
  storeDescription: string | null;
  deliveryFee: number;
  minOrderAmount: number;
  codEnabled: boolean;
  onlinePayEnabled: boolean;
  whatsappNumber: string | null;
}

const StoreContext = createContext<StoreData | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreLayoutClient');
  return ctx;
}

export function StoreLayoutClient({ store, children }: { store: StoreData; children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={store}>
      <CartProvider slug={store.storeSlug}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <StoreHeader
            slug={store.storeSlug}
            storeName={store.storeName}
            storeLogo={store.storeLogo}
            themeColor={store.storeThemeColor}
          />
          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4">
            {children}
          </main>
          <StoreFooter />
          {store.whatsappNumber && (
            <FloatingWhatsApp phone={store.whatsappNumber} />
          )}
        </div>
      </CartProvider>
    </StoreContext.Provider>
  );
}
