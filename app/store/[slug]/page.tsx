'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useStore } from './store-layout-client';
import { useCart } from '@/lib/store/cart-context';
import { ProductGrid } from '@/components/store/product-grid';
import { CategoryTabs } from '@/components/store/category-tabs';
import { ProductQuickView } from '@/components/store/product-quick-view';
import Link from 'next/link';
import { Phone, Instagram } from 'lucide-react';
import { shade, telHref, prettyPhone, instagramHandle } from '@/lib/store/colors';

export default function StoreHomePage() {
  const store = useStore();
  const { totalItems, totalAmount } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Fetch store categories
  useEffect(() => {
    fetch(`/api/store/${store.storeSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, [store.storeSlug]);

  // Fetch products
  const fetchProducts = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);

    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (search) params.set('search', search);
      if (category) params.set('category', category);

      const res = await fetch(`/api/store/${store.storeSlug}/products?${params}`);
      const data = await res.json();

      if (reset || p === 1) {
        setProducts(data.products || []);
      } else {
        setProducts((prev) => [...prev, ...(data.products || [])]);
      }
      setHasMore(p < (data.totalPages || 1));
    } catch {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [store.storeSlug, search, category, page]);

  useEffect(() => {
    fetchProducts(true);
  }, [store.storeSlug, search, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);
    const params = new URLSearchParams({ page: String(nextPage), limit: '20' });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    fetch(`/api/store/${store.storeSlug}/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts((prev) => [...prev, ...(data.products || [])]);
        setHasMore(nextPage < (data.totalPages || 1));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const isEmpty = !loading && products.length === 0 && !search && !category;

  const [theme, accent] = [store.storeThemeColor, store.storeAccentColor];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: `linear-gradient(135deg, ${shade(theme, -0.45)} 0%, ${theme} 55%, ${shade(accent, -0.05)} 130%)` }}
      >
        {store.storeBanner && (
          <>
            <img src={store.storeBanner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" />
          </>
        )}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-40" style={{ backgroundColor: accent }} />
        <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full blur-3xl opacity-30 bg-white" />
        <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-16 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-center sm:text-left">
          {store.storeLogo ? (
            <img src={store.storeLogo} alt={store.storeName} className="h-28 w-28 sm:h-40 sm:w-40 rounded-full object-cover bg-white ring-4 ring-white/80 shadow-2xl flex-shrink-0" />
          ) : (
            <div className="h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-white flex items-center justify-center text-5xl font-extrabold shadow-2xl flex-shrink-0" style={{ color: theme }}>
              {store.storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/15 backdrop-blur">
              {store.city ? `${store.city} · ` : ''}Order online
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-lg">{store.storeName}</h1>
            {store.storeDescription && (
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/85 line-clamp-3">{store.storeDescription}</p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <a href="#shop" className="px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:scale-[1.03] transition-transform" style={{ backgroundColor: accent, color: '#fff' }}>
                Shop now →
              </a>
              {store.phone && (
                <a href={telHref(store.phone)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-white/15 hover:bg-white/25 backdrop-blur">
                  <Phone className="h-4 w-4" /> {prettyPhone(store.phone)}
                </a>
              )}
              {store.instagramUrl && (
                <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-white/15 hover:bg-white/25 backdrop-blur">
                  <Instagram className="h-4 w-4" /> {instagramHandle(store.instagramUrl)}
                </a>
              )}
            </div>
          </div>
        </div>
        {/* wave */}
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="relative block w-full h-6 sm:h-10" aria-hidden>
          <path d="M0,40 C240,0 480,0 720,20 C960,40 1200,40 1440,10 L1440,40 Z" fill="white" fillOpacity="0.9" />
        </svg>
      </section>

      {/* highlights */}
      <section className="max-w-6xl mx-auto px-4 -mt-1 grid grid-cols-3 gap-2 sm:gap-4 text-center">
        {[
          { t: 'Fresh & genuine', d: 'Quality you can trust', e: '✨' },
          { t: 'Easy ordering', d: 'Cart or WhatsApp', e: '🛒' },
          { t: 'Cash on delivery', d: 'Pay when it arrives', e: '🚚' },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl bg-white/90 border border-white shadow-sm px-2 py-3 sm:py-4">
            <div className="text-xl sm:text-2xl">{x.e}</div>
            <div className="text-[11px] sm:text-sm font-bold text-gray-900 mt-1">{x.t}</div>
            <div className="hidden sm:block text-xs text-gray-500">{x.d}</div>
          </div>
        ))}
      </section>

      {/* ===== SHOP ===== */}
      <div id="shop" className="max-w-6xl mx-auto px-4 pt-8 space-y-4 scroll-mt-28">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Our <span style={{ color: theme }}>products</span>
        </h2>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ '--tw-ring-color': theme } as any}
        />
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          selected={category}
          onSelect={setCategory}
          themeColor={theme}
        />
      )}

      {/* Empty Store */}
      {isEmpty ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">Coming Soon!</h2>
          <p className="text-sm text-gray-500 mt-1">We&apos;re adding products to our store. Check back soon!</p>
          {store.whatsappNumber && (
            <a
              href={`https://wa.me/${store.whatsappNumber}?text=Hi`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
            >
              Chat with us on WhatsApp
            </a>
          )}
        </div>
      ) : (
        <>
          <ProductGrid
            products={products}
            slug={store.storeSlug}
            themeColor={store.storeThemeColor}
            accentColor={store.storeAccentColor}
            loading={loading && products.length === 0}
            onProductClick={(id) => setSelectedProductId(id)}
          />

          {hasMore && !loading && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Load More Products
              </button>
            </div>
          )}

          {loading && products.length > 0 && (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
        </>
      )}

      </div>

      {/* ===== ABOUT ===== */}
      <section id="about" className="max-w-6xl mx-auto px-4 pt-12 scroll-mt-28">
        <div className="rounded-3xl p-6 sm:p-10 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${theme}, ${shade(theme, -0.4)})` }}>
          <h2 className="text-2xl sm:text-3xl font-extrabold">About {store.storeName}</h2>
          <p className="mt-3 text-white/85 max-w-3xl text-sm sm:text-base leading-relaxed">
            {store.storeDescription || `Welcome to ${store.storeName}. Browse our products, add what you like to the cart and order in a minute.`}
          </p>
          {categories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} onClick={() => { setCategory(c); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/15 hover:bg-white/25">
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sticky Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/store/${store.storeSlug}/cart`}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-white font-medium text-sm"
              style={{ backgroundColor: store.storeThemeColor }}
            >
              <span>View Cart ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
              <span>&#8377;{totalAmount.toLocaleString('en-IN')}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Product Quick View Modal */}
      {selectedProductId && (
        <ProductQuickView
          productId={selectedProductId}
          storeSlug={store.storeSlug}
          themeColor={store.storeThemeColor}
          accentColor={store.storeAccentColor}
          whatsappNumber={store.whatsappNumber}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}
