'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Minus, X } from 'lucide-react';
import { Product, ProductVariant } from '@/types';

interface CartItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
}

interface CreateOfflineOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateOfflineOrderModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateOfflineOrderModalProps) {
  const [step, setStep] = useState<'products' | 'customer' | 'confirm'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const searchProducts = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/client/products/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch {
      console.error('Search failed');
    } finally {
      setSearching(false);
    }
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
      setCart([
        ...cart,
        {
          productId: product.id,
          variantId: variant?.id,
          productName: product.name,
          variantName: variant?.variantName,
          price: variant ? Number(variant.price) : Number(product.basePrice),
          quantity: 1,
        },
      ]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const lookupCustomer = async () => {
    if (customerMobile.length !== 10) return;
    try {
      const res = await fetch(`/api/client/customers?search=${customerMobile}`);
      const data = await res.json();
      if (data.customers?.length > 0) {
        setCustomerName(data.customers[0].name);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerMobile || cart.length === 0) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/client/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerMobile,
          orderType: 'offline',
          paymentMethod,
          paymentStatus,
          items: cart,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      // Reset and close
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStep('products');
    setCart([]);
    setProductSearch('');
    setSearchResults([]);
    setCustomerName('');
    setCustomerMobile('');
    setPaymentMethod('cash');
    setPaymentStatus('unpaid');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Offline Order</DialogTitle>
          <DialogDescription>Add products, enter customer details, and confirm the order.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {step === 'products' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {searching && <p className="text-sm text-gray-500">Searching...</p>}

            {searchResults.length > 0 && (
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <div key={p.id}>
                    {(!p.variants || p.variants.length === 0) ? (
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex justify-between items-center border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                      >
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-sm text-gray-500">&#8377;{Number(p.basePrice).toLocaleString()}</span>
                      </button>
                    ) : (
                      p.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => addToCart(p, v)}
                          className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex justify-between items-center border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                        >
                          <span className="text-sm">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-gray-500 ml-1">({v.variantName})</span>
                          </span>
                          <span className="text-sm text-gray-500">&#8377;{Number(v.price).toLocaleString()}</span>
                        </button>
                      ))
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Cart */}
            {cart.length > 0 && (
              <div className="space-y-2">
                <Label>Cart ({cart.length} items)</Label>
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      )}
                      <p className="text-xs text-gray-500">&#8377;{item.price.toLocaleString()} each</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(i)}>
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <span>Subtotal</span>
                  <span>&#8377;{subtotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={cart.length === 0}
              onClick={() => setStep('customer')}
            >
              Next: Customer Details
            </Button>
          </div>
        )}

        {step === 'customer' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mobile">Customer Mobile *</Label>
              <Input
                id="mobile"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onBlur={lookupCustomer}
                placeholder="10-digit mobile"
                maxLength={10}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cod">COD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(v: 'paid' | 'unpaid') => setPaymentStatus(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('products')} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!customerName || customerMobile.length !== 10}
                onClick={() => setStep('confirm')}
              >
                Next: Confirm
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Customer:</span> {customerName} ({customerMobile})</p>
              <p className="text-sm"><span className="font-medium">Payment:</span> {paymentMethod} - <Badge variant={paymentStatus === 'paid' ? 'default' : 'secondary'}>{paymentStatus}</Badge></p>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{item.productName}{item.variantName ? ` (${item.variantName})` : ''} x{item.quantity}</span>
                    <span>&#8377;{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-2">
                  <span>Total</span>
                  <span>&#8377;{subtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('customer')} className="flex-1">
                Back
              </Button>
              <Button className="flex-1" disabled={saving} onClick={handleSubmit}>
                {saving ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
