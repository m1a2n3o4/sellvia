'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useStore } from './store-layout-client';
import { useCart } from '@/lib/store/cart-context';
import { ProductGrid } from '@/components/store/product-grid';
import { CategoryTabs } from '@/components/store/category-tabs';
import Link from 'next/link';

export default function StoreHomePage() {
  const store = useStore();
  const { totalItems, totalAmount } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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
      setTotalPages(data.totalPages || 1);
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
    // Fetch more
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

  // Empty store state
  const isEmpty = !loading && products.length === 0 && !search && !category;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ '--tw-ring-color': store.storeThemeColor } as any}
        />
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          selected={category}
          onSelect={setCategory}
          themeColor={store.storeThemeColor}
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
          {/* Product Grid */}
          <ProductGrid
            products={products}
            slug={store.storeSlug}
            themeColor={store.storeThemeColor}
            loading={loading && products.length === 0}
          />

          {/* Load More */}
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
    </div>
  );
}
