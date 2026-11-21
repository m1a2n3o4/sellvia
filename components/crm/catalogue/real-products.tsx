'use client';

// The owner's real products (loaded from /api/app/products). Sample catalogues are never shown to real owners.
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Archive, Package, Pencil } from 'lucide-react';
import { inr } from '@/lib/crm/format';
import { btn } from '../button-styles';
import { EmptyState } from '../empty-state';
import { StatusBadge } from '../status-badge';
import { useModule } from '../module-page';

interface Row { id: string; name: string; category: string; sku: string; price: number; stock: number; variants: number; status: string }

export function RealProducts() {
  const { label } = useModule('products');
  const [rows, setRows] = useState<Row[] | null>(null); const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try { const r = await fetch('/api/app/products', { cache: 'no-store' }); const j = await r.json(); if (!r.ok) setErr(j.error ?? 'Could not load'); else setRows(j.products); }
    catch { setErr('Could not reach the server'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const archive = async (id: string) => { await fetch(`/api/app/products/${id}`, { method: 'DELETE' }); void load(); };

  if (err) return <div role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{err}</div>;
  if (!rows) return <div className="crm-card p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!rows.length) return <EmptyState icon={Package} title={`No ${label.toLowerCase()} yet`} description="Add your first one. The form is set up for your business type." action={<Link href="/app/catalogue/products/new" className={btn.brand}>Add your first</Link>} />;
  const value = rows.reduce((a, p) => a + p.price * p.stock, 0);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[[`Total ${label.toLowerCase()}`, String(rows.length)], ['Out of stock', String(rows.filter((r) => r.stock === 0).length)], ['Stock value', inr(value)]].map(([k, v]) => <div key={k} className="crm-card p-4"><p className="t-label text-muted-foreground">{k}</p><p className="t-h2 mt-1">{v}</p></div>)}
      </div>
      <div className="crm-card p-0"><div className="crm-scroll overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
        <thead><tr className="t-micro border-b border-white/80 text-muted-foreground">{['Product', 'Type', 'Price', 'Stock', 'Variants', 'Status', ''].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{rows.map((p) => (
          <tr key={p.id} className="border-b border-white/60 hover:bg-white/60">
            <td className="px-4 py-3"><div className="font-semibold text-ink">{p.name}</div><div className="t-small text-muted-foreground">{p.sku}</div></td>
            <td className="px-4 py-3">{p.category}</td><td className="px-4 py-3 font-semibold">{inr(p.price)}</td>
            <td className={`px-4 py-3 ${p.stock === 0 ? 'font-semibold text-danger' : ''}`}>{p.stock}</td><td className="px-4 py-3">{p.variants}</td>
            <td className="px-4 py-3"><StatusBadge tone={p.stock === 0 ? 'danger' : 'success'}>{p.stock === 0 ? 'Out of stock' : 'Live'}</StatusBadge></td>
            <td className="px-4 py-3"><span className="flex justify-end gap-1.5">
              <Link href={`/app/catalogue/products/${p.id}`} aria-label={`Edit ${p.name}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white"><Pencil className="h-3.5 w-3.5" /></Link>
              <button aria-label={`Archive ${p.name}`} onClick={() => { if (window.confirm(`Archive "${p.name}"? It will be hidden from your list.`)) void archive(p.id); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white"><Archive className="h-3.5 w-3.5" /></button></span></td>
          </tr>))}</tbody></table></div></div>
    </div>
  );
}
