'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { buildMessage, drawPoster } from '@/lib/demo/outreach';

interface Demo {
  id: string; businessName: string; mobile: string; slug: string; products: number; enabled: boolean;
  whatsappOrders: boolean; isPlatformAgent: boolean; testOrders: number; pageViews: number; createdAt: string;
  logo: string | null; themeColor: string; accentColor: string; sample: { name: string; price: number }[];
}

const PIN_KEY = 'satyasell_demo_pins';
function readPins(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(PIN_KEY) || '{}'); } catch { return {}; }
}
function writePin(id: string, pin: string) {
  try { localStorage.setItem(PIN_KEY, JSON.stringify({ ...readPins(), [id]: pin })); } catch { /* ignore */ }
}

export default function DemosPage() {
  const [pins, setPins] = useState<Record<string, string>>({});
  useEffect(() => { setPins(readPins()); }, []);
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

  // The WhatsApp test chat answers for ONE business only - make sure it is this one before sending.
  const ensureAgent = async (d: Demo) => {
    if (d.isPlatformAgent) return true;
    const other = demos.find((x) => x.isPlatformAgent);
    const ok = confirm(`The SatyaSell WhatsApp AI currently answers for ${other ? other.businessName : 'the default store'}.\n\nSwitch it to ${d.businessName} so ${d.businessName}'s owner can test it?`);
    if (ok) await setAgent(d.id, true);
    return ok;
  };

  const [posterFor, setPosterFor] = useState<Demo | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (posterFor && canvasRef.current) drawPoster(canvasRef.current, posterFor).catch(() => setMsg('Could not draw poster'));
  }, [posterFor]);
  const downloadPoster = async () => {
    const c = canvasRef.current;
    if (!c || !posterFor) return;
    const save = (url: string) => { const a = document.createElement('a'); a.href = url; a.download = `${posterFor.slug}-poster.png`; a.click(); };
    try { save(c.toDataURL('image/png')); }
    catch { await drawPoster(c, { ...posterFor, logo: null }); save(c.toDataURL('image/png')); setMsg('Logo could not be embedded - downloaded without it'); }
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
                  <div className="text-xs text-gray-700">PIN: {pins[d.id] ? <span className="font-mono bg-yellow-100 px-1 rounded">{pins[d.id]}</span> : <span className="text-gray-400">not saved on this browser</span>}</div>
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
                  <button className="text-blue-600" onClick={async () => { if (!(await ensureAgent(d))) return; const pin = pins[d.id]; copy(buildMessage(d, pin || '<PIN>'), pin ? `Message copied with PIN ${pin}` : 'Message copied, but no PIN is saved here - press "New PIN + copy message" first'); }}>Copy message</button>
                  <button className="text-pink-600" onClick={() => setPosterFor(d)}>Poster</button>
                  <button className="text-blue-600" onClick={async () => {
                    if (!confirm(`Create a NEW PIN for ${d.businessName}? The old PIN (in any message already sent) will stop working.`)) return;
                    if (!(await ensureAgent(d))) return;
                    const r = await patch(d.id, { action: 'resetPin' });
                    if (r) { writePin(d.id, r.pin); setPins(readPins()); await copy(buildMessage(d, r.pin), `New PIN ${r.pin} saved - full message copied`); }
                  }}>New PIN + copy message</button>
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

      {posterFor && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPosterFor(null)}>
          <div className="bg-white rounded-xl p-4 max-w-md w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <canvas ref={canvasRef} className="w-full h-auto rounded-lg border" />
            <div className="flex gap-3 mt-3">
              <button onClick={downloadPoster} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">Download PNG</button>
              <button onClick={() => setPosterFor(null)} className="px-4 py-2 border rounded-md text-sm text-gray-800">Close</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Send this image on WhatsApp together with the message.</p>
          </div>
        </div>
      )}
    </div>
  );
}
