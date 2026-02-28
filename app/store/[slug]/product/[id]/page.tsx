'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart, MessageCircle, CheckCircle, Package, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store-layout-client';
import { useCart } from '@/lib/store/cart-context';
import { ProductGallery } from '@/components/store/product-gallery';
import { VariantSelector } from '@/components/store/variant-selector';
import { ProductGrid } from '@/components/store/product-grid';
import Link from 'next/link';

interface Variant {
  id: string;
  variantName: string;
  price: string | number;
  stockQuantity: number;
  attributes: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  category?: string | null;
  basePrice: string | number;
  stockQuantity: number;
  images: any;
  variants: Variant[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const store = useStore();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/store/${store.storeSlug}/products?id=${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          // Auto-select first variant if only one
          if (data.product.variants?.length === 1) {
            setSelectedVariant(data.product.variants[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store.storeSlug, params.id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="aspect-square bg-gray-200 rounded-xl" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Product Not Found</h2>
        <button
          onClick={() => router.push(`/store/${store.storeSlug}`)}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          Back to Store
        </button>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const hasVariants = product.variants && product.variants.length > 0;
  const price = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
  const stock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
  const inStock = stock > 0;
  const needsVariantSelection = hasVariants && !selectedVariant;

  const handleAddToCart = () => {
    if (needsVariantSelection || !inStock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.variantName,
      price,
      quantity,
      image: images[0],
      maxStock: stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappMsg = `Hi, I'm interested in ${product.name}${selectedVariant ? ` (${selectedVariant.variantName})` : ''} - Rs.${price}`;

  return (
    <div className="space-y-6 pb-4">
      {/* Back button */}
      <Link
        href={`/store/${store.storeSlug}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>

      {/* Image Gallery */}
      <ProductGallery images={images} productName={product.name} />

      {/* Product Info */}
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
        {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">&#8377;{price.toLocaleString('en-IN')}</span>
          {inStock ? (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              In Stock ({stock})
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector */}
      {hasVariants && (
        <VariantSelector
          variants={product.variants}
          selectedId={selectedVariant?.id}
          onSelect={(v) => {
            setSelectedVariant(v);
            setQuantity(1);
          }}
          themeColor={store.storeThemeColor}
        />
      )}

      {/* Quantity Selector */}
      {inStock && !needsVariantSelection && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-1.5 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(stock, 99, q + 1))}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
              disabled={quantity >= stock || quantity >= 99}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || needsVariantSelection}
          className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: added ? '#16a34a' : store.storeThemeColor }}
        >
          {added ? (
            <>
              <CheckCircle className="h-5 w-5" /> Added to Cart!
            </>
          ) : !inStock ? (
            'Out of Stock'
          ) : needsVariantSelection ? (
            'Select an option'
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" /> Add to Cart — &#8377;{(price * quantity).toLocaleString('en-IN')}
            </>
          )}
        </button>

        {store.whatsappNumber && (
          <a
            href={`https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl border border-green-500 text-green-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="h-5 w-5" /> Ask on WhatsApp
          </a>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-medium text-gray-900 mb-3">You May Also Like</h3>
          <ProductGrid products={related} slug={store.storeSlug} themeColor={store.storeThemeColor} />
        </div>
      )}
    </div>
  );
}
