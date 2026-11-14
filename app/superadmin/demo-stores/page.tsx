'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Store {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  status: string;
  _count: { items: number };
}

export default function DemoStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', tagline: '', city: '', shopPhone: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch('/api/superadmin/demo-stores')
      .then((r) => r.json())
      .then((d) => setStores(d.stores || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/superadmin/demo-stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) return setError(d.error || 'Failed to create');
    window.location.href = `/superadmin/demo-stores/${d.store.id}`;
  };

  const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Demo Stores</h1>
      <p className="text-sm text-gray-500 mb-6">
        Let a prospect&apos;s shop answer customers on the SatyaSell WhatsApp number, using a catalogue you upload.
      </p>

      <form onSubmit={create} className="bg-white shadow rounded-lg p-5 mb-8 grid sm:grid-cols-2 gap-3">
        <h2 className="sm:col-span-2 font-semibold text-gray-900">New demo store</h2>
        <input className={input} placeholder="Shop name (e.g. VR Tech)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className={input} placeholder="Keyword to open it (default: shop name)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className={input} placeholder="Tagline (e.g. Second-hand laptops, monitors & desktops)" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        <input className={input} placeholder="City / area (e.g. Ameerpet, Hyderabad)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className={input} placeholder="Shop phone (shown to customers)" value={form.shopPhone} onChange={(e) => setForm({ ...form, shopPhone: e.target.value })} />
        <div className="flex items-center gap-3">
          <button disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create & add catalogue'}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : stores.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">No demo stores yet.</div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-100">
          {stores.map((s) => (
            <Link key={s.id} href={`/superadmin/demo-stores/${s.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-500">{[s.tagline, s.city].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-700">{s._count.items} items</p>
                <p className={`text-xs ${s.status === 'active' ? 'text-green-700' : 'text-gray-400'}`}>{s.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
