'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inr } from '@/lib/crm/format';
import type { Product, ProductStatus } from '@/lib/crm/mock/catalogue';
import { StatusBadge } from '../status-badge';
import { btn } from '../button-styles';
import { useModule } from '../module-page';
import { useCrm } from '../crm-context';
import { RealProducts } from './real-products';

const ST: Record<ProductStatus, [React.ComponentProps<typeof StatusBadge>['tone'], string]> = { live: ['success', 'Live'], draft: ['neutral', 'Draft'], out_of_stock: ['danger', 'Out of stock'] };

export function ProductsView({ products }: { products: Product[] }) {
  const { workspace } = useCrm();
  if (workspace.real) return <RealProducts />;
  return <SampleProducts products={products} />;
}

function SampleProducts({ products }: { products: Product[] }) {
  const { label } = useModule('products');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const cats = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const list = products.filter((p) => (cat === 'All' || p.category === cat) && (!q.trim() || `${p.name}${p.sku}`.toLowerCase().includes(q.trim().toLowerCase())));
  const low = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const out = products.filter((p) => p.stock === 0).length;
  const value = products.reduce((a, p) => a + p.price * p.stock, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        {[[`Total ${label.toLowerCase()}`, String(products.length)], ['Low stock (3 or fewer)', String(low)], ['Out of stock', String(out)], ['Stock value', inr(value)]].map(([k, v]) => (
          <div key={k} className="crm-card p-4"><p className="t-label text-muted-foreground">{k}</p><p className="t-h2 mt-1">{v}</p></div>
        ))}
      </div>
      <div className="crm-card p-0">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU" aria-label={`Search ${label}`}
              className="h-10 w-full rounded-full border border-white/90 bg-white/80 pl-10 pr-3 text-sm focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]" />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
            {cats.map((c) => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold', cat === c ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:text-ink')}>{c}</button>)}
          </div>
        </div>
        <div className="crm-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead><tr className="t-micro border-y border-white/80 text-muted-foreground">{['Product', 'Category', 'Price', 'Stock', 'Variants', 'Source', 'Status'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-white/60 hover:bg-white/60">
                  <td className="px-4 py-3"><div className="font-semibold text-ink">{p.name}</div><div className="t-small text-muted-foreground">{p.sku}</div></td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 font-semibold">{inr(p.price)}</td>
                  <td className={cn('px-4 py-3', p.stock <= 3 && 'font-semibold text-danger')}>{p.stock}</td>
                  <td className="px-4 py-3">{p.variants}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.source}</td>
                  <td className="px-4 py-3"><StatusBadge tone={ST[p.status][0]}>{ST[p.status][1]}</StatusBadge></td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Nothing matches.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AddProductLink() {
  const { label } = useModule('products');
  return <Link href="/app/catalogue/products/new" className={btn.brand}><Plus className="h-4 w-4" aria-hidden />Add {label.replace(/s$/, '').toLowerCase()}</Link>;
}
