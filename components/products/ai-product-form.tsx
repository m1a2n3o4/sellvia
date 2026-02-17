'use client';

import { useState } from 'react';
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
import { Plus, X, Save, Trash2 } from 'lucide-react';

interface SpecRow {
  key: string;
  value: string;
  price: string;
}

interface Prediction {
  name: string;
  brand: string;
  category: string;
  description: string;
  basePrice: number;
  color: string;
  gender: string;
  material: string;
}

interface AIProductFormProps {
  imageUrl: string;
  initialData: Prediction | null;
  onSaved: () => void;
  onDiscard: () => void;
}

export function AIProductForm({
  imageUrl,
  initialData,
  onSaved,
  onDiscard,
}: AIProductFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    basePrice: initialData?.basePrice ? String(initialData.basePrice) : '',
    sku: '',
    stockQuantity: '0',
    lowStockThreshold: '10',
    status: 'active' as 'active' | 'inactive',
  });

  // Build initial specs from AI predictions
  const buildInitialSpecs = (): SpecRow[] => {
    if (!initialData) return [];
    const specs: SpecRow[] = [];
    if (initialData.color) {
      specs.push({ key: 'Color', value: initialData.color, price: '' });
    }
    if (initialData.gender) {
      specs.push({ key: 'Gender', value: initialData.gender, price: '' });
    }
    if (initialData.material) {
      specs.push({ key: 'Material', value: initialData.material, price: '' });
    }
    return specs;
  };

  const [specs, setSpecs] = useState<SpecRow[]>(buildInitialSpecs);

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
          images: [imageUrl],
          variants,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create product');
      }

      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image preview */}
      <div className="flex items-start gap-4">
        <img
          src={imageUrl}
          alt="Product"
          className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-neutral-700"
        />
        <div className="flex-1 text-sm text-gray-500 dark:text-neutral-400">
          {initialData ? (
            <p>AI has pre-filled the form below. Review and adjust as needed.</p>
          ) : (
            <p>AI could not analyze this image. Please fill in the details manually.</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="ai-name">Product Name *</Label>
          <Input
            id="ai-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Cotton T-Shirt"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ai-brand">Brand</Label>
          <Input
            id="ai-brand"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="e.g. Nike"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ai-category">Category</Label>
          <Input
            id="ai-category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Clothing"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ai-basePrice">Base Price (&#8377;) *</Label>
          <Input
            id="ai-basePrice"
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
          <Label htmlFor="ai-sku">SKU</Label>
          <Input
            id="ai-sku"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="e.g. TSH-001"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ai-stock">Stock Quantity</Label>
          <Input
            id="ai-stock"
            type="number"
            min="0"
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ai-lowstock">Low Stock Threshold</Label>
          <Input
            id="ai-lowstock"
            type="number"
            min="0"
            value={form.lowStockThreshold}
            onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ai-status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v: 'active' | 'inactive') => setForm({ ...form, status: v })}
          >
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
          <Label htmlFor="ai-description">Description</Label>
          <Textarea
            id="ai-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Product description..."
            rows={3}
            className="mt-1"
          />
        </div>
      </div>

      {/* Specifications */}
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
            No specifications added.
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
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onDiscard}>
          <Trash2 className="h-4 w-4 mr-2" />
          Discard
        </Button>
      </div>
    </form>
  );
}
