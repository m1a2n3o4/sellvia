'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useStore } from '../store-layout-client';
import { useCart } from '@/lib/store/cart-context';

export default function CheckoutPage() {
  const store = useStore();
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const deliveryFee = store.deliveryFee;
  const grandTotal = totalAmount + deliveryFee;

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: store.codEnabled ? 'cod' : 'online',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Redirect to cart if empty
  if (items.length === 0) {
    if (typeof window !== 'undefined') {
      router.replace(`/store/${store.storeSlug}/cart`);
    }
    return null;
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName || form.customerName.length < 2) errs.customerName = 'Name is required (min 2 chars)';
    if (!/^[6-9]\d{9}$/.test(form.customerPhone)) errs.customerPhone = 'Enter a valid 10-digit phone number';
    if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) errs.customerEmail = 'Enter a valid email';
    if (!form.deliveryAddress || form.deliveryAddress.length < 10) errs.deliveryAddress = 'Address must be at least 10 characters';
    if (!form.city || form.city.length < 2) errs.city = 'City is required';
    if (!form.state || form.state.length < 2) errs.state = 'State is required';
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      const res = await fetch(`/api/store/${store.storeSlug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          honeypot: '', // bot trap
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      // Clear cart on success
      clearCart();

      // Redirect based on payment method
      // Use window.location.href (not router.push) to prevent re-render
      // that would redirect back to cart due to empty items check
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        window.location.href = `/store/${store.storeSlug}/order/${data.orderId}`;
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-8">
      <h1 className="text-lg font-bold text-gray-900">Checkout</h1>

      {serverError && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 border border-red-100">
          {serverError}
        </div>
      )}

      {/* Contact Details */}
      <section className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Contact Details</h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => updateField('customerName', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': store.storeThemeColor } as any}
            placeholder="Enter your name"
          />
          {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone Number *</label>
          <input
            type="tel"
            value={form.customerPhone}
            onChange={(e) => updateField('customerPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': store.storeThemeColor } as any}
            placeholder="10-digit phone number"
            inputMode="tel"
          />
          {errors.customerPhone && <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email (optional)</label>
          <input
            type="email"
            value={form.customerEmail}
            onChange={(e) => updateField('customerEmail', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': store.storeThemeColor } as any}
            placeholder="your@email.com"
            inputMode="email"
          />
          {errors.customerEmail && <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>}
        </div>
      </section>

      {/* Delivery Address */}
      <section className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Delivery Address</h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Full Address *</label>
          <textarea
            value={form.deliveryAddress}
            onChange={(e) => updateField('deliveryAddress', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none"
            style={{ '--tw-ring-color': store.storeThemeColor } as any}
            rows={2}
            placeholder="House/Flat no., Street, Landmark"
          />
          {errors.deliveryAddress && <p className="text-xs text-red-500 mt-1">{errors.deliveryAddress}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">City *</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': store.storeThemeColor } as any}
              placeholder="City"
            />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">State *</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': store.storeThemeColor } as any}
              placeholder="State"
            />
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Pincode *</label>
          <input
            type="text"
            value={form.pincode}
            onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': store.storeThemeColor } as any}
            placeholder="6-digit pincode"
            inputMode="numeric"
          />
          {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
        </div>
      </section>

      {/* Payment Method */}
      <section className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Payment Method</h2>

        <div className="space-y-2">
          {store.onlinePayEnabled && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={form.paymentMethod === 'online'}
                onChange={() => updateField('paymentMethod', 'online')}
                className="accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Pay Online (UPI/Card/Wallet)</span>
            </label>
          )}
          {store.codEnabled && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={form.paymentMethod === 'cod'}
                onChange={() => updateField('paymentMethod', 'cod')}
                className="accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Cash on Delivery (COD)</span>
            </label>
          )}
        </div>
      </section>

      {/* Order Summary */}
      <section className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
        <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Order Summary</h2>

        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId || ''}`} className="flex justify-between text-sm py-1">
            <span className="text-gray-600 truncate mr-2">
              {item.name}{item.variantName ? ` (${item.variantName})` : ''} x{item.quantity}
            </span>
            <span className="text-gray-900 flex-shrink-0">&#8377;{(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        ))}

        <div className="border-t border-gray-100 pt-2 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>&#8377;{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery</span>
            <span>{deliveryFee > 0 ? `₹${deliveryFee.toLocaleString('en-IN')}` : 'Free'}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
            <span>Total</span>
            <span>&#8377;{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </section>

      {/* Honeypot - hidden from humans */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        style={{ backgroundColor: store.storeThemeColor }}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Placing Order...
          </>
        ) : (
          `Place Order — ₹${grandTotal.toLocaleString('en-IN')}`
        )}
      </button>
    </form>
  );
}
