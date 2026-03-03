'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Store, ExternalLink, Loader2, Package } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  logo: string | null;
  themeColor: string;
  city: string | null;
  isDefault: boolean;
  _count: { products: number; orders: number; customers: number };
}

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerMobile, setNewManagerMobile] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/client/stores');
      const data = await res.json();
      if (Array.isArray(data)) setStores(data);
    } catch {
      console.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

  const handleCreate = async () => {
    if (!newName || !newSlug) {
      setError('Store name and URL are required');
      return;
    }
    setError('');
    setCreating(true);

    try {
      const res = await fetch('/api/client/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          city: newCity || undefined,
          managerName: newManagerName || undefined,
          managerMobile: newManagerMobile || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create store');
        return;
      }

      setNewName('');
      setNewSlug('');
      setNewCity('');
      setNewManagerName('');
      setNewManagerMobile('');
      router.push(`/client/stores/${data.id}`);
    } catch {
      setError('Network error');
    } finally {
      setCreating(false);
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Stores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your storefronts</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-100">{error}</div>
      )}

      {/* Store Cards */}
      <div className="grid gap-4">
        {stores.map((store) => (
          <div
            key={store.id}
            onClick={() => router.push(`/client/stores/${store.id}`)}
            className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: store.themeColor }}
                >
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{store.name}</h3>
                  {store.isDefault && (
                    <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Default</span>
                  )}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    store.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {store.enabled ? 'Live' : 'Offline'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  satyasell.com/store/{store.slug}
                  {store.city && <span className="ml-2 text-purple-500">({store.city})</span>}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" /> {store._count.products} products
                  </span>
                  <span>{store._count.orders} orders</span>
                  <span>{store._count.customers} customers</span>
                </div>
              </div>

              {store.enabled && (
                <a
                  href={`/store/${store.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-50 rounded-lg"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create New Store */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create New Store
        </h3>
        <div className="space-y-3">
          <div>
            <Input
              placeholder="Store name (e.g. My Clothing Store)"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setNewSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center text-sm text-gray-400 bg-gray-50 dark:bg-neutral-800 px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-neutral-700 whitespace-nowrap">
              satyasell.com/store/
            </div>
            <Input
              value={newSlug}
              onChange={(e) => setNewSlug(slugify(e.target.value))}
              placeholder="store-url"
              className="rounded-l-none"
            />
          </div>
          <div>
            <Input
              placeholder="City / Location (e.g. Kukatpally)"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="Store Manager Name"
              value={newManagerName}
              onChange={(e) => setNewManagerName(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="Manager Mobile (10 digits)"
              type="tel"
              maxLength={10}
              value={newManagerMobile}
              onChange={(e) => setNewManagerMobile(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <Button onClick={handleCreate} disabled={creating || !newName || !newSlug} className="w-full">
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Store className="h-4 w-4 mr-2" />}
            {creating ? 'Creating...' : 'Create Store'}
          </Button>
        </div>
      </div>
    </div>
  );
}
