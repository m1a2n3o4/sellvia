'use client';

import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { useCart, CartItem as CartItemType } from '@/lib/store/cart-context';

interface CartItemProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-6 w-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
        {item.variantName && (
          <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
        )}
        <p className="text-sm font-semibold text-gray-900 mt-1">
          &#8377;{subtotal.toLocaleString('en-IN')}
        </p>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
              className="px-2 py-1 text-gray-500 hover:bg-gray-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 py-1 text-xs font-medium min-w-[28px] text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              className="px-2 py-1 text-gray-500 hover:bg-gray-50"
              disabled={item.quantity >= item.maxStock || item.quantity >= 99}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => removeItem(item.productId, item.variantId)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
