'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Brand {
  name: string;
  logo: string | null;
  theme: string;
  accent: string;
  loaded: boolean;
}

const DEFAULT: Brand = { name: '', logo: null, theme: '#2563eb', accent: '#f59e0b', loaded: false };
const BrandContext = createContext<Brand>(DEFAULT);

export function useBrand() {
  return useContext(BrandContext);
}

/** Loads the business's own logo, name and colours so the CRM carries their branding. */
export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<Brand>(DEFAULT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storesRes, infoRes] = await Promise.all([fetch('/api/client/stores'), fetch('/api/client/business-info')]);
        const stores = storesRes.ok ? await storesRes.json() : [];
        const info = infoRes.ok ? await infoRes.json() : null;
        const s = Array.isArray(stores) ? stores.find((x: any) => x.isDefault) || stores[0] : null;
        if (cancelled) return;
        setBrand({
          name: info?.storeName || s?.name || '',
          logo: s?.logo || info?.storeLogo || null,
          theme: s?.themeColor || info?.storeThemeColor || DEFAULT.theme,
          accent: s?.accentColor || info?.storeAccentColor || DEFAULT.accent,
          loaded: true,
        });
      } catch {
        if (!cancelled) setBrand({ ...DEFAULT, loaded: true });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}
