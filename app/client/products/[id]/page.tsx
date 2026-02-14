'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_product() {
      try {
        const res = await fetch(`/api/client/products/${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProduct(data);
      } catch {
        console.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }
    fetch_product();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-neutral-400">Product not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/client/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/client/products')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
              {product.brand && `${product.brand} · `}{product.category || 'Uncategorized'}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/client/products/${product.id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Status</p>
            <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="mt-1">
              {product.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Base Price</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              &#8377;{Number(product.basePrice).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Stock</p>
            <p className={`text-lg font-semibold mt-1 ${product.stockQuantity <= (product.lowStockThreshold || 10) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {product.stockQuantity}
            </p>
          </div>
          {product.sku && (
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">SKU</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">{product.sku}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Low Stock Alert</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{product.lowStockThreshold || 10}</p>
          </div>
        </div>

        {product.description && (
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-neutral-300">{product.description}</p>
          </div>
        )}
      </div>

      {/* Specifications / Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specifications</h2>
          <div className="space-y-2">
            {product.variants.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2 last:border-0"
              >
                <div>
                  {Object.entries(v.attributes || {}).map(([key, val]) => (
                    <span key={key} className="text-sm text-gray-700 dark:text-neutral-300">
                      <span className="font-medium">{key}:</span> {val}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  &#8377;{Number(v.price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
