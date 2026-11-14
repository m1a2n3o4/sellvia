'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

interface Row { name: string; category: string; brand: string; description: string; price: string; quantity: string; images: string[]; _new?: boolean }

const input = 'w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900';
const label = 'block text-xs font-medium text-gray-600 mb-1';

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 2000 / Math.max(img.width, img.height));
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

async function uploadFile(file: File, purpose: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('purpose', purpose);
  const res = await fetch('/api/superadmin/onboard/upload', { method: 'POST', body: fd });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error || 'Upload failed');
  return d.url;
}

export default function OnboardPage() {
  const [f, setF] = useState({
    businessName: '', contactName: '', mobile: '', city: '', instagramUrl: '', description: '',
    themeColor: '#2563eb', accentColor: '#f59e0b', slug: '', enableWhatsAppOrders: false,
  });
  const [logo, setLogo] = useState('');
  const [banner, setBanner] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<any>(null);
  const shotRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));
  const upd = (i: number, k: keyof Row, v: any) => setRows((p) => p.map((r, n) => (n === i ? { ...r, [k]: v, _new: false } : r)));

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>, purpose: string, setter: (u: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(`Uploading ${purpose}...`);
    try { setter(await uploadFile(file, purpose)); setStatus(''); } catch (err: any) { setStatus(err.message); }
  };

  const readShots = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    let added = 0;
    for (let n = 0; n < files.length; n++) {
      setStatus(`Reading screenshot ${n + 1} of ${files.length}... (up to a minute)`);
      try {
        const image = await compress(files[n]);
        const res = await fetch('/api/superadmin/onboard/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image }) });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Failed');
        const fresh: Row[] = d.items.map((i: any) => ({ name: i.name, category: i.category, brand: i.brand, description: i.description, price: i.price ?? '', quantity: i.quantity ?? '', images: [], _new: true }));
        added += fresh.length;
        setRows((p) => [...p, ...fresh]);
      } catch (err: any) {
        setStatus(`Screenshot ${n + 1} failed: ${err.message}`);
        setBusy(false);
        return;
      }
    }
    setStatus(`Added ${added} products (highlighted). Check names and prices, add photos if you have them.`);
    setBusy(false);
    if (shotRef.current) shotRef.current.value = '';
  };

  const addPhoto = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const u = await uploadFile(file, 'product'); setRows((p) => p.map((r, n) => (n === i ? { ...r, images: [u] } : r))); } catch (err: any) { setStatus(err.message); }
  };

  const submit = async () => {
    setBusy(true);
    setStatus('Creating business, page, products and sample orders...');
    try {
      const res = await fetch('/api/superadmin/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, logo, banner, products: rows.map((r) => ({ ...r, price: Number(r.price), quantity: r.quantity === '' ? null : Number(r.quantity) })) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setDone(d);
      setStatus('');
    } catch (err: any) { setStatus(err.message); }
    setBusy(false);
  };

  if (done) {
    const url = `https://www.satyasell.com${done.storeUrl}`;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Demo ready ✅</h1>
        <div className="bg-white border rounded-lg p-5 space-y-2 text-sm text-gray-800">
          <p><b>Public page:</b> <a className="text-blue-600 underline" href={url} target="_blank" rel="noreferrer">{url}</a></p>
          <p><b>Dashboard login:</b> <a className="text-blue-600 underline" href="/client/login" target="_blank" rel="noreferrer">www.satyasell.com/client/login</a></p>
          <p><b>Mobile:</b> {done.loginMobile} &nbsp; <b>PIN:</b> <span className="font-mono bg-yellow-100 px-2 py-0.5 rounded">{done.loginPin}</span> <span className="text-gray-500">(shown once - you can reset it later)</span></p>
          <p className="text-gray-600">Sample data added: {done.seeded?.customers} customers, {done.seeded?.orders} orders. Nothing was sent to the business owner.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/superadmin/demos" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Manage demos & copy message</Link>
          <button onClick={() => location.reload()} className="px-4 py-2 border rounded-md text-sm text-gray-800">Onboard another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Onboard a business (demo)</h1>
        <p className="text-sm text-gray-600">Creates their page, dashboard login, products and sample orders. Nothing is sent to them.</p>
      </div>

      <section className="bg-white border rounded-lg p-5 grid sm:grid-cols-2 gap-4">
        <div><label className={label}>Business name *</label><input className={input} value={f.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="Sugandha Spices & Dry Fruits" /></div>
        <div><label className={label}>Owner name</label><input className={input} value={f.contactName} onChange={(e) => set('contactName', e.target.value)} /></div>
        <div><label className={label}>Contact / WhatsApp number * (also their login)</label><input className={input} value={f.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="10 digits" /></div>
        <div><label className={label}>City</label><input className={input} value={f.city} onChange={(e) => set('city', e.target.value)} /></div>
        <div><label className={label}>Instagram link</label><input className={input} value={f.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." /></div>
        <div><label className={label}>Page address (optional) - satyasell.com/store/…</label><input className={input} value={f.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from name" /></div>
        <div className="sm:col-span-2"><label className={label}>About (paste from Instagram bio)</label><textarea className={input} rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
        <div><label className={label}>Logo</label><input type="file" accept="image/*" onChange={(e) => pickImage(e, 'logo', setLogo)} className="text-sm" />{logo && <img src={logo} alt="" className="h-14 mt-2 rounded" />}</div>
        <div><label className={label}>Banner (optional)</label><input type="file" accept="image/*" onChange={(e) => pickImage(e, 'banner', setBanner)} className="text-sm" />{banner && <img src={banner} alt="" className="h-14 mt-2 rounded" />}</div>
        <div><label className={label}>Brand colour</label><input type="color" value={f.themeColor} onChange={(e) => set('themeColor', e.target.value)} className="h-9 w-20" /></div>
        <div><label className={label}>Accent colour</label><input type="color" value={f.accentColor} onChange={(e) => set('accentColor', e.target.value)} className="h-9 w-20" /></div>
        <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-800">
          <input type="checkbox" checked={f.enableWhatsAppOrders} onChange={(e) => set('enableWhatsAppOrders', e.target.checked)} />
          Enable "Order via WhatsApp" to the owner's number (turn on only after they agree)
        </label>
      </section>

      <section className="bg-white border rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-gray-900">Products ({rows.length})</h2>
          <div className="flex gap-2">
            <label className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm cursor-pointer">
              Upload catalogue screenshots
              <input ref={shotRef} type="file" accept="image/*" multiple hidden onChange={readShots} disabled={busy} />
            </label>
            <button onClick={() => setRows((p) => [...p, { name: '', category: '', brand: '', description: '', price: '', quantity: '', images: [] }])} className="px-3 py-1.5 border rounded-md text-sm text-gray-800">+ Add row</button>
          </div>
        </div>
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500"><th className="p-1">Photo</th><th className="p-1">Name</th><th className="p-1">Category</th><th className="p-1">Price ₹</th><th className="p-1">Stock</th><th className="p-1">Details</th><th /></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={r._new ? 'bg-yellow-50' : ''}>
                    <td className="p-1 w-24">
                      {r.images[0] ? <img src={r.images[0]} alt="" className="h-10 w-10 object-cover rounded" /> : <label className="text-xs text-blue-600 cursor-pointer">+ photo<input type="file" accept="image/*" hidden onChange={(e) => addPhoto(i, e)} /></label>}
                    </td>
                    <td className="p-1"><input className={input} value={r.name} onChange={(e) => upd(i, 'name', e.target.value)} /></td>
                    <td className="p-1 w-32"><input className={input} value={r.category} onChange={(e) => upd(i, 'category', e.target.value)} /></td>
                    <td className="p-1 w-24"><input className={input} value={r.price} onChange={(e) => upd(i, 'price', e.target.value)} /></td>
                    <td className="p-1 w-20"><input className={input} value={r.quantity} onChange={(e) => upd(i, 'quantity', e.target.value)} placeholder="50" /></td>
                    <td className="p-1"><input className={input} value={r.description} onChange={(e) => upd(i, 'description', e.target.value)} /></td>
                    <td className="p-1"><button onClick={() => setRows((p) => p.filter((_, n) => n !== i))} className="text-red-600 text-xs">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {status && <p className="text-sm text-gray-700">{status}</p>}
      <button onClick={submit} disabled={busy || !f.businessName || f.mobile.replace(/\D/g, '').length < 10} className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50">
        {busy ? 'Working...' : 'Create demo business'}
      </button>
    </div>
  );
}
