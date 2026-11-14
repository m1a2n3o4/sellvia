'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SITE } from '@/lib/site';

interface Item {
  category: string; brand: string; model: string; cpu: string; ram: string; storage: string;
  screen: string; color: string; condition: string; price: number | string | null;
  quantity: number | string | null; notes: string; imageUrl?: string | null; _new?: boolean;
}
interface Store {
  id: string; slug: string; name: string; tagline: string | null; city: string | null;
  shopPhone: string | null; extraRules: string | null; status: string; items: any[];
}

const COLS: { key: keyof Item; label: string; w: string }[] = [
  { key: 'category', label: 'Type', w: 'w-24' },
  { key: 'brand', label: 'Brand', w: 'w-24' },
  { key: 'model', label: 'Model', w: 'w-36' },
  { key: 'cpu', label: 'CPU', w: 'w-28' },
  { key: 'ram', label: 'RAM', w: 'w-16' },
  { key: 'storage', label: 'Storage', w: 'w-24' },
  { key: 'screen', label: 'Screen', w: 'w-16' },
  { key: 'color', label: 'Colour', w: 'w-20' },
  { key: 'condition', label: 'Condition', w: 'w-24' },
  { key: 'price', label: 'Price (Rs)', w: 'w-24' },
  { key: 'quantity', label: 'Qty', w: 'w-14' },
  { key: 'notes', label: 'Notes', w: 'w-40' },
];

const clean = (i: any): Item => ({
  category: i.category || 'other', brand: i.brand || '', model: i.model || '', cpu: i.cpu || '', ram: i.ram || '',
  storage: i.storage || '', screen: i.screen || '', color: i.color || '', condition: i.condition || '',
  price: i.price ?? '', quantity: i.quantity ?? '', notes: i.notes || '', imageUrl: i.imageUrl || null,
});

/** Shrinks a screenshot in the browser so each upload stays well under server limits. */
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 2000;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = url;
  });
}

