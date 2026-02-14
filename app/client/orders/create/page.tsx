'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Search, Plus, Minus, X } from 'lucide-react';
import { Product, ProductVariant } from '@/types';

interface CartItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Product search
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  // Order details
  const [orderType, setOrderType] = useState<'online' | 'offline'>('online');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'pending'>('pending');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [discount, setDiscount] = useState('0');
  const [shippingFee, setShippingFee] = useState('0');
  const [tax, setTax] = useState('0');
  const [notes, setNotes] = useState('');

  const searchProducts = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(`/api/client/products/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(productSearch), 300);
    return () => clearTimeout(timer);
  }, [productSearch, searchProducts]);

  const addToCart = (product: Product, variant?: ProductVariant) => {
    const existingIndex = cart.findIndex(
      (c) => c.productId === product.id && c.variantId === (variant?.id || undefined)
    );
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, {
        productId: product.id,
        variantId: variant?.id,
        productName: product.name,
        variantName: variant?.variantName,
        price: variant ? Number(variant.price) : Number(product.basePrice),
        quantity: 1,
      }]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) updated.splice(index, 1);
    setCart(updated);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - (parseFloat(discount) || 0) + (parseFloat(shippingFee) || 0) + (parseFloat(tax) || 0);

  const lookupCustomer = async () => {
    if (customerMobile.length !== 10) return;
    try {
      const res = await fetch(`/api/client/customers?search=${customerMobile}`);
      const data = await res.json();
      if (data.customers?.length > 0) {
        setCustomerName(data.customers[0].name);
      }
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { setError('Add at least one product'); return; }
    if (!customerName || customerMobile.length !== 10) { setError('Customer name and 10-digit mobile required'); return; }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/client/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerMobile,
          orderType,
          paymentMethod,
          paymentStatus,
          deliveryAddress: deliveryAddress || undefined,
          discount: parseFloat(discount) || 0,
          shippingFee: parseFloat(shippingFee) || 0,
          tax: parseFloat(tax) || 0,
          notes: notes || undefined,
          items: cart,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      router.push('/client/orders');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Order</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Create a new online order
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Products */}
        <div className="space-y-3">
          <Label>Products *</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products to add..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg max-h-48 overflow-y-auto">
              {searchResults.map((p) => (
                <div key={p.id}>
                  {(!p.variants || p.variants.length === 0) ? (
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex justify-between border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                    >
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-sm text-gray-500">&#8377;{Number(p.basePrice).toLocaleString()}</span>
                    </button>
                  ) : (
                    p.variants.map((v) => (
                      <button
                        type="button"
                        key={v.id}
                        onClick={() => addToCart(p, v)}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex justify-between border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                      >
                        <span className="text-sm"><span className="font-medium">{p.name}</span> <span className="text-gray-500">({v.variantName})</span></span>
                        <span className="text-sm text-gray-500">&#8377;{Number(v.price).toLocaleString()}</span>
                      </button>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="space-y-2">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                    <p className="text-xs text-gray-500">&#8377;{item.price.toLocaleString()} each</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCart(cart.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerMobile">Customer Mobile *</Label>
            <Input
              id="customerMobile"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={lookupCustomer}
              placeholder="10-digit mobile"
              maxLength={10}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
              className="mt-1"
            />
          </div>
        </div>

        {/* Order settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Order Type</Label>
            <Select value={orderType} onValueChange={(v: 'online' | 'offline') => setOrderType(v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment Status</Label>
            <Select value={paymentStatus} onValueChange={(v: 'paid' | 'unpaid' | 'pending') => setPaymentStatus(v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Input
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Delivery address"
              className="mt-1"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="discount">Discount (&#8377;)</Label>
            <Input id="discount" type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="shipping">Shipping (&#8377;)</Label>
            <Input id="shipping" type="number" min="0" step="0.01" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="tax">Tax (&#8377;)</Label>
            <Input id="tax" type="number" min="0" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} className="mt-1" />
          </div>
        </div>

        {/* Total */}
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>&#8377;{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span>Total</span>
            <span>&#8377;{total.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Order notes..." rows={2} className="mt-1" />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Order'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
