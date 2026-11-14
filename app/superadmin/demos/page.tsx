'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Demo {
  id: string; businessName: string; mobile: string; slug: string; products: number; enabled: boolean;
  whatsappOrders: boolean; isPlatformAgent: boolean; testOrders: number; pageViews: number; createdAt: string;
}

const SITE = 'https://www.satyasell.com';

function outreach(d: Demo, ownerName?: string) {
  return `Hi${ownerName ? ' ' + ownerName : ''}, this is Manohar from SatyaSell 👋

I came across ${d.businessName} on Instagram and loved your products. We're building a tool for Instagram sellers, and I made a FREE demo for your business using your public Instagram/WhatsApp catalogue - nothing is live for your customers.

🛍️ Your demo store: ${SITE}/store/${d.slug}
📊 Your dashboard (orders, products, customers): ${SITE}/client/login
   Login: ${d.mobile}  |  PIN: <PIN>

You can try placing a test order and editing products. If you like it, we can set it up properly (no setup cost - we only take 1% on orders you receive through it). If not, just reply "remove" and I'll delete everything immediately. Your data stays private and is never shared.

Would you take 2 minutes to look?`;
}

export default function DemosPage() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => fetch('/api/superadmin/demos').then((r) => r.json()).then((d) => { setDemos(d.demos || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const patch = async (id: string, body: any) => {
    const res = await fetch(`/api/superadmin/demos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await res.json();
    if (!res.ok) { setMsg(d.error || 'Failed'); return null; }
    load();
    return d;
  };

  const copy = async (text: string, note: string) => {
    try { await navigator.clipboard.writeText(text); setMsg(note); } catch { setMsg('Could not copy'); }
  };

  const setAgent = async (id: string, enabled: boolean) => {
    await fetch(`/api/superadmin/clients/${id}/agent`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
    load();
  };

  const remove = async (d: Demo) => {
    if (!confirm(`Delete ${d.businessName} and all its data permanently?`)) return;
    await fetch(`/api/superadmin/clients/${d.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demo businesses</h1>
          <p className="text-sm text-gray-600">Businesses you onboarded on behalf of prospects. Pages are unlisted and hidden from search engines.</p>
        </div>
        <Link href="/superadmin/onboard" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">+ Onboard business</Link>
      </div>
      {msg && <p className="text-sm text-green-700">{msg}</p>}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="px-4 py-3 text-left">Business</th><th className="px-4 py-3 text-left">Page</th><th className="px-4 py-3 text-left">Activity</th><th className="px-4 py-3 text-left">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr> :
             demos.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">No demos yet. Click "Onboard business".</td></tr> :
             demos.map((d) => (
              <tr key={d.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{d.businessName}</div>
                  <div className="text-xs text-gray-500">{d.mobile} · {d.products} products</div>
                  {d.isPlatformAgent && <span className="mt-1 inline-flex px-2 text-xs rounded-full bg-purple-100 text-purple-800">AI ordering agent</span>}
                </td>
                <td className="px-4 py-3">
                  <a className="text-blue-600 underline" href={`/store/${d.slug}`} target="_blank" rel="noreferrer">/store/{d.slug}</a>
                  <div className={`text-xs mt-1 ${d.enabled ? 'text-green-700' : 'text-red-700'}`}>{d.enabled ? 'Live (unlisted)' : 'Taken down'}</div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-700">
                  <div>Page views: {d.pageViews}</div>
                  <div>Real test orders: {d.testOrders}</div>
                  <div>WhatsApp orders: {d.whatsappOrders ? 'on' : 'off'}</div>
                </td>
                <td className="px-4 py-3 space-x-3 space-y-1">
                  <button className="text-blue-600" onClick={() => copy(outreach(d), 'Message copied - replace <PIN> (use Reset PIN)')}>Copy message</button>
                  <button className="text-blue-600" onClick={async () => { const r = await patch(d.id, { action: 'resetPin' }); if (r) { await copy(outreach(d).replace('<PIN>', r.pin), `New PIN ${r.pin} - full message copied`); } }}>Reset PIN + copy message</button>
                  <button className="text-blue-600" onClick={() => patch(d.id, { action: 'whatsappOrders', enabled: !d.whatsappOrders })}>{d.whatsappOrders ? 'WhatsApp orders off' : 'WhatsApp orders on'}</button>
                  <button className="text-purple-600" onClick={() => setAgent(d.id, !d.isPlatformAgent)}>{d.isPlatformAgent ? 'Remove AI agent' : 'Make AI agent'}</button>
                  <button className="text-orange-600" onClick={() => patch(d.id, { action: d.enabled ? 'takedown' : 'restore' })}>{d.enabled ? 'Take down' : 'Restore'}</button>
                  <button className="text-gray-600" onClick={() => confirm('Remove sample orders & customers?') && patch(d.id, { action: 'clearDemoOrders' })}>Clear sample orders</button>
                  <button className="text-red-600" onClick={() => remove(d)}>Delete</button>
                </td>
              </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
