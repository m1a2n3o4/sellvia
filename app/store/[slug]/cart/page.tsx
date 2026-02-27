'use client';

import Link from 'next/link';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { useStore } from '../store-layout-client';
import { useCart } from '@/lib/store/cart-context';
import { CartItemRow } from '@/components/store/cart-item';

export default function CartPage() {
  const store = useStore();
  const { items, totalItems, totalAmount, clearCart } = useCart();
  const deliveryFee = store.deliveryFee;
  const grandTotal = totalAmount + deliveryFee;
  const meetsMinOrder = store.minOrderAmount <= 0 || totalAmount >= store.minOrderAmount;

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mt-1">Browse our products and add items you love!</p>
        <Link
          href={`/store/${store.storeSlug}`}
          className="inline-block mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: store.storeThemeColor }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28">
      <h1 className="text-lg font-bold text-gray-900">
        Your Cart ({totalItems} item{totalItems > 1 ? 's' : ''})
      </h1>

      {/* Cart Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        {items.map((item) => (
          <CartItemRow key={`${item.productId}-${item.variantId || ''}`} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>&#8377;{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery</span>
          <span>{deliveryFee > 0 ? `₹${deliveryFee.toLocaleString('en-IN')}` : 'Free'}</span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>&#8377;{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Min order warning */}
      {!meetsMinOrder && (
        <p className="text-xs text-orange-600 text-center">
          Minimum order amount is &#8377;{store.minOrderAmount.toLocaleString('en-IN')}. Add &#8377;
          {(store.minOrderAmount - totalAmount).toLocaleString('en-IN')} more.
        </p>
      )}

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto space-y-2">
          <Link
            href={meetsMinOrder ? `/store/${store.storeSlug}/checkout` : '#'}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-white font-medium text-sm ${
              !meetsMinOrder ? 'opacity-50 pointer-events-none' : ''
            }`}
            style={{ backgroundColor: store.storeThemeColor }}
          >
            <span>Proceed to Checkout</span>
            <span>&#8377;{grandTotal.toLocaleString('en-IN')}</span>
          </Link>
          {store.whatsappNumber && meetsMinOrder && (
            <a
              href={`https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(
                `Hi! I'd like to order:\n\n${items.map((i) => `- ${i.name}${i.variantName ? ` (${i.variantName})` : ''} x${i.quantity} - Rs.${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n')}\n\nTotal: Rs.${grandTotal.toLocaleString('en-IN')}${deliveryFee > 0 ? ` (incl. Rs.${deliveryFee} delivery)` : ''}\n\nPlease confirm my order.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-green-500 text-green-600 font-medium text-sm hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4" /> Order via WhatsApp
            </a>
          )}
          <Link
            href={`/store/${store.storeSlug}`}
            className="block text-center text-sm text-gray-500 hover:text-gray-700 py-1"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
