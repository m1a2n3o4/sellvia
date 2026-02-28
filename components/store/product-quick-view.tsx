'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minus, Plus, ShoppingCart, MessageCircle, CheckCircle, Package, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { VariantSelector } from './variant-selector';

interface Variant {
  id: string;
  variantName: string;
  price: string | number;
  stockQuantity: number;
  attributes: Record<string, string>;
}

interface ProductData {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  category?: string | null;
  basePrice: string | number;
  stockQuantity: number;
  images: string[];
  variants: Variant[];
}

interface ProductQuickViewProps {
  productId: string;
  storeSlug: string;
  themeColor: string;
  accentColor: string;
  whatsappNumber?: string | null;
  onClose: () => void;
}

export function ProductQuickView({ productId, storeSlug, themeColor, accentColor, whatsappNumber, onClose }: ProductQuickViewProps) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const backdropRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Fetch product details
  useEffect(() => {
    setLoading(true);
    fetch(`/api/store/${storeSlug}/products?id=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          const p = data.product;
          setProduct({
            ...p,
            images: Array.isArray(p.images) ? p.images : [],
          });
          if (p.variants?.length === 1) {
            setSelectedVariant(p.variants[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeSlug, productId]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) setZoomed(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, zoomed]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  // Image navigation
  const images = product?.images || [];
  const prevImage = () => setCurrentImage((c) => (c > 0 ? c - 1 : images.length - 1));
  const nextImage = () => setCurrentImage((c) => (c < images.length - 1 ? c + 1 : 0));

  // Touch swipe for image carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only swipe if horizontal movement is dominant
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextImage();
      else prevImage();
    }
  };

  // Zoom handler
  const handleZoomMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  if (!product && !loading) {
    return (
      <div ref={backdropRef} onClick={handleBackdropClick} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
        <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 text-center">
          <p className="text-gray-500">Product not found</p>
          <button onClick={onClose} className="mt-4 text-sm text-blue-600">Close</button>
        </div>
      </div>
    );
  }

  const hasVariants = product?.variants && product.variants.length > 0;
  const price = selectedVariant ? Number(selectedVariant.price) : Number(product?.basePrice || 0);
  const stock = selectedVariant ? selectedVariant.stockQuantity : (product?.stockQuantity || 0);
  const inStock = stock > 0;
  const needsVariantSelection = hasVariants && !selectedVariant;

  const handleAddToCart = () => {
    if (!product || needsVariantSelection || !inStock) return;

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

  const whatsappMsg = product
    ? `Hi, I'm interested in ${product.name}${selectedVariant ? ` (${selectedVariant.variantName})` : ''} - Rs.${price}`
    : '';

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center animate-in fade-in duration-200"
      >
        {/* Bottom Sheet / Modal */}
        <div className="bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
          {/* Close button */}
          <div className="sticky top-0 z-10 flex justify-between items-center px-4 pt-3 pb-1 bg-white rounded-t-2xl">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto sm:hidden" />
            <button
              onClick={onClose}
              className="absolute right-3 top-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {loading ? (
            <div className="p-4 space-y-4 animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-200 rounded-xl" />
            </div>
          ) : product && (
            <div className="px-4 pb-4 space-y-4">
              {/* Image Carousel */}
              <div
                className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImage]}
                      alt={`${product.name} - ${currentImage + 1}`}
                      className="w-full h-full object-contain"
                      draggable={false}
                    />

                    {/* Zoom button */}
                    <button
                      onClick={() => setZoomed(true)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    >
                      <ZoomIn className="h-4 w-4 text-gray-700" />
                    </button>

                    {/* Navigation arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {/* Dots indicator */}
                    {images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImage(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i === currentImage ? 'bg-white shadow' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
                {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-900">&#8377;{price.toLocaleString('en-IN')}</span>
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

              {/* Variants */}
              {hasVariants && (
                <VariantSelector
                  variants={product.variants}
                  selectedId={selectedVariant?.id}
                  onSelect={(v) => { setSelectedVariant(v); setQuantity(1); }}
                  themeColor={themeColor}
                />
              )}

              {/* Quantity */}
              {inStock && !needsVariantSelection && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Qty:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-50" disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(stock, 99, q + 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-50" disabled={quantity >= stock}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Description (collapsed) */}
              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{product.description}</p>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || needsVariantSelection}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: added ? '#16a34a' : themeColor }}
                >
                  {added ? (
                    <><CheckCircle className="h-5 w-5" /> Added to Cart!</>
                  ) : !inStock ? (
                    'Out of Stock'
                  ) : needsVariantSelection ? (
                    'Select an option'
                  ) : (
                    <><ShoppingCart className="h-5 w-5" /> Add to Cart — &#8377;{(price * quantity).toLocaleString('en-IN')}</>
                  )}
                </button>

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl border border-green-500 text-green-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Overlay */}
      {zoomed && images.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center cursor-crosshair"
          onClick={() => setZoomed(false)}
          onMouseMove={handleZoomMove}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Navigation in zoom */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 z-10"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 z-10"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </>
          )}

          <div
            className="w-full h-full overflow-hidden"
            style={{
              backgroundImage: `url(${images[currentImage]})`,
              backgroundSize: '200%',
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white text-sm px-3 py-1 rounded-full">
            {currentImage + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