export default function DemoStoreDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/superadmin/demo-stores/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.store) {
          setStore(d.store);
          setItems(d.store.items.map(clean));
        }
      });
  }, [id]);

  if (!store) return <div className="max-w-5xl mx-auto px-4 py-8 text-gray-500">Loading...</div>;

  const demoLink = SITE.whatsappUrl(`Hi ${store.name}`);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let added = 0;
    for (let n = 0; n < files.length; n++) {
      setStatus(`Reading screenshot ${n + 1} of ${files.length}... (can take up to a minute)`);
      try {
        const image = await compress(files[n]);
        const res = await fetch(`/api/superadmin/demo-stores/${id}/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Failed');
        const rows: Item[] = d.items.map((i: any) => ({ ...clean(i), _new: true }));
        added += rows.length;
        setItems((prev) => [...prev, ...rows]);
        setDirty(true);
      } catch (e: any) {
        setStatus(`Screenshot ${n + 1} failed: ${e.message}`);
        setBusy(false);
        return;
      }
    }
    setStatus(`Added ${added} rows (highlighted). Check prices and specs, then press Save.`);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const save = async () => {
    setBusy(true);
    const res = await fetch(`/api/superadmin/demo-stores/${id}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setStatus(d.error || 'Save failed');
    setItems((prev) => prev.filter((i) => i.brand || i.model).map((i) => ({ ...i, _new: false })));
    setDirty(false);
    setStatus(`Saved ${d.count} items. The WhatsApp assistant now uses this catalogue.`);
  };

  const update = (idx: number, key: keyof Item, val: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
    setDirty(true);
  };

  const patchStore = async (data: Partial<Store>) => {
    const res = await fetch(`/api/superadmin/demo-stores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (res.ok) {
      setStore({ ...store, ...d.store });
      setStatus('Store updated.');
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${store.name}" and all its items?`)) return;
    await fetch(`/api/superadmin/demo-stores/${id}`, { method: 'DELETE' });
    router.push('/superadmin/demo-stores');
  };

  const cell = 'border border-gray-300 rounded px-1.5 py-1 text-xs';

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <Link href="/superadmin/demo-stores" className="text-sm text-blue-600 hover:underline">&larr; Demo Stores</Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-sm text-gray-500">{[store.tagline, store.city].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => patchStore({ status: store.status === 'active' ? 'paused' : 'active' })}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            {store.status === 'active' ? 'Pause' : 'Activate'} ({store.status})
          </button>
          <button onClick={remove} className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50">Delete</button>
        </div>
      </div>

      <div className="mt-5 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
        <p className="font-medium text-green-900">How to demo</p>
        <p className="text-green-900 mt-1">
          Open this link on any phone, or message <strong>{SITE.phoneDisplay}</strong> with <strong>&quot;Hi {store.name}&quot;</strong>. The assistant then answers as {store.name} for 24 hours. Type <strong>MENU</strong> to go back to the SatyaSell assistant.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input readOnly value={demoLink} className="flex-1 min-w-[240px] border border-green-300 rounded px-2 py-1 text-xs bg-white" />
          <button
            onClick={() => { navigator.clipboard.writeText(demoLink); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="px-3 py-1 text-xs bg-green-700 text-white rounded"
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <a href={demoLink} target="_blank" rel="noreferrer" className="text-xs text-green-800 underline">Open</a>
        </div>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg p-5">
        <h2 className="font-semibold text-gray-900">1. Upload screenshots of the price/stock list</h2>
        <p className="text-sm text-gray-500 mb-3">PNG or JPG. Clear, cropped screenshots read best. Rows are added below for you to check.</p>
        <input ref={fileRef} type="file" accept="image/*" multiple disabled={busy} onChange={(e) => onFiles(e.target.files)} className="text-sm" />
        {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
      </div>

      <div className="mt-6 bg-white shadow rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">2. Check the catalogue ({items.length} items)</h2>
            <p className="text-sm text-gray-500">Edit any cell. Rows with no brand and no model are dropped on save.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setItems((p) => [...p, { ...clean({}), _new: true }]); setDirty(true); }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              + Add row
            </button>
            <button
              onClick={save}
              disabled={busy || !dirty}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
            >
              {dirty ? 'Save catalogue' : 'Saved'}
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No items yet. Upload a screenshot above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  {COLS.map((c) => <th key={c.key} className="px-1 pb-1 text-[11px] font-medium text-gray-500 uppercase">{c.label}</th>)}
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className={it._new ? 'bg-yellow-50' : ''}>
                    {COLS.map((c) => (
                      <td key={c.key} className="px-1 py-0.5">
                        {c.key === 'category' ? (
                          <select className={`${cell} ${c.w}`} value={it.category} onChange={(e) => update(idx, 'category', e.target.value)}>
                            {['laptop', 'desktop', 'monitor', 'accessory', 'other'].map((o) => <option key={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input className={`${cell} ${c.w}`} value={(it[c.key] as any) ?? ''} onChange={(e) => update(idx, c.key, e.target.value)} />
                        )}
                      </td>
                    ))}
                    <td className="px-1">
                      <button onClick={() => { setItems((p) => p.filter((_, i) => i !== idx)); setDirty(true); }} className="text-red-600 text-xs hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white shadow rounded-lg p-5">
        <h2 className="font-semibold text-gray-900">Store details & extra rules</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <input className="border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Shop phone shown to customers" defaultValue={store.shopPhone || ''} onBlur={(e) => e.target.value !== (store.shopPhone || '') && patchStore({ shopPhone: e.target.value })} />
          <input className="border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Tagline" defaultValue={store.tagline || ''} onBlur={(e) => e.target.value !== (store.tagline || '') && patchStore({ tagline: e.target.value })} />
          <textarea className="sm:col-span-2 border border-gray-300 rounded px-3 py-2 text-sm" rows={3} placeholder="Extra rules for the assistant (e.g. 'All laptops have 6 months warranty. Shop is open 10am-9pm, closed Sundays.')" defaultValue={store.extraRules || ''} onBlur={(e) => e.target.value !== (store.extraRules || '') && patchStore({ extraRules: e.target.value })} />
        </div>
        <p className="text-xs text-gray-500 mt-2">Only add rules that are true. The assistant will state them to customers.</p>
      </div>
    </div>
  );
}
