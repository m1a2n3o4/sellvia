'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, CheckCircle, Copy, ExternalLink, ArrowLeft, Loader2, Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function StoreSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    enabled: false,
    slug: '',
    logo: '',
    banner: '',
    themeColor: '#2563eb',
    accentColor: '#f59e0b',
    description: '',
    deliveryFee: 0,
    minOrderAmount: 0,
    codEnabled: true,
    onlinePayEnabled: true,
    isDefault: false,
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    managerName: '',
    managerMobile: '',
  });

  useEffect(() => {
    fetch(`/api/client/stores/${storeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setForm({
          name: data.name || '',
          enabled: data.enabled ?? false,
          slug: data.slug || '',
          logo: data.logo || '',
          banner: data.banner || '',
          themeColor: data.themeColor || '#2563eb',
          accentColor: data.accentColor || '#f59e0b',
          description: data.description || '',
          deliveryFee: Number(data.deliveryFee) || 0,
          minOrderAmount: Number(data.minOrderAmount) || 0,
          codEnabled: data.codEnabled ?? true,
          onlinePayEnabled: data.onlinePayEnabled ?? true,
          isDefault: data.isDefault ?? false,
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          phone: data.phone || '',
          managerName: data.managerName || '',
          managerMobile: data.managerMobile || '',
        });
      })
      .catch(() => setError('Failed to load store'))
      .finally(() => setLoading(false));
  }, [storeId]);

  const storeUrl = form.slug ? `https://www.satyasell.com/store/${form.slug}` : '';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch(`/api/client/stores/${storeId}`, {
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this store? Products will be unassigned but not deleted.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/client/stores/${storeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to delete');
        setDeleting(false);
        return;
      }
      router.push('/client/stores');
    } catch {
      setError('Failed to delete store');
      setDeleting(false);
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

  const handleImageUpload = async (file: File, purpose: 'logo' | 'banner') => {
    const isLogo = purpose === 'logo';
    if (isLogo) setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', purpose);

      const res = await fetch('/api/client/upload-image', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      if (isLogo) setForm((f) => ({ ...f, logo: data.url }));
      else setForm((f) => ({ ...f, banner: data.url }));
    } catch {
      setError('Upload failed');
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

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
        <button onClick={() => router.push('/client/stores')} className="p-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{form.name || 'Store Settings'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure this store</p>
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
              {form.enabled ? 'Your store is live and visible to customers' : 'Your store is currently offline'}
            </p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
            className={`relative w-12 h-7 rounded-full transition-colors ${form.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Store Name & URL */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Store Identity</h2>

        <div>
          <Label>Store Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="My Store"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Store URL</Label>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center text-sm text-gray-400 bg-gray-50 dark:bg-neutral-800 px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-neutral-700 whitespace-nowrap">
              satyasell.com/store/
            </div>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
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
            <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Location / Branch</h2>
        <p className="text-xs text-gray-500">Physical location details for this branch.</p>
        <div>
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="e.g. Kukatpally" className="mt-1" />
        </div>
        <div>
          <Label>Address</Label>
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Full address" className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>State</Label>
            <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="e.g. Telangana" className="mt-1" />
          </div>
          <div>
            <Label>Pincode</Label>
            <Input value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} placeholder="500072" className="mt-1" />
          </div>
        </div>
        <div>
          <Label>Branch Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Contact number for this branch" className="mt-1" />
        </div>
      </div>

      {/* Store Manager */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Store Manager</h2>
        <p className="text-xs text-gray-500">Person responsible for managing this store.</p>
        <div>
          <Label>Manager Name</Label>
          <Input value={form.managerName} onChange={(e) => setForm((f) => ({ ...f, managerName: e.target.value }))} placeholder="Manager name" className="mt-1" />
        </div>
        <div>
          <Label>Manager Mobile</Label>
          <Input value={form.managerMobile} onChange={(e) => setForm((f) => ({ ...f, managerMobile: e.target.value.replace(/\D/g, '') }))} placeholder="10-digit mobile number" type="tel" maxLength={10} className="mt-1" />
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-white">Branding</h2>

        {/* Logo */}
        <div>
          <Label>Store Logo</Label>
          <div className="mt-2 flex items-start gap-4">
            {form.logo ? (
              <div className="relative">
                <img src={form.logo} alt="Logo" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                <button onClick={() => setForm((f) => ({ ...f, logo: '' }))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 border border-dashed border-gray-300 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploadingLogo ? 'Uploading...' : 'Upload Image'}
              </button>
              <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, 'logo'); e.target.value = ''; }} />
              <div className="text-xs text-gray-400">Or paste URL</div>
              <Input value={form.logo} onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))} placeholder="https://..." className="text-xs" />
            </div>
          </div>
        </div>

        {/* Banner */}
        <div>
          <Label>Banner Image</Label>
          <div className="mt-2 space-y-2">
            {form.banner ? (
              <div className="relative">
                <img src={form.banner} alt="Banner" className="w-full h-32 rounded-lg object-cover border border-gray-200" />
                <button onClick={() => setForm((f) => ({ ...f, banner: '' }))} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div onClick={() => bannerInputRef.current?.click()} className="w-full h-32 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                {uploadingBanner ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : <><Upload className="h-6 w-6 text-gray-400 mb-1" /><span className="text-xs text-gray-400">Click to upload banner</span></>}
              </div>
            )}
            <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, 'banner'); e.target.value = ''; }} />
            <Input value={form.banner} onChange={(e) => setForm((f) => ({ ...f, banner: e.target.value }))} placeholder="https://..." className="text-xs" />
          </div>
        </div>

        {/* Theme Colors */}
        <div>
          <Label>Theme Colors</Label>
          <p className="text-xs text-gray-500 mt-0.5 mb-2">Primary for header & buttons. Accent for highlights.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input type="color" value={form.themeColor} onChange={(e) => setForm((f) => ({ ...f, themeColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Primary</p>
                <Input value={form.themeColor} onChange={(e) => setForm((f) => ({ ...f, themeColor: e.target.value }))} className="w-24 h-7 text-xs mt-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={form.accentColor} onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Accent</p>
                <Input value={form.accentColor} onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))} className="w-24 h-7 text-xs mt-0.5" />
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 rounded-lg border border-gray-200 flex items-center gap-3">
            <div className="flex-1 h-8 rounded-lg" style={{ backgroundColor: form.themeColor }} />
            <div className="flex-1 h-8 rounded-lg" style={{ backgroundColor: form.accentColor }} />
          </div>
        </div>

        <div>
          <Label>Store Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe your store..." className="mt-1" rows={3} />
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Delivery Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Delivery Fee (Rs.)</Label>
            <Input type="number" min={0} value={form.deliveryFee} onChange={(e) => setForm((f) => ({ ...f, deliveryFee: Number(e.target.value) || 0 }))} className="mt-1" />
          </div>
          <div>
            <Label>Min Order Amount (Rs.)</Label>
            <Input type="number" min={0} value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: Number(e.target.value) || 0 }))} className="mt-1" />
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Payment Options</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cash on Delivery (COD)</p>
            <p className="text-xs text-gray-500">Allow customers to pay on delivery</p>
          </div>
          <button onClick={() => setForm((f) => ({ ...f, codEnabled: !f.codEnabled }))} className={`relative w-12 h-7 rounded-full transition-colors ${form.codEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.codEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Online Payment (UPI/Card)</p>
            <p className="text-xs text-gray-500">Accept payments via UPI, cards & wallets</p>
          </div>
          <button onClick={() => setForm((f) => ({ ...f, onlinePayEnabled: !f.onlinePayEnabled }))} className={`relative w-12 h-7 rounded-full transition-colors ${form.onlinePayEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.onlinePayEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : saved ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Save className="h-4 w-4 mr-2" />}
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
      </Button>

      {/* Delete Store */}
      {!form.isDefault && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-red-200 dark:border-red-800 p-5">
          <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-3">Deleting a store will unassign all its products. Products are not deleted.</p>
          <Button variant="outline" onClick={handleDelete} disabled={deleting} className="text-red-600 border-red-200 hover:bg-red-50">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {deleting ? 'Deleting...' : 'Delete This Store'}
          </Button>
        </div>
      )}
    </div>
  );
}
