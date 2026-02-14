'use client';

import { useState } from 'react';
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
import { ArrowLeft, Plus, X } from 'lucide-react';

interface SpecRow {
  key: string;
  value: string;
  price: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    brand: '',
    description: '',
    category: '',
    basePrice: '',
    sku: '',
    stockQuantity: '0',
    lowStockThreshold: '10',
    status: 'active' as 'active' | 'inactive',
  });

  const [specs, setSpecs] = useState<SpecRow[]>([]);

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '', price: '' }]);
  };

  const updateSpec = (index: number, field: keyof SpecRow, value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const variants = specs
        .filter((s) => s.key && s.value)
        .map((s) => ({
          variantName: `${s.key}: ${s.value}`,
          price: parseFloat(s.price) || parseFloat(form.basePrice) || 0,
          stockQuantity: 0,
          attributes: { [s.key]: s.value },
        }));

      const res = await fetch('/api/client/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice) || 0,
          stockQuantity: parseInt(form.stockQuantity) || 0,
          lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
          variants,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/client/products');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Product</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Add a new product to your inventory
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Cotton T-Shirt"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="e.g. Nike"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Clothing"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="basePrice">Base Price (&#8377;) *</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              min="0"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              placeholder="0.00"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. TSH-001"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(v: 'active' | 'inactive') => setForm({ ...form, status: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        {/* Specifications / Variants */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Specifications</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSpec}>
              <Plus className="h-4 w-4 mr-1" />
              Add Specification
            </Button>
          </div>

          {specs.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              No specifications added. Click &quot;Add Specification&quot; to add variants like size, color, etc.
            </p>
          )}

          {specs.map((spec, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Key (e.g. size)"
                value={spec.key}
                onChange={(e) => updateSpec(index, 'key', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value (e.g. XL)"
                value={spec.value}
                onChange={(e) => updateSpec(index, 'value', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Price"
                type="number"
                step="0.01"
                min="0"
                value={spec.price}
                onChange={(e) => updateSpec(index, 'price', e.target.value)}
                className="w-28"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(index)}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
