'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, CheckCircle, Copy, ExternalLink, ArrowLeft, Store, Loader2 } from 'lucide-react';

export default function StorefrontSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    storeEnabled: false,
    storeSlug: '',
    storeLogo: '',
    storeBanner: '',
    storeThemeColor: '#2563eb',
    storeDescription: '',
    deliveryFee: 0,
    minOrderAmount: 0,
    codEnabled: true,
    onlinePayEnabled: true,
  });

  useEffect(() => {
    fetch('/api/client/business-info')
      .then((r) => r.json())
      .then((data) => {
        setForm({
          storeEnabled: data.storeEnabled ?? false,
          storeSlug: data.storeSlug || '',
          storeLogo: data.storeLogo || '',
          storeBanner: data.storeBanner || '',
          storeThemeColor: data.storeThemeColor || '#2563eb',
          storeDescription: data.storeDescription || '',
          deliveryFee: Number(data.deliveryFee) || 0,
          minOrderAmount: Number(data.minOrderAmount) || 0,
          codEnabled: data.codEnabled ?? true,
          onlinePayEnabled: data.onlinePayEnabled ?? true,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const storeUrl = form.storeSlug
    ? `https://www.satyasell.com/store/${form.storeSlug}`
    : '';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/client/business-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save');
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/client/settings')} className="p-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Storefront Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Customize your online store</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-100">{error}</div>
      )}

      {/* Store Status */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Store Status</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {form.storeEnabled ? 'Your store is live and visible to customers' : 'Your store is currently offline'}
            </p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, storeEnabled: !f.storeEnabled }))}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              form.storeEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                form.storeEnabled ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Store URL */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Store URL</h2>

        <div>
          <Label>Store Slug</Label>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center text-sm text-gray-400 bg-gray-50 dark:bg-neutral-800 px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-neutral-700">
              satyasell.com/store/
            </div>
            <Input
              value={form.storeSlug}
              onChange={(e) => setForm((f) => ({ ...f, storeSlug: slugify(e.target.value) }))}
              placeholder="your-store-name"
              className="rounded-l-none"
            />
          </div>
        </div>

        {storeUrl && (
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-50 dark:bg-neutral-800 px-3 py-2 rounded-lg flex-1 truncate text-gray-600 dark:text-gray-400">
              {storeUrl}
            </code>
            <button onClick={copyUrl} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      {/* Branding */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Branding</h2>

        <div>
          <Label>Store Logo URL</Label>
          <Input
            value={form.storeLogo}
            onChange={(e) => setForm((f) => ({ ...f, storeLogo: e.target.value }))}
            placeholder="https://example.com/logo.png"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Banner Image URL</Label>
          <Input
            value={form.storeBanner}
            onChange={(e) => setForm((f) => ({ ...f, storeBanner: e.target.value }))}
            placeholder="https://example.com/banner.jpg"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Theme Color</Label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              value={form.storeThemeColor}
              onChange={(e) => setForm((f) => ({ ...f, storeThemeColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <Input
              value={form.storeThemeColor}
              onChange={(e) => setForm((f) => ({ ...f, storeThemeColor: e.target.value }))}
              className="w-32"
            />
          </div>
        </div>

        <div>
          <Label>Store Description</Label>
          <Textarea
            value={form.storeDescription}
            onChange={(e) => setForm((f) => ({ ...f, storeDescription: e.target.value }))}
            placeholder="Describe your store in a few words..."
            className="mt-1"
            rows={3}
          />
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Delivery Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Delivery Fee (Rs.)</Label>
            <Input
              type="number"
              min={0}
              value={form.deliveryFee}
              onChange={(e) => setForm((f) => ({ ...f, deliveryFee: Number(e.target.value) || 0 }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Min Order Amount (Rs.)</Label>
            <Input
              type="number"
              min={0}
              value={form.minOrderAmount}
              onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: Number(e.target.value) || 0 }))}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Payment Options</h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.codEnabled}
            onChange={(e) => setForm((f) => ({ ...f, codEnabled: e.target.checked }))}
            className="w-4 h-4 rounded accent-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Cash on Delivery</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.onlinePayEnabled}
            onChange={(e) => setForm((f) => ({ ...f, onlinePayEnabled: e.target.checked }))}
            className="w-4 h-4 rounded accent-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Online Payment (UPI/Card)</span>
        </label>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : saved ? (
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
