'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, MessageCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { useStore } from '../../store-layout-client';

interface OrderData {
  id: string;
  orderNumber: string;
  total: string | number;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  orderItems: {
    productName: string;
    variantName?: string;
    quantity: number;
    price: string | number;
    subtotal: string | number;
  }[];
}

export default function OrderConfirmationPage() {
  const store = useStore();
  const params = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order details
    fetch(`/api/store/${store.storeSlug}/checkout?orderId=${params.orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store.storeSlug, params.orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-gray-700">Order Not Found</h2>
        <Link
          href={`/store/${store.storeSlug}`}
          className="inline-block mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: store.storeThemeColor }}
        >
          Back to Store
        </Link>
      </div>
    );
  }

  const total = Number(order.total);
  const isPaid = order.paymentStatus === 'paid';
  const isCod = order.paymentMethod === 'cod';

  return (
    <div className="text-center space-y-6 py-8">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Order Placed!</h1>
        <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 text-left space-y-2">
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span className="text-gray-600">
              {item.productName}{item.variantName ? ` (${item.variantName})` : ''} x{item.quantity}
            </span>
            <span className="text-gray-900">&#8377;{Number(item.subtotal).toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>&#8377;{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 text-left space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Payment:</span>{' '}
          <span className="text-gray-900 font-medium">
            {isCod ? 'Cash on Delivery' : isPaid ? 'Paid Online' : 'Pending Online Payment'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Delivery to:</span>{' '}
          <span className="text-gray-900">{order.deliveryAddress}</span>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        You will receive order updates on WhatsApp
      </p>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        {store.whatsappNumber && (
          <a
            href={`https://wa.me/${store.whatsappNumber}?text=Hi, I just placed order ${order.orderNumber}. Can you confirm?`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl border border-green-500 text-green-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-50"
          >
            <MessageCircle className="h-5 w-5" /> Track on WhatsApp
          </a>
        )}

        <Link
          href={`/store/${store.storeSlug}`}
          className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2"
          style={{ backgroundColor: store.storeThemeColor }}
        >
          <ShoppingBag className="h-5 w-5" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
