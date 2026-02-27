'use client';

import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';

interface ProductCardProps {
  slug: string;
  product: {
    id: string;
    name: string;
    brand?: string | null;
    basePrice: string | number;
    stockQuantity: number;
    images: string[];
    variants?: { id: string; variantName: string; price: string | number; stockQuantity: number }[];
  };
  themeColor?: string;
}

export function ProductCard({ slug, product, themeColor = '#2563eb' }: ProductCardProps) {
  const { addItem } = useCart();
  const price = Number(product.basePrice);
  const inStock = product.stockQuantity > 0 || (product.variants && product.variants.some((v) => v.stockQuantity > 0));
  const hasVariants = product.variants && product.variants.length > 0;
  const image = product.images?.[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      // Navigate to product page for variant selection
      window.location.href = `/store/${slug}/product/${product.id}`;
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: 1,
      image,
      maxStock: product.stockQuantity,
    });
  };

  return (
    <Link
      href={`/store/${slug}/product/${product.id}`}
      className="group block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">{product.name}</h3>
        {product.brand && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{product.brand}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-base text-gray-900">
            &#8377;{price.toLocaleString('en-IN')}
          </span>
          {inStock && (
            <button
              onClick={handleAddToCart}
              className="p-2 rounded-full text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: themeColor }}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
