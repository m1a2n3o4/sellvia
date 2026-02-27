'use client';

import { ProductCard } from './product-card';

interface Product {
  id: string;
  name: string;
  brand?: string | null;
  basePrice: string | number;
  stockQuantity: number;
  images: any;
  variants?: any[];
}

interface ProductGridProps {
  products: Product[];
  slug: string;
  themeColor?: string;
  accentColor?: string;
  loading?: boolean;
}

export function ProductGrid({ products, slug, themeColor, accentColor, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          slug={slug}
          product={{ ...product, images: Array.isArray(product.images) ? product.images : [] }}
          themeColor={themeColor}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
}
